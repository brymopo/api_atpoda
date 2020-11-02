module.exports = (router)=>{
    const Admin  =  require('../controllers/admin');
    const deleteReportedAd = require('../controllers/ad').deleteReportedAd;
    const passport = require('passport');
    const SurveyQuestions = require('../controllers/survey_question');

    router.post('/admin/create',
        /* passport.authenticate('jwt',{session:false}),
        Admin.isAdmin, */
        Admin.create);

    router.post('/admin/survey/questions/new',
        passport.authenticate('jwt',{session:false}),
        Admin.isAdmin,
        SurveyQuestions.findMasterSurveyQuestions,
        SurveyQuestions.createMasterSurvey
    );

    router.post('/admin/report_ad',Admin.reportAd);

    router.put('/admin/survey/questions/update',
        passport.authenticate('jwt',{session:false}),
        Admin.isAdmin,
        SurveyQuestions.findMasterSurveyQuestions,
        SurveyQuestions.updateMasterSurvey
    );

    router.delete('/admin/delete/:id',Admin.delete),

    router.delete('/admin/reported_ads/:adId/delete',
                passport.authenticate('jwt',{session:false}),
                Admin.isAdmin,
                deleteReportedAd,
                Admin.removeFromReportedArray)
}



