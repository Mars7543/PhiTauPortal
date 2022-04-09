const brothers_controller   = require('../../controllers/brothers-controller')
const router                = require('express').Router()

/* 
    @route      POST /api/brother
    @desc       Mass add brothers
    @access     Protected
*/
router
    .route('/')
    .post(brothers_controller.add_brothers)

/* 
    @route      GET /api/brother/class/:classID (optional ?sort=duty,name)
    @desc       Get brothers by class
    @access     Protected
*/
router
    .route('/class/:class')
    .get(brothers_controller.get_brothers_by_class)

/* 
    @route      GET /api/brother
    @desc       Get all brothers
    @access     Protected
*/
router
    .route('/')
    .get(brothers_controller.get_brothers)

/*
    @route      PUT /api/brother/:id
    @desc       Edit brother by id
    @access     Protected
*/
router
    .route('/:id')
    .put(brothers_controller.update_brother)

/*
    @route      PUT /api/brother/phone/:id
    @desc       Update brother's phone number
    @access     Protected
*/
router
    .route('/phone/:id')
    .put(brothers_controller.update_brother_phone)

/*
    @route      DELETE /api/brother/:id
    @desc       Delete brother by id
    @access     Protected
*/
router
    .route('/:id')
    .delete(brothers_controller.delete_brother)

module.exports = router