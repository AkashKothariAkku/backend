const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const { errFunc } = require('../utils/sendResponse')
const User = require('../model/user.model')
const Contest = require('../model/contest.model')
const BankAccount = require('../model/bankaccount.model')
const Transaction = require('../model/transaction.model')
const ContestAmount = require('../model/contestAmount.model')
const levenshtein = require('js-levenshtein');
const { ObjectId } = require('mongodb');
const { default: mongoose } = require('mongoose')
const WithdrawAmount = require('../model/withdrawalAmount.model')

// Register User
exports.register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body

  const isUser = await User.findOne({ email })
  if (isUser) {
    if (isUser && isUser?.isVerified === false) {
      // Get verifyUser Token
      const verifyToken = await isUser.getVerifyUserToken()
      const message = `Thanks so much for signing up on GodMoney! We're really excited to have you as part of our community. Please verify your email: \n\n ${verifyToken}`

      sendEmail({
        email: isUser.email,
        subject: 'Welcome to GodMoney! Please verify your email ',
        message
      })

      return res.status(200).json({
        success: true,
        data: {
          userId: isUser?._id
        },
        message: `Email sent to ${isUser.email} successfully`
      })
    } else {
      return next(errFunc(res, 401, false, 'Email ID already exist'))
    }
  }

  const user = await User.create({ name, email, password })

  // Get verifyUser Token
  const verifyToken = await user.getVerifyUserToken()

  const message = `Thanks so much for signing up on GodMoney! We're really excited to have you as part of our community. Please verify your email: \n\n ${verifyToken}`

  try {
    res.status(200).json({
      success: true,
      data: {
        userId: user?._id
      },
      message: `Email sent to ${user.email} successfully`
    })

    await sendEmail({
      email: user.email,
      subject: 'Welcome to GodMoney! Please verify your email ',
      message
    })
  } catch (error) {
    user.verifyUserToken = undefined
    user.verifyUserExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(errFunc(res, 500, false, error.message))
  }
})

// Verification of User

exports.verifyUser = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const verifyUserToken = req.body.otp

  const user = await User.findOne({
    _id: req?.params?.userId,
    verifyUserToken
  }).select('+verifyUserToken').select('+verifyUserExpire')
  const time = new Date(user.verifyUserExpire).getTime()
  if (user && user.isVerified === false && (time + (15 * 60 * 1000)) < Date.now()) {
    await user.deleteOne()
    return errFunc(res, 400, false, `Verify User Token is invalid or has been expired`
    )
  }

  if (user && user.isVerified === true) {
    return errFunc(res, 400, false, 'User already verified')
  }

  if (!user) {
    return errFunc(res, 400, false, 'Verify User Token is invalid or has been expired')
  }

  user.status = true
  user.isVerified = true
  await user.save()
  sendToken(user, 200, res)
})

// // Register Admin
// exports.registerAdminSync = catchAsyncErrors(async (req, res, next) => {
//   const { name, email, password } = req.body

//   const isUser = await syncAdminRegistration.findOne({ email })
//   const userData = await syncRegistration.findOne({ email })

//   if (isUser || userData) {
//     return next(errFunc(res, 401, false, 'Email ID already exist'))
//   }

//   const user = await syncAdminRegistration.create({ name, email, password })

//   await user.save({ validateBeforeSave: false })
//   res.status(200).json({
//     success: true,
//     message: `Register ${user.email} successfully`
//   })
// })

// Login User
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(errFunc(res, 400, false, 'Please Enter Email & Password'))
  }

  const user = await User.findOne({ email }).select('+password')
  if (user) {
    if (user.isVerified === false) {
      await sendVerificationEmail(user, req)
      return res.status(403).json({
        success: false,
        message: `Email sent to ${user.email} successfully. Please verify first`,
        status: 403,
        data: {
          userId: user?._id
        },
      })
    }

    if (await user.comparePassword(password)) {
      if (user.status === false) {
        return res.status(403).json({
          success: false,
          message: 'Your account is temporarily deactivated by admin'
        })
      }
      sendToken(user, 200, res)
      return
    } else {
      next(errFunc(res, 401, false, 'Invalid email or password'))
    }
  }
  next(errFunc(res, 401, false, 'Invalid email or password'))
})

