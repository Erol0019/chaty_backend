const { register, login, setAvatar } = require("../controllers/usersController");

const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/setAvatar', setAvatar);

module.exports = router;