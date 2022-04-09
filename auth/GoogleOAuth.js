const axios         = require('axios')
const jwt           = require('jsonwebtoken')
const Brother       = require('../models/Brother')
const Session       = require('../models/Session')
const debug         = require('debug')('auth:GoogleOAUth')

const getGoogleAuthURL = () => {
    const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"
    const options = {
        redirect_uri: `${process.env.REDIRECT_URI}`,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" ")
    }

    let queryString = new URLSearchParams(options).toString()

    return `${rootURL}?${queryString}`
}

const getGoogleOAuthTokens = async code => {
    const url = 'https://accounts.google.com/o/oauth2/token'
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
    }
    try {
        const res = await axios.post(url, values)

        return res.data
    } catch (err) {
        debug(err)
        throw new Error(err)
    }
}

const getGoogleUser = async (access_token, id_token) => {
    try {
        const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        })

        return res.data
    } catch (err) {
        debug('Error catching google user:\n', err)
        throw new Error(err)
    }
}

const getBrother = async email => {
    try {
        let [netid, domain] = email.split("@")

        if (domain !== 'cornell.edu')
            throw new Error("Must use your cornell email")

        const brother = await Brother.findOne({ netid }).lean()

        return brother
    } catch (err) {
        debug(err)
        throw new Error(err)
    }
}

const googleOAuthHandler = async (req, res) => {
    try {
        // get id and access tokens via code query
        const { access_token, id_token } = await getGoogleOAuthTokens(req.query.code)

        // get user via tokens
        const googleUser = await getGoogleUser(access_token, id_token)
        const brother = await getBrother(googleUser.email)

        // create session & session token
        const session = await Session.create({ brother : brother._id })
        const session_token = jwt.sign({ session_id : session._id }, process.env.JWT_SESSION_SECRET)

        // set session cookie
        res.cookie(process.env.SESSION_COOKIE_NAME, session_token, {
            httpOnly: true,
            secure: false,
            signed: true
        })
        
        res.redirect(`${process.env.ORIGIN}?signed_in=success`)
    } catch (err) {
        debug(err)
        res.redirect(`${process.env.ORIGIN}?signed_in=failed`)
    }
}

const googleLogout = async (req, res) => {
    try {
        // get session token from cookie
        const session_cookie = req.signedCookies[process.env.SESSION_COOKIE_NAME]
        const session_token = jwt.verify(session_cookie, process.env.JWT_SESSION_SECRET)
        
        // delete session and session cookie
        await Session.findByIdAndDelete(session_token.session_id)
        res.clearCookie(process.env.SESSION_COOKIE_NAME)
        
        res.redirect('/?logged_out=success')
    } catch (e) {
        debug(e)
        res.redirect('/?logged_out=failed')
    }
}

module.exports = {
    getGoogleAuthURL,
    googleOAuthHandler,
    googleLogout
}