async function sendVerificationEmail(user, req) {
  const verifyToken = await user.getVerifyUserToken()
  const message = `Thanks so much for signing up on GodMoney! We're really excited to have you as part of our community. Please verify your email: \n\n ${verifyToken}`
  await sendEmail({
    email: user.email,
    subject: 'Welcome to GodMoney! Please verify your email ',
    message
  })
}
// // Login Admin
// exports.loginAdminSync = catchAsyncErrors(async (req, res, next) => {
//   const { email, password, fcmToken } = req.body

//   if (!email || !password) {
//     return next(errFunc(res, 400, false, 'Please Enter Email & Password'))
//   }

//   const admin = await syncAdminRegistration.findOne({ email }).select('+password')

//   if (!admin) {
//     return next(errFunc(res, 401, false, 'User not found'))
//   }

//   if (admin && await admin.comparePassword(password)) {
//     if (fcmToken !== '' && !admin.fcmToken.some((e) => e === fcmToken)) {
//       admin.fcmToken.push(fcmToken)
//       await admin.save()
//     }
//     sendToken(admin, 200, res)
//     return
//   }

//   next(errFunc(res, 401, false, 'Invalid email or password'))
// })

// // Logout User
// exports.logout = catchAsyncErrors(async (req, res, next) => {
//   console.log(req.body, 'asdjhj')
//   let user = await syncRegistration.findById(req.body.id)

//   if (!user) {
//     user = await cafeRegistration.findById(req.body.id)
//   }

//   if (!user) {
//     user = await syncAdminRegistration.findById(req.body.id)
//   }

//   if (!user) {
//     return next(errFunc(res, 401, false, 'User not found'))
//   }

//   user.fcmToken = user.fcmToken.filter((item) => item !== req.body.fcmToken)
//   await user.save()
//   res.cookie('token', '', {
//     expires: new Date(0),
//     httpOnly: true
//   })

//   res.status(200).json({
//     success: true,
//     message: 'Logged Out'
//   })
// })

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(errFunc(res, 404, false, 'User not found'))
  }

  if (user && user.isVerified === false) {
    // Get verifyUser Token
    await sendVerificationEmail(user, req)
    res.status(403).json({
      success: false,
      data: {
        userId: user?._id
      },
      message: `Email sent to ${user.email} successfully.Please verify first`
    })
  }

  // Get ResetPassword Token
  if (user) {
    const resetToken = user.getResetPasswordToken()

    const message = `Your password reset OTP is :- \n\n ${resetToken} \n\nIf you have not requested this email then, please ignore it.`

    try {
      res.status(200).json({
        success: true,
        data: {
          userId: user?._id
        },
        message: `Email sent to ${user.email} successfully`
      })

      await sendEmail({
        email: user.email,
        subject: 'GodMoney Password Recovery',
        message
      })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({ validateBeforeSave: false })

      return next(errFunc(res, 500, false, error.message))
    }
  }
})

// verify OTP
exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = req.body.otp

  const user = await User.findOne({
    _id: req?.params?.userId,
    resetPasswordToken
  }).select('+resetPasswordToken').select('+resetPasswordExpire')

  if (!user) {
    return next(errFunc(res, 400, false, 'Reset Password OTP is invalid or has been expired'))
  }

  if (user) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({
      success: true,
      data: {
        userId: user?._id
      },
      message: `OTP matched`
    })
  }
})

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findOne({
    _id: req?.params?.userId
  }).select('+password')

  if (!user) {
    return next(errFunc(res, 400, false, 'User not found'))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(errFunc(res, 400, false, 'Password and confirm password does not macthed'))
  }

  if (user) {
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
  }
})

