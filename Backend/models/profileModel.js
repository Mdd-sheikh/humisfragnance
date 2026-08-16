import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email:{type:String,unique:true},
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema); 
export default Profile; 