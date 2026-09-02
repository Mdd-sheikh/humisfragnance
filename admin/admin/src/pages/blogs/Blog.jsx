import { useState } from "react";
import "./Blog.css";
import { useContext } from "react";
import { Context } from "../../context/Context";
import axios from "axios";



const MAX_IMAGES = 6;
const CATEGORIES = ["News", "Guides", "Behind the Scenes", "Product Launch", "Lifestyle"];

export default function Blog() {
    const {API_URl} = useContext(Context)


  const [images, setImages] = useState([]); // [{ file, preview, alt }]
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "News",
    excerpt: "",
    bannerText: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    featured: false,
    topStory: false,
    published: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Auto-generate a slug from the title, but only until the user edits slug manually
  const [slugTouched, setSlugTouched] = useState(false);
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched
        ? prev.slug
        : title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-"),
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images per post.`, "error");
      e.target.value = "";
      return;
    }

    const newEntries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: "",
    }));

    setImages((prev) => [...prev, ...newEntries]);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleAltChange = (index, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, alt: value } : img))
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.slug.trim()) errors.slug = "Slug is required.";
    if (!form.excerpt.trim()) errors.excerpt = "Excerpt is required.";
    if (images.length === 0) errors.images = "Add at least one image.";
    if (images.some((img) => !img.alt.trim())) errors.images = "Every image needs alt text.";
    return errors;
  };

  // Builds a multipart FormData payload matching the backend controller:
  //   - "images"      : each image file, field name must be "images" (upload.array("images"))
  //   - "imageAlts"   : JSON-stringified array of alt text, same order as images
  //   - "keywords"    : JSON-stringified array
  //   - all other fields appended as plain strings
  const buildFormData = () => {
    const formData = new FormData();

    images.forEach((img) => {
      formData.append("images", img.file);
    });
    formData.append("imageAlts", JSON.stringify(images.map((img) => img.alt)));

    const keywordsArray = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    Object.entries(form).forEach(([key, value]) => {
      if (key === "keywords") {
        formData.append("keywords", JSON.stringify(keywordsArray));
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert("Fix the highlighted fields before publishing.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = buildFormData();

      await axios.post(`${API_URl}/blog/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // remove if your Auth doesn't rely on cookies
      });

      alert("Post published.", "success");
      setForm({
        title: "",
        slug: "",
        category: "News",
        excerpt: "",
        bannerText: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        featured: false,
        topStory: false,
        published: true,
      });
      setImages([]);
      setSlugTouched(false);
      setFieldErrors({});
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="blog-form-page">
      <header className="blog-form-page__header">
        <p className="blog-form-page__kicker">Journal</p>
        <h1 className="blog-form-page__title">New entry</h1>
        <p className="blog-form-page__subtitle">
          Write and publish a post to the Humi's Fragrance journal.
        </p>
      </header>

      <form className="blog-form" onSubmit={handleSubmit} noValidate>
        <section className="blog-form__section">
          <label className="field">
            <span className="field__label">Title</span>
            <input
              className={`field__input ${fieldErrors.title ? "field__input--error" : ""}`}
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="The alchemy of gold & glass"
            />
            {fieldErrors.title && <span className="field__error">{fieldErrors.title}</span>}
          </label>

          <label className="field">
            <span className="field__label">Slug</span>
            <input
              className={`field__input ${fieldErrors.slug ? "field__input--error" : ""}`}
              name="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                handleChange(e);
              }}
              placeholder="the-alchemy-of-gold-and-glass"
            />
            <span className="field__hint">humisfragrance.com/blog/{form.slug || "your-slug"}</span>
            {fieldErrors.slug && <span className="field__error">{fieldErrors.slug}</span>}
          </label>

          <label className="field">
            <span className="field__label">Category</span>
            <select
              className="field__input field__input--select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Excerpt</span>
            <textarea
              className={`field__input field__input--textarea ${fieldErrors.excerpt ? "field__input--error" : ""}`}
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="A short summary shown in previews and search results."
            />
            {fieldErrors.excerpt && <span className="field__error">{fieldErrors.excerpt}</span>}
          </label>

          <label className="field">
            <span className="field__label">Content</span>
            <textarea
              className="field__input field__input--textarea field__input--tall"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              placeholder="Write the full post here."
            />
          </label>
        </section>

        <hr className="blog-form__divider" />

        <section className="blog-form__section">
          <div className="field">
            <span className="field__label">Images (up to {MAX_IMAGES})</span>
            <label className="dropzone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImagesChange}
                className="dropzone__input"
              />
              <span className="dropzone__text">Click to choose images, or drag files here</span>
              <span className="dropzone__hint">JPG, PNG, or WebP</span>
            </label>
            {fieldErrors.images && <span className="field__error">{fieldErrors.images}</span>}
          </div>

          {images.length > 0 && (
            <ul className="image-strip">
              {images.map((img, i) => (
                <li className="image-strip__item" key={i}>
                  <img className="image-strip__thumb" src={img.preview} alt="" />
                  <input
                    className="image-strip__alt"
                    placeholder="Describe this image"
                    value={img.alt}
                    onChange={(e) => handleAltChange(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="image-strip__remove"
                    onClick={() => removeImage(i)}
                    aria-label={`Remove image ${i + 1}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr className="blog-form__divider" />

        <section className="blog-form__section">
          <p className="blog-form__section-title">Search appearance</p>

          <label className="field">
            <span className="field__label">Meta title</span>
            <input
              className="field__input"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              maxLength={60}
              placeholder="Shown as the blue link in Google"
            />
            <span className="field__hint">{form.metaTitle.length}/60</span>
          </label>

          <label className="field">
            <span className="field__label">Meta description</span>
            <textarea
              className="field__input field__input--textarea"
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              rows={2}
              maxLength={160}
              placeholder="Shown under the title in Google's results"
            />
            <span className="field__hint">{form.metaDescription.length}/160</span>
          </label>

          <label className="field">
            <span className="field__label">Keywords</span>
            <input
              className="field__input"
              name="keywords"
              value={form.keywords}
              onChange={handleChange}
              placeholder="perfume bottle design, artisanal flacon"
            />
            <span className="field__hint">Separate with commas</span>
          </label>
        </section>

        <hr className="blog-form__divider" />

        <section className="blog-form__section blog-form__section--row">
          <label className="toggle">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span className="toggle__track"><span className="toggle__thumb" /></span>
            <span>Featured</span>
          </label>

          <label className="toggle">
            <input type="checkbox" name="topStory" checked={form.topStory} onChange={handleChange} />
            <span className="toggle__track"><span className="toggle__thumb" /></span>
            <span>Top story</span>
          </label>

          <label className="toggle">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
            <span className="toggle__track"><span className="toggle__thumb" /></span>
            <span>Published</span>
          </label>
        </section>

        <div className="blog-form__actions">
          <button type="submit" className="button button--primary" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish post"}
          </button>
        </div>
      </form>
    </div>
  );
}