// Get Contest List
exports.getContest = catchAsyncErrors(async (req, res, next) => {

  const contest = await Contest.find({ status: "active" })
  res.status(200).json({
    success: true,
    data: contest,
    message: `Get contest list`
  })

})

// Get Contest List
exports.viewContest = catchAsyncErrors(async (req, res, next) => {
  const {id} = req.params
  const contest = await ContestAmount.aggregate([{
    $match:{
      contestId: mongoose.Types.ObjectId.createFromHexString(id)
    }
  },{
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "users",
      pipeline:[{
        $project: {
          name: 1,
          email: 1
        }
      }]
    }
  },{
    $unwind:{
      path: "$users",
      preserveNullAndEmptyArrays: false
    }
  }])
  res.status(200).json({
    success: true,
    data: contest,
    message: `Get contest list`
  })

})


// Get Winner List
exports.winnerList = catchAsyncErrors(async (req, res, next) => {
  const contest = await Contest.aggregate([{
    $lookup: {
      from: "users",
      localField: "winnerId",
      foreignField: "_id",
      as: "users",
      pipeline:[{
        $project: {
          name: 1,
          email: 1
        }
      }]
    }
  },{
    $unwind:{
      path: "$users",
      preserveNullAndEmptyArrays: false
    }
  }])
  res.status(200).json({
    success: true,
    data: contest,
    message: `Get Winner list`
  })

})


// Get Contest List
exports.requestAmount = catchAsyncErrors(async (req, res, next) => {
  const contest = await Transaction.aggregate([{
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "users",
      pipeline:[{
        $project: {
          name: 1,
          email: 1
        }
      }]
    }
  },{
    $unwind:{
      path: "$users",
      preserveNullAndEmptyArrays: false
    }
  }])
  res.status(200).json({
    success: true,
    data: contest,
    message: `Get contest list`
  })

})


// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req?.user?.id)

  if (!user) {
    res.status(404).json({
      success: false,
      data: {},
      message: `User not found`
    })
  }

  res.status(200).json({
    success: true,
    data: user,
    message: `User details`
  })
})


// Edit User Detail
exports.editUserDetails = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findByIdAndUpdate(req?.user?.id, req.body)

  if (!user) {
    res.status(404).json({
      success: false,
      data: {},
      message: `User not found`
    })
  }

  res.status(200).json({
    success: true,
    data: user,
    message: `User details`
  })
})


// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!user) {
    return next(errFunc(res, 401, false, 'User not found'))
  }

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

  if (!isPasswordMatched) {
    return next(errFunc(res, 400, false, 'Old password is incorrect'))
  }

  user.password = req.body.newPassword

  await user.save()

  sendToken(user, 200, res)
})

// Add Bank Account
exports.addBankAccount = catchAsyncErrors(async (req, res, next) => {
  const { name, accountNumber, bankName, branchName, ifscCode } = req.body

  const isUser = await User.findById(req?.user?.id)
  if (!isUser) {
    return next(errFunc(res, 404, false, 'User not found'))
  }

  await BankAccount.create({ userId: req.user.id, name, accountNumber, bankName, branchName, ifscCode })

  res.status(200).json({
    success: true,
    data: {},
    message: `Bank account added`
  })
})

// Add Wallet Amount
exports.addAmount = catchAsyncErrors(async (req, res, next) => {
  const { utrNumber, amount } = req.body

  const isUser = await User.findById(req?.user?.id)
  if (!isUser) {
    return next(errFunc(res, 404, false, 'User not found'))
  }

  await Transaction.create({ userId: req.user.id, utrNumber, amount })

  res.status(200).json({
    success: true,
    data: {},
    message: `Add amount request generated.`
  })
})

