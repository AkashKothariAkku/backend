const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { errFunc } = require('../utils/sendResponse')
const Contest = require('../model/contest.model')

// Add Contest
exports.addContest = catchAsyncErrors(async (req, res, next) => {
    try {
        const { winnerAmount, maxAmount, sentence } = req.body
        await Contest.create({ winnerAmount, maxAmount, sentence })
        res.status(200).json({
            success: true,
            data: {},
            message: `Contest created`
        })
    } catch (error) {
        return next(errFunc(res, 500, false, error.message))
    }
})

// Get Contest
exports.getContest = catchAsyncErrors(async (req, res, next) => {
    try {
        let contestList = await Contest.find()
        res.status(200).json({
            success: true,
            data: contestList,
            message: `Contest created`
        })
    } catch (error) {
        return next(errFunc(res, 500, false, error.message))
    }
})



