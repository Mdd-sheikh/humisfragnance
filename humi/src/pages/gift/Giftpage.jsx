import React, { useContext, useState } from "react";
import "./GiftPage.css";
import { Assets, GIFT_SETS } from "../../assets/Assests";
import { Context } from "../../context/Context";
import { Link, Links } from "react-router-dom";

/**
 * Gift Page — "The Art of Gifting"
 *
 * Follows the same data + cart pattern as ShopPage.jsx:
 * - Gift sets are pulled from an array (GIFT_SETS) exported from
 *   ../../assets/Assests, exactly like PRODUCTS is in ShopPage.
 * - Adding an item uses the same Context -> addToCart(product, qty) call.
 *
 * Expected GIFT_SETS shape (add this export to Assests.js):
 * {
 *   id: "gift-sultans-treasury",
 *   name: "The Sultan's Treasury",
 *   notes: "Oud, Amber & Rose Musk",
 *   price: 285.0,
 *   image: sultansTreasuryImg,   // imported asset, same as product.image
 *   badge: "NEW ARRIVAL",        // optional
 * }
 */

export default function GiftPage() {
  return (
    <div className="gift-page">
      <GiftHero />
      <CuratedGiftSets />
      <CreateYourOwn />
      <CorporateGifting />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Hero — "The Art of Gifting"                                 */
/* ---------------------------------------------------------- */

function GiftHero() {
  const heroImage = GIFT_SETS?.[0]?.image;

  return (
    <section className="gift-hero">
      <div className="gift-hero__copy">
        <span className="gift-eyebrow">
          <span className="gift-eyebrow-dot" />
          Exquisite Experiences
        </span>
        <h1 className="gift-hero__title">The Art of Gifting</h1>
        <p className="gift-hero__subtitle">
          Elevate every occasion with our meticulously curated fragrance
          collections, designed for those who appreciate the finer notes of
          life.
        </p>
        <button type="button" className="gift-btn gift-btn--gold">
          Discover Collections
        </button>
      </div>

      <div className="gift-hero__media">
        <div className="gift-hero__glow" aria-hidden="true" />
        {heroImage ? (
          <img src={Assets.gift_header} alt="Opened gift box with fragrance bottle" />
        ) : (
          <div className="gift-hero__placeholder" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- */
/* Curated Gift Sets — array-driven grid                       */
/* ---------------------------------------------------------- */

function CuratedGiftSets() {
  return (
    <section className="gift-section">
      <div className="gift-section__head">
        <div>
          <h2 className="gift-section__title">Curated Gift Sets</h2>
          <p className="gift-section__subtitle">
            Hand-selected pairings for ultimate sophistication.
          </p>
        </div>
        <a className="gift-view-all" href="#all-gift-sets">
          View all
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="gift-grid">
        {GIFT_SETS.map((giftSet) => (
          <GiftCard key={giftSet.id} giftSet={giftSet} />
        ))}
      </div>
    </section>
  );
}

function GiftCard({ giftSet }) {
  const { addToCart } = useContext(Context);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = () => {
    addToCart(giftSet, 1);
    setJustAdded(true);
    window.clearTimeout(handleQuickAdd._t);
    handleQuickAdd._t = window.setTimeout(() => setJustAdded(false), 1300);
  };

  return (
    <article className="gift-card">
      <div className="gift-card__media">
        {giftSet.badge && (
          <span className="gift-card__badge">{giftSet.badge}</span>
        )}
        <img src={giftSet.image} alt={giftSet.name} loading="lazy" />
      </div>

      <div className="gift-card__body">
        <h3 className="gift-card__name">{giftSet.name}</h3>
        <p className="gift-card__notes">{giftSet.notes}</p>

        <div className="gift-card__footer">
          <span className="gift-card__price">
            ${giftSet.price.toFixed(2)}
          </span>
          <button
            type="button"
            className={`gift-card__add ${justAdded ? "is-added" : ""}`}
            onClick={handleQuickAdd}
          >
            {justAdded ? "Added ✓" : "Quick Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- */
/* Create Your Own — 3-step builder                             */
/* ---------------------------------------------------------- */

const BUILD_STEPS = [
  {
    id: 1,
    title: "Choose Your Box",
    copy: "Select from our signature matte cream or deep navy velvet options.",
    done: true,
  },
  {
    id: 2,
    title: "Select Your Scents",
    copy: "Choose 3 travel-sized attars or 1 signature full-size bottle.",
    done: false,
  },
  {
    id: 3,
    title: "Add a Message",
    copy: "Handwritten gold-foil calligraphy on luxury cardstock.",
    done: false,
  },
];

function CreateYourOwn() {
  const builderImage = GIFT_SETS?.[1]?.image;

  return (
    <section className="gift-section gift-section--muted">
      <div className="gift-section__head gift-section__head--center">
        <h2 className="gift-section__title">Create Your Own</h2>
        <p className="gift-section__subtitle">
          Personalize a unique olfactory journey for someone special. Follow
          our three-step process to build your custom gift set.
        </p>
      </div>

      <div className="builder">
        <div className="builder__media">
          {builderImage ? (
            <img src={builderImage} alt="Custom gift box, embossed" />
          ) : (
            <div className="builder__placeholder" aria-hidden="true">
              ELIXIR
            </div>
          )}
          <blockquote className="builder__quote">
            <p>"Truly the most beautiful packaging I've ever received."</p>
            <cite>— Elena M.</cite>
          </blockquote>
        </div>

        <div className="builder__steps">
          {BUILD_STEPS.map((step) => (
            <div
              key={step.id}
              className={`builder__step ${step.done ? "is-done" : ""}`}
            >
              <span className="builder__step-number">
                {step.done ? <CheckIcon /> : step.id}
              </span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.copy}</p>
              </div>
            </div>
          ))}

          <button type="button" className="gift-btn gift-btn--dark gift-btn--block">
            Start Customizing
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- */
/* Corporate Gifting                                            */
/* ---------------------------------------------------------- */

function CorporateGifting() {
  return (
    <section className="corporate">
      <div className="corporate__rule" aria-hidden="true" />
      <RibbonIcon />
      <h2 className="corporate__title">Corporate Gifting</h2>
      <p className="corporate__subtitle">
        For businesses that value excellence. Impress your clients and
        partners with bespoke fragrance experiences, custom branding, and
        global concierge delivery.
      </p>
      <div className="corporate__actions">
       <Link to="/contact"><button type="button" className="gift-btn gift-btn--brown">
          Consult with an Expert
        </button></Link> 
        <button type="button" className="gift-btn gift-btn--outline">
          View Brochure
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- */
/* Icons                                                        */
/* ---------------------------------------------------------- */

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1.5 5L4 7.5L8.5 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RibbonIcon() {
  return (
    <svg
      className="corporate__icon"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="17" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M17 6.5l1.4 3 3.3.3-2.5 2.2.8 3.2-3-1.8-3 1.8.8-3.2-2.5-2.2 3.3-.3z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 18.5L10 31l7-3.5 7 3.5-2.5-12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}