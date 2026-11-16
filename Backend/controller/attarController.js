import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import slugify from "slugify"; // npm i slugify
import Product from "../models/attarModel.js"; // capitalized for clarity

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload a single buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "product_images" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// ---------------- CREATE ----------------
export const createAttarproduct = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            discountPrice,
            category,
            tags,
            variants, // expect JSON string from form-data, e.g. '[{"size":"10ml","price":499,"stock":20}]'
            stock,
        } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({
                message: "Name, description, price, and category are required",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Upload all images in parallel
        const uploadResults = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file.buffer))
        );

        const images = uploadResults.map((result) => ({
            url: result.secure_url,
            public_id: result.public_id,
        }));

        // Generate a unique slug from the name
        let slug = slugify(name, { lower: true, strict: true });
        const existingSlug = await Product.findOne({ slug });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`; // avoid duplicate slugs
        }

        const product = await Product.create({
            name,
            slug,
            description,
            shortDescription,
            price,
            discountPrice,
            images,
            category,
            tags: tags ? JSON.parse(tags) : [],
            variants: variants ? JSON.parse(variants) : [],
            stock: stock || 0,
        });

        return res.status(201).json({ message: "Product created", success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create product", success: false });
    }
};

// ---------------- GET ALL ----------------
export const getAttarproduct = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;

        const filter = { isActive: true };
        if (category) filter.category = category;
        if (search) filter.$text = { $search: search };

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Product.countDocuments(filter);

        return res.status(200).json({
            products,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch products" }); 
    }
};

// ---------------- GET SINGLE (by slug or id) ----------------
export const getSingleAttarproduct = async (req, res) => {
    try {
        const { id } = req.params;

        // allow lookup by slug OR mongo _id
        const product = await Product.findOne({
            $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
};

// ---------------- UPDATE ----------------
export const updateAttarproduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Images: drop the ones the admin removed, append any newly uploaded ones
        const removedIds = updates.removedImages ? JSON.parse(updates.removedImages) : [];
        delete updates.removedImages;
        const removedImages = product.images.filter((img) => removedIds.includes(img.public_id));

        let newImages = [];
        if (req.files && req.files.length > 0) {
            const uploadResults = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );
            newImages = uploadResults.map((result) => ({
                url: result.secure_url,
                public_id: result.public_id,
            }));
        }

        if (removedImages.length > 0 || newImages.length > 0) {
            const keptImages = product.images.filter((img) => !removedIds.includes(img.public_id));
            const finalImages = [...keptImages, ...newImages];
            if (finalImages.length === 0) {
                return res.status(400).json({ message: "A product needs at least one image" });
            }
            updates.images = finalImages;
        }

        // seo arrives as a JSON string from form-data
        if (typeof updates.seo === "string") updates.seo = JSON.parse(updates.seo);

        // Re-generate slug if name changed
        if (updates.name && updates.name !== product.name) {
            let slug = slugify(updates.name, { lower: true, strict: true });
            const existingSlug = await Product.findOne({ slug, _id: { $ne: id } });
            if (existingSlug) slug = `${slug}-${Date.now()}`;
            updates.slug = slug;
        }

        if (updates.tags) updates.tags = JSON.parse(updates.tags);
        if (updates.variants) {
            // keep each variant's _id (orders reference variantId); drop empty sku
            updates.variants = JSON.parse(updates.variants).map((v) => {
                const variant = { ...v };
                if (!variant.sku || String(variant.sku).trim() === "") delete variant.sku;
                return variant;
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        // Remove deleted images from Cloudinary only after the DB update succeeded
        await Promise.allSettled(
            removedImages.map((img) => cloudinary.uploader.destroy(img.public_id))
        );

        return res.status(200).json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update product" });
    }
};

// ---------------- DELETE ----------------
export const deleteAttarproduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Remove all associated images from Cloudinary
        if (product.images && product.images.length > 0) {
            // a Cloudinary hiccup shouldn't block deleting the product itself
            await Promise.allSettled(
                product.images.map((img) => cloudinary.uploader.destroy(img.public_id))
            );
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};





// Total units left for a product: sum of variant stock when it has variants,
// otherwise the product-level stock field.
const TOTAL_STOCK_EXPR = {
    $cond: [
        { $gt: [{ $size: { $ifNull: ["$variants", []] } }, 0] },
        { $sum: "$variants.stock" },
        { $ifNull: ["$stock", 0] },
    ],
};
const LOW_STOCK_THRESHOLD = 5;

// ---------------- GET ALL (ADMIN) ----------------
// Returns every product regardless of isActive status,
// with extra filters/sorting useful for the admin dashboard.
export const getAllAttarproduct = async (req, res) => {
    try {
        const {
            category,
            search,
            status,       // "active" | "inactive" | undefined (= all)
            stock,        // "in" | "out" | undefined (= all)
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (search) filter.$text = { $search: search };

        // Admin can filter by active/inactive, or omit to see all
        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

        // Admin can filter by stock availability
        if (stock === "in") filter.$expr = { $gt: [TOTAL_STOCK_EXPR, 0] };
        if (stock === "out") filter.$expr = { $lte: [TOTAL_STOCK_EXPR, 0] };
        if (stock === "low") {
            filter.$expr = {
                $and: [
                    { $gt: [TOTAL_STOCK_EXPR, 0] },
                    { $lte: [TOTAL_STOCK_EXPR, LOW_STOCK_THRESHOLD] },
                ],
            };
        }

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const products = await Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Product.countDocuments(filter);

        // Quick summary stats for the admin dashboard
        const [activeCount, inactiveCount, outOfStockCount, lowStockCount] = await Promise.all([
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: false }),
            Product.countDocuments({ $expr: { $lte: [TOTAL_STOCK_EXPR, 0] } }),
            Product.countDocuments({
                $expr: {
                    $and: [
                        { $gt: [TOTAL_STOCK_EXPR, 0] },
                        { $lte: [TOTAL_STOCK_EXPR, LOW_STOCK_THRESHOLD] },
                    ],
                },
            }),
        ]);

        return res.status(200).json({
            products,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            stats: {
                active: activeCount,
                inactive: inactiveCount,
                outOfStock: outOfStockCount,
                lowStock: lowStockCount,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch products", success: false });
    }
};