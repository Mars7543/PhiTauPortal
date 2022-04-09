const Assignment    = require('../models/Assignment')
const debug         = require('debug')('middleware:assignment')

const update_brother_assignments_status = async (req, res, next) => {
    try {
        let assignments = await Assignment
                                    .find({ brother : req.user._id })
                                    .populate('duty')

        for (let assignment of assignments) {
            let { year, month, day } = assignment.duty.date
            let assignment_date = new Date(year, month, day)
            let duty_deadline = 20 // 24 hour clock (20 = 10pm)
            assignment_date.setHours(duty_deadline)

            let today = new Date()
            let gmt_difference = 4 // date default to GMT+0 which is 4 hours ahead of est
            today.setHours(today.getHours() - gmt_difference)

            if (today < assignment_date)
                assignment.status = "Upcoming"
            else {
                if (assignment.credit === 0)
                    assignment.status = "Missed"
                else if (assignment.credit < 1)
                    assignment.status = "Incomplete"
                else 
                    assignment.status = "Complete"
            }

            await assignment.save()
        }

        req.assignments = assignments
        next()
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to update assignments' status.",
                error: e
            })
    }
}

const get_brother_assignments_by_type = async (req, res, next) => {
    try {
        let assignments = {
            'waiter': [],
            'cleanup': [],
            'setup': []
        }

        // separate assignments by type
        for (let assignment of req.assignments)
            assignments[assignment.duty.type].push(assignment)

        // sort by date
        for (const [type, _] of Object.entries(assignments)) {
            assignments[type].sort((a, b) => {
                const { year: a_year, month: a_month, day: a_day } = a.duty.date
                const a_date = new Date(a_year, a_month, a_day)
    
                const { year: b_year, month: b_month, day: b_day } = b.duty.date
                const b_date = new Date(b_year, b_month, b_day)
    
                return b_date - a_date
            })
        }

        req.assignments = assignments
        next()
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get assignments by type.",
                error: e
            })
    }
}

module.exports = {
    update_brother_assignments_status,
    get_brother_assignments_by_type
}