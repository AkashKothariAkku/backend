const express = require('express')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const { addContest } = require('../controllers/admin.controller')
const { getContest, viewContest } = require('../controllers/user.controller')

const router = express.Router()

router.route('/add-contest').post(addContest)

router.route('/get-all-contest').get(getContest)

router.route('/view-contest/:id').get(viewContest)

module.exports = router
