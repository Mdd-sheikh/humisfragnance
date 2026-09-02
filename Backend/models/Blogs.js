import mongoose from "mongoose";
const { Schema } = mongoose;

const BlogPostSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated, alphanumeric only"],
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["News", "Guides", "Behind the Scenes", "Product Launch", "Lifestyle"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    updatedDate: {
      type: Date,
      default: null,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    bannerText: {
      type: String,
      trim: true,
      maxlength: 400,
    },

    content: {
      type: String,
    },

    // --- Multiple images per post ---
    images: {
      type: [
        {
          imageUrl: { type: String, required: true, trim: true },
          publicId: { type: String, trim: true },
          width: { type: Number },
          height: { type: Number },
          alt: { type: String, required: true, trim: true, maxlength: 200 },
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one image is required",
      },
    },

    featured: { type: Boolean, default: false, index: true },
    topStory: { type: Boolean, default: false, index: true },

    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    keywords: { type: [String], default: [] },

    author: { type: String, default: "Humi's Fragrance" },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

BlogPostSchema.virtual("url").get(function () {
  return `/blog/${this.slug}`;
});

// Convenience virtual: first image = the "cover" used in cards/listings
BlogPostSchema.virtual("coverImage").get(function () {
  return this.images?.[0] || null;
});

BlogPostSchema.set("toJSON", { virtuals: true });
BlogPostSchema.set("toObject", { virtuals: true });

BlogPostSchema.index({ published: 1, date: -1 });

const blog =  mongoose.model("Blog", BlogPostSchema);
export default blog;