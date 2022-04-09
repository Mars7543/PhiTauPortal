const duty_controller   = require('../../controllers/duty-contoller')
const router            = require('express').Router()

/*
    @route      GET /api/duty/schedule/:type/:month/:year
    @desc       Get duties assigned for a given month (include previous and next month)
    @access     Protected
*/
router
    .route('/schedule/:type/:month/:year')
    .get(duty_controller.get_schedule)

/*
    @route      POST /api/duty
    @desc       Create duty
    @access     Protected
*/
router
    .route('/')
    .post(duty_controller.create_duty)

/*
    @route      GET /api/duty/:id
    @desc       Get duty by id (and associated assignments)
    @access     Protected
*/
/*
    @route      PUT /api/duty/:id
    @desc       Update duty by id
    @access     Protected
*/
/*
    @route      DELETE /api/duty/:id
    @desc       Delete duty by id (and associated assignments)
    @access     Protected
*/
router
    .route('/:id')
    .get(duty_controller.get_duty)
    .put(duty_controller.update_duty)
    .delete(duty_controller.delete_duty)

module.exports = router