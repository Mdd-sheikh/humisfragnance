import express from 'express'
import Auth from '../middleware/Auth.js';
import { createAddress, DeleteAddress, Getaddress, updateAdddress } from '../controller/addressController.js';

const AddressRouter = express.Router();

AddressRouter.post("/addtoaddress",Auth,createAddress);
AddressRouter.put("/updateaddress",Auth,updateAdddress);
AddressRouter.delete("/deleteaddress/:id",Auth,DeleteAddress);
AddressRouter.get("/getaddress",Auth,Getaddress)


export default AddressRouter;