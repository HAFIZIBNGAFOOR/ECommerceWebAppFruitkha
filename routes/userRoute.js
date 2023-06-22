const express=require ('express');
const userRoute=express();
const bodyParser=require('body-parser');
const userController= require('../controllers/userController');
const morgan = require('morgan');
const config=require('../config/config');
const session= require('express-session');
const auth =require('../middleware/auth');
const Razorpay=require('razorpay');
var instance = new Razorpay({key_id:config.YOUR_KEY_ID,key_secret:config.YOUR_KEY_SECRET,});

userRoute.use(session({secret:config.sessionSecret,resave: true, saveUninitialized: true}));
userRoute.set('view engine','ejs');
userRoute.set('views','./views/userViews');
userRoute.use(express.json());
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}));
userRoute.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next();
})
userRoute.use(morgan('dev'));
userRoute.get('/signup',userController.loadSignUp);
userRoute.post('/signup',userController.sendOTP);
userRoute.post('/otp',userController.verifyOTP);
userRoute.get('/',userController.loadHome);
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login/otp',userController.verifyLogin);
userRoute.post('/login',userController.verifyUser)
userRoute.get('/shop',userController.loadShop);
userRoute.get('/single-product',auth.userlogin,userController.singleProductLoad);
userRoute.post('/add-to-cart',userController.addToCart);
userRoute.get('/cart',auth.userlogin,userController.loadCart);
userRoute.post('/delete-cartItem',userController.deleteCart)
userRoute.get('/Checkout',auth.userlogin,userController.loadCheckout);
userRoute.post('/Checkout',userController.placeOrder)
userRoute.get('/edit-checkOutAddress',userController.editCheckoutAddress)
userRoute.post('/removeaddress-checkoutpage',userController.deleteCheckoutAddress);
userRoute.get('/checkout-addAddress',userController.addCheckoutAddress);
userRoute.post('/checkout-addAddress',userController.saveCheckoutAddress);
userRoute.post('/validateCoupon',userController.coupon)


userRoute.post('/updateCart',userController.updateCart);
userRoute.get('/profile',auth.userlogin,userController.loadProfile);
userRoute.post('/profile',userController.AddProfile);
userRoute.get('/address',auth.userlogin,userController.loadAddress);
userRoute.get('/add-address',auth.userlogin,userController.addAddress);
userRoute.post('/add-address',userController.saveAddress);
userRoute.get('/editAddress',auth.userlogin, userController.loadEditAddress)
userRoute.post('/editAddress', userController.saveEditedAddress)
userRoute.get('/forgotPassword',auth.userlogin, userController.loadForgotPassword)
userRoute.post('/forgotPassword', userController.forgotPassword)
userRoute.get('/forget-password',  userController.forgetVerify);
userRoute.post('/forget-password',  userController.resetPassword);
 
userRoute.post('/deleteAddress',userController.deleteAddress)
userRoute.get('/orders',auth.userlogin,userController.loadOrders)
userRoute.get('/viewOrder',auth.userlogin,userController.viewOrders)
userRoute.get('/cancel-order',auth.userlogin,userController.deleteOrder)
userRoute.get('/orderSuccess',auth.userlogin,userController.orderSuccess);
userRoute.get('/trackOrder',auth.userlogin,userController.trackOrder);

userRoute.post('/create/orderId',(req,res)=>{
    try {
            console.log("Create OrderId Request",req.body)
            var options = {
              amount: req.body.amount,  // amount in the smallest currency unit
              currency: "INR",
              receipt: "rcp1"
            };
            instance.orders.create(options, function(err, order) {
              console.log(order);
              res.send({orderId:order.id});//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
            });

    } catch (error) {
        console.log('this is creating oreder id error   ',error);
    }
  });

  userRoute.post("/api/payment/verify",(req,res)=>{

    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
     var crypto = require("crypto");
var expectedSignature = crypto.createHmac('sha256',config.YOUR_KEY_SECRET) 
                                     .update(body.toString())
                                     .digest('hex');
                                     console.log("sig received " ,req.body.response.razorpay_signature);
                                     console.log("sig generated " ,expectedSignature);
     var response = {"signatureIsValid":"false"}
     if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
  });

userRoute.get('/logout',auth.userLogout);

module.exports=userRoute;