const stripe = require('stripe')('sk_test_51MgnzPSGPDEMOcS92YCxCvswU4XsePaDef0UbZ1G0kHkkFZtIPdfxTVDkVqfT89NZCJWg5a7zOy0EIKKCvpNFXKi00HCTKM1sO');
const express = require('express');
const router = express();
const adminController = require('../controllers/admin');

const auth = require('../middleware/adminAuth')

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
router.set('views', './views/admin');

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



router.get('/home', adminController.getDashboard);

router.get('/logout', auth.isLogin, adminController.getLogout);

router.get('/forget', auth.isLogout, adminController.getForget);

router.post('/forget', adminController.postForget);

router.get('/forget-password', auth.isLogout, adminController.getForgetPassword);

router.post('/forget-password', adminController.postForgetPassword);

// router.get('/dashboard', auth.isLogin, adminController.loadDashboard);
router.get('/dashboard', adminController.loadDashboard);


router.get('/new-user', auth.isLogin, adminController.getNewUser);

router.post('/new-user', upload.single('image'), adminController.postNewUser);

router.get('/edit-user', auth.isLogin, adminController.getEditUser);

router.post('/edit-user', upload.single('image'), adminController.postUpdateUser);

router.get('/delete-user', auth.isLogin, adminController.getDeleteUser);

router.get('/export-user', auth.isLogin, adminController.getExportUser);




module.exports = router;