import express from "express";
import {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    upload,
} from "../controller/BlogController.js";
import Auth from "../middleware/Auth.js";

const BlogRoute = express.Router();

const MAX_IMAGES = 6; // must match MAX_IMAGES in BlogController.js

// GET all posts (supports ?published=true&category=News&featured=true&page=1&limit=10)
BlogRoute.get("/getallposts", getAllPosts);

// GET single post by slug
BlogRoute.get("/get/:slug", getPostBySlug);

// CREATE post — Auth checked first, then multer parses the multipart images
BlogRoute.post("/create", upload.array("images", MAX_IMAGES), createPost);

// UPDATE post
BlogRoute.put("/update/:slug", Auth, upload.array("images", MAX_IMAGES), updatePost);

export default BlogRoute;