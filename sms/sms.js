const sms_helper    = require('./sms-helper')
const twilio        = require('./twilio')
const debug         = require('debug')('app:sms')

const MILISECONDS_IN_DAY = 86400000

// Notification Types
const TODAY = 'Today'
const TOMORROW = 'Tomorrow'
const NEXT_WEEK = 'This Week'
const NEXT_MONTH = 'This Month'

const notify_brother = (assignment, notification_type) => {
    const { brother, duty } = assignment

    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let date = new Date(duty.date.year, duty.date.month, duty.date.day)
    let date_str = `${duty.date.month+1}/${duty.date.day}`
    let msg = `Hey ${brother.name.first}, this is an automated reminder to let you know you have been assigned to "${duty.name}" on ${days[date.getDay()]} ${date_str}.`

    twilio.send_sms(msg, brother.phone.raw).then(_ => {
        if (notification_type)
            assignment.notify[notification_type] = false

        assignment.notify.notified = true
        assignment.save()
    })
}

// notify brothers in assignments list
const notify_assigned = (assignments, notification_type) => {
    for (let assignment of assignments) {
        notify_brother(assignment, notification_type)
    }
}

// notify about today's duties
const notify_today = async _ => {
    let assignments = await sms_helper.get_todays_assignments()
    notify_assigned(assignments, 'day')

    debug('Sent reminders for today\'s duties.')
}

// notify about tomorrow's duties
const notify_tomorrow = async _ => {
    let assignments = await sms_helper.get_tomorrows_assignments()
    notify_assigned(assignments, 'tomorrow')

    debug('Sent reminders for tomorrow\'s duties.')
}

// notify about this week's duties
const notify_this_week = async _ => {
    let assignments = await sms_helper.get_this_weeks_assignments()
    notify_assigned(assignments, 'week')

    debug('Sent reminders for this week\'s duties.')
}

// notify about this month's duties
const notify_this_month = async _ => {
    let assignments = await sms_helper.get_this_months_assignments()
    notify_assigned(assignments, 'month')

    debug('Sent reminders for this month\'s duties.')
}

// TODO: only send notifications at 10am
const notify = (type="all") => {
    debug('Sending daily duty texts...') 

    notify_today()
    notify_tomorrow()
    notify_this_week()
    notify_this_month()

    setTimeout(() => notify(), MILISECONDS_IN_DAY)
}

module.exports = {
    notify
}