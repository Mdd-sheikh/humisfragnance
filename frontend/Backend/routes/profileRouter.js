import express from "express";
import Auth from "../middleware/Auth.js"; // adjust path as needed
 // your diskStorage multer instance
 import { Upload } from "../controller/profileController.js";
import { getMyProfile,getProfileByUserId,createProfile,updateProfile,deleteProfile,uploadAvatar,getAllProfiles } from "../controller/profileController.js"; // adjust path as needed

const Profilerouter = express.Router();

// Logged-in user's own profile
Profilerouter.post("/createprofile", Auth, Upload.single("avatarUrl"), createProfile); 
Profilerouter.get("/getprofile", Auth, getMyProfile);
Profilerouter.put("/updateprofAuth",Auth, updateProfile);
Profilerouter.delete("/deleteprofile", Auth, deleteProfile);

// Avatar-specific route (update/replace picture only)


// Admin routes
Profilerouter.get("/all", Auth, getAllProfiles);
 

export default Profilerouter;