import { useParams, Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { PRODUCTS } from "../../../assets/Assests.js";
import { Context } from "../../../context/Context";
import { toast } from "react-toastify";
import "./ProductDetail.css";

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useContext(Context);

    const product = PRODUCTS.find((p) => String(p.id) === id);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);

    // Reset gallery/size and scroll to top whenever navigating to a different product
    useEffect(() => {
        setActiveImage(0);
        if (product?.sizes?.length) {
            setSelectedSize(product.sizes[0]);
        } else {
            setSelectedSize(null);
        }
        window.scrollTo(0, 0);
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!product) {
        return (
            <div className="pd-not-found">
                <p>This product could not be found.</p>
                <Link to="/shop">Back to Shop</Link>
            </div>
        );
    }

    // Support either a single `image` string or an `images` array, whichever the data has
    const gallery =
        product.images && product.images.length > 0 ? product.images : [product.image];

    const displayPrice = selectedSize ? selectedSize.price : product.price;

    const handleAddToCart = () => {
        addToCart({ ...product, size: selectedSize?.label, price: displayPrice }, 1);
        toast.success(
            `${product.name}${selectedSize ? ` (${selectedSize.label})` : ""} added to cart`
        );
    };

    const handleBuyNow = () => {
        handleAddToCart();
        // navigate("/cart") or straight to checkout if you have that route
    };

    const related = PRODUCTS.filter(
        (p) => p.id !== product.id && p.category === product.category
    ).slice(0, 4);

    return (
        <div className="pd-page">
            <div className="pd-top">
                {/* ---------- Image gallery ---------- */}
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

                {/* ---------- Details ---------- */}
                <div className="pd-details">
                    <p className="pd-breadcrumb">
                        Collections / {(product.category || "Attars").toUpperCase()}
                    </p>
                    <h1 className="pd-name">{product.name}</h1>
                    <p className="pd-price">
                        ${displayPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>

                    {product.sizes && product.sizes.length > 0 && (
                        <div className="pd-size-block">
                            <span className="pd-label">Select Size</span>
                            <div className="pd-size-row">
                                {product.sizes.map((s) => (
                                    <button
                                        key={s.label}
                                        type="button"
                                        className={`pd-size-btn${selectedSize?.label === s.label ? " active" : ""
                                            }`}
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

            {/* ---------- Related products ---------- */}
            {related.length > 0 && (
                <div className="pd-related">
                    <div className="pd-related-header">
                        <h2>Related Treasures</h2>
                        <Link to="/shop" className="pd-view-all">
                            View All
                        </Link>
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
                                <p>${p.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ---------- Sticky bottom bar ---------- */}
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