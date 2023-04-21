const express = require('express');

const userController = require('../controllers/user')
const router = express();

const config = require('../config/config')
const session  = require('express-session')
router.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.set('view engine', 'ejs');
router.set('views', './views/users');

const auth = require('../middleware/auth');

const multer = require('multer');
const path = require('path');   

router.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/Images'));
    },
    filename:function(req,file,cb){
        const name = Date.now() + path.extname(file.originalname);
        cb(null,name);
    }
});

const upload = multer({storage:storage});

router.get('/register',auth.isLogout, userController.getRegister);

router.post('/register',
//     bodyParser, [
//     check('name', 'The username must be 3+ characters long')
//         .exists()
//         .isLength({ min: 3 })
// ],
    userController.postRegister);

router.get('/verify', userController.getverifyMail);

router.post('/email-verified', userController.postverifyMail);

router.get('/',auth.isLogout, userController.getLogin);

router.get('/login',auth.isLogout, userController.getLogin);

router.post('/login', userController.postLogin);

router.get('/home',auth.isLogin, userController.getHome);

router.get('/logout',auth.isLogin, userController.getLogout);

router.get('/forget', auth.isLogout, userController.getForget);

router.post('/forget', userController.postForget);

router.get('/forget-password', auth.isLogout, userController.forgetpassword);

router.post('/forget-password', userController.resetpassword);

router.get('/edit', auth.isLogin, userController.getEdit);

router.post('/edit', upload.single('image'), userController.postUpdate);

router.get('/dashboard',  userController.getdashboard);

module.exports = router;