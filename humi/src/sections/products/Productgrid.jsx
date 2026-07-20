import { useState, useMemo, useContext } from "react";
import "./Productgrid.css";
import { PRODUCTS } from "../../assets/Assests";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";


/* ---------------- Data ---------------- */



/* ---------------- Small building blocks ---------------- */

function Stars({ rating }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="pg-stars" aria-label={`${rating} out of 5 stars`}>
      <span className="pg-stars__track">★★★★★</span>
      <span className="pg-stars__fill" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pg-icon"><line x1="5" y1="12" x2="19" y2="12" /></svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pg-icon"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pg-icon pg-icon--lg">
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
      <path d="M2.5 3h2.4l2.3 12.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.6L21 7H6" fill="none" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pg-icon"><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></svg>
  );
}

function formatINR(n) {
  return `₹ ${n.toLocaleString("en-IN")}.00`;
}

/* ---------------- Product card ---------------- */

function ProductCard({ product, onAdd }) {


  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(20, q + 1));

  const handleAdd = () => {
    onAdd(product, qty);
    setJustAdded(true);
    setQty(1);
    window.clearTimeout(handleAdd._t);
    handleAdd._t = window.setTimeout(() => setJustAdded(false), 1300);
  };

  return (
    <article className="pg-card">
      <div className="pg-card__media">
        {product.compareAt && <span className="pg-card__badge">Sale</span>}
        {product.image ? (
          <img className="pg-card__img" src={product.image} alt={product.alt || product.name} loading="lazy" />
        ) : (
          <div className="pg-card__img pg-card__img--placeholder" role="img" aria-label={product.name}>
            <span>Image</span>
          </div>
        )}
      </div>

      <div className="pg-card__body">
        <h3 className="pg-card__title">{product.name}</h3>

        <div className="pg-card__rating">
          <Stars rating={product.rating} />
          <span className="pg-card__reviews">({product.reviews})</span>
        </div>

        <div className="pg-card__price">
          <span className="pg-card__price-label">From</span>
          <span className="pg-card__price-now">{formatINR(product.price)}</span>
          {product.compareAt && (
            <span className="pg-card__price-was">{formatINR(product.compareAt)}</span>
          )}
        </div>

        <div className="pg-card__controls">
          <div className="pg-stepper">
            <button type="button" className="pg-stepper__btn" onClick={dec} aria-label="Decrease quantity">
              <MinusIcon />
            </button>
            <span className="pg-stepper__value">{qty}</span>
            <button type="button" className="pg-stepper__btn" onClick={inc} aria-label="Increase quantity">
              <PlusIcon />
            </button>
          </div>

          <button
            type="button"
            className={`pg-add-btn${justAdded ? " pg-add-btn--added" : ""}`}
            onClick={handleAdd}
          >
            {justAdded ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Cart panel ---------------- */

function CartPanel({ open, items, onClose, onUpdateQty, onRemove, total }) {
  return (
    <>
      <div
        className={`pg-cart-backdrop${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`pg-cart${open ? " is-open" : ""}`} aria-label="Shopping cart">
        <div className="pg-cart__header">
          <h3>Your Cart</h3>
          <button type="button" className="pg-cart__close" onClick={onClose} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <div className="pg-cart__items">
          {items.length === 0 && <p className="pg-cart__empty">Your cart is empty.</p>}

          {items.map((item) => (
            <div className="pg-cart__row" key={item.id}>
              <div className="pg-cart__thumb">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="pg-cart__thumb--placeholder">Img</div>
                )}
              </div>

              <div className="pg-cart__info">
                <p className="pg-cart__name">{item.name}</p>
                <p className="pg-cart__unit">{formatINR(item.price)}</p>

                <div className="pg-stepper pg-stepper--sm">
                  <button
                    type="button"
                    className="pg-stepper__btn"
                    onClick={() => onUpdateQty(item.id, item.qty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon />
                  </button>
                  <span className="pg-stepper__value">{item.qty}</span>
                  <button
                    type="button"
                    className="pg-stepper__btn"
                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="pg-cart__remove"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="pg-cart__footer">
            <div className="pg-cart__total">
              <span>Subtotal</span>
              <strong>{formatINR(total)}</strong>
            </div>
            <button type="button" className="pg-add-btn pg-add-btn--full">
              Go to Cart Page
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------- Main export ---------------- */

export default function Productgrid() {
  const { cart, setCart, updateQty, addToCart, removeFromCart, cartItems, cartCount, cartTotal } = useContext(Context) // { [id]: qty }
  const [isCartOpen, setIsCartOpen] = useState(false);


  return (
    <div className="pg-page">
      <section className="pg">
        <div className="pg__grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} />
          ))}
        </div>

        <div className="pg__view-all-wrap">
        <Link to="/shop"> <button type="button" className="pg__view-all">View all</button></Link> 
        </div>
      </section>

      <button
        type="button"
        className="pg-cart-fab"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open cart"
      >
        <CartIcon />
        {cartCount > 0 && <span className="pg-cart-fab__badge">{cartCount}</span>}
      </button>

      <CartPanel
        open={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        total={cartTotal}
      />
    </div>
  );
}