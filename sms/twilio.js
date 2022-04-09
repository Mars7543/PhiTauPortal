const accountSid    = process.env.TWILIO_ACCOUNT_SID;
const authToken     = process.env.TWILIO_AUTH_TOKEN;
const client        = require('twilio')(accountSid, authToken)
const debug         = require('debug')('app:twilio')


const send_sms = async (msg, to) => {
    try {
        await client.messages.create({ 
            body: msg, 
            from: process.env.TWILIO_PHONE_NUMBER, 
            to
        })
    } catch (e) {
        debug(e)
    }
}

module.exports = {
    send_sms
}