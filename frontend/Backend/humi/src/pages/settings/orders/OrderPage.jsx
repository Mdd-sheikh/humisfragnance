import React, { useState } from "react";
import './Order.css'

/**
 * OrderPage
 * Mobile-first account/orders page matching the Elixir Lux design tokens.
 * Sidebar becomes a horizontal scroll-tab strip on small screens and a
 * fixed left column on desktop. All nav items are functional — clicking
 * one swaps the main panel. Order History has a working status filter.
 */

const NAV_ITEMS = [
    { key: "orders", label: "My Orders" },
    { key: "wishlist", label: "Wishlist" },
    { key: "addresses", label: "Saved Addresses" },
    { key: "payments", label: "Payment Methods" },
    { key: "settings", label: "Account Settings" },
];

const STEPS = ["Placed", "Packed", "Shipped", "Delivered"];

const ORDERS = [
    { id: "LX-891044", date: "Oct 12, 2023", items: 2, price: 245.0, status: "Delivered" },
    { id: "LX-885921", date: "Sep 28, 2023", items: 1, price: 110.0, status: "Delivered" },
    { id: "LX-823004", date: "Aug 15, 2023", items: 4, price: 580.0, status: "Cancelled" },
    { id: "LX-942031", date: "Oct 20, 2023", items: 3, price: 320.0, status: "Shipped" },
];

const FILTERS = ["All", "Placed", "Shipped", "Delivered", "Cancelled"];

const WISHLIST = [
    { name: "Amber Noir Parfum", price: 165.0 },
    { name: "Velvet Oud Candle", price: 58.0 },
    { name: "Gilded Rose Diffuser", price: 92.0 },
];

function statusColor(status) {
    if (status === "Delivered") return "var(--success)";
    if (status === "Cancelled") return "var(--error)";
    return "var(--color-primary)";
}

function StatusBadge({ status }) {
    return (
        <span
            className="op-badge"
            style={{
                color: statusColor(status),
                background:
                    status === "Delivered"
                        ? "rgba(46,125,50,0.1)"
                        : status === "Cancelled"
                            ? "rgba(161,58,58,0.1)"
                            : "rgba(201,162,39,0.16)",
            }}
        >
            {status}
        </span>
    );
}

function Thumb() {
    return (
        <div className="op-thumb" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
                    stroke="var(--color-primary-light)"
                    strokeWidth="1.4"
                />
            </svg>
        </div>
    );
}

/* ---------------- Panels ---------------- */

