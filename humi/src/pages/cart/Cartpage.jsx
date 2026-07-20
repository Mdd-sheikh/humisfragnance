import React, { useState } from "react";
import "./Cartpage.css";
import { useContext } from "react";
import { Context } from "../../context/Context";

const TAX_RATE = 0.08; // 8% — adjust to your actual tax rule

function formatUSD(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Full checkout flow: Shopping Bag -> Shipping Address.
 * Cart data comes entirely from Context (cartItems/cartCount/cartTotal) —
 * nothing here is hardcoded.
 *
 * Note: this context stores cart as { [productId]: qty } and rebuilds
 * cartItems by looking each id up in PRODUCTS. That means anything
 * passed to addToCart() must already exist in PRODUCTS, or it will be
 * silently dropped from cartItems (see the .filter(Boolean) in context.jsx).
 */
export default function CartPage() {
  const [step, setStep] = useState("cart"); // "cart" | "address" | "confirmation"
  const [shippingAddress, setShippingAddress] = useState(null);

  return (
    <div className="cart-page">
      {step === "cart" && (
        <ShoppingBag onCheckout={() => setStep("address")} />
      )}
      {step === "address" && (
        <AddressStep
          initialValue={shippingAddress}
          onBack={() => setStep("cart")}
          onContinue={(address) => {
            setShippingAddress(address);
            setStep("confirmation");
          }}
        />
      )}
      {step === "confirmation" && (
        <OrderConfirmation
          shippingAddress={shippingAddress}
          onBackToBag={() => setStep("cart")}
        />
      )}
    </div>
  );
}

/* ============================================================
   Step 1 — Shopping Bag
   ============================================================ */

function ShoppingBag({ onCheckout }) {
  const { cartItems, cartCount, cartTotal, updateQty, removeFromCart } =
    useContext(Context);

  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState(null); // null | "applied" | "invalid"
  const [discount, setDiscount] = useState(0);

  const subtotal = cartTotal;
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal - discount + tax);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // Mock validation — replace with a real promo-code API call.
    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
      setPromoStatus("applied");
    } else {
      setDiscount(0);
      setPromoStatus("invalid");
    }
  };

  return (
    <div className="bag-layout">
      <div className="bag-main">
        <header className="bag-header">
          <h1 className="bag-header__title">Shopping Bag</h1>
          <p className="bag-header__subtitle">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your selection
          </p>
        </header>

        {cartItems.length === 0 ? (
          <div className="bag-empty">
            <p className="bag-empty__text">Your bag is empty.</p>
            <p className="bag-empty__hint">
              Items you add to your bag will show up here.
            </p>
          </div>
        ) : (
          <ul className="bag-list">
            {cartItems.map((item) => (
              <li key={item.id} className="bag-item">
                <div className="bag-item__media">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="bag-item__info">
                  <div className="bag-item__top">
                    <h3 className="bag-item__name">{item.name}</h3>
                    <span className="bag-item__price">
                      {formatUSD(item.price)}
                    </span>
                  </div>
                  {(item.variant || item.notes) && (
                    <p className="bag-item__variant">
                      {item.variant || item.notes}
                    </p>
                  )}

                  <div className="bag-item__actions">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span>{String(item.qty).padStart(2, "0")}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="bag-item__links">
                      <button
                        type="button"
                        className="bag-item__link"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <TrashIcon /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cartItems.length > 0 && (
          <form className="promo" onSubmit={handleApplyPromo}>
            <label className="promo__label" htmlFor="promo-code">
              Promotional Code
            </label>
            <div className="promo__row">
              <input
                id="promo-code"
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoStatus(null);
                }}
                placeholder="Enter code"
              />
              <button type="submit">Apply</button>
            </div>
            {promoStatus === "applied" && (
              <p className="promo__message promo__message--ok">
                Promo code applied.
              </p>
            )}
            {promoStatus === "invalid" && (
              <p className="promo__message promo__message--error">
                That code isn't valid.
              </p>
            )}
          </form>
        )}
      </div>

      {/* Order summary + checkout button only ever render when there's
          something in the bag */}
      {cartItems.length > 0 && (
        <aside className="bag-sidebar">
          <div className="order-summary">
            <h2 className="order-summary__title">Order Summary</h2>

            <div className="order-summary__row">
              <span>Subtotal</span>
              <span>{formatUSD(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="order-summary__row order-summary__row--discount">
                <span>Discount</span>
                <span>−{formatUSD(discount)}</span>
              </div>
            )}

            <div className="order-summary__row">
              <span>Shipping (Standard)</span>
              <span className="order-summary__note">
                Calculated at next step
              </span>
            </div>

            <div className="order-summary__row">
              <span>Tax</span>
              <span>{formatUSD(tax)}</span>
            </div>

            <div className="order-summary__total">
              <span>Total</span>
              <span>{formatUSD(total)}</span>
            </div>

            <button
              type="button"
              className="order-summary__checkout"
              onClick={onCheckout}
            >
              Proceed to Checkout
            </button>

            <p className="order-summary__secure">
              <LockIcon /> Secure encrypted checkout
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ============================================================
   Step 2 — Shipping Address
   ============================================================ */

function AddressStep({ initialValue, onBack, onContinue }) {
  const { cartCount } = useContext(Context);

  const [form, setForm] = useState(
    initialValue || {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    }
  );
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.line1.trim()) next.line1 = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onContinue(form);
  };

  return (
    <div className="bag-layout">
      <div className="bag-main">
        <button type="button" className="step-back" onClick={onBack}>
          <BackIcon /> Back to bag
        </button>

        <header className="bag-header">
          <h1 className="bag-header__title">Shipping Address</h1>
          <p className="bag-header__subtitle">
            Where should we send your {cartCount}{" "}
            {cartCount === 1 ? "item" : "items"}?
          </p>
        </header>

        <form className="address-form" onSubmit={handleSubmit} noValidate>
          <div className="address-form__grid">
            <Field
              label="Full Name"
              value={form.fullName}
              onChange={update("fullName")}
              error={errors.fullName}
              autoComplete="name"
            />
            <Field
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              error={errors.phone}
              autoComplete="tel"
            />

            <Field
              label="Address Line 1"
              value={form.line1}
              onChange={update("line1")}
              error={errors.line1}
              full
              autoComplete="address-line1"
            />
            <Field
              label="Address Line 2 (optional)"
              value={form.line2}
              onChange={update("line2")}
              full
              autoComplete="address-line2"
            />

            <Field
              label="City"
              value={form.city}
              onChange={update("city")}
              error={errors.city}
              autoComplete="address-level2"
            />
            <Field
              label="State"
              value={form.state}
              onChange={update("state")}
              error={errors.state}
              autoComplete="address-level1"
            />

            <Field
              label="Postal Code"
              value={form.postalCode}
              onChange={update("postalCode")}
              error={errors.postalCode}
              autoComplete="postal-code"
            />
            <label className="field">
              <span className="field__label">Country</span>
              <select value={form.country} onChange={update("country")}>
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>India</option>
                <option>Australia</option>
              </select>
            </label>
          </div>

          <button type="submit" className="address-form__submit">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, full, ...inputProps }) {
  return (
    <label className={`field ${full ? "field--full" : ""}`}>
      <span className="field__label">{label}</span>
      <input {...inputProps} />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

/* ============================================================
   Step 3 — Placeholder confirmation (wire up your payment step here)
   ============================================================ */

function OrderConfirmation({ shippingAddress, onBackToBag }) {
  const { cartTotal, setCart } = useContext(Context);
  const tax = cartTotal * TAX_RATE;
  const total = cartTotal + tax;

  return (
    <div className="confirmation">
      <h1 className="confirmation__title">Almost there</h1>
      <p className="confirmation__text">
        Your address is saved. This is where you'd hand off to your payment
        provider (Stripe, Razorpay, etc.) — plug that in here.
      </p>

      {shippingAddress && (
        <div className="confirmation__address">
          <strong>{shippingAddress.fullName}</strong>
          <span>{shippingAddress.line1}</span>
          {shippingAddress.line2 && <span>{shippingAddress.line2}</span>}
          <span>
            {shippingAddress.city}, {shippingAddress.state}{" "}
            {shippingAddress.postalCode}
          </span>
          <span>{shippingAddress.country}</span>
        </div>
      )}

      <p className="confirmation__total">Order total: {formatUSD(total)}</p>

      <button
        type="button"
        className="confirmation__done"
        onClick={() => {
          setCart({});
          onBackToBag();
        }}
      >
        Place Order
      </button>
    </div>
  );
}

/* ---------------------------- Icons ---------------------------- */

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 3.5h9M5.5 3.5V2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M5.8 6.3v4M8.2 6.3v4M3.3 3.5l.5 8a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.5-8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.5 2.5L3 7l5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}