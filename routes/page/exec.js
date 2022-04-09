const Class     = require('../../models/Class')
const Brother   = require('../../models/Brother')
const router    = require('express').Router()
const debug     = require('debug')('pages:exec')

router.get('/', (req, res) => {
    res.redirect('exec/duties-master')
})

router.get('/brothers-master', (req, res) => {
    res.render('exec/brothers_master', { 
        title   : 'Brothers Master Page',
        styles  : ['exec/brothers/brothers_master.css'], 
        scripts : ['exec/brothers/brothers_master.js'],
        user: req.user
    })
})

router.get('/duties-master', async (req, res) => {
    let classes = await Class.find({}).sort({ classNumber : 1 })
    let brothers = []
    
    for (let class_ of classes) {
        let b = await Brother.find({ class: class_._id }).populate('class')
        b.sort((x, y) => {
            if (x.class.classNumber === y.class.classNumber)
                return x.full_name.toLowerCase().localeCompare(y.full_name.toLowerCase())
            
            return x.class.classNumber < y.class.classNumber ? -1 : 1
        })
        brothers.push(b)
    }

    let duty_type = {
        'Steward'           : 'waiter',
        'Cleaning Manager'  : 'cleanup',
        'Social Chair'      : 'setup',
    }

    res.render('exec/duties_master/duties_master', {
        title   : 'Duties Master Page',
        styles  : ['exec/duties/brothers_view.css', 'exec/duties/calendar_view.css', 'exec/duties/duties_master.css'],
        scripts : ['exec/duties/brothers_view.js', 'exec/duties/duties_master.js', 'exec/duties/calendar_view.js'],
        classes,
        brothers,
        duty_type: duty_type[req.user.position],
        user: req.user
    })
})

module.exports = router