const debug     = require('debug')('model:class')
const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

const classSchema = new Schema({
    classNumber: {
        type: Number,
        required: true,
        unique: true
    }, 
    className: {
        type: String,
        required: true,
        unique: true
    }
})

classSchema.statics.updatePrevClasses = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let classes = await this.find().sort({ classNumber : -1 })
            for (class_ of classes) {
                class_.classNumber += 1
                await class_.save()
            }
            resolve({})
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = Class = mongoose.model('Class', classSchema)