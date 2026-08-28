import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attar",
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    size: { type: String },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    },

    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },

    items: {
        type: [orderItemSchema],
        required: true,
        validate: (v) => Array.isArray(v) && v.length > 0,
    },

    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // ---- Razorpay — only required for online payments, not COD ----
    razorpayOrderId: {
        type: String,
        required: function () {
            return this.paymentMode !== "COD";
        },
    },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    paymentMode: {
        type: String,
        enum: ["Prepaid", "COD"],
        default: "Prepaid",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },

    // ---- Shiprocket / shipping ----
    courierPartner: { type: String, default: "Delhivery" },
    waybill: { type: String },        // AWB / tracking number
    trackingUrl: { type: String },    // label PDF URL after shipment creation

    // Package details — required by Shiprocket's create-order API
    packageWeightGrams: { type: Number, default: 500 },
    packageLengthCm: { type: Number, default: 10 },
    packageWidthCm: { type: Number, default: 10 },
    packageHeightCm: { type: Number, default: 10 },

    // Tracks whether push-order to Shiprocket succeeded, and Shiprocket's own shipment id
    shiprocketPushed: { type: Boolean, default: false },
    shipmentId: { type: String },

    orderStatus: {
        type: String,
        enum: [
            "placed",
            "shipment_created",
            "picked_up",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "rto",
        ],
        default: "placed",
    },

    deliveredAt: { type: Date },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ waybill: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;