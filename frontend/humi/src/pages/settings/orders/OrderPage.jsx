import React, { useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import './Order.css'
import { Context } from "../../../context/Context";

// ---- Status display labels (maps DB enum -> UI text) ----
const STATUS_LABELS = {
    placed: "Placed",
    shipment_created: "Shipment Created",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rto: "RTO",
};

// Steps shown in the progress stepper (terminal/exception states excluded)
const STEPS = [
    "Placed",
    "Shipment Created",
    "Picked Up",
    "In Transit",
    "Out for Delivery",
    "Delivered",
];

// Filter dropdown options — includes terminal states too
const FILTERS = ["All", ...Object.values(STATUS_LABELS)];

// Statuses that are "in motion" — get a soft pulse on their badge
const LIVE_STATUSES = ["In Transit", "Out for Delivery", "Shipment Created", "Picked Up"];

const statusColor = (status) => {
    switch (status) {
        case "Delivered":
            return "var(--success)";
        case "Cancelled":
        case "RTO":
            return "var(--error)";
        case "Out for Delivery":
        case "In Transit":
            return "var(--color-primary-light)";
        case "Shipment Created":
        case "Picked Up":
            return "var(--color-primary-dark)";
        default:
            return "var(--text-secondary)";
    }
};

function StatusBadge({ status }) {
    return (
        <span
            className={`op-status-badge ${LIVE_STATUSES.includes(status) ? "is-live" : ""}`}
            style={{
                color: statusColor(status),
                borderColor: statusColor(status),
            }}
        >
            {status}
        </span>
    );
}

// Simple bottle glyph — nods to the product (attar/fragrance) without
// depending on any image assets.
function Thumb() {
    return (
        <div className="op-thumb">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M10 3h4M11 3v3.2c0 .4-.15.78-.42 1.06L8.4 9.44A2 2 0 0 0 7.8 10.9v8.1A2 2 0 0 0 9.8 21h4.4a2 2 0 0 0 2-2V10.9c0-.53-.21-1.04-.58-1.41l-2.2-2.24A1.5 1.5 0 0 1 13 6.2V3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M8 14h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
            </svg>
        </div>
    );
}

function SkeletonRows() {
    return (
        <div className="op-skeleton-list" aria-hidden="true">
            <div className="op-skeleton-row" />
            <div className="op-skeleton-row" />
            <div className="op-skeleton-row" />
        </div>
    );
}

// Vertical progress timeline — shared by the current-order card and the
// detail modal, so any order (not just the current one) can render its
// own progress trail.
function Timeline({ status, placedDate }) {
    const stepIndex = Math.max(STEPS.indexOf(status), 0);

    if (!STEPS.includes(status)) {
        return <p className="op-eta">This order was {status.toLowerCase()}.</p>;
    }

    return (
        <>
            <ol className="op-timeline">
                {STEPS.map((step, i) => {
                    const done = i < stepIndex;
                    const active = i === stepIndex;
                    const isDelivered = done && step === "Delivered";
                    return (
                        <li
                            className={`op-timeline-item ${done ? "is-done" : ""} ${
                                active ? "is-active" : ""
                            } ${isDelivered ? "is-delivered" : ""}`}
                            key={step}
                        >
                            <span className="op-timeline-dot">
                                {done || active ? (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M5 13l4 4L19 7"
                                            stroke="#fff"
                                            strokeWidth="2.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <span className="op-timeline-num">{i + 1}</span>
                                )}
                            </span>
                            <div className="op-timeline-content">
                                <p className="op-timeline-title">{step}</p>
                                {i === 0 && placedDate && (
                                    <p className="op-timeline-sub">
                                        Your order has been placed &middot; {placedDate}
                                    </p>
                                )}
                                {active && step !== "Placed" && (
                                    <p className="op-timeline-sub">In progress</p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
            {status !== "Delivered" && (
                <p className="op-eta">Estimated delivery: Tuesday, Oct 24th</p>
            )}
        </>
    );
}

// ---------------- Order detail modal ----------------
// Shows every item (with image), the shipping address, and live courier
// tracking pulled from GET /order/:id/tracking, in addition to the same
// progress timeline shown on the current-order card.
function OrderDetailModal({ order, onClose, tracking, trackingLoading, trackingError }) {
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const liveStatus = tracking?.orderStatus
        ? STATUS_LABELS[tracking.orderStatus] || order.status
        : order.status;

    return (
        <div className="op-modal-overlay" onMouseDown={onClose}>
            <div
                className="op-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Order ${order.id} details`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="op-modal-head">
                    <div>
                        <p className="op-eyebrow">Order Details</p>
                        <p className="op-order-id-sub">Order #{order.id}</p>
                    </div>
                    <button className="op-modal-close" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="op-modal-body">
                    {/* ---- Items, each with its image ---- */}
                    <ul className="op-modal-items">
                        {(order.products || []).map((p, i) => (
                            <li className="op-modal-item" key={i}>
                                <div className="op-product-thumb">
                                    {p.image ? <img src={p.image} alt={p.name} /> : <Thumb />}
                                </div>
                                <div className="op-product-info">
                                    <p className="op-product-name">{p.name}</p>
                                    <p className="op-product-meta">
                                        {[p.size, `Qty ${p.quantity}`].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                {typeof p.price === "number" && (
                                    <p className="op-product-price">₹{p.price.toFixed(2)}</p>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* ---- Price summary ---- */}
                    <div className="op-modal-summary">
                        {typeof order.itemsTotal === "number" && (
                            <div className="op-summary-row">
                                <span>Items total</span>
                                <span>₹{order.itemsTotal.toFixed(2)}</span>
                            </div>
                        )}
                        {typeof order.shippingFee === "number" && (
                            <div className="op-summary-row">
                                <span>Shipping</span>
                                <span>{order.shippingFee === 0 ? "Free" : `₹${order.shippingFee.toFixed(2)}`}</span>
                            </div>
                        )}
                        <div className="op-summary-row op-summary-total">
                            <span>Total paid</span>
                            <span>₹{order.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* ---- Shipping address ---- */}
                    {order.shippingAddress && (
                        <div className="op-modal-block">
                            <p className="op-modal-block-title">Shipping to</p>
                            <p className="op-address-text">
                                {order.shippingAddress.fullName}
                                <br />
                                {order.shippingAddress.addressLine1}, {order.shippingAddress.city}
                                <br />
                                {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
                                {order.shippingAddress.country}
                                <br />
                                {order.shippingAddress.phone}
                            </p>
                        </div>
                    )}

                    {/* ---- Live courier tracking ---- */}
                    <div className="op-modal-block">
                        <p className="op-modal-block-title">Tracking</p>

                        {trackingLoading && (
                            <div className="op-skeleton-list">
                                <div className="op-skeleton-row" style={{ height: 44 }} />
                            </div>
                        )}

                        {!trackingLoading && trackingError && (
                            <p className="op-empty is-error">{trackingError}</p>
                        )}

                        {!trackingLoading && !trackingError && tracking && !tracking.trackingAvailable && (
                            <p className="op-empty">Tracking will appear here once your order ships.</p>
                        )}

                        {!trackingLoading && !trackingError && tracking?.trackingAvailable && (
                            <>
                                <div className="op-tracking-meta">
                                    {tracking.courier && (
                                        <span className="op-tracking-chip">{tracking.courier}</span>
                                    )}
                                    {tracking.awbNumber && (
                                        <span className="op-tracking-chip">AWB {tracking.awbNumber}</span>
                                    )}
                                    {tracking.expectedDeliveryDate && (
                                        <span className="op-tracking-chip">
                                            ETA {tracking.expectedDeliveryDate}
                                        </span>
                                    )}
                                </div>

                                {Array.isArray(tracking.scanDetail) && tracking.scanDetail.length > 0 && (
                                    <ul className="op-scan-list">
                                        {tracking.scanDetail.map((activity, i) => (
                                            <li className="op-scan-item" key={i}>
                                                <span className="op-scan-dot" />
                                                <div>
                                                    <p className="op-scan-status">
                                                        {activity.activity || activity["sr-status-label"] || activity.status}
                                                    </p>
                                                    <p className="op-scan-meta">
                                                        {[activity.date, activity.location].filter(Boolean).join(" · ")}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    {/* ---- Order progress ---- */}
                    <div className="op-modal-block">
                        <p className="op-modal-block-title">Order progress</p>
                        <Timeline status={liveStatus} placedDate={order.date} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderPage() {
    const [filter, setFilter] = useState("All");
    const [filterOpen, setFilterOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { API_URL, token } = useContext(Context);

    // ---- Order detail modal state ----
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/order/getorders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    // Normalize backend shape -> UI shape
                    const mapped = res.data.orders.map((o) => ({
                        id: o._id,
                        date: new Date(o.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                        items: o.items?.length || 0,
                        price: o.totalAmount,
                        status: STATUS_LABELS[o.orderStatus] || "Placed",
                        // Kept alongside the fields above (not replacing them) so the
                        // current-order card and the detail modal can show real
                        // product images/prices — each order item already carries
                        // these from checkout.
                        products: (o.items || []).map((it) => ({
                            name: it.name,
                            image: it.image,
                            size: it.size,
                            quantity: it.quantity,
                            price: it.price,
                        })),
                        // Only present if the API includes them — rendered
                        // conditionally, never fabricated.
                        itemsTotal: typeof o.itemsTotal === "number" ? o.itemsTotal : undefined,
                        shippingFee: typeof o.shippingFee === "number" ? o.shippingFee : undefined,
                        shippingAddress: o.shippingAddress || null,
                    }));
                    setOrders(mapped);
                } else {
                    setError(res.data.message || "Failed to load orders");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [API_URL, token]);

    // Lock page scroll while the modal is open
    useEffect(() => {
        if (selectedOrder) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [selectedOrder]);

    const openOrder = useCallback(
        async (order) => {
            setSelectedOrder(order);
            setTracking(null);
            setTrackingError("");
            setTrackingLoading(true);
            try {
                const res = await axios.get(`${API_URL}/order/${order.id}/tracking`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) {
                    setTracking(res.data);
                } else {
                    setTrackingError(res.data.message || "Unable to load tracking");
                }
            } catch (err) {
                setTrackingError(err.response?.data?.message || "Unable to load tracking");
            } finally {
                setTrackingLoading(false);
            }
        },
        [API_URL, token]
    );

    const closeOrder = useCallback(() => {
        setSelectedOrder(null);
        setTracking(null);
        setTrackingError("");
    }, []);

    const handleRowKeyDown = (e, order) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openOrder(order);
        }
    };

    if (loading) {
        return (
            <div className="op-root op-order-page">
                <section className="op-card">
                    <p className="op-eyebrow">Current Order</p>
                    <SkeletonRows />
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="op-root op-order-page">
                <section className="op-card">
                    <p className="op-empty is-error">{error}</p>
                </section>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="op-root op-order-page">
                <section className="op-card">
                    <p className="op-empty">You haven't placed any orders yet.</p>
                </section>
            </div>
        );
    }

    // Treat the most recent non-final order as "current"; fall back to the latest order
    const currentOrder =
        orders.find((o) => !["Delivered", "Cancelled", "RTO"].includes(o.status)) || orders[0];

    const history = orders
        .filter((o) => o.id !== currentOrder.id)
        .filter((o) => filter === "All" || o.status === filter);

    const firstProduct = currentOrder.products?.[0];
    const extraCount = (currentOrder.products?.length || 0) - 1;

    return (
        <div className="op-root op-order-page">
            <section className="op-card">
                <div className="op-current-top">
                    <p className="op-eyebrow">Current Order</p>
                    <StatusBadge status={currentOrder.status} />
                </div>
                <p className="op-order-id-sub">Order #{currentOrder.id}</p>

                {firstProduct && (
                    <div
                        className="op-product-row is-clickable"
                        role="button"
                        tabIndex={0}
                        onClick={() => openOrder(currentOrder)}
                        onKeyDown={(e) => handleRowKeyDown(e, currentOrder)}
                    >
                        <div className="op-product-thumb">
                            {firstProduct.image ? (
                                <img src={firstProduct.image} alt={firstProduct.name} />
                            ) : (
                                <Thumb />
                            )}
                        </div>
                        <div className="op-product-info">
                            <p className="op-product-name">{firstProduct.name}</p>
                            <p className="op-product-meta">
                                {[
                                    firstProduct.size,
                                    firstProduct.quantity > 1 ? `Qty ${firstProduct.quantity}` : null,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                            {extraCount > 0 && (
                                <p className="op-product-more">
                                    +{extraCount} more item{extraCount > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                        <p className="op-product-price">₹{currentOrder.price.toFixed(2)}</p>
                    </div>
                )}

                <Timeline status={currentOrder.status} placedDate={currentOrder.date} />
            </section>

            <div className="op-history-head">
                <h3 className="op-section-title">Order History</h3>
                <div className="op-filter-wrap">
                    <button
                        className={`op-filter-btn ${filterOpen ? "is-open" : ""}`}
                        onClick={() => setFilterOpen((v) => !v)}
                    >
                        Filter: {filter}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    {filterOpen && (
                        <div className="op-filter-menu">
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    className={`op-filter-option ${f === filter ? "is-selected" : ""}`}
                                    onClick={() => {
                                        setFilter(f);
                                        setFilterOpen(false);
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="op-order-list">
                {history.length === 0 && <p className="op-empty">No orders match this filter.</p>}
                {history.map((o, i) => (
                    <div
                        className="op-order-row"
                        key={o.id}
                        role="button"
                        tabIndex={0}
                        style={{ "--op-delay": `${Math.min(i, 8) * 60}ms` }}
                        onClick={() => openOrder(o)}
                        onKeyDown={(e) => handleRowKeyDown(e, o)}
                    >
                        <Thumb />
                        <div className="op-order-info">
                            <p className="op-order-num">#{o.id}</p>
                            <p className="op-order-meta">
                                {o.date} &middot; {o.items} {o.items === 1 ? "item" : "items"}
                            </p>
                        </div>
                        <div className="op-order-right">
                            <p className="op-order-price">₹{o.price.toFixed(2)}</p>
                            <StatusBadge status={o.status} />
                        </div>
                    </div>
                ))}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={closeOrder}
                    tracking={tracking}
                    trackingLoading={trackingLoading}
                    trackingError={trackingError}
                />
            )}
        </div>
    );
}
export default OrderPage;