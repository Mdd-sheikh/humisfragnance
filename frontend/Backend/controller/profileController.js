import profile from "../models/profileModel.js";
import multer from "multer";
import streamifier from "streamifier";
import slugify from "slugify";
import fs from "fs";
import cloudinary from "../config/cloudinary.js"; // adjust path to your cloudinary config
import Profile from "../models/profileModel.js";

// adjust path as needed

// @desc    Get logged-in user's profile
// @route   GET /api/profile
// @access  Private

// for upload image 
const storage = multer.memoryStorage();
export const Upload = multer({ storage });

export const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "avatarUrl" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};



export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            "user",
            "name email"
        );

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create profile for logged-in user
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res) => {
    try {
        const existing = await Profile.findOne({ user: req.user.id });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Profile already exists for this user"
            });
        }

        const { firstName, lastName, phone, dob, gender, email } = req.body;

        let avatarUrl;
        let avatarPublicId;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            avatarUrl = result.secure_url;
            avatarPublicId = result.public_id;
        }

        const profile = await Profile.create({
            user: req.user.id,
            firstName,
            lastName,
            phone,
            dob,
            gender, // avoid enum validation error on empty string
            email,
            avatarUrl,
            avatarPublicId,
        });

        return res.status(201).json({ success: true, }); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/profile
// @access  Private 
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, dob, gender, avatarUrl } = req.body;

        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: { firstName, lastName, phone, dob, gender, avatarUrl } },
            { new: true, runValidators: true, upsert: true }
        );

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete logged-in user's profile
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json({ success: true, message: "Profile deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get any user's profile by userId (e.g. admin or public view)
// @route   GET /api/profile/:userId
// @access  Private/Admin
export const getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await Profile.findOne({ user: userId }).populate(
            "user",
            "name email"
        );

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload / update profile picture
// @route   POST /api/profile/avatar
// @access  Private
// @note    Expects multer diskStorage middleware before this (e.g. upload.single("avatar"))
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            fs.unlink(req.file.path, () => { });
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        // Delete old avatar from Cloudinary if one exists
        if (profile.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(profile.avatarPublicId);
            } catch (err) {
                console.error("Failed to delete old avatar:", err.message);
            }
        }

        // Upload new avatar
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile_avatars",
            resource_type: "image",
        });

        // Remove temp file from disk regardless of success/failure above
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to remove temp file:", err.message);
        });

        profile.avatarUrl = result.secure_url;
        profile.avatarPublicId = result.public_id;
        await profile.save();

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        if (req.file?.path) {
            fs.unlink(req.file.path, () => { });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all profiles (admin)
// @route   GET /api/profile/all
// @access  Private/Admin
export const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", "name email");
        return res.status(200).json({ success: true, count: profiles.length, data: profiles });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};