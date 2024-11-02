const express = require('express')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const { register, verifyUser, login, forgotPassword, verifyOtp, resetPassword, getContest, getUserDetails, editUserDetails, updatePassword, addBankAccount, addAmount, addContestAmount, getUserContests, getBankAccount, withdrawRequest, logout, requestAmount, winnerList, resendOtp } = require('../controllers/user.controller')

const router = express.Router()

router.route('/register').post(register)

router.route('/verify/:userId').post(verifyUser)

router.route('/resend-otp/:userId').post(resendOtp)

router.route('/login').post(login)

router.route('/forgot-password').post(forgotPassword)

router.route('/verify-otp/:userId').post(verifyOtp)

router.route('/reset-password/:userId').post(resetPassword)

router.route('/get-contest').get(isAuthenticatedUser, getContest)

router.route('/get-user-contest').get(isAuthenticatedUser, getUserContests)

router.route('/me').get(isAuthenticatedUser, getUserDetails)

router.route('/edit-user').post(isAuthenticatedUser, editUserDetails)

router.route('/password/update').put(isAuthenticatedUser, updatePassword)

router.route('/add-bank-account').post(isAuthenticatedUser, addBankAccount)

router.route('/withdraw-request').post(isAuthenticatedUser, withdrawRequest)

router.route('/get-bank-account').get(isAuthenticatedUser, getBankAccount)

router.route('/request-amount-list').get(requestAmount)

router.route('/winner-list').get(winnerList)

router.route('/add-amount').post(isAuthenticatedUser, addAmount)

router.route('/add-contest-amount').post(isAuthenticatedUser, addContestAmount)

router.route('/logout').get(isAuthenticatedUser, logout)
// router.route('/registeradmin').post(registerAdminSync)

// router.route('/adminlogin').post(loginAdminSync)


// router.route('/password/forgot').post(forgotPassword)

// router.route('/password/reset/:token').put(resetPassword)

// router.route('/logout').post(logout)



// router
//   .route('/admin/addusers')
//   .post(isAuthenticatedUser, authorizeRoles('admin'), addUser)

// router
//   .route('/admin/users')
//   .get(isAuthenticatedUser, getAllUser)

// router.route('/getsingleuser/:id').get(isAuthenticatedUser, getSingleUser)

// router
//   .route('/admin/user/:id')
//   .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
//   .patch(isAuthenticatedUser, authorizeRoles('admin'), updateUserStatus).put(isAuthenticatedUser, authorizeRoles('admin'), updateAdminData)

// router.route('/admin/changepassword').put(isAuthenticatedUser, authorizeRoles('admin'), updateAdminPassword)

module.exports = router
