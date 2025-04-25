const express = require("express");
const { authenticateUser } = require("../middleware/userMiddleware");
const Account = require("../schemas/BankSchema");
const router = express.Router();
const zod = require("zod");
const User = require("../schemas/UserSchema");
const mongoose = require("mongoose")
router.get('/balance', authenticateUser, async (req, res) => {
    const myAccount = await Account.findOne({userId:req.userId});
    res.json(myAccount);
})

const transferValidation = zod.object({
    to: zod.string().email(),
    amount: zod.number().min(1, 'Amount cannot be negative')
});
router.post('/transfer',authenticateUser, async(req, res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    const { success, error } = transferValidation.safeParse({to:req.body.to, amount:req.body.amount});
    console.log(error)
    if ( ! success ) {
        res.status(400).json({message:'Invalid input'});
        return;
    }
    const sendUser = await User.findOne({email:req.to}).session(session);
    if( ! sendUser ) {
        res.status(400).json({message:'Invalid user'});
        return;
    }
    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }
    const toAccount = await Account.findOne({ userId: sendUser.userId }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }


    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
})

module.exports = router 