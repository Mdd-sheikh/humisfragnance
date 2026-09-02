import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Blog from "../models/Blogs.js";

const MAX_IMAGES = 6; // adjust as needed

const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Uploads a single file buffer to Cloudinary.
 */
const uploadBufferToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "blog" },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                });
            }
        );
        stream.end(fileBuffer);
    });
};

/**
 * Uploads multiple file buffers in parallel.
 */
const uploadMultipleToCloudinary = (files) => {
    return Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
};

/**
 * Deletes multiple Cloudinary images by publicId. Non-fatal on individual failures.
 */
const deleteMultipleFromCloudinary = async (images = []) => {
    await Promise.all(
        images
            .filter((img) => img?.publicId)
            .map((img) =>
                cloudinary.uploader.destroy(img.publicId).catch(() => {
                    console.warn(`Could not delete old Cloudinary image: ${img.publicId}`);
                })
            )
    );
};

/**
 * GET /api/blog
 */
export const getAllPosts = async (req, res) => {
    try {
        const { published, category, featured, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (published !== undefined) filter.published = published === "true";
        if (category) filter.category = category;
        if (featured !== undefined) filter.featured = featured === "true";

        const posts = await Blog.find(filter)
            .sort({ date: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Blog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch posts", error: error.message });
    }
};

/**
 * GET /api/blog/:slug
 */
export const getPostBySlug = async (req, res) => {
    try {
        const post = await Blog.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch post", error: error.message });
    }
};

/**
 * POST /api/blog
 * Expects multipart/form-data with:
 *   - "images" : one or more image files (field name "images")
 *   - "imageAlts" : JSON-stringified array of alt text, one per image, same order
 *   - the rest of the post fields as regular form fields
 * Route must use: upload.array("images", MAX_IMAGES)
 */
export const createPost = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image file is required" });
        }

        const {
            title, slug, category, excerpt, bannerText, content, imageAlts,
            featured, topStory, metaTitle, metaDescription, keywords,
            author, published, date,
        } = req.body;

        if (!title || !slug || !category || !excerpt) {
            return res.status(400).json({
                success: false,
                message: "title, slug, category, and excerpt are required",
            });
        }

        let altsArray = [];
        try {
            altsArray = imageAlts ? JSON.parse(imageAlts) : [];
        } catch {
            return res.status(400).json({ success: false, message: "imageAlts must be a valid JSON array" });
        }

        if (altsArray.length !== req.files.length) {
            return res.status(400).json({
                success: false,
                message: `Expected ${req.files.length} alt text entries (one per image), got ${altsArray.length}`,
            });
        }

        const existing = await Blog.findOne({ slug });
        if (existing) {
            return res.status(409).json({ success: false, message: "A post with this slug already exists" });
        }

        const uploadedImages = await uploadMultipleToCloudinary(req.files);
        const images = uploadedImages.map((img, i) => ({ ...img, alt: altsArray[i] }));

        const post = await Blog.create({
            title,
            slug,
            category,
            excerpt,
            bannerText,
            content,
            date: date || Date.now(),
            featured: featured === "true" || featured === true,
            topStory: topStory === "true" || topStory === true,
            metaTitle,
            metaDescription,
            keywords: keywords ? JSON.parse(keywords) : [],
            author,
            published: published === undefined ? true : published === "true" || published === true,
            images,
        });

        res.status(201).json({ success: true, data: post });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "A post with this slug already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to create post", error: error.message });
    }
};

/**
 * PUT /api/blog/:slug
 * Two ways to handle images on update:
 *   - Send new "images" files -> ALL old images are deleted and replaced with these
 *   - Send no files -> existing images are left untouched
 *   - Optionally send "keepImagePublicIds" (JSON array of publicId strings) to
 *     keep only specific existing images while adding new ones alongside them
 * Route must use: upload.array("images", MAX_IMAGES)
 */
export const updatePost = async (req, res) => {
    try {
        const post = await Blog.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const {
            title, category, excerpt, bannerText, content, imageAlts,
            featured, topStory, metaTitle, metaDescription, keywords,
            author, published, date, newSlug, keepImagePublicIds,
        } = req.body;

        if (title !== undefined) post.title = title;
        if (category !== undefined) post.category = category;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (bannerText !== undefined) post.bannerText = bannerText;
        if (content !== undefined) post.content = content;
        if (featured !== undefined) post.featured = featured === "true" || featured === true;
        if (topStory !== undefined) post.topStory = topStory === "true" || topStory === true;
        if (metaTitle !== undefined) post.metaTitle = metaTitle;
        if (metaDescription !== undefined) post.metaDescription = metaDescription;
        if (keywords !== undefined) post.keywords = JSON.parse(keywords);
        if (author !== undefined) post.author = author;
        if (published !== undefined) post.published = published === "true" || published === true;
        if (date !== undefined) post.date = date;
        if (newSlug !== undefined) post.slug = newSlug;

        // Determine which existing images survive this update
        let keptImages = post.images;
        if (keepImagePublicIds !== undefined) {
            const keepIds = JSON.parse(keepImagePublicIds);
            const toDelete = post.images.filter((img) => !keepIds.includes(img.publicId));
            await deleteMultipleFromCloudinary(toDelete);
            keptImages = post.images.filter((img) => keepIds.includes(img.publicId));
        }

        // Add any newly uploaded images
        if (req.files && req.files.length > 0) {
            let altsArray = [];
            try {
                altsArray = imageAlts ? JSON.parse(imageAlts) : [];
            } catch {
                return res.status(400).json({ success: false, message: "imageAlts must be a valid JSON array" });
            }

            if (altsArray.length !== req.files.length) {
                return res.status(400).json({
                    success: false,
                    message: `Expected ${req.files.length} alt text entries (one per new image), got ${altsArray.length}`,
                });
            }

            // If keepImagePublicIds was NOT sent, treat new files as a full replacement
            if (keepImagePublicIds === undefined) {
                await deleteMultipleFromCloudinary(post.images);
                keptImages = [];
            }

            const uploadedImages = await uploadMultipleToCloudinary(req.files);
            const newImages = uploadedImages.map((img, i) => ({ ...img, alt: altsArray[i] }));
            keptImages = [...keptImages, ...newImages];
        }

        post.images = keptImages;
        post.updatedDate = Date.now();

        await post.save();

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "A post with this slug already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to update post", error: error.message });
    }
};