function OrdersPanel() {
    const [filter, setFilter] = useState("All");
    const [filterOpen, setFilterOpen] = useState(false);

    const currentOrder = ORDERS.find((o) => o.id === "LX-942031");
    const currentStepIndex = STEPS.indexOf(currentOrder.status);

    const history = ORDERS.filter((o) => o.id !== "LX-942031").filter(
        (o) => filter === "All" || o.status === filter
    );

    return (
        <>
            <section className="op-card">
                <p className="op-eyebrow">Current Order</p>
                <div className="op-current-head">
                    <h3 className="op-order-id">Order #{currentOrder.id}</h3>
                    <StatusBadge status={currentOrder.status} />
                </div>

                <div className="op-stepper">
                    {STEPS.map((step, i) => {
                        const done = i < currentStepIndex;
                        const active = i === currentStepIndex;
                        return (
                            <div className="op-step" key={step}>
                                <div
                                    className={`op-step-dot ${done ? "is-done" : ""} ${active ? "is-active" : ""
                                        }`}
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

                <p className="op-eta">Estimated delivery: Tuesday, Oct 24th</p>
            </section>

            <div className="op-history-head">
                <h3 className="op-section-title">Order History</h3>
                <div className="op-filter-wrap">
                    <button
                        className="op-filter-btn"
                        onClick={() => setFilterOpen((v) => !v)}
                    >
                        Filter: {filter}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 9l6 6 6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
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
                {history.length === 0 && (
                    <p className="op-empty">No orders match this filter.</p>
                )}
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

function WishlistPanel() {
    const [items, setItems] = useState(WISHLIST);
    return (
        <section className="op-card">
            <h3 className="op-section-title" style={{ marginBottom: 16 }}>
                Wishlist
            </h3>
            {items.length === 0 && <p className="op-empty">Your wishlist is empty.</p>}
            <div className="op-wishlist-grid">
                {items.map((it) => (
                    <div className="op-wishlist-item" key={it.name}>
                        <Thumb />
                        <div style={{ flex: 1 }}>
                            <p className="op-order-num">{it.name}</p>
                            <p className="op-order-price" style={{ marginTop: 4 }}>
                                ${it.price.toFixed(2)}
                            </p>
                        </div>
                        <button
                            className="op-link-btn"
                            onClick={() =>
                                setItems((prev) => prev.filter((p) => p.name !== it.name))
                            }
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AddressesPanel() {
    const [addresses, setAddresses] = useState([
        { id: 1, label: "Home", line: "12 Rosewood Lane, Chennai, TN 600001" },
        { id: 2, label: "Office", line: "4th Floor, Elixir Tower, Chennai, TN 600006" },
    ]);
    const [form, setForm] = useState({ label: "", line: "" });
    const [showForm, setShowForm] = useState(false);

    function saveAddress(e) {
        e.preventDefault();
        if (!form.label.trim() || !form.line.trim()) return;
        setAddresses((prev) => [...prev, { id: Date.now(), ...form }]);
        setForm({ label: "", line: "" });
        setShowForm(false);
    }

    return (
        <section className="op-card">
            <div className="op-history-head" style={{ marginBottom: 16 }}>
                <h3 className="op-section-title">Saved Addresses</h3>
                <button className="op-filter-btn" onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "Add Address"}
                </button>
            </div>

            {showForm && (
                <form className="op-form" onSubmit={saveAddress}>
                    <label className="op-field">
                        <span>Label</span>
                        <input
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            placeholder="e.g. Home, Office"
                        />
                    </label>
                    <label className="op-field">
                        <span>Address</span>
                        <input
                            value={form.line}
                            onChange={(e) => setForm({ ...form, line: e.target.value })}
                            placeholder="Street, city, state, pincode"
                        />
                    </label>
                    <button type="submit" className="op-primary-btn">
                        Save Address
                    </button>
                </form>
            )}

            <div className="op-address-list">
                {addresses.map((a) => (
                    <div className="op-address-row" key={a.id}>
                        <div>
                            <p className="op-order-num">{a.label}</p>
                            <p className="op-order-meta">{a.line}</p>
                        </div>
                        <button
                            className="op-link-btn"
                            onClick={() =>
                                setAddresses((prev) => prev.filter((x) => x.id !== a.id))
                            }
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

function PaymentsPanel() {
    const [cards, setCards] = useState([
        { id: 1, brand: "Visa", last4: "4291" },
        { id: 2, brand: "Mastercard", last4: "8830" },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [num, setNum] = useState("");

    function addCard(e) {
        e.preventDefault();
        const digits = num.replace(/\D/g, "");
        if (digits.length < 4) return;
        setCards((prev) => [
            ...prev,
            { id: Date.now(), brand: "Card", last4: digits.slice(-4) },
        ]);
        setNum("");
        setShowForm(false);
    }

    return (
        <section className="op-card">
            <div className="op-history-head" style={{ marginBottom: 16 }}>
                <h3 className="op-section-title">Payment Methods</h3>
                <button className="op-filter-btn" onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "Add Card"}
                </button>
            </div>

            {showForm && (
                <form className="op-form" onSubmit={addCard}>
                    <label className="op-field">
                        <span>Card number</span>
                        <input
                            value={num}
                            onChange={(e) => setNum(e.target.value)}
                            placeholder="•••• •••• •••• ••••"
                            inputMode="numeric"
                        />
                    </label>
                    <button type="submit" className="op-primary-btn">
                        Save Card
                    </button>
                </form>
            )}

            <div className="op-address-list">
                {cards.map((c) => (
                    <div className="op-address-row" key={c.id}>
                        <div>
                            <p className="op-order-num">{c.brand}</p>
                            <p className="op-order-meta">•••• •••• •••• {c.last4}</p>
                        </div>
                        <button
                            className="op-link-btn"
                            onClick={() => setCards((prev) => prev.filter((x) => x.id !== c.id))}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

function SettingsPanel() {
    const [form, setForm] = useState({
        name: "Julian Thorne",
        email: "julian.thorne@elixir-lux.com",
        phone: "",
    });
    const [saved, setSaved] = useState(false);

    function save(e) {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    }

    return (
        <section className="op-card">
            <h3 className="op-section-title" style={{ marginBottom: 16 }}>
                Account Settings
            </h3>
            <form className="op-form" onSubmit={save}>
                <label className="op-field">
                    <span>Full name</span>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </label>
                <label className="op-field">
                    <span>Email</span>
                    <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </label>
                <label className="op-field">
                    <span>Phone</span>
                    <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91"
                    />
                </label>
                <button type="submit" className="op-primary-btn">
                    Save Changes
                </button>
                {saved && <p className="op-saved-msg">Changes saved.</p>}
            </form>
        </section>
    );
}

/* ---------------- Root ---------------- */

export default function OrderPage() {
    const [active, setActive] = useState("orders");

    return (
        <div className="op-root">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap');

        .op-root {
          --font-display: "Fraunces", Georgia, serif;
          --font-body: "Manrope", -apple-system, sans-serif;
          --color-primary: #755b00;
          --color-primary-light: #c9a227;
          --color-primary-dark: #4b3a00;
          --bg-primary: #fbf9f9;
          --bg-card: #ffffff;
          --bg-muted: #dbdad9;
          --bg-panel: #f2f0ee;
          --text-primary: #1b1c1c;
          --text-secondary: #4d4635;
          --border-color: #d1c5af;
          --success: #2e7d32;
          --error: #a13a3a;

          font-family: var(--font-body);
          background: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
        }
        .op-root * { box-sizing: border-box; }

        .op-layout {
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 860px) {
          .op-layout { flex-direction: row; align-items: flex-start; }
        }

        /* --- Profile / sidebar --- */
        .op-sidebar {
          background: var(--bg-panel);
          padding: 20px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        @media (min-width: 860px) {
          .op-sidebar {
            width: 260px;
            flex-shrink: 0;
            border-bottom: none;
            border-right: 1px solid var(--border-color);
            min-height: 100vh;
            position: sticky;
            top: 0;
          }
        }

        .op-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .op-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark));
          flex-shrink: 0;
        }
        .op-profile-name {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .op-profile-email { font-size: 12px; color: var(--text-secondary); margin: 2px 0 0; }

        .op-profile-actions { display: flex; gap: 8px; margin-bottom: 24px; }
        .op-btn-outline, .op-btn-dark {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          flex: 1;
        }
        .op-btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }
        .op-btn-dark {
          background: var(--color-primary-dark);
          border: 1px solid var(--color-primary-dark);
          color: #fbf9f9;
        }

        .op-nav { display: flex; gap: 6px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (min-width: 860px) {
          .op-nav { flex-direction: column; gap: 2px; overflow: visible; }
        }
        .op-nav-item {
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-left: 3px solid transparent;
          padding: 10px 12px;
          white-space: nowrap;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
        }
        .op-nav-item:hover { background: var(--bg-muted); }
        .op-nav-item.is-active {
          color: var(--color-primary-dark);
          border-left-color: var(--color-primary-light);
          background: rgba(201,162,39,0.1);
        }

        /* --- Main --- */
        .op-main { flex: 1; width: 100%; padding: 20px 16px 48px; }
        @media (min-width: 860px) { .op-main { padding: 32px 32px 56px; } }

        .op-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .op-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin: 0 0 6px;
        }
        .op-current-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .op-order-id {
          font-family: var(--font-display);
          font-size: 19px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        .op-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .op-stepper {
          display: flex;
          align-items: flex-start;
          margin: 26px 4px 16px;
        }
        .op-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .op-step-dot {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: var(--bg-muted);
          display: flex; align-items: center; justify-content: center;
          z-index: 1;
        }
        .op-step-dot.is-done, .op-step-dot.is-active { background: var(--color-primary-dark); }
        .op-step-num { font-size: 12px; font-weight: 700; color: var(--text-secondary); }
        .op-step-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 8px;
          text-align: center;
        }
        .op-step-line {
          position: absolute;
          top: 15px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--bg-muted);
        }
        .op-step-line.is-done { background: var(--color-primary-dark); }

        .op-eta {
          text-align: center;
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 8px 0 0;
        }

        .op-history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .op-section-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .op-filter-wrap { position: relative; }
        .op-filter-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
        }
        .op-filter-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(27,28,28,0.12);
          overflow: hidden;
          z-index: 10;
          min-width: 150px;
        }
        .op-filter-option {
          display: block;
          width: 100%;
          text-align: left;
          font-family: var(--font-body);
          font-size: 13px;
          padding: 9px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
        }
        .op-filter-option:hover { background: var(--bg-panel); }
        .op-filter-option.is-selected { color: var(--color-primary-dark); font-weight: 700; }

        .op-order-list { display: flex; flex-direction: column; gap: 10px; }
        .op-order-row, .op-address-row, .op-wishlist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 14px;
        }
        .op-thumb {
          width: 44px; height: 44px;
          border-radius: 8px;
          background: var(--bg-panel);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .op-order-info { flex: 1; min-width: 0; }
        .op-order-num { font-size: 14px; font-weight: 700; margin: 0; color: var(--text-primary); }
        .op-order-meta { font-size: 12px; color: var(--text-secondary); margin: 2px 0 0; }
        .op-order-right { text-align: right; }
        .op-order-price { font-size: 14px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }

        .op-empty { color: var(--text-secondary); font-size: 13.5px; }

        .op-wishlist-grid { display: flex; flex-direction: column; gap: 10px; }
        .op-link-btn {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          color: var(--error);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .op-address-list { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }

        .op-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .op-field { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--text-secondary); }
        .op-field input {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-primary);
        }
        .op-field input:focus {
          outline: none;
          border-color: var(--color-primary-light);
          box-shadow: 0 0 0 3px rgba(201,162,39,0.18);
        }
        .op-primary-btn {
          align-self: flex-start;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #fbf9f9;
          background: var(--color-primary-dark);
          border: none;
          border-radius: 6px;
          padding: 10px 18px;
          cursor: pointer;
        }
        .op-saved-msg { font-size: 12.5px; color: var(--success); font-weight: 600; margin: 0; }
      `}</style>

            <div className="op-layout">
                <aside className="op-sidebar">
                    <div className="op-profile">
                        <div className="op-avatar" />
                        <div>
                            <p className="op-profile-name">Julian Thorne</p>
                            <p className="op-profile-email">julian.thorne@elixir-lux.com</p>
                        </div>
                    </div>

                    <div className="op-profile-actions">
                        <button className="op-btn-outline">Edit Profile</button>
                        <button className="op-btn-dark">Logout</button>
                    </div>

                    <nav className="op-nav">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.key}
                                className={`op-nav-item ${active === item.key ? "is-active" : ""}`}
                                onClick={() => setActive(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="op-main">
                    {active === "orders" && <OrdersPanel />}
                    {active === "wishlist" && <WishlistPanel />}
                    {active === "addresses" && <AddressesPanel />}
                    {active === "payments" && <PaymentsPanel />}
                    {active === "settings" && <SettingsPanel />}
                </main>
            </div>
        </div>
    );
}