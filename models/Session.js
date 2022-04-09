const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sessionSchema = new Schema({
    brother: {
        type: Schema.Types.ObjectId,
        ref: 'Brother',
        required: true
    }
})

module.exports = Session = mongoose.model('Session', sessionSchema)