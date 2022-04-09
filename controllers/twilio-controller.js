require('dotenv').config()

const accountSid    = process.env.TWILIO_ACCOUNT_SID
const authToken     = process.env.TWILIO_AUTH_TOKEN
const client        = require('twilio')(accountSid, authToken)
const debug         = require('debug')('controller:twilio')

const verify_phone = async (req, res) => {
    try {
        let { phone, phone_formatted } = req.body
        let clientRes = await client.validationRequests.create({ 
            friendlyName: req.user.full_name,
            phoneNumber: phone,
            // statusCallback: 'http://localhost:3000/api/twilio/verified'
        })
    
        let b = await Brother.findById(req.user._id)
        b.phone = { 
            raw : phone, 
            formatted : phone_formatted
        }
        await b.save()
    
        req.user = b
    
        res
            .status(200)
            .json({
                status: "Success",
                validationCode : clientRes.validationCode 
            })
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

const verified = async (req, res) => {
    try {
        const phone = await Brother.findById(req.params._id).select('phone')

        debug(phone)
        
        res.status(204).send()
    } catch (err) {
        debug(err)
        res.status(400).json({ err })
    }
}

async function sendMsg() {
    try {
        let res = await client.messages.create({ 
            body: 'Hi there', from: process.env.TWILIO_PHONE_NUMBER, to: num2
        })

        console.log(res)
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    verify_phone,
    verified,
    sendMsg
}