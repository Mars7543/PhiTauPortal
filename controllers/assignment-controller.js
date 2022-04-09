const Assignment    = require('../models/Assignment')
const Duty          = require('../models/Duty')
const debug         = require('debug')('controller:assignment')

const get_assignments_by_date = async (req, res) => {
    let { type, month, day, year } = req.params
    try {
        month = Number(month)
        day = Number(day)
        year = Number(year)

        const duties = await Duty.find({ 
            type, 
            'date.month' : month, 
            'date.day' : day, 
            'date.year' : year 
        }).lean()

        let duties_assignments = []

        for (let duty of duties) {
            const assignments = await Assignment.find({ duty : duty._id }).populate('brother')
            duties_assignments.push({ duty, assignments })
        }

        res
            .status(200)
            .json({ 
                status: "Success",
                duties_assignments 
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get assignments by date.",
                error: e
            })
    }
}

const get_assignments = async (req, res) => {
    const { brother, type } = req.params
    try {
        const assignments = await Assignment
                                    .find({ brother })
                                    .populate({ 
                                        path: 'duty',
                                        match: { type }
                                    })
                                    .lean()
        
        res
            .status(200)
            .json({ 
                success: "Success",
                assignments 
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get assignments.",
                error: e 
            })
    }
}

const get_brother_credits = async (req, res) => {
    const { brother, type } = req.params
    try {
        const assignments = await Assignment
                                    .find({ brother })
                                    .populate({
                                        path: 'duty',
                                        match: { type }
                                    })
                                    .lean()

        let credits = 0
        for (let assignment of assignments)
            credits += assignment.credit

        res
            .status(200)
            .json({ 
                status: "Success",
                credits 
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get brother's credits.",
                error: e 
            })
    }
}

const create_assignment = async (req, res) => {
    try {
        const assignmentInfo = { duty, brother, status, credit } = req.body
        const assignment = await Assignment.create(assignmentInfo)

        res
            .status(200)
            .json({
                status: "Success",
                assignment
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({
                status: 'Failed',
                msg: "Failed to create assignment.",
                error: e
            })
    }
}

const delete_assignment = async (req, res) => {
    try {
        // delete by duty id
        if (Number(req.query.delete_by_duty) === 1) {
            let assignments = await Assignment.find({ duty : req.params.id }).lean()
            await Assignment.deleteMany({ duty : req.params.id })

            return res
                    .status(200)
                    .json({
                        status: "Success",
                        assignments
                    })
        }

        // delete by assignment id
        const assignment = await Assignment.findByIdAndDelete(req.params.id)

        if (!assignment)
            res
                .status(400)
                .json({ 
                    status: "Failed",
                    msg: "Assignment does not exist.",
                    error: e 
                })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({
                status: 'Failed',
                msg: "Failed to delete assignment.",
                error: e
            })
    }
}

module.exports = {
    get_assignments_by_date,
    get_assignments,
    get_brother_credits,
    create_assignment,
    delete_assignment
}