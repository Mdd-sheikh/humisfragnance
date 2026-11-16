import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X, Plus, Trash2 } from "lucide-react";
import "./EditProductModal.css";

const CATEGORIES = ["floral", "woody", "musk", "oud", "citrus", "spicy"];
const MAX_IMAGES = 5;

const toVariantForm = (v) => ({
    _id: v._id,
    size: v.size ?? "",
    price: v.price ?? "",
    discountPrice: v.discountPrice ?? "",
    stock: v.stock ?? 0,
    sku: v.sku ?? "",
});

/**
 * Edit modal for one product. `product` is the raw document from the API.
 * Calls onSaved() after a successful update so the list can refresh.
 */
const EditProductModal = ({ product, apiUrl, onClose, onSaved }) => {
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: product.name ?? "",
        category: product.category ?? "",
        price: product.price ?? "",
        discountPrice: product.discountPrice ?? "",
        stock: product.stock ?? 0,
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
    });
    const [variants, setVariants] = useState((product.variants ?? []).map(toVariantForm));
    const [existingImages, setExistingImages] = useState(product.images ?? []);
    const [removedIds, setRemovedIds] = useState([]);
    const [newImages, setNewImages] = useState([]); // [{ file, previewUrl }]
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const hasVariants = variants.length > 0;
    const imageCount = existingImages.length + newImages.length;

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && !saving && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, saving]);

    // Free object URLs on unmount
    useEffect(
        () => () => newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const setField = (key) => (e) =>
        setForm((f) => ({
            ...f,
            [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
        }));

    const updateVariant = (i, key, value) =>
        setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
    const addVariant = () =>
        setVariants((prev) => [...prev, { size: "", price: "", discountPrice: "", stock: 0, sku: "" }]);
    const removeVariant = (i) => setVariants((prev) => prev.filter((_, idx) => idx !== i));

    const removeExistingImage = (img) => {
        setExistingImages((prev) => prev.filter((p) => p.public_id !== img.public_id));
        setRemovedIds((prev) => [...prev, img.public_id]);
    };

    const addFiles = (fileList) => {
        const room = MAX_IMAGES - imageCount;
        const files = Array.from(fileList)
            .filter((f) => f.type.startsWith("image/"))
            .slice(0, Math.max(0, room));
        setNewImages((prev) => [
            ...prev,
            ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
        ]);
    };

    const removeNewImage = (i) =>
        setNewImages((prev) => {
            URL.revokeObjectURL(prev[i].previewUrl);
            return prev.filter((_, idx) => idx !== i);
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.name.trim() || !form.description.trim() || form.price === "" || !form.category) {
            return setError("Name, description, price and category are required.");
        }
        if (imageCount === 0) return setError("A product needs at least one image.");
        if (variants.some((v) => !v.size.trim() || v.price === "")) {
            return setError("Every variant needs a size and a price.");
        }

        const data = new FormData();
        data.append("name", form.name.trim());
        data.append("category", form.category);
        data.append("price", form.price);
        data.append("discountPrice", form.discountPrice === "" ? "" : form.discountPrice);
        data.append("stock", form.stock === "" ? 0 : form.stock);
        data.append("shortDescription", form.shortDescription.trim());
        data.append("description", form.description.trim());
        data.append("isActive", form.isActive);
        data.append("isFeatured", form.isFeatured);
        data.append(
            "variants",
            JSON.stringify(
                variants.map((v) => ({
                    ...(v._id ? { _id: v._id } : {}),
                    size: v.size.trim(),
                    price: Number(v.price),
                    discountPrice: v.discountPrice === "" ? null : Number(v.discountPrice),
                    stock: Number(v.stock) || 0,
                    sku: v.sku,
                }))
            )
        );
        data.append("removedImages", JSON.stringify(removedIds));
        newImages.forEach((img) => data.append("images", img.file));

        setSaving(true);
        try {
            const res = await axios.put(`${apiUrl}/api/product/${product._id}`, data);
            toast.success(res.data?.message || "Product updated");
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={() => !saving && onClose()}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Edit ${product.name}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h2 className="modal__title">Edit Product</h2>
                    <button className="modal__close" onClick={onClose} disabled={saving} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__body">
                    {/* Images */}
                    <p className="modal__section">Images ({imageCount}/{MAX_IMAGES})</p>
                    <div className="edit-images">
                        {existingImages.map((img) => (
                            <div className="edit-images__item" key={img.public_id}>
                                <img src={img.url} alt="" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img)}
                                    aria-label="Remove image"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {newImages.map((img, i) => (
                            <div className="edit-images__item edit-images__item--new" key={img.previewUrl}>
                                <img src={img.previewUrl} alt="" />
                                <button type="button" onClick={() => removeNewImage(i)} aria-label="Remove image">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {imageCount < MAX_IMAGES && (
                            <button
                                type="button"
                                className="edit-images__add"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus size={18} />
                                <span>Add</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => {
                                if (e.target.files?.length) addFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </div>

                    {/* Core fields */}
                    <p className="modal__section">Details</p>
                    <label className="mfield">
                        <span>Product name</span>
                        <input type="text" value={form.name} onChange={setField("name")} />
                    </label>

                    <div className="mfield-row">
                        <label className="mfield">
                            <span>Category</span>
                            <select value={form.category} onChange={setField("category")}>
                                <option value="" disabled>Choose category</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="mfield">
                            <span>Price (₹)</span>
                            <input type="number" min="0" step="0.01" value={form.price} onChange={setField("price")} />
                        </label>
                    </div>

                    <div className="mfield-row">
                        <label className="mfield">
                            <span>Discount price (₹)</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.discountPrice}
                                onChange={setField("discountPrice")}
                                placeholder="Optional"
                            />
                        </label>
                        <label className="mfield">
                            <span>Stock {hasVariants && "(set per size below)"}</span>
                            <input
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={setField("stock")}
                                disabled={hasVariants}
                            />
                        </label>
                    </div>

                    <label className="mfield">
                        <span>Short description (max 160)</span>
                        <input
                            type="text"
                            maxLength={160}
                            value={form.shortDescription}
                            onChange={setField("shortDescription")}
                        />
                    </label>

                    <label className="mfield">
                        <span>Description</span>
                        <textarea rows={4} value={form.description} onChange={setField("description")} />
                    </label>

                    {/* Variants */}
                    <p className="modal__section">Sizes &amp; stock</p>
                    {variants.map((v, i) => (
                        <div className="variant-edit" key={v._id ?? `new-${i}`}>
                            <label className="mfield">
                                <span>Size</span>
                                <input
                                    type="text"
                                    value={v.size}
                                    onChange={(e) => updateVariant(i, "size", e.target.value)}
                                    placeholder="10ml"
                                />
                            </label>
                            <label className="mfield">
                                <span>Price</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={v.price}
                                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                                />
                            </label>
                            <label className="mfield">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={v.discountPrice}
                                    onChange={(e) => updateVariant(i, "discountPrice", e.target.value)}
                                />
                            </label>
                            <label className="mfield">
                                <span>Stock</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                                />
                            </label>
                            <button
                                type="button"
                                className="variant-edit__remove"
                                onClick={() => removeVariant(i)}
                                aria-label="Remove size"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                    <button type="button" className="mbtn-ghost" onClick={addVariant}>
                        <Plus size={14} /> Add size
                    </button>

                    {/* Flags */}
                    <div className="modal__flags">
                        <label className="mcheck">
                            <input type="checkbox" checked={form.isActive} onChange={setField("isActive")} />
                            Active (visible in store)
                        </label>
                        <label className="mcheck">
                            <input type="checkbox" checked={form.isFeatured} onChange={setField("isFeatured")} />
                            Featured on homepage
                        </label>
                    </div>

                    {error && <p className="modal__error">{error}</p>}

                    <div className="modal__footer">
                        <button type="button" className="mbtn-ghost" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="mbtn-solid" disabled={saving}>
                            {saving ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;
