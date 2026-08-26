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

        // If new images are uploaded, add them (or replace — your choice)
        if (req.files && req.files.length > 0) {
            const uploadResults = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );
            const newImages = uploadResults.map((result) => ({
                url: result.secure_url,
                public_id: result.public_id,
            }));
            updates.images = [...product.images, ...newImages]; // append; use just newImages to replace
        }

        // Re-generate slug if name changed
        if (updates.name && updates.name !== product.name) {
            let slug = slugify(updates.name, { lower: true, strict: true });
            const existingSlug = await Product.findOne({ slug, _id: { $ne: id } });
            if (existingSlug) slug = `${slug}-${Date.now()}`;
            updates.slug = slug;
        }

        if (updates.tags) updates.tags = JSON.parse(updates.tags);
        if (updates.variants) updates.variants = JSON.parse(updates.variants);

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

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
            await Promise.all(
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
        if (stock === "in") filter.stock = { $gt: 0 };
        if (stock === "out") filter.stock = { $lte: 0 };

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const products = await Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Product.countDocuments(filter);

        // Quick summary stats for the admin dashboard
        const [activeCount, inactiveCount, outOfStockCount] = await Promise.all([
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: false }),
            Product.countDocuments({ stock: { $lte: 0 } }),
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
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch products", success: false });
    }
};