// Add Contest Amount
exports.addContestAmount = catchAsyncErrors(async (req, res, next) => {
  const { contestId, amount, sentence, time } = req.body

  const isUser = await User.findById(req?.user?.id)
  if (!isUser) {
    return next(errFunc(res, 404, false, 'User not found'))
  }

  if (isUser?.walletAmount < amount) {
    return next(errFunc(res, 501, false, 'Your wallet does not have enough amount'))
  }

  let getContest = await Contest.findById(contestId)

  if (!getContest) {
    return next(errFunc(res, 501, false, 'Contest not found'))
  }

  const distance = levenshtein(sentence, getContest?.sentence);

  const accuracy = 1 - (distance / Math.max(sentence.length, getContest?.sentence.length));
  await ContestAmount.create({ userId: req.user.id, amount, contestId, sentenceAccuracy: (accuracy * 100).toFixed(2), time })
  await Contest.findByIdAndUpdate(contestId, {$inc: {peopleCount: 1}})
  await User.findByIdAndUpdate(req.user.id, { $inc: { walletAmount: -amount } })

  res.status(200).json({
    success: true,
    data: {},
    message: `Played contest.`
  })
})

// Get User Contests
exports.getUserContests = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req?.user?.id)
  if (!user) {
    res.status(404).json({
      success: false,
      data: {},
      message: `User not found`
    })
  }
  const objectIdUserId = mongoose.Types.ObjectId.createFromHexString(req?.user?.id);
  let contests = await ContestAmount.aggregate([
    {
      $match: { userId: objectIdUserId }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: "$contestId",
        doc: { $first: "$$ROOT" }
      }
    },
    {
      $lookup: {
        from: "contests",
        localField: "_id",
        foreignField: "_id",
        as: "contestDetails"
      }
    },
    {
      $unwind: "$contestDetails"
    },
    {
      $project: {
        _id: 0,
        contest: "$doc",
        contestDetails: 1
      }
    }
  ]);
  res.status(200).json({
    success: true,
    data: contests,
    message: `User details`
  })
})

// Get Bank Account
exports.getBankAccount = catchAsyncErrors(async (req, res, next) => {

  const isUser = await User.findById(req?.user?.id)
  if (!isUser) {
    return next(errFunc(res, 404, false, 'User not found'))
  }

  let bankAccountList = await BankAccount.find({ userId: req.user.id })
  bankAccountList = bankAccountList.map(account => {
    return {
      ...account.toObject(),
      accountNumber: account.accountNumber.toString().replace(/\d(?=\d{4})/g, 'x')
    };
  });

  res.status(200).json({
    success: true,
    data: bankAccountList,
    message: `Bank account list fetched.`
  })
})

// Get Withdraw Request
exports.withdrawRequest = catchAsyncErrors(async (req, res, next) => {
  let {amount, bankAccountId} = req.body
  const isUser = await User.findById(req?.user?.id)
  if (!isUser) {
    return next(errFunc(res, 404, false, 'User not found'))
  }
  if(amount > isUser?.walletAmount){
    return next(errFunc(res, 500, false, 'Your wallet Amount is low then your requested amount'))
  }
  amount = +amount
  await User.findByIdAndUpdate(req?.user?.id, { $inc: { walletAmount: -amount } })

  await WithdrawAmount.create({userId: req?.user?.id, amount, accountNumberId: bankAccountId})

  res.status(200).json({
    success: true,
    data: {},
    message: `Withdraw requested`
  })
})

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {

  let user = await User.findById(req.user.id)

  if (!user) {
    return next(errFunc(res, 401, false, 'User not found'))
  }

  await user.save()
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'None',
   secure: true,
  })

  res.status(200).json({
    success: true,
    message: 'Logged Out'
  })
})

// // Get all users(admin)
// exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
//   const users = await syncRegistration.find().populate({
//     path: 'connection',
//     model: syncRegistration,
//     select: 'name schoolName profileImage connection headline gender interest',
//     populate: { path: 'connection', model: syncRegistration, select: 'name schoolName profileImage connection' }
//   }).exec()

//   res.status(200).json({
//     success: true,
//     users: users.reverse()
//   })
// })

// // Get single user (admin)
// exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
//   const user = await syncRegistration.findById(req.params.id).populate([{
//     path: 'ratingReviews',
//     populate: [
//       { path: 'cafeData', model: cafeRegistration, select: 'establishmentName pictures streetAddress images city' },
//       { path: 'userProfile', model: syncRegistration, select: 'name profileImage position country city' }
//     ]
//   },
//   {
//     path: 'ratingFilters',
//     populate: [
//       { path: 'cafeData', model: cafeRegistration, select: 'establishmentName pictures streetAddress images city' },
//       { path: 'userProfile', model: syncRegistration, select: 'name profileImage position country city' }
//     ]
//   },
//   {
//     path: 'savedCafe',
//     model: cafeRegistration,
//     select: 'establishmentName pictures streetAddress city images latitude longitude'
//   },
//   {
//     path: 'recommandCafes',
//     model: recommendCafeSchema,
//     select: 'establishmentName pictures streetAddress city latitude longitude ratingReviews reviewsNumber stars openHours images',
//     populate: { path: 'ratingReviews', populate: { path: 'userProfile', model: syncRegistration, select: 'name schoolName profileImage' } }
//   },
//   {
//     path: 'pinnedCafe',
//     model: cafeRegistration,
//     select: 'establishmentName pictures streetAddress city images latitude longitude ratingReviews reviewsNumber openHours stars',
//     populate: { path: 'ratingReviews', populate: { path: 'userProfile', model: syncRegistration, select: 'name schoolName profileImage' } }
//   },
//   {
//     path: 'requestConnection',
//     model: syncRegistration,
//     select: 'name schoolName profileImage connection',
//     populate: { path: 'connection', model: syncRegistration, select: 'name schoolName profileImage connection' }
//   },
//   {
//     path: 'sendConnection',
//     model: syncRegistration,
//     select: 'name schoolName profileImage connection',
//     populate: { path: 'connection', model: syncRegistration, select: 'name schoolName profileImage connection' }
//   },
//   {
//     path: 'connection',
//     model: syncRegistration,
//     select: 'name schoolName profileImage connection',
//     populate: { path: 'connection', model: syncRegistration, select: 'name schoolName profileImage connection' }
//   }]).exec()

//   if (!user) {
//     return next(errFunc(res, 404, false, `User does not exist with Id: ${req.params.id}`))
//   }

//   res.status(200).json({
//     success: true,
//     user
//   })
// })

// // update User Status -- Admin
// exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
//   const user = await syncRegistration.findById(req.params.id)

//   if (!user) {
//     return next(errFunc(res, 404, false, `User does not exist with Id: ${req.params.id}`))
//   }

//   user.status = !user.status

//   res.status(200).json({
//     success: true,
//     message: `${user.name} is ${
//       user.status === true ? 'actived' : 'deactivated'
//     }`
//   })

//   await user.save()
// })



// // Update admin data
// exports.updateAdminData = catchAsyncErrors(async (req, res, next) => {
//   const user = await syncAdminRegistration.findByIdAndUpdate(req.params.id, req.body, {
//     new: true
//   })

//   if (!user) {
//     return next(errFunc(res, 404, false, `User does not exist with Id: ${req.params.id}`))
//   }

//   res.status(200).json({
//     success: true,
//     message: `${user.name} is updated successfully`,
//     user
//   })

//   await user.save()
// })

// exports.updateAdminPassword = catchAsyncErrors(async (req, res, next) => {
//   const user = await syncAdminRegistration.findById(req.user.id).select('+password')

//   const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

//   if (!isPasswordMatched) {
//     return next(errFunc(res, 400, false, 'Old password is incorrect'))
//   }

//   user.password = req.body.newPassword

//   await user.save()

//   res.status(200).json({
//     success: true,
//     message: 'Password updated successfully'
//   })
// })



