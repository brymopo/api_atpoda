const mongoose = require('mongoose');
const Survey =  require('../models/survey');
const User = require('mongoose').model('User');

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.createSurvey = (req,res,next)=>{

    /* 
    Creates a new survey. Expects three objects within the request:
        - req.user, containing the user's information
        - req.questions, containing the master survey's questions retrieved from DB.
        - req.body, an object where the keys are the survey's questions and its values are
        the user's answers to them.
    */
    
    if(!req.questions){
        const error = new Error('Cannot create survey without questions');
        next(error)
    };
    
   User.findById(req.user._id)
   .then(user=>{
        if(!user){
            let error = new Error('Could not locate user. Please retry');
            next(error);
        }

        // Survey model expects an author property (the user's id) and a QandA property.
        // QandA is an array of objects(pairs) where the key is the question and its value 
        // the user's answer to that question.

        let questionAnswerPairs = [];
        let body = req.body;
        let questions = req.questions.statements;

        questions.forEach(question => {
            /* 
            Instead of simply taking the questions and answers from the request body,
            questions are set from the master survey and then its answers are looked up +
            within the request, if they exist. This is done to prevent users from tampering
            with the questions in the frontend.
            */

            let pair = {
                question:question,
                answer:body[question]?body[question]:'El usuario no respondio esta pregunta'
            }
            questionAnswerPairs.push(pair);                                 
        });
        

        let survey = new Survey({
            author:user._id,
            QandA:questionAnswerPairs
        });

        survey.save()
        .then(survey=>{
            if(survey){
                
                user.survey = survey;
                
                user.save().then(u=>{console.log('saved: ',u)}).catch(e=>next(e));
                return res.status(200).json({
                    success:true,
                    result: survey           
                })
            }else{
                const error = new Error('could not create survey, please try again')
                next(error)
            }
        })
        .catch(e=>next(e))

   })
   .catch(e=>next(e))
};


exports.updateSurvey = (req,res,next)=>{
    /* 
    Expects a req.survey object containing the survey's info; it must come after the
    findSurvey middleware.
    */   
    
    Survey.findByIdAndUpdate(
        req.survey._id,
        {QandA:req.body},
        {new:true}
    )
    .then(updated=>{
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
    .catch(e=>next(e))
};

exports.deleteSurvey = (req,res)=>{
    /* 
    Expects a req.survey object containing the survey's info; it must come after the
    findSurvey middleware.
    */

    Survey.findByIdAndRemove(req.survey._id)
    .then(deleted=>{
        if(!deleted){
            return res.status(206).json({
                success:false,
                result:'Could not delete survey. Please retry'
            }) 
        }
        return res.status(200).json({
            success:true,
            result:deleted
        })
    })
    .catch(e=>next(e))
}

// END OF PROTECTED ROUTES' FUNCTIONS //

exports.findSurvey = (req,res,next)=>{
    /* 
    Finds a survey in the DB by id and sets a req.survey object with its info when done.
    It only expects the survey's id as a parameter of the request.
    */

    let id = req.params.id;
    Survey.findById(id)
    .then(foundSurvey=>{
        if(foundSurvey){
            req.survey = foundSurvey;
            req.compareId = foundSurvey.author;
            next();
        }else{
            const error = new Error('could not find a survey with this id');
            next(error)
        }
    })
};

exports.returnSurvey = (req,res)=>{
    return res.status(200).json({
        success: true,
        result:req.survey
    })    
}



