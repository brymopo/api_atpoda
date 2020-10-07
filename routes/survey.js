module.exports = (router)=>{
    const SurveyQuestions = require('../controllers/survey_question');
    const Survey = require('../controllers/survey');
    const passport = require('passport');
    const authUser = require('../auth/utils').authUser;

    router.get('/survey/questions/show',
        SurveyQuestions.findMasterSurveyQuestions,
        SurveyQuestions.returnMasterSurveyQuestions 
    );

    router.post('/survey/new',
        passport.authenticate('jwt',{session:false}),
        SurveyQuestions.findMasterSurveyQuestions,    
        Survey.createSurvey
    );

    router.get('/survey/:id',Survey.findSurvey,Survey.returnSurvey);

    router.put('/survey/:id/update',
        passport.authenticate('jwt',{session:false}),
        Survey.findSurvey,
        authUser,
        Survey.updateSurvey
    );

    router.delete('/survey/:id/delete',
        passport.authenticate('jwt',{session:false}),
        Survey.findSurvey,
        authUser,
        Survey.deleteSurvey
    );
};