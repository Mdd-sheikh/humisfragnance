import mongoose from "mongoose";

// Each size/volume option can have its own price and stock
const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },       // e.g. "10ml", "25ml", "50ml"
    price: { type: Number, required: true },
    discountPrice: { type: Number },               // optional sale price
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true }, // unique code per variant, optional
}, { _id: true });

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    public_id: { type: String, required: true },
}, { _id: false });

const attarSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true, // for fast lookup by URL slug, e.g. /product/rose-attar
    },
    description: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String, // for product cards/listings, keep it brief
        maxlength: 160,
    },

    // Base price for display/sorting when no variant is selected yet
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discountPrice: {
        type: Number,
        min: 0,
    },

    variants: [variantSchema], // different sizes, each with own price/stock

    images: {
        type: [imageSchema],
        validate: [(arr) => arr.length > 0, "At least one image is required"],
    },

    category: {
        type: String,
        required: true,
        enum: ["floral", "woody", "musk", "oud", "citrus", "spicy"], // adjust to your actual categories
        index: true,
    },
    tags: [{ type: String }], // e.g. ["bestseller", "new", "unisex"], useful for filters

    brand: {
        type: String,
        default: "Humi's",
    },

    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
    },

    stock: {
        type: Number,
        default: 0,
        min: 0,
    }, // total stock if you don't use variants for a given product

    isActive: {
        type: Boolean,
        default: true, // soft-delete: hide instead of removing permanently
    },
    isFeatured: {
        type: Boolean,
        default: false, // for homepage "featured products" sections
    },

    seo: {
        metaTitle: { type: String },
        metaDescription: { type: String },
    },

}, { timestamps: true });

// Text index for search functionality (name + description)
attarSchema.index({ name: "text", description: "text", tags: "text" });

const Product = mongoose.model("Attar", attarSchema); 
export default Product;
