const {Router} = require('express');
const cors = require('cors')
const userRoutes = require("./UserRoutes");
const accountRoutes = require("./AccountRoutes");
const router = Router();

router.use(cors())

router.use('/user', userRoutes);
router.use('/account',accountRoutes);

module.exports = router;