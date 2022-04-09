const Class     = require('../models/Class')
const Brother   = require('../models/Brother')
const debug     = require('debug')('controller:class')

const create_class = async (req, res) => {
    let { className, classNumber } = req.body

    try {
        const class_ = await Class.create({ className, classNumber })
        res.status(201).json({ class_ })
    } catch (err) {
        debug(err)
        res.status(400).json({ err })
    }
}

const get_classes =  async (req, res) => {
    try {
        const classes = await Class.find({}).sort({ classNumber : 1 })
        res.json({ classes })
    } catch (err) {
        debug(err)
        res.status(500).json({ err })
    }
}

const intiate_new_class = async (req, res) => {
    try {
        let fall_class = await Class.findOne({ classNumber : 0.5 })
        let spring_class = await Class.findOne({ classNumber : 1 })

        await Brother.updateMany({ class : fall_class._id }, { class : spring_class._id })
        await fall_class.remove()

        res.status(204).send()
    } catch (err) {
        debug(err)
        res.status(500).json({ err })
    }
}

const delete_class = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id)
        res.status(204).send()
    } catch (err) {
        debug(err)
        res.status(500).json(err)
    }
}

module.exports = {
    create_class,
    get_classes,
    intiate_new_class,
    delete_class
}