const class_controller  = require('../../controllers/class-controller')
const router            = require('express').Router()

/*
    @route      POST /api/class
    @desc       Add new class
    @access     Protected
*/
router
    .route('/')
    .post(class_controller.create_class)

/*
    @route      GET /api/class
    @desc       Get all classes
    @access     Protected
*/
router
    .route('/')
    .get(class_controller.get_classes)

/*
    @route      PUT /api/class/initiate-fall-class
    @desc       Update fall class number from .5 to 1
    @access     Protected
*/
router
    .route('/initiate-fall-class')
    .put(class_controller.intiate_new_class)

/*
    @route      DELETE /api/class/:id
    @desc       Delete class by id
    @access     Protected
*/
router
    .route('/:id')
    .delete(class_controller.delete_class)

module.exports = router