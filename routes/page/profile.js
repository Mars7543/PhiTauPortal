const router    = require('express').Router()
const debug     = require('debug')('pages:profile')

router.get('/', (req, res) => {
    res.render('profile/profile', {
        title: 'My Profile',
        styles: ['profile/profile.css'],
        scripts: ['profile/profile.js'],
        user: req.user,
    })
})

module.exports = router