import React, { useState, useRef } from "react";
import {
    FiChevronDown,
    FiUser,
    FiLock,
    FiMapPin,
    FiClock,
    FiTruck,
    FiPackage,
    FiBell,
    FiMail,
    FiGlobe,
    FiCreditCard,
    FiHelpCircle,
    FiShield,
    FiFileText,
    FiEdit2,
    FiEye,
    FiEyeOff,
    FiPlus,
    FiTrash2,
    FiHeadphones,
} from "react-icons/fi";
import "./SettingsPage.css";

// ---------- Mock data (swap with real API calls) ----------
const initialOrders = [
    { id: "HF-10432", date: "12 Jun 2026", items: "Rose Attar 10ml, Oud Musk 25ml", total: "₹2,340", status: "Delivered" },
    { id: "HF-10391", date: "28 May 2026", items: "Sandal Woody 50ml", total: "₹1,890", status: "Delivered" },
    { id: "HF-10288", date: "03 May 2026", items: "Citrus Bloom 10ml", total: "₹640", status: "Cancelled" },
];

const initialAddresses = [
    { id: 1, label: "Home", line: "14 Patwar Bagan Lane, Kolkata, WB 700005", isDefault: true },
    { id: 2, label: "Office", line: "Park Street, Kolkata, WB 700016", isDefault: false },
];

// ---------- Reusable accordion row ----------
function SettingRow({ icon, label, isOpen, onToggle, children }) {
    return (
        <div className="setting-row">
            <button
                type="button"
                className="setting-row-header"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className="setting-row-label">
                    <span className="setting-row-icon">{icon}</span>
                    {label}
                </span>
                <FiChevronDown className={`chevron${isOpen ? " chevron-open" : ""}`} />
            </button>
            <div className={`setting-row-panel${isOpen ? " open" : ""}`}>
                <div className="setting-row-panel-inner">{children}</div>
            </div>
        </div>
    );
}

export default function Settingspage() {
    // ----- profile -----
    const [avatar, setAvatar] = useState(
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces"
    );
    const fileInputRef = useRef(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profile, setProfile] = useState({
        name: "Amara Vance",
        memberSince: "October 2023",
        tier: "Elite Tier",
        email: "amara.vance@email.com",
        phone: "+91 98300 00000",
        dob: "1996-04-12",
    });
    const [profileDraft, setProfileDraft] = useState(profile);

    const openGallery = () => fileInputRef.current?.click();

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatar(url);
        }
    };

    const saveProfile = () => {
        setProfile(profileDraft);
        setEditingProfile(false);
    };

    // ----- accordion open state -----
    const [openSection, setOpenSection] = useState(null);
    const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));

    // ----- security -----
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [pwError, setPwError] = useState("");

    const submitPasswordChange = (e) => {
        e.preventDefault();
        if (!pwForm.current || !pwForm.next) {
            setPwError("Enter your current and new password");
            return;
        }
        if (pwForm.next.length < 8) {
            setPwError("New password should be at least 8 characters");
            return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwError("New password and confirmation don't match");
            return;
        }
        setPwError("");
        // TODO: call backend change-password endpoint
        setPwForm({ current: "", next: "", confirm: "" });
        alert("Password updated");
    };

    // ----- addresses -----
    const [addresses, setAddresses] = useState(initialAddresses);
    const [newAddress, setNewAddress] = useState("");

    const addAddress = () => {
        if (!newAddress.trim()) return;
        setAddresses((prev) => [
            ...prev,
            { id: Date.now(), label: "New address", line: newAddress.trim(), isDefault: false },
        ]);
        setNewAddress("");
    };

    const removeAddress = (id) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
    };

    const makeDefault = (id) => {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    };

    // ----- order tracking -----
    const [trackId, setTrackId] = useState("");
    const [trackResult, setTrackResult] = useState(null);

    const handleTrack = (e) => {
        e.preventDefault();
        if (!trackId.trim()) return;
        setTrackResult({
            id: trackId.trim(),
            steps: [
                { label: "Order confirmed", done: true },
                { label: "Packed", done: true },
                { label: "Shipped", done: true },
                { label: "Out for delivery", done: false },
                { label: "Delivered", done: false },
            ],
        });
    };

    // ----- returns -----
    const [returnOrderId, setReturnOrderId] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [returnSubmitted, setReturnSubmitted] = useState(false);

    const submitReturn = (e) => {
        e.preventDefault();
        if (!returnOrderId.trim() || !returnReason.trim()) return;
        setReturnSubmitted(true);
        setReturnOrderId("");
        setReturnReason("");
    };

    // ----- preferences -----
    const [pushNotif, setPushNotif] = useState(true);
    const [emailMarketing, setEmailMarketing] = useState(false);
    const [language, setLanguage] = useState("English (US)");
    const [currency, setCurrency] = useState("INR (₹)");

    return (
        <div className="settings-page">
            {/* ---------- Profile header ---------- */}
            <section className="profile-header">
                <div className="avatar-wrap">
                    <button
                        type="button"
                        className="avatar-btn"
                        onClick={openGallery}
                        aria-label="Change profile photo"
                    >
                        <img src={avatar} alt="Profile" className="avatar-img" />
                        <span className="avatar-edit-badge">
                            <FiEdit2 size={12} />
                        </span>
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        hidden
                    />
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">{profile.name}</h1>
                    <p className="profile-meta">
                        Member since {profile.memberSince} &bull; {profile.tier}
                    </p>

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setProfileDraft(profile);
                                setEditingProfile((v) => !v);
                            }}
                        >
                            {editingProfile ? "Close" : "Edit Profile"}
                        </button>
                        <button type="button" className="btn btn-outline">
                            View Rewards
                        </button>
                    </div>
                </div>
            </section>

            {editingProfile && (
                <section className="edit-profile-card">
                    <div className="field">
                        <label>Full name</label>
                        <input
                            value={profileDraft.name}
                            onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <input
                            value={profileDraft.email}
                            onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label>Phone</label>
                        <input
                            value={profileDraft.phone}
                            onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                        />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={saveProfile}>
                        Save changes
                    </button>
                </section>
            )}

            {/* ---------- Two column layout ---------- */}
            <div className="settings-columns">
                {/* LEFT COLUMN */}
                <div className="settings-col">
                    <div className="settings-group">
                        <h2 className="group-title">
                            <FiUser className="group-title-icon" /> Account Settings
                        </h2>

                        <SettingRow
                            icon={<FiUser />}
                            label="Personal Information"
                            isOpen={openSection === "personal"}
                            onToggle={() => toggleSection("personal")}
                        >
                            <div className="info-grid">
                                <div>
                                    <span className="info-label">Full name</span>
                                    <span className="info-value">{profile.name}</span>
                                </div>
                                <div>
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{profile.email}</span>
                                </div>
                                <div>
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{profile.phone}</span>
                                </div>
                                <div>
                                    <span className="info-label">Date of birth</span>
                                    <span className="info-value">{profile.dob}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setProfileDraft(profile);
                                    setEditingProfile(true);
                                }}
                            >
                                Edit details
                            </button>
                        </SettingRow>

                        <SettingRow
                            icon={<FiLock />}
                            label="Security & Password"
                            isOpen={openSection === "security"}
                            onToggle={() => toggleSection("security")}
                        >
                            <form className="stacked-form" onSubmit={submitPasswordChange}>
                                {["current", "next", "confirm"].map((key) => (
                                    <div className="field password-field" key={key}>
                                        <label>
                                            {key === "current"
                                                ? "Current password"
                                                : key === "next"
                                                    ? "New password"
                                                    : "Confirm new password"}
                                        </label>
                                        <div className="password-input-wrap">
                                            <input
                                                type={showPw[key] ? "text" : "password"}
                                                value={pwForm[key]}
                                                onChange={(e) =>
                                                    setPwForm({ ...pwForm, [key]: e.target.value })
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="eye-btn"
                                                onClick={() =>
                                                    setShowPw({ ...showPw, [key]: !showPw[key] })
                                                }
                                            >
                                                {showPw[key] ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pwError && <p className="field-error">{pwError}</p>}
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Update password
                                </button>
                            </form>
                        </SettingRow>

                        <SettingRow
                            icon={<FiMapPin />}
                            label="Saved Addresses"
                            isOpen={openSection === "addresses"}
                            onToggle={() => toggleSection("addresses")}
                        >
                            <ul className="address-list">
                                {addresses.map((a) => (
                                    <li key={a.id} className="address-item">
                                        <div>
                                            <span className="address-label">
                                                {a.label}
                                                {a.isDefault && <span className="pill">Default</span>}
                                            </span>
                                            <span className="address-line">{a.line}</span>
                                        </div>
                                        <div className="address-actions">
                                            {!a.isDefault && (
                                                <button
                                                    type="button"
                                                    className="text-btn"
                                                    onClick={() => makeDefault(a.id)}
                                                >
                                                    Make default
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="icon-only-btn"
                                                onClick={() => removeAddress(a.id)}
                                                aria-label="Remove address"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="add-address-row">
                                <input
                                    placeholder="Add a new address"
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                />
                                <button type="button" className="btn btn-primary btn-sm" onClick={addAddress}>
                                    <FiPlus /> Add
                                </button>
                            </div>
                        </SettingRow>
                    </div>

                    <div className="settings-group">
                        <h2 className="group-title">
                            <FiPackage className="group-title-icon" /> Order Management
                        </h2>

                        <SettingRow
                            icon={<FiClock />}
                            label="Order History"
                            isOpen={openSection === "orderHistory"}
                            onToggle={() => toggleSection("orderHistory")}
                        >
                            <ul className="order-list">
                                {initialOrders.map((o) => (
                                    <li key={o.id} className="order-item">
                                        <div>
                                            <span className="order-id">{o.id}</span>
                                            <span className="order-date">{o.date}</span>
                                            <span className="order-items">{o.items}</span>
                                        </div>
                                        <div className="order-right">
                                            <span className="order-total">{o.total}</span>
                                            <span className={`status-pill status-${o.status.toLowerCase()}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </SettingRow>

                        <SettingRow
                            icon={<FiTruck />}
                            label="Track My Package"
                            isOpen={openSection === "track"}
                            onToggle={() => toggleSection("track")}
                        >
                            <form className="track-form" onSubmit={handleTrack}>
                                <input
                                    placeholder="Enter order ID e.g. HF-10432"
                                    value={trackId}
                                    onChange={(e) => setTrackId(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Track
                                </button>
                            </form>

                            {trackResult && (
                                <div className="track-timeline">
                                    <p className="track-heading">Order {trackResult.id}</p>
                                    {trackResult.steps.map((s, i) => (
                                        <div className="track-step" key={i}>
                                            <span className={`track-dot${s.done ? " done" : ""}`} />
                                            <span className={s.done ? "" : "track-step-pending"}>
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SettingRow>

                        <SettingRow
                            icon={<FiPackage />}
                            label="Returns & Exchanges"
                            isOpen={openSection === "returns"}
                            onToggle={() => toggleSection("returns")}
                        >
                            {returnSubmitted && (
                                <p className="success-note">
                                    Return request submitted. We'll email you the next steps.
                                </p>
                            )}
                            <form className="stacked-form" onSubmit={submitReturn}>
                                <div className="field">
                                    <label>Order ID</label>
                                    <input
                                        placeholder="e.g. HF-10432"
                                        value={returnOrderId}
                                        onChange={(e) => setReturnOrderId(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Reason for return</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tell us what happened"
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Submit return request
                                </button>
                            </form>
                        </SettingRow>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="settings-col">
                    <div className="settings-group">
                        <h2 className="group-title">Preferences</h2>

                        <div className="pref-row">
                            <span className="pref-label">
                                <FiBell className="group-title-icon" /> Push Notifications
                            </span>
                            <button
                                type="button"
                                className={`toggle${pushNotif ? " toggle-on" : ""}`}
                                onClick={() => setPushNotif((v) => !v)}
                                aria-pressed={pushNotif}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>

                        <div className="pref-row">
                            <span className="pref-label">
                                <FiMail className="group-title-icon" /> Email Marketing
                            </span>
                            <button
                                type="button"
                                className={`toggle${emailMarketing ? " toggle-on" : ""}`}
                                onClick={() => setEmailMarketing((v) => !v)}
                                aria-pressed={emailMarketing}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>

                        <div className="pref-row">
                            <span className="pref-label">
                                <FiGlobe className="group-title-icon" /> Language
                            </span>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option>English (US)</option>
                                <option>Hindi</option>
                                <option>Bengali</option>
                            </select>
                        </div>

                        <div className="pref-row">
                            <span className="pref-label">
                                <FiCreditCard className="group-title-icon" /> Currency
                            </span>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-group">
                        <h2 className="group-title">Support &amp; Legal</h2>

                        <SettingRow
                            icon={<FiHelpCircle />}
                            label="Help Center"
                            isOpen={openSection === "help"}
                            onToggle={() => toggleSection("help")}
                        >
                            <p className="static-text">
                                Browse FAQs on orders, shipping, and fragrance care, or reach out
                                to our concierge team below for anything else.
                            </p>
                        </SettingRow>

                        <SettingRow
                            icon={<FiShield />}
                            label="Privacy Policy"
                            isOpen={openSection === "privacy"}
                            onToggle={() => toggleSection("privacy")}
                        >
                            <p className="static-text">
                                We collect only what's needed to fulfil your orders and improve
                                your experience. Your data is never sold to third parties.
                            </p>
                        </SettingRow>

                        <SettingRow
                            icon={<FiFileText />}
                            label="Terms of Service"
                            isOpen={openSection === "terms"}
                            onToggle={() => toggleSection("terms")}
                        >
                            <p className="static-text">
                                By using Humi's Fragrance, you agree to our order, return, and
                                delivery terms outlined in full on our policies page.
                            </p>
                        </SettingRow>
                    </div>

                    <button
                        type="button"
                        className="concierge-btn"
                        onClick={() => alert("Connecting you to concierge...")}
                    >
                        <FiHeadphones /> Contact Concierge
                    </button>
                </div>
            </div>
        </div>
    );
}