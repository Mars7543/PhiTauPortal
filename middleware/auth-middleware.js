const Brother   = require('../models/Brother')
const Session   = require('../models/Session')
const jwt       = require('jsonwebtoken')
const debug     = require('debug')('middleware:auth')

const onExec = user => ["Steward", "Cleaning Manager", "Social Chair"].indexOf(user.position) !== -1

const getUser = async req => {
    try {
        // get session token from cookie
        const session_cookie = req.signedCookies[process.env.SESSION_COOKIE_NAME]
        if (!session_cookie) return undefined
        const session_token = jwt.verify(session_cookie, process.env.JWT_SESSION_SECRET)

        // get session and user from session token
        const session = await Session.findById(session_token.session_id)
        const user = await Brother.findById(session.brother).populate('class')
        // const user = await Brother.findOne({ 'name.first' : 'Dominic' }).populate('class')

        return user
    } catch(e) {
        debug(e)
        return undefined
    }
}

const brotherAuth = async (req, res, next) => {
    try {
        let user = await getUser(req)

        if (user) {
            req.user = user
            return next()
        }

        req.user = undefined
        res.clearCookie(process.env.SESSION_COOKIE_NAME)

        res.redirect('/?auth_error=1')
    } catch (e) {
        debug(e)
        req.user = undefined
        res.clearCookie(process.env.SESSION_COOKIE_NAME)
        res.redirect('/?auth_error=0')
    }
}

const execAuth = async (req, res, next) => {
    try {
        let user = await getUser(req)

        if (user) {
            if (onExec(user)) {
                req.user = user
                return next()
            }

            return res.redirect('/?auth_error=2')
        }

        req.user = undefined
        res.clearCookie(process.env.SESSION_COOKIE_NAME)

        res.redirect('/?auth_error=1')
    } catch (e) {
        debug(e)
        req.user = undefined
        res.clearCookie(process.env.SESSION_COOKIE_NAME)
        res.redirect('/?auth_error=0')
    }
}

module.exports = {
    getUser,
    onExec,
    brotherAuth,
    execAuth
}