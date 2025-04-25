const {Schema, model, default: mongoose} = require('mongoose');

const BankSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    balance:{
        type: Number,
        default: 0
    }
});

const Account = model('account', BankSchema);
module.exports = Account;