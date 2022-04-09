const assignment_controller     = require('../../controllers/assignment-controller')
const router                    = require('express').Router()

/* 
    @route      GET /api/assignment/:brother/:type
    @desc       Get all assigments with given brother id and given type
    @access     Protected
*/
router
    .route('/:brother/:type')
    .get(assignment_controller.get_assignments)

/* 
    @route      GET /api/assignment/:type/:month/:day/:year
    @desc       Get all assigments with given type and date
    @access     Protected
*/
router
    .route('/:type/:month/:day/:year')
    .get(assignment_controller.get_assignments_by_date)

/* 
    @route      GET /api/assignment/credits/:brother/:type
    @desc       Get total credits received by brother for given duty type
    @access     Protected
*/
router
    .route('/credits/:brother/:type')
    .get(assignment_controller.get_brother_credits)

/* 
    @route      POST /api/assignment
    @desc       Create assignment
    @access     Protected
*/
router
    .route('/')
    .post(assignment_controller.create_assignment)

/* 
    @route      DELETE /api/assignment/:id?delete_by_duty=:0or1
    @desc       Delete assignment by id or delete many by duty_id
    @access     Protected
*/
router
    .route('/:id')
    .delete(assignment_controller.delete_assignment)

module.exports = router