require('dotenv').config()

const accountSid    = process.env.TWILIO_ACCOUNT_SID
const authToken     = process.env.TWILIO_AUTH_TOKEN
const client        = require('twilio')(accountSid, authToken)
const debug         = require('debug')('middleware:twilio')

const verify_phone = async (req, res, next) => {
    try {
        let res = await client
                            .verify
                            .services('VAd68987e0eee6835e7fc4461dc9d09b5e')
                            .verifications
                            .create({to: '+9176631919', channel: 'sms'})

        debug(res)
        // req.verified = verified
        next()
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to verify phone number.",
                error: e
            })
    }
}

module.exports = {
    verify_phone
}