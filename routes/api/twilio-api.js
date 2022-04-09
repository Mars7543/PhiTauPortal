const twilio        = require('../../controllers/twilio-controller')
const router        = require('express').Router()

/*
    @route      DELETE /api/duty/:id
    @desc       Delete duty by id (and associated assignments)
    @access     Protected
*/
router
    .route('/verify-phone')
    .post(twilio.verify_phone)

/*
    @route      GET /api/twilio/verfied/:id
    @desc       Check if user's phone is verified
    @access     Protected
*/
router
    .route('/verified/:id')
    .post(twilio.verified)

module.exports = router