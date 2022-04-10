const OAuth     = require('../../auth/GoogleOAuth')
const auth      = require('../../middleware/auth-middleware')
const debug     = require('debug')('pages:index')
const router    = require('express').Router()

// login
router.get('/auth/google', OAuth.googleOAuthHandler)

// logout
router.get('/logout', OAuth.googleLogout)

// home page
router.get('/', async (req, res) => {
    let options = {
        title   : 'Sign-In Portal',
        styles  : ['index/signin.css'],
        scripts : [],
        page: 'signin',
        auth_url: OAuth.getGoogleAuthURL(),
        auth_error: undefined,
        signed_in: undefined,
        logged_out: undefined
    }

    let user = await auth.getUser(req)
    options.user = user

    if (user) {
        delete options.auth_url
        options.styles.pop()

        options.title = 'Duties Portal'
        options.styles.push('index/brother.css')
        options.scripts.push('index/brother.js')

        if (auth.onExec(user))
            options.page = "exec"
        else 
            options.page = "brother"
    }

    const auth_error_messages = [
        "Error authenticating user, please sign in again.", 
        "You must be signed in to access that page.", 
        "You do not have permission to access that page."
    ]

    const { auth_error, signed_in, logged_out } = req.query
    if (auth_error)
        options.auth_error = auth_error_messages[auth_error]

    if (signed_in)
        options.signed_in = {
            status: signed_in,
            msg: signed_in === "success" 
                    ? `Welcome back ${user.name.first}!` 
                    : "Error signing in, please try again later." 
        }

    if (logged_out)
        options.logged_out = {
            status: logged_out,
            msg: logged_out === "success" 
                    ? "Successfully logged out." 
                    : "Error logging out, please try again later." 
        }

    res.render('index', options)
})

router.all('*', async (req, res) => {
    res.render('404', {
        title   : 'Page Not Found',
        styles  : ['404.css'], 
        scripts : [],
        user: req.user,
        auth_url: OAuth.getGoogleAuthURL(),
    })
})

module.exports = router