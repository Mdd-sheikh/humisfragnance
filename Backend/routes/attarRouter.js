import express from "express";
import { upload,createAttarproduct,
    getAttarproduct,
    getSingleAttarproduct,
    updateAttarproduct,
    deleteAttarproduct,getAllAttarproduct } from "../controller/attarController.js";


const Attarrouter = express.Router();

Attarrouter.post("/create", upload.array("images", 5), createAttarproduct);
Attarrouter.get("/get", getAttarproduct);
Attarrouter.get("/getallatter", getAllAttarproduct);
Attarrouter.get("/:id", getSingleAttarproduct);
// Admin panel has no login, so edit/delete are not token-protected (same as create).
Attarrouter.put("/:id", upload.array("images", 5), updateAttarproduct);
Attarrouter.delete("/:id", deleteAttarproduct);

export default Attarrouter;