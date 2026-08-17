import React, { useContext, useState, useEffect } from "react";
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

const statusColor = (status) => {
    switch (status) {
        case "Delivered":
            return "#16a34a";
        case "Cancelled":
        case "RTO":
            return "#dc2626";
        case "Out for Delivery":
        case "In Transit":
            return "#2563eb";
        case "Shipment Created":
        case "Picked Up":
            return "#d97706";
        default:
            return "#6b7280";
    }
};

function StatusBadge({ status }) {
    return (
        <span
            className="op-status-badge"
            style={{
                color: statusColor(status),
                borderColor: statusColor(status),
            }}
        >
            {status}
        </span>
    );
}

function Thumb() {
    return <div className="op-thumb" />;
}

function OrderPage() {
    const [filter, setFilter] = useState("All");
    const [filterOpen, setFilterOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { API_URL, token } = useContext(Context);

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

    if (loading) {
        return (
            <section className="op-card">
                <p className="op-empty">Loading your orders...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="op-card">
                <p className="op-empty">{error}</p>
            </section>
        );
    }

    if (orders.length === 0) {
        return (
            <section className="op-card">
                <p className="op-empty">You haven't placed any orders yet.</p>
            </section>
        );
    }

    // Treat the most recent non-final order as "current"; fall back to the latest order
    const currentOrder =
        orders.find((o) => !["Delivered", "Cancelled", "RTO"].includes(o.status)) || orders[0];
    const currentStepIndex = Math.max(STEPS.indexOf(currentOrder.status), 0);

    const history = orders
        .filter((o) => o.id !== currentOrder.id)
        .filter((o) => filter === "All" || o.status === filter);

    return (
        <>
            <section className="op-card">
                <p className="op-eyebrow">Current Order</p>
                <div className="op-current-head">
                    <h3 className="op-order-id">Order #{currentOrder.id}</h3>
                    <StatusBadge status={currentOrder.status} />
                </div>

                {STEPS.includes(currentOrder.status) ? (
                    <div className="op-stepper">
                        {STEPS.map((step, i) => {
                            const done = i < currentStepIndex;
                            const active = i === currentStepIndex;
                            return (
                                <div className="op-step" key={step}>
                                    <div
                                        className={`op-step-dot ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
                                    >
                                        {done || active ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M5 13l4 4L19 7"
                                                    stroke="#fff"
                                                    strokeWidth="2.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            <span className="op-step-num">{i + 1}</span>
                                        )}
                                    </div>
                                    <span
                                        className="op-step-label"
                                        style={{
                                            color: active ? "var(--color-primary)" : "var(--text-secondary)",
                                        }}
                                    >
                                        {step}
                                    </span>
                                    {i < STEPS.length - 1 && (
                                        <div className={`op-step-line ${done ? "is-done" : ""}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="op-eta">
                        This order was {currentOrder.status.toLowerCase()}.
                    </p>
                )}

                {STEPS.includes(currentOrder.status) && currentOrder.status !== "Delivered" && (
                    <p className="op-eta">Estimated delivery: Tuesday, Oct 24th</p>
                )}
            </section>

            <div className="op-history-head">
                <h3 className="op-section-title">Order History</h3>
                <div className="op-filter-wrap">
                    <button className="op-filter-btn" onClick={() => setFilterOpen((v) => !v)}>
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
                {history.map((o) => (
                    <div className="op-order-row" key={o.id}>
                        <Thumb />
                        <div className="op-order-info">
                            <p className="op-order-num">#{o.id}</p>
                            <p className="op-order-meta">
                                {o.date} &middot; {o.items} {o.items === 1 ? "item" : "items"}
                            </p>
                        </div>
                        <div className="op-order-right">
                            <p className="op-order-price">${o.price.toFixed(2)}</p>
                            <StatusBadge status={o.status} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
export default OrderPage;