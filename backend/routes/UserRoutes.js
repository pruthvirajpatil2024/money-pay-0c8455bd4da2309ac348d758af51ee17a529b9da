const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../schemas/UserSchema");
const { authenticateUser } = require("../middleware/userMiddleware");
const zod = require('zod');
const Account = require("../schemas/BankSchema");
const userValidator = zod.object({
    firstName: zod.string(),
    lastName: zod.string(),
    email: zod.string().email(),
    password: zod.string(),
    avatar: zod.string().url(),
})

router.post('/', async (req, res) => {
    const { firstName, lastName, email, password, avatar } = req.body;
    const { success } = userValidator.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }
    const alreadyPresent = await User.findOne({ email });
    if (alreadyPresent) {
        res.status(411).json({ message: 'Email alread exists.' });
        return;
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const myUser = new User({ firstName, lastName, email, password: hashPassword, avatar });
    myUser.save()
        .then(async ( user ) => {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const account = new Account({
                userId: user._id,
                balance: parseInt( 1+ Math.random() * 1000 )
            });
            await account.save();
            res.status(201).json({ message: 'Account created successfully', id: user._id, token: token });
        }
        )
        .catch(err => console.log(err));
})

const userLoginValidator = zod.object({
    email: zod.string().email(),
    password: zod.string(),
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const { success } = userLoginValidator.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }
    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.status(200).json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
})

router.put('/', authenticateUser, async (req, res) => {
    const { firstName, lastName, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (user) {
        if (firstName) {
            user.firstName = firstName
        }
        if (lastName) {
            user.lastName = lastName
        }
        if (avatar) {
            user.avatar = lastName
        }
        await user.save();
        res.json({ message: 'User updated successfully' })
    } else {
        res.status(404).json({ message: 'Invalid credentials' });
    }
})

router.get('/', async (req, res) => {
    const searchQuery = req.query.search || '';
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": searchQuery
            }
        }, {
            lastName: {
                "$regex": searchQuery
            }
        }]
    })  

    res.json({
        user: users.map(user => ({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;