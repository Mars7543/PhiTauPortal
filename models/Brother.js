const mongoose = require('mongoose')
const Schema = mongoose.Schema

const brotherSchema = new Schema({
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },

    netid: {
        type: String,
        unique: true,
        required: true
    },
    
    phone: {
        raw: {
            type: Number,
            default: undefined
        },
        formatted: {
            type: String,
            default: undefined
        },
        verified: {
            type: Boolean,
            default: false
        }
    },

    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    
    position: {
        type: String,
        default: undefined
    },

    off_campus: {
        type: Boolean,
        default: false
    },

    duty_exempt: {
        type: String,
        default: undefined
    },

    notify: {
        semester: {
            type: Boolean,
            default: true
        },

        month: {
            type: Boolean,
            default: true
        },

        week: {
            type: Boolean,
            default: true
        },

        tomorrow: {
            type: Boolean,
            default: true
        },

        day: {
            type: Boolean,
            default: true
        }
    }
})

brotherSchema.virtual('full_name').get(function() {
    return this.name.first + ' ' + this.name.last
})

brotherSchema.set('toJSON', { virtuals: true })

module.exports = Brother = mongoose.model('Brother', brotherSchema)