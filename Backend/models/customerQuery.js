import mongoose from "mongoose";

export const QUERY_SUBJECTS = ["General Inquiry", "Refund", "Complaint", "Others"];
export const QUERY_STATUSES = ["new", "read", "resolved"];

const customerQuerySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
        phone: { type: String, trim: true, maxlength: 20, default: "" },
        subject: { type: String, enum: QUERY_SUBJECTS, default: "General Inquiry" },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        status: { type: String, enum: QUERY_STATUSES, default: "new", index: true },
    },
    { timestamps: true }
);

customerQuerySchema.index({ createdAt: -1 });

const CustomerQuery = mongoose.model("CustomerQuery", customerQuerySchema);
export default CustomerQuery;
