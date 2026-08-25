import express from 'express';
import { createOrder, verifyPayment, getUserOrders, getAllOrders } from '../controller/orderController.js';
import Auth from '../middleware/Auth.js';


const placeorderRouter = express.Router();

placeorderRouter.post('/placeorder', Auth, createOrder);
placeorderRouter.post('/verifypayment', Auth, verifyPayment);
placeorderRouter.get("/getorders", Auth,getUserOrders);
placeorderRouter.get("/getuserorders",getUserOrders);
placeorderRouter.get("/getAllOrders",getAllOrders)


export default placeorderRouter;