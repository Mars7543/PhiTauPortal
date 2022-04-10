const methodOverride    = require('method-override')
const express           = require('express')
const cookieParser      = require('cookie-parser')
const logger            = require('morgan')
const path              = require('path')
const cors              = require('cors')

const auth              = require('./middleware/auth-middleware')

const classAPI          = require('./routes/api/class-api')
const brotherAPI        = require('./routes/api/brother-api')
const dutyAPI           = require('./routes/api/duty-api')
const assignmentAPI     = require('./routes/api/assignment-api')
const twilioAPI         = require('./routes/api/twilio-api')

const execRouter        = require('./routes/page/exec')
const dutiesRouter      = require('./routes/page/duties')
const profileRouter     = require('./routes/page/profile')
const indexRouter       = require('./routes/page/index')

require('dotenv').config()

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app config
app.enable('trust proxy')
app.use(cors())
app.options('*', cors())

if (process.env.NODE_ENV === 'production')
    app.use(logger('combined'))
else
    app.use(logger('dev'))

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: false }))

// static assetts
app.use('/static', express.static(path.join(__dirname, 'public')))

// api routes
app.use('/api/class',       auth.brotherAuth, classAPI)
app.use('/api/brother',     auth.brotherAuth, brotherAPI)
app.use('/api/assignment',  auth.brotherAuth, assignmentAPI)
app.use('/api/duty',        auth.brotherAuth, dutyAPI)
app.use('/api/twilio',      auth.brotherAuth, twilioAPI)

// exec pages
app.use('/exec', auth.execAuth, execRouter)

// brother pages
app.use('/duties',  auth.brotherAuth, dutiesRouter)
app.use('/profile', auth.brotherAuth, profileRouter)
app.use('/', indexRouter)

app.use('*', async (req, res) => res.render('404'))

module.exports = app