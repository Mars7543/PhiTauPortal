const assignment_mw     = require('../../middleware/assignment-middleware')
const router            = require('express').Router()
const debug             = require('debug')('pages:duties')

router.use('/', 
    assignment_mw.update_brother_assignments_status, 
    assignment_mw.get_brother_assignments_by_type
)

router
    .route('/')
    .get(async (req, res) => {
        res.render('duties/duties', {
            title: 'My Duties',
            styles: ["duties/duties.css"],
            scripts: [],
            user: req.user,
            assignments_by_type: req.assignments
        })
    })

module.exports = router