const Brother   = require('./Brother')
const debug     = require('debug')('model:assignment')
const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

const assignmentSchema = new Schema({
    duty: {
        type: Schema.Types.ObjectId,
        ref: 'Duty',
        required: true
    },

    brother: {
        type: Schema.Types.ObjectId,
        ref: 'Brother',
        required: true
    },

    status: {
        type: String, // "Upcoming" | "Completed" | "Missed" | "Incomplete"
        default: "Upcoming"
    },

    credit: {
        type: Number,
        required: true
    },

    notify: {
        // notify brother a semester in advance (if applicable)
        semester: {
            type: Boolean,
            default: true
        },
        // notify brother a month in advance (if applicable)
        month: {
            type: Boolean,
            default: true
        },
        // notify brother a week in advance (if applicable)
        week: {
            type: Boolean,
            default: true,
        },
        // notify brother a day in advance
        tomorrow: {
            type: Boolean,
            default: true
        },
        // notify brother day of
        day: {
            type: Boolean,
            default: true,
        }
    }
})

// if the brother has been notified one of the notify properties is false
assignmentSchema.virtual('notified').get(function() {
    const { semester, month, week, tomorrow, day} = this.notify
    return !(semester && month && week && tomorrow && day)
})

module.exports = Duty = mongoose.model('Assignment', assignmentSchema)