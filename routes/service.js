const express = require('express');
const router = express();
const serviceController = require('../controllers/service');
const config = require('../config/config')
const auth = require('../middleware/adminAuth')
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const stripe = require('stripe')('sk_test_51MgnzPSGPDEMOcS92YCxCvswU4XsePaDef0UbZ1G0kHkkFZtIPdfxTVDkVqfT89NZCJWg5a7zOy0EIKKCvpNFXKi00HCTKM1sO');

router.set('view engine', 'ejs');
router.set('views', './views/service');
router.use(express.static('public'));


router.get('/servicelist', serviceController.getService);

router.get('/addservice', serviceController.getAddService);

router.post('/addservice', serviceController.postService)

router.get('/edit-service', auth.isLogin, serviceController.getEditService);

router.post('/edit-service', serviceController.postUpdateService);

router.get('/delete-service', auth.isLogin, serviceController.getDeleteService);

router.get('/payment', auth.isLogin, serviceController.getpayment);

router.post('/create-checkout-session', serviceController.postpayments);

module.exports = router;
