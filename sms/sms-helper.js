const Assignment    = require('../models/Assignment')
const Duty          = require('../models/Duty')
const debug         = require('debug')('app:sms-helper')

// return list of assignments from list of duties
const get_assignments_from_duties = async (duties, noti_type) => {
    try {
        let assignments = []
        for (const duty of duties) {
            let duty_assignments = await Assignment
                                            .find({ 
                                                duty : duty._id,
                                                [`notify.${noti_type}`] : true
                                            })
                                            .populate('brother')
                                            .populate('duty')

            for (let duty_assignment of duty_assignments) {
                // only notify brothers with verified phone numbers & notifcation settings on
                if (duty_assignment.brother.notify[noti_type])
                    assignments.push(duty_assignment)
            }
        }

        return assignments
    } catch (e) {
        debug(e)
    }
}

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf())
    date.setDate(date.getDate() + days)
    return date
}

// get list of dates between <start_date> and <end_date>
const get_dates_list = (start_date, end_date) => {
    let dates = []
    let current_date = start_date

    while (current_date <= end_date) {
        dates.push(new Date(current_date))
        current_date = current_date.addDays(1)
    }

    return dates
}

// get list of duties from list of dates
const get_duties_list = async dates => {
    let duties = []
    for (const date of dates) {
        let date_duties = await Duty.findOne({
            'date.month'    : date.getMonth(),
            'date.day'      : date.getDate(),
            'date.year'     : date.getFullYear()
        }).lean()

        // if duty exits add to list
        if (date_duties)
            duties.push(date_duties)
    }

    return duties
}

// return list of today's assignments
const get_todays_assignments = async _ => {
    try {
        const today = new Date()

        let duties = await get_duties_list([today])
        let assignments = await get_assignments_from_duties(duties, 'day')
        return assignments
    } catch (e) {
        debug(e)
    }
}

// return list of tomorrow's assignments
const get_tomorrows_assignments = async _ => {
    try {
        const today = new Date()
        const tomorrow = today.addDays(1)

        let duties = await get_duties_list([tomorrow])
        let assignments = await get_assignments_from_duties(duties, 'tomorrow')
        return assignments
    } catch (e) {
        debug(e)
    }
}

// return list of assignments between 2 and 7 days from today
const get_this_weeks_assignments = async _ => {
    try {
        const today = new Date()
        const startDate = today.addDays(2)
        const endDate = today.addDays(7)

        const dates = get_dates_list(startDate, endDate)

        let duties = await get_duties_list(dates)
        let assignments = await get_assignments_from_duties(duties, 'week')

        return assignments
    } catch (e) {
        debug(e)
    }
}

// return list of assignments between 8 and 31 days from today
const get_this_months_assignments = async _ => {
    try {
        const today = new Date()
        const startDate = today.addDays(8)
        const endDate = today.addDays(31)
        
        const dates = get_dates_list(startDate, endDate)
        let duties = await get_duties_list(dates)
        let assignments = await get_assignments_from_duties(duties, 'month')
        
        return assignments
    } catch (e) {
        debug(e)
    }
}

module.exports = {
    get_todays_assignments,
    get_tomorrows_assignments,
    get_this_weeks_assignments,
    get_this_months_assignments
}