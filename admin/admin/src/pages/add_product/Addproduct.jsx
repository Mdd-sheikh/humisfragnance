import { useState, useRef, useContext } from "react";
import {
  FileUp,
  X,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import "./Addproduct.css";
import axios from 'axios'
import { Context } from "../../context/Context";
import { toast } from "react-toastify";

const CATEGORIES = ["floral", "woody", "musk", "oud", "citrus", "spicy"];


const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyVariant = () => ({
  size: "",
  price: "",
  discountPrice: "",
  stock: "",
  sku: "",
});

const AddProduct = () => {
  const fileInputRef = useRef(null);
  const { API_URL } = useContext(Context)




  // Core fields
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("Humi's");

  // Variants
  const [variants, setVariants] = useState([]);


  // Tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  console.log(tags);




  // Flags
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  console.log(metaDescription);

  // Images
  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  console.log(images);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    const mapped = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const addTag = () => {
    const cleaned = tagInput.trim().replace(/,$/, "");
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  };


  /*================================================= handle press button ==================================*/
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const resetForm = () => {
    setName("");
    setShortDescription("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("");
    setCategory("");
    setBrand("Humi's");
    setVariants([]);
    setTags([]);
    setTagInput("");
    setIsActive(true);
    setIsFeatured(false);
    setMetaTitle("");
    setMetaDescription("");
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };


  /* =============================================post the product data ===================================*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!name.trim() || !description.trim() || !price || !category) {
      const msg = "Please fill in name, description, price, and category.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (images.length === 0) {
      const msg = "At least one product image is required.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slugify(name));
      formData.append("description", description.trim());
      formData.append("shortDescription", shortDescription.trim());
      formData.append("price", price);
      if (discountPrice) formData.append("discountPrice", discountPrice);
      formData.append("stock", stock || 0);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("isActive", isActive);
      formData.append("isFeatured", isFeatured);
      formData.append("tags", JSON.stringify(tags));

      // clean variants: drop empty sku so it doesn't hit the unique index as ""
      const cleanedVariants = variants
        .filter((v) => v.size && v.price)
        .map((v) => {
          const variant = { ...v };
          if (!variant.sku || variant.sku.trim() === "") {
            delete variant.sku;
          }
          return variant;
        });

      formData.append("variants", JSON.stringify(cleanedVariants));
      formData.append("seo", JSON.stringify({ metaTitle, metaDescription }));
      images.forEach((img) => formData.append("images", img.file));

      // await added — without it, res was a pending Promise, not the actual response
      const res = await axios.post(`${API_URL}/api/product/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // axios wraps the server's JSON in res.data — check res.data.success, not res.success
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create product");
      }

      setSubmitSuccess(true);
      toast.success(res.data.message || "Product published successfully");
      resetForm();

    } catch (err) {
      // axios throws on non-2xx responses — real server message lives in err.response.data
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };




  return (
    <div className="add-product">
      <div className="add-product__header">
        <h1 className="add-product__title">New Masterpiece</h1>
        <p className="add-product__subtitle">
          Curate the olfactory identity of Humi's latest addition.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product imagery */}
        <p className="section-label">Product Imagery</p>

        <div
          className={`dropzone${isDragging ? " dropzone--active" : ""}${images.length ? " dropzone--filled" : ""
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {images.length === 0 ? (
            <button
              type="button"
              className="dropzone__cta"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={26} strokeWidth={1.5} />
              <span className="dropzone__cta-title">
                Drag & Drop or Select Image
              </span>
              <span className="dropzone__cta-subtitle">
                High-resolution (4:5 ratio) recommended
              </span>
            </button>
          ) : (
            <div className="dropzone__grid">
              {images.map((img, index) => (
                <div className="dropzone__thumb" key={img.previewUrl}>
                  <img
                    src={img.previewUrl}
                    alt={`Product preview ${index + 1}`}
                    onClick={() => setPreviewImage(img.previewUrl)}
                  />
                  <button
                    type="button"
                    className="dropzone__remove"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="dropzone__add-more"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={20} />
                <span>Add More</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileInputChange}
          />
        </div>

        {/* Identity & inventory */}
        <p className="section-label">Identity & Inventory</p>

        <div className="field">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rose Attar Royale"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Select Category</label>
            <div className="select-wrap">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>
                  Choose category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="select-wrap__chevron" />
            </div>
          </div>

          <div className="field field--price">
            <label htmlFor="price">Price</label>
            <div className="price-input">
              <span>$</span>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="discountPrice">Discount Price (optional)</label>
            <div className="price-input">
              <span>$</span>
              <input
                id="discountPrice"
                type="number"
                min="0"
                step="0.01"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="shortDescription">
            Short Description <span>(max 160 characters, for product cards)</span>
          </label>
          <input
            id="shortDescription"
            type="text"
            maxLength={160}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A brief, evocative summary..."
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scent profile, notes, and story..."
          />
        </div>

        {/* Variants */}
        <p className="section-label">Variants (Optional)</p>

        {variants.length > 0 && (
          <div className="variants">
            {variants.map((variant, index) => (
              <div className="variant-row" key={index}>
                <div className="field field--sm">
                  <label>Size</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    placeholder="10ml"
                  />
                </div>
                <div className="field field--sm">
                  <label>Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, "price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="field field--sm">
                  <label>Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.discountPrice}
                    onChange={(e) =>
                      updateVariant(index, "discountPrice", e.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="field field--sm">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="field field--sm">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <button
                  type="button"
                  className="variant-remove"
                  onClick={() => removeVariant(index)}
                  aria-label="Remove variant"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="btn-outline btn-add-variant" onClick={addVariant}>
          <Plus size={14} />
          Add Variant
        </button>

        {/* Organization */}
        <p className="section-label">Organization & Visibility</p>

        <div className="field">
          <label htmlFor="tags">Tags</label>
          <div className="tag-input">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Type and press Enter (e.g. bestseller)"
            />
          </div>
        </div>

        <div className="toggle-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="toggle__track">
              <span className="toggle__thumb" />
            </span>
            Active (visible in store)
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span className="toggle__track">
              <span className="toggle__thumb" />
            </span>
            Featured on homepage
          </label>
        </div>

        {/* SEO */}
        <p className="section-label">SEO</p>

        <div className="field">
          <label htmlFor="metaTitle">Meta Title</label>
          <input
            id="metaTitle"
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Shown in search engine results"
          />
        </div>

        <div className="field">
          <label htmlFor="metaDescription">Meta Description</label>
          <textarea
            id="metaDescription"
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief summary for search engines"
          />
        </div>

        {/* Submit */}
        {submitError && <p className="form-message form-message--error">{submitError}</p>}
        {submitSuccess && (
          <p className="form-message form-message--success">
            Product published successfully.
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-solid" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish Product"}
          </button>
        </div>
      </form>

      {/* Image preview lightbox */}
      {previewImage && (
        <div className="lightbox" onClick={() => setPreviewImage(null)}>
          <button
            className="lightbox__close"
            onClick={() => setPreviewImage(null)}
            aria-label="Close preview"
          >
            <X size={22} />
          </button>
          <img
            src={previewImage}
            alt="Full preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AddProduct;