import express from 'express';
import { createOrder, verifyPayment, getUserOrders, getAllOrders, getOrderTracking } from '../controller/orderController.js';
import Auth from '../middleware/Auth.js';


const placeorderRouter = express.Router();

placeorderRouter.post('/placeorder', Auth, createOrder);
placeorderRouter.post('/verifypayment', Auth, verifyPayment);
placeorderRouter.get("/getorders", Auth, getUserOrders);
placeorderRouter.get("/getuserorders", Auth, getUserOrders);
placeorderRouter.get("/getAllOrders", Auth, getAllOrders)
placeorderRouter.get("/getOrderTracking", Auth, getOrderTracking);


export default placeorderRouter;