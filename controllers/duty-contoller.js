const Duty          = require('../models/Duty')
const Assignment    = require('../models/Assignment')
const debug         = require('debug')('controller:duty')

// type, month, year
const get_schedule = async (req, res) => {
    let { type, month, year } = req.params

    try {
        month = Number(month)
        year = Number(year)

        let schedule = {}

        let prevDate = {
            month: month === 0 ? 11 : month - 1,
            year: month === 0 ? year - 1 : year
        }

        let date = { month, year }

        let nextDate = {
            month: month === 11 ? 0 : month + 1,
            year: month === 11 ? year + 1 : year
        }

        schedule.prevMonth   = await Duty.find({ type, 'date.month' : prevDate.month, 'date.year' : prevDate.year }).distinct('date.day')
        schedule.month       = await Duty.find({ type, 'date.month' : date.month, 'date.year' : date.year }).distinct('date.day')
        schedule.nextMonth   = await Duty.find({ type, 'date.month' : nextDate.month, 'date.year' : nextDate.year }).distinct('date.day')

        res.status(200).json({ schedule })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get schedule.",
                error: e
            })
    }
}

const create_duty = async (req, res) => {
    try {
        let { type, name, date } = req.body
        date = JSON.parse(date)

        const duty = await Duty.create({ type, name, date })
        res.status(200).json({ duty })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to create duty.",
                error: e
            })
    }
}

const get_duty = async (req, res) => {
    try {
        const duty = await Duty.findById(req.params.id)

        if (!duty) 
            return res
                    .status(400)
                    .json({
                        status: "Failed",
                        msg: "Duty does not exist."
                    })

        const assignments = await Assignment.find({ duty: duty._id }).populate('brother').lean()

        if (assignments.length === 0)
            return res
                .status(400)
                .json({
                    status: "Failed",
                    msg: "Duty has no assignments."
                })

        res
            .status(200)
            .json({ 
                status: "Success",
                duty,
                assignments
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to create duty.",
                error: e
            })
    }
}

const update_duty = async (req, res) => {
    try {
        const duty = await Duty.findByIdAndUpdate(req.params.id, req.body, { new : true }).lean()
        if (!duty)
            return res
                    .status(400)
                    .json({ 
                        status: "Failed",
                        msg: "Duty does not exist.",
                        error: e
                    })
        
        res
            .status(200)
            .json({ 
                status: "Success",
                duty
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to delete duty.",
                error: e
            })
    }
}

const delete_duty = async (req, res) => {
    try {
        const duty = await Duty.findByIdAndDelete(req.params.id)
        
        if (!duty) 
            return res
                    .status(400)
                    .json({ 
                        status: "Failed",
                        msg: 'Duty does not exist.' 
                    })


        let assignments = await Assignment.find({ duty : duty._id })
        await Assignment.deleteMany({ duty : duty._id })

        res
            .status(200)
            .json({ 
                status: "Success",
                duty,
                assignments
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to delete duty.",
                error: e
            })
    }
}

module.exports = {
    get_schedule,
    create_duty,
    get_duty,
    update_duty,
    delete_duty
}