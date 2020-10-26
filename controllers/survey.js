const mongoose = require('mongoose');
const Survey =  require('../models/survey');
const removeFromArray = require('../auth/utils').removeFromArray;

function buildSurvey(req){
    let questionAnswerPairs = [];
    let body = req.body;
    let questions = req.questions.statements;

    questions.forEach(question => {
             
        // Instead of simply taking the questions and answers from the request body,
        // questions are set from the master survey and then its answers are looked up
        // within the request, if they exist. This is done to prevent users from tampering
        // with the questions in the frontend.       

        let pair = {
            question:question,
            answer:body[question]?body[question]:'El usuario no respondio esta pregunta'
        }
        questionAnswerPairs.push(pair);                                 
    });

    let survey = new Survey({
        author:req.user._id,
        QandA:questionAnswerPairs
    });
    
    return survey;
}

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.createSurvey = (req,res,next)=>{

    if(!req.questions){
        const error = new Error('Cannot create survey without questions');
        next(error)
    };

    let survey = buildSurvey(req);
    
    survey.save().then(newSurvey=>{
        req.user.survey = newSurvey;
        req.user.save();
        return res.status(200).json({
            success:true,
            result: newSurvey
        })
    })
    .catch(err=>next(err));
} 
   
exports.updateSurvey = (req,res,next)=>{
     
    //Expects a req.survey object containing the survey's info; it must come after the
    //findSurvey middleware.     
    
    Survey.findByIdAndUpdate(
        req.survey._id,
        {QandA:req.body},
        {new:true}
    ).then(updated=>{
        if(!updated){
            return res.status(206).json({
                success:false,
                result:'Could not update survey. Please retry'
            })
        }
        return res.status(200).json({
            success:true,
            result:updated
        })
    })
    .catch(e=>next(e));
};

exports.deleteSurvey = (req,res)=>{
    /* 
    Expects a req.survey object containing the survey's info; it must come after the
    findSurvey middleware.
    */

    Survey.findByIdAndRemove(req.survey._id).then(deleted=>{
        if(!deleted){
            return res.status(206).json({
                success:false,
                result:'Could not delete survey. Please retry'
            }) 
        }
        removeFromArray(req.user,'survey',req.survey._id).then(result=>{
            return res.status(200).json({
                success:true,
                result:deleted
            })
        })
        .catch(e=>next(e));
        
    }).catch(e=>next(e));
}

// END OF PROTECTED ROUTES' FUNCTIONS //

exports.findSurvey = (req,res,next)=>{
    /* 
    Finds a survey in the DB by id and sets a req.survey object with its info when done.
    It only expects the survey's id as a parameter of the request.
    */

    let id = req.params.id;
    Survey.findById(id).then(foundSurvey=>{
        if(foundSurvey){
            req.survey = foundSurvey;
            req.compareId = foundSurvey.author;
            next();
        }else{
            const error = new Error('could not find a survey with this id');
            next(error)
        }
    })
    .catch(err=>next(err));
};

exports.returnSurvey = (req,res)=>{
    return res.status(200).json({
        success: true,
        result:req.survey
    })    
}
