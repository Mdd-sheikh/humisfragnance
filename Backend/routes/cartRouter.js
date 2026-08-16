import express from 'express'
import Auth from '../middleware/Auth.js'
import { AddtoCart, getCart, removefromCart, updateCartQty } from '../controller/cartController.js'

const cartRouter = express.Router()

cartRouter.post("/addtocart", Auth, AddtoCart);
cartRouter.post("/removecart", Auth, removefromCart);
cartRouter.get("/get",Auth,getCart)
cartRouter.put("/updatequantity",Auth,updateCartQty);



export default cartRouter;