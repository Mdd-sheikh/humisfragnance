import mongoose from "mongoose";
import CustomerQuery, { QUERY_STATUSES, QUERY_SUBJECTS } from "../models/customerQuery.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Very small in-memory rate limit for the public form (per IP) ----------
// Stops one visitor from flooding the inbox. Resets if the server restarts.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map(); // ip -> [timestamps]

const isRateLimited = (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    return false;
};

setInterval(() => {
    const now = Date.now();
    for (const [ip, times] of hits) {
        if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
    }
}, WINDOW_MS).unref();

/**
 * POST /api/query/create   (public — used by the shop's contact form)
 */
export const createQuery = async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
        if (isRateLimited(ip)) {
            return res.status(429).json({
                success: false,
                message: "Too many messages sent. Please try again in a few minutes.",
            });
        }

        const { name, email, phone, subject, message } = req.body;

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({ success: false, message: "Name, email and message are required." });
        }
        if (!EMAIL_RE.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Please enter a valid email." });
        }
        if (message.trim().length > 2000) {
            return res.status(400).json({ success: false, message: "Message is too long (max 2000 characters)." });
        }

        await CustomerQuery.create({
            name,
            email,
            phone: phone ?? "",
            subject: QUERY_SUBJECTS.includes(subject) ? subject : "General Inquiry",
            message,
        });

        res.status(201).json({ success: true, message: "Message sent. We'll reply within a day." });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "Please check your details and try again." });
        }
        console.error("createQuery error:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

/**
 * GET /api/query/getall?status=new|read|resolved&page=1&limit=20
 * Admin: list messages, newest first, plus counts per status.
 */
export const getQueries = async (req, res) => {
    try {
        const { status } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const filter = QUERY_STATUSES.includes(status) ? { status } : {};

        const [queries, total, grouped] = await Promise.all([
            CustomerQuery.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            CustomerQuery.countDocuments(filter),
            CustomerQuery.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        ]);

        const counts = { new: 0, read: 0, resolved: 0 };
        grouped.forEach((g) => {
            counts[g._id] = g.count;
        });
        counts.all = counts.new + counts.read + counts.resolved;

        res.status(200).json({
            success: true,
            queries,
            counts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("getQueries error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

/**
 * PATCH /api/query/:id/status   body: { status: "new" | "read" | "resolved" }
 */
export const updateQueryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid message id" });
        }
        if (!QUERY_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${QUERY_STATUSES.join(", ")}` });
        }

        const query = await CustomerQuery.findByIdAndUpdate(id, { status }, { new: true });
        if (!query) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.status(200).json({ success: true, query });
    } catch (error) {
        console.error("updateQueryStatus error:", error);
        res.status(500).json({ success: false, message: "Failed to update message" });
    }
};

/**
 * DELETE /api/query/:id
 */
export const deleteQuery = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid message id" });
        }

        const query = await CustomerQuery.findByIdAndDelete(id);
        if (!query) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.error("deleteQuery error:", error);
        res.status(500).json({ success: false, message: "Failed to delete message" });
    }
};
