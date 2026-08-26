import express from "express";
import { upload,createAttarproduct,
    getAttarproduct,
    getSingleAttarproduct,
    updateAttarproduct,
    deleteAttarproduct,getAllAttarproduct } from "../controller/attarController.js";
    import Auth from "../middleware/Auth.js";


const Attarrouter = express.Router();

Attarrouter.post("/create", upload.array("images", 5), createAttarproduct);
Attarrouter.get("/get", getAttarproduct);
Attarrouter.get("/:id", getSingleAttarproduct);
Attarrouter.put("/:id",Auth, upload.array("images", 5), updateAttarproduct);
Attarrouter.delete("/:id",Auth, deleteAttarproduct);
Attarrouter.get("/getallatter", getAllAttarproduct);

export default Attarrouter;