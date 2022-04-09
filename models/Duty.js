const Brother   = require('../models/Brother')
const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

const dutySchema = new Schema({
    type: {
        type: String,
        required: true
    },
    
    name: {
        type: String,
        required: true
    },

    date: {
        month: {
            type: Number,
            required: true
        },

        day: {
            type: Number,
            required: true
        },
    
        year: {
            type: Number,
            default: new Date().getFullYear()
        },
    }
})

module.exports = Duty = mongoose.model('Duty', dutySchema)