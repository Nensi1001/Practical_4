const express = require('express');
const router = express();
const custController = require('../controllers/customer');
const config = require('../config/config')
const auth = require('../middleware/adminAuth')
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.set('view engine', 'ejs');
router.set('views', './views/customer');
router.use(express.static('public'));


router.get('/custlist', custController.getCustomer);

router.get('/addcustomer', custController.getAddCustomer);

router.post('/addcustomer',custController.postCustomer)

router.get('/edit-customer', auth.isLogin, custController.getEditCustomer);

router.post('/edit-customer', custController.postUpdateCustomer);

router.get('/delete-customer', auth.isLogin, custController.getDeleteCustomer);

module.exports = router;
