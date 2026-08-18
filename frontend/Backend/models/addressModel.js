// models/Address.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true }, // recipient name, can differ from account name
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" }, 
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
 
const Address =  mongoose.model("Address", addressSchema);
export default Address;