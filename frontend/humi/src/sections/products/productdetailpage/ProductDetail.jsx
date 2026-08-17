import { useParams, Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Context } from "../../../context/Context";
import { toast } from "react-toastify";
import "./ProductDetail.css";

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart, API_URL } = useContext(Context);

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);

    const mapProduct = (p) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url || "",
        images: (p.images || []).map((img) => img.url),
        alt: p.name,
        price: p.discountPrice || p.price,
        compareAt: p.discountPrice ? p.price : null,
        rating: p.ratings?.average || 0,
        reviews: p.ratings?.count || 0,
        category: p.category,
        stock: p.stock,
        description: p.description,
        features: p.features,
        notes: p.notes,
        badge: p.discountPrice ? "Sale" : null,
        // adjust this mapping to match how your backend's `variants` are shaped
        sizes: p.variants?.length
            ? p.variants.map((v) => ({ label: v.label || v.size, price: v.price }))
            : null,
    });

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/product/${id}`);
            const mapped = mapProduct(res.data.product);
            setProduct(mapped);

            // fetch related products in the same category
            const allRes = await axios.get(`${API_URL}/product/get`);
            const rel = (allRes.data.products || [])
                .filter((p) => p._id !== id && p.category === mapped.category)
                .slice(0, 4)
                .map(mapProduct);
            setRelated(rel);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setActiveImage(0);
        window.scrollTo(0, 0);
        fetchProduct();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (product?.sizes?.length) {
            setSelectedSize(product.sizes[0]);
        } else {
            setSelectedSize(null);
        }
    }, [product]);

    if (loading) {
        return <div className="pd-page pd-not-found"><p>Loading...</p></div>;
    }

    if (!product) {
        return (
            <div className="pd-not-found">
                <p>This product could not be found.</p>
                <Link to="/shop">Back to Shop</Link>
            </div>
        );
    }

    const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
    const displayPrice = selectedSize ? selectedSize.price : product.price;

    const handleAddToCart = () => {
        addToCart({ ...product, size: selectedSize?.label, price: displayPrice }, 1);
        toast.success(
            `${product.name}${selectedSize ? ` (${selectedSize.label})` : ""} added to cart`
        );
    };

    const handleBuyNow = () => {
        handleAddToCart();
    };

    return (
        <div className="pd-page">
            <div className="pd-top">
                <div className="pd-gallery">
                    <div className="pd-thumbs">
                        {gallery.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`pd-thumb${i === activeImage ? " active" : ""}`}
                                onClick={() => setActiveImage(i)}
                                aria-label={`View image ${i + 1}`}
                            >
                                <img src={img} alt={`${product.name} view ${i + 1}`} />
                            </button>
                        ))}
                    </div>

                    <div className="pd-main-image">
                        {product.badge && <span className="pd-badge">{product.badge}</span>}
                        <img src={gallery[activeImage]} alt={product.alt || product.name} />
                    </div>
                </div>

                <div className="pd-details">
                    <p className="pd-breadcrumb">
                        Collections / {(product.category || "Attars").toUpperCase()}
                    </p>
                    <h1 className="pd-name">{product.name}</h1>
                    <p className="pd-price">
                        ₹ {displayPrice?.toLocaleString("en-IN")}.00
                    </p>

                    {product.sizes && product.sizes.length > 0 && (
                        <div className="pd-size-block">
                            <span className="pd-label">Select Size</span>
                            <div className="pd-size-row">
                                {product.sizes.map((s) => (
                                    <button
                                        key={s.label}
                                        type="button"
                                        className={`pd-size-btn${selectedSize?.label === s.label ? " active" : ""}`}
                                        onClick={() => setSelectedSize(s)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.description && (
                        <p className="pd-description">{product.description}</p>
                    )}

                    {product.features && product.features.length > 0 && (
                        <ul className="pd-features">
                            {product.features.map((f, i) => (
                                <li key={i}>
                                    <span className="pd-dot" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    )}

                    {product.notes && (
                        <div className="pd-notes-card">
                            <span className="pd-notes-title">Olfactory Pyramid</span>
                            <div className="pd-note-row">
                                <div>
                                    <span className="pd-note-label">Top Note</span>
                                    <span className="pd-note-value">{product.notes.top}</span>
                                </div>
                                <span className="pd-note-icon">✧</span>
                            </div>
                            <div className="pd-note-row">
                                <div>
                                    <span className="pd-note-label">Middle Note</span>
                                    <span className="pd-note-value">{product.notes.middle}</span>
                                </div>
                                <span className="pd-note-icon">❁</span>
                            </div>
                            <div className="pd-note-row">
                                <div>
                                    <span className="pd-note-label">Base Note</span>
                                    <span className="pd-note-value">{product.notes.base}</span>
                                </div>
                                <span className="pd-note-icon">♣</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {related.length > 0 && (
                <div className="pd-related">
                    <div className="pd-related-header">
                        <h2>Related Treasures</h2>
                        <Link to="/shop" className="pd-view-all">View All</Link>
                    </div>
                    <div className="pd-related-grid">
                        {related.map((p) => (
                            <Link key={p.id} to={`/product/${p.id}`} className="pd-related-card">
                                <div className="pd-related-img-wrap">
                                    <img src={p.image} alt={p.name} />
                                </div>
                                <span className="pd-related-series">
                                    {(p.category || "Series").toUpperCase()} SERIES
                                </span>
                                <h3>{p.name}</h3>
                                <p>₹ {p.price?.toLocaleString("en-IN")}.00</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="pd-sticky-bar">
                <div className="pd-sticky-info">
                    <span className="pd-sticky-label">Selected Product</span>
                    <strong>
                        {product.name}
                        {selectedSize ? ` (${selectedSize.label})` : ""}
                    </strong>
                </div>
                <div className="pd-sticky-actions">
                    <button type="button" className="pd-btn pd-btn-outline" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                    <button type="button" className="pd-btn pd-btn-primary" onClick={handleBuyNow}>
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}