const mongoose = require('mongoose');
const SurveyQuestion = require('../models/survey_question');


exports.createMasterSurvey = (req,res)=>{    
    
        if(req.questions){
           return res.status(400).json({
               success:false,
               result:'A master already exists. Please update instead'
           }) 
        };

        let questions = [];  
            
        
        req.body.statements.forEach(element => {
            questions.push(element)
        });

        SurveyQuestion.create({statements:questions})
        .then(result=>{
            if(result){
                return res.status(200).json({
                    success:true,
                    result:result
                })
            }else{
                return res.status(206).json({
                    result:'could not create'
                })
            }
        })
        .catch((err)=>next(err));           
};

exports.findMasterSurveyQuestions = (req,res,next)=>{
    /* 
    Finds the SurveyQuestion object in the database and sets a req.questions
    property to be used later by other middlewares
    */

    SurveyQuestion.findOne({})
    .then(questions=>{
        if(!questions){
            req.questions = false;
            next();            
        }else{
            req.questions = questions;
            next(); 
        };        
    })
    .catch(e=>next(e));
};

exports.returnMasterSurveyQuestions = (req,res,next)=>{
    /* 
    Sends a response with the contents of req.questions 
    or an error if empty.
    Expects req.questions
    */

    if(req.questions){        
        return res.status(200).json({
            success:true,
            result:req.questions.statements
        })
    }
    const error = new Error('Could not locate survey questions. Please contact administrator');
    next(error)
}

exports.updateMasterSurvey = (req,res)=>{
        if(!req.questions){
            const error = new Error('Could not locate survey questions. Please contact administrator');
            next(error)
        };
    
        SurveyQuestion.findByIdAndUpdate(
            req.questions._id,
            {statements:req.body.statements},
            {new:true}
        )
        .then(updated=>{
            if(!updated){
                return res.status(206).json({
                    success:false,
                    result:'Could not update questions. please try again'
                }) 
            }
            return res.status(200).json({
                success:true,
                result:updated
            })
        })
        .catch(err=>next(err))    
}
