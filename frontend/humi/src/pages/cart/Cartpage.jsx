import React, { useState, useEffect } from "react";
import "./Cartpage.css";
import { useContext } from "react";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TAX_RATE = 0.08; // 8% — adjust to your actual tax rule

function formatUSD(amount) {
  return `₹${amount.toFixed(2)}`;
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
// adjust path

export default function CartPage() {
  const [step, setStep] = useState("cart");
  const [checkoutData, setCheckoutData] = useState(null);

  // NEW: promo/discount lives here so it survives cart -> address -> payment
  const [promo, setPromo] = useState({ code: "", discount: 0 });

  return (
    <div className="cart-page">
      {step === "cart" && (
        <ShoppingBag
          onCheckout={() => setStep("address")}
          promo={promo}
          setPromo={setPromo}
        />
      )}
      {step === "address" && (
        <AddressStep
          onBack={() => setStep("cart")}
          onContinue={(data) => {
            // NEW: carry the promo forward into checkoutData
            setCheckoutData({ ...data, promo });
            setStep("payment");
          }}
        />
      )}
      {step === "payment" && (
        <PaymentPage
          checkoutData={checkoutData}
          onBack={() => setStep("address")}
          onPlaced={() => setStep("cart")} // or navigate to an order confirmation page
        />
      )}


    </div>
  );
}

/* ============================================================
   Step 1 — Shopping Bag
   ============================================================ */

function ShoppingBag({ onCheckout, promo, setPromo }) {
  const { cartItems, cartCount, cartTotal, updateQty, removeFromCart } =
    useContext(Context);

  // NEW: promoInput is just the text box; the actual applied code/discount
  // now lives in the `promo` prop lifted up to CartPage.
  const [promoInput, setPromoInput] = useState(promo.code || "");
  const [promoStatus, setPromoStatus] = useState(promo.code ? "applied" : null); // null | "applied" | "invalid"

  const subtotal = cartTotal;
  const discount = promo.discount; // NEW: read from lifted state
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal - discount + tax);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    // Mock validation — replace with a real promo-code API call.
    if (code === "SAVE10") {
      setPromo({ code, discount: subtotal * 0.1 }); // NEW: write to lifted state
      setPromoStatus("applied");
    } else {
      setPromo({ code: "", discount: 0 }); // NEW: clear lifted state on invalid code
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
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
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

function AddressStep({ onBack, onContinue }) {
  const { cartCount, cartItems, API_URL } = useContext(Context);

  // ---- saved addresses (same fetch logic as Settingspage) ----
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const getAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/personal/address/getaddress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.success) {
        console.error(response.data.message);
        return [];
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching addresses:", error.response?.data || error.message);
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoadingAddresses(true);
      const data = await getAddress();
      setAddresses(data || []);
      // auto-select the default one, if any
      const def = (data || []).find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
      setLoadingAddresses(false);
    };
    load();
  }, []);

  // ---- "add new address" form (collapsed by default) ----
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.addressLine1.trim()) next.addressLine1 = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/personal/address/addtoaddress`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Address added");
        setForm({
          fullName: "",
          phone: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "United States",
        });
        setShowForm(false);

        // refresh list and auto-select the newly created address
        const refreshed = await getAddress();
        setAddresses(refreshed || []);
        const newest = refreshed?.[refreshed.length - 1];
        if (newest) setSelectedAddressId(newest._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  // ---- continue to payment ----
  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    const productIds = cartItems.map((item) => item.id);
    const selected = addresses.find((a) => a._id === selectedAddressId);

    onContinue({
      addressId: selectedAddressId,
      address: selected,
      productIds,
    });
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

        {/* ---- saved address list ---- */}
        {loadingAddresses ? (
          <p>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="bag-empty__hint">
            No saved addresses yet. Add one below.
          </p>
        ) : (
          <ul className="address-list">
            {addresses.map((a) => (
              <li
                key={a._id}
                className={`address-item selectable-address${selectedAddressId === a._id ? " selected" : ""
                  }`}
                onClick={() => setSelectedAddressId(a._id)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === a._id}
                    onChange={() => setSelectedAddressId(a._id)}
                  />
                  <span className="address-label">
                    {a.label || a.fullName}
                    {a.isDefault && <span className="pill">Default</span>}
                  </span>
                  <span className="address-line">
                    {a.addressLine1}, {a.city}, {a.state} {a.postalCode}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add new address"}
        </button>

        {/* ---- add-new-address form ---- */}
        {showForm && (
          <form className="address-form" onSubmit={handleAddAddress} noValidate>
            <div className="address-form__grid">
              <Field label="Full Name" value={form.fullName} onChange={update("fullName")} error={errors.fullName} autoComplete="name" />
              <Field label="Phone Number" type="tel" value={form.phone} onChange={update("phone")} error={errors.phone} autoComplete="tel" />
              <Field label="Address Line 1" value={form.addressLine1} onChange={update("addressLine1")} error={errors.addressLine1} full autoComplete="address-line1" />
              <Field label="City" value={form.city} onChange={update("city")} error={errors.city} autoComplete="address-level2" />
              <Field label="State" value={form.state} onChange={update("state")} error={errors.state} autoComplete="address-level1" />
              <Field label="Postal Code" value={form.postalCode} onChange={update("postalCode")} error={errors.postalCode} autoComplete="postal-code" />
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
              Save address
            </button>
          </form>
        )}

        <button
          type="button"
          className="address-form__submit"
          style={{ marginTop: "16px" }}
          onClick={handleContinue}
          disabled={!selectedAddressId}
        >
          Continue to Payment
        </button>
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

/*==========================================payment page ===========================*/

/* ============================================================
   Step 3 — Payment
   ============================================================ */

function PaymentPage({ checkoutData, onBack }) {
  const { cartItems, cartTotal, API_URL, setCart } = useContext(Context);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "cod" | "upi" | "card"

  // NEW: pull the promo carried over from ShoppingBag via checkoutData
  const discount = checkoutData?.promo?.discount || 0;
  const promoCode = checkoutData?.promo?.code || undefined;
  const tax = Math.max(0, cartTotal - discount) * TAX_RATE;
  const finalTotal = Math.max(0, cartTotal - discount + tax);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const buildItems = () =>
    cartItems.map((item) => ({
      productId: item.id,
      variantId: item.variantId || undefined,
      size: item.size || undefined,
      quantity: item.qty,
    }));

  // ---------------- Cash on Delivery ----------------
  const handleCodOrder = async () => {
    setPlacing(true);
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${API_URL}/order/placeorder`,
        {
          items: buildItems(),
          addressId: checkoutData.addressId,
          paymentMode: "COD", // fixed — was missing paymentMode, so backend always defaulted to Prepaid
          promoCode, // NEW — backend re-validates the code and recalculates the total itself
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        toast.error(data.message || "Could not place order");
        navigate("/cart");
        return;
      }

      toast.success("Order placed! Pay on delivery.");
      setCart({});
      navigate(`/order-confirmation/ordered`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      navigate("/cart");
    } finally {
      setPlacing(false);
    }
  };

  // ---------------- UPI / Card via Razorpay ----------------
  const handleOnlinePayment = async () => {
    setPlacing(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      if (!checkoutData?.addressId) {
        toast.error("Shipping address is missing");
        navigate("/cart");
        return;
      }

      // 1. Create order on backend
      const { data } = await axios.post(
        `${API_URL}/order/placeorder`,
        {
          items: buildItems(),
          addressId: checkoutData.addressId,
          paymentMode: "Prepaid",
          promoCode, // NEW — backend re-validates the code and computes order.amount from it
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2. Check backend response
      if (!data.success) {
        toast.error(data.message || "Could not start payment");
        return;
      }

      const { order, orderId, key } = data;

      // Safety checks
      if (!order?.id) {
        console.error("Razorpay order missing:", data);
        toast.error("Razorpay order was not created");
        return;
      }

      if (!key) {
        console.error("Razorpay key missing:", data);
        toast.error("Razorpay configuration error");
        return;
      }

      // 3. Check Razorpay SDK
      if (!window.Razorpay) {
        toast.error("Razorpay is not loaded. Please refresh and try again.");
        return;
      }

      console.log("Razorpay Order:", order);
      console.log("Backend Order ID:", orderId);
      console.log("Razorpay Key:", key);

      // 4. Razorpay Checkout options
      const options = {
        key: key,

        amount: order.amount,

        currency: order.currency || "INR",

        name: "Humi's Attars",

        description: "Order Payment",

        order_id: order.id,

        // IMPORTANT:
        // Do NOT restrict payment methods here.
        // Razorpay will handle UPI / QR / Card / other available methods.

        handler: async (response) => {
          console.log("Razorpay success response:", response);

          try {
            // 5. Verify payment on your backend
            const verifyRes = await axios.post(
              `${API_URL}/order/verifypayment`,
              {
                orderId: orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Payment verification response:", verifyRes.data);

            if (verifyRes.data.success) {
              toast.success("Payment successful!");

              // Clear cart
              setCart({});

              // Go to order confirmation
              navigate(`/order-confirmation/ordered`);
            } else {
              toast.error(
                verifyRes.data.message || "Payment verification failed"
              );
            }
          } catch (err) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              err.response?.data || err
            );

            toast.error(
              err.response?.data?.message ||
              "Payment verification failed"
            );
          }
        },

        prefill: {
          name: checkoutData?.address?.fullName || "",
          contact: checkoutData?.address?.phone || "",
        },

        theme: {
          color: "#c9a227",
        },

        modal: {
          ondismiss: () => {
            console.log("Razorpay checkout closed");

            setPlacing(false);

            toast.info("Payment cancelled");
          },
        },
      };

      // 6. Create Razorpay instance
      const rzp = new window.Razorpay(options);

      // 7. VERY IMPORTANT:
      // Show the real Razorpay error instead of generic "Payment failed"
      rzp.on("payment.failed", (response) => {
        console.error(
          "================ RAZORPAY PAYMENT FAILED ================"
        );

        console.error("Full error:", response.error);

        console.error("Code:", response.error?.code);

        console.error(
          "Description:",
          response.error?.description
        );

        console.error(
          "Source:",
          response.error?.source
        );

        console.error(
          "Step:",
          response.error?.step
        );

        console.error(
          "Reason:",
          response.error?.reason
        );

        console.error(
          "Metadata:",
          response.error?.metadata
        );

        console.error(
          "=========================================================="
        );

        toast.error(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      // 8. OPEN RAZORPAY
      rzp.open();

    } catch (err) {
      console.error(
        "CREATE RAZORPAY ORDER ERROR:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        "Unable to start payment. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!checkoutData?.addressId) {
      toast.error("Missing shipping address");
      navigate("/cart");
      return;
    }

    if (paymentMethod === "cod") {
      handleCodOrder();
    } else {
      handleOnlinePayment();
    }
  };

  return (
    <div className="bag-layout">
      <div className="bag-main">
        <button type="button" className="step-back" onClick={onBack}>
          <BackIcon /> Back to address
        </button>

        <header className="bag-header">
          <h1 className="bag-header__title">Payment</h1>
          <p className="bag-header__subtitle">
            Review your order and complete payment
          </p>
        </header>

        {checkoutData?.address && (
          <div className="confirmation__address">
            <strong>{checkoutData.address.fullName}</strong>
            <span>{checkoutData.address.addressLine1}</span>
            <span>
              {checkoutData.address.city}, {checkoutData.address.state}{" "}
              {checkoutData.address.postalCode}
            </span>
            <span>{checkoutData.address.country}</span>
          </div>
        )}

        {/* ---------------- Payment method selector ---------------- */}
        <div className="pm-block">
          <span className="pd-label">Choose Payment Method</span>
          <div className="pm-options">
            <button
              type="button"
              className={`pm-option${paymentMethod === "upi" ? " active" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              <span className="pm-option__title">UPI</span>
              <span className="pm-option__sub">Pay via any UPI app</span>
            </button>

            <button
              type="button"
              className={`pm-option${paymentMethod === "card" ? " active" : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              <span className="pm-option__title">Card</span>
              <span className="pm-option__sub">Credit / Debit card</span>
            </button>

            <button
              type="button"
              className={`pm-option${paymentMethod === "cod" ? " active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="pm-option__title">Cash on Delivery</span>
              <span className="pm-option__sub">Pay when it arrives</span>
            </button>
          </div>
        </div>

        {/* NEW: order breakdown so the discount is visible on the payment step too */}
        <div className="order-summary" style={{ marginTop: "16px" }}>
          <div className="order-summary__row">
            <span>Subtotal</span>
            <span>{formatUSD(cartTotal)}</span>
          </div>

          {discount > 0 && (
            <div className="order-summary__row order-summary__row--discount">
              <span>Discount{promoCode ? ` (${promoCode})` : ""}</span>
              <span>−{formatUSD(discount)}</span>
            </div>
          )}

          <div className="order-summary__row">
            <span>Tax</span>
            <span>{formatUSD(tax)}</span>
          </div>
        </div>

        <p className="confirmation__total">Order total: {formatUSD(finalTotal)}</p>

        <button
          type="button"
          className="address-form__submit"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing
            ? "Processing..."
            : paymentMethod === "cod"
              ? "Place Order (COD)"
              : "Place Order & Pay"}
        </button>
      </div>
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