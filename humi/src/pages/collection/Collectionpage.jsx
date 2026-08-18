import React from "react";
import "./Collectionpage.css";
import { Assets, PRODUCTS } from "../../assets/Assests";
import { Link } from "react-router-dom";

/**
 * Collection Page
 *
 * Sections (top to bottom, matching the reference screenshots):
 * 1. Hero        — full-bleed banner, eyebrow + title + CTA over image
 * 2. Most-Loved  — 3-up product grid, centered heading with rule
 * 3. Core Series — "The Anthology" header, then 3 alternating image/copy rows
 * 4. Marquee     — closing scrolling strip, brand line repeated
 *
 * All images are left as placeholders (`image: null`) — drop real imports
 * into MOST_LOVED and CORE_SERIES below and they'll render automatically,
 * same pattern as GIFT_SETS in GiftPage.jsx.
 */

const MOST_LOVED = [
    {
        id: "carbon-noir",
        name: "Carbon Noir",
        description: "Volcanic intensity and charcoal depth.",
        price: 185.0,
        image: Assets.product_one, // e.g. import carbonNoirImg from "../../assets/images/carbon-noir.jpg"
    },
    {
        id: "saffron-gold",
        name: "Saffron Gold",
        description: "Exotic saffron meets golden liquid warmth.",
        price: 210.0,
        image: Assets.product_four,
    },
    {
        id: "velvet-rose",
        name: "Velvet Rose",
        description: "A sophisticated take on classic beauty.",
        price: 195.0,
        image: Assets.product_nine,
    },
];

const CORE_SERIES = [
    {
        id: "noir",
        index: "01",
        label: "Darkness",
        title: "Noir",
        description:
            "A journey into the subterranean. Intense, architectural, and unapologetically bold. Featuring notes of crushed volcanic rock, oud, and shadow.",
        image: Assets.section_image_one,
        reverse: false,
    },
    {
        id: "luminous",
        index: "02",
        label: "Radiance",
        title: "Luminous",
        description:
            "Capturing the essence of high noon and crystal reflections. Sparkling citrus, nectar, and warm skin musks that glow throughout the day.",
        image: Assets.section_image_two,
        reverse: true,
    },
    {
        id: "element",
        index: "03",
        label: "Raw",
        title: "Element",
        description:
            "The intersection of metal and slate. Industrial chic fragrances for the urban architect. Cold copper, wet concrete, and vibrant rain.",
        image: Assets.section_image_three,
        reverse: false,
    },
];

const MARQUEE_ITEMS = [
    "Noir",
    "Luminous",
    "Element",
    "Handcrafted in Small Batches",
    "Kannauj, India",
];

export default function CollectionPage() {
    return (
        <div className="coll-page">
            <CollectionHero />
            <MostLoved />
            <CoreSeries />
            <ClosingMarquee />
        </div>
    );
}

/* ---------------------------------------------------------- */
/* Hero                                                          */
/* ---------------------------------------------------------- */

function CollectionHero() {
    return (
        <section className="coll-hero">
            <div className="coll-hero__media" aria-hidden="true">
                <img src={Assets.blog_image_one} alt="" className="coll-hero__img" />
                <div className="coll-hero__overlay" />
            </div>

            <div className="coll-hero__content">
                <span className="coll-eyebrow coll-eyebrow--light">New Collection</span>
                <h1 className="coll-hero__title">The New Dawn</h1>
                <button type="button" className="coll-btn coll-btn--gold">
                    Shop Now
                </button>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* Most-Loved                                                    */
/* ---------------------------------------------------------- */

function MostLoved() {
    return (
        <section className="coll-section">
            <div className="coll-section__head coll-section__head--center">
                <h2 className="coll-heading-script">Most-Loved</h2>
                <span className="coll-rule" aria-hidden="true" />
            </div>

            <div className="loved-grid">
                {MOST_LOVED.map((item) => (
                    <a key={item.id} className="loved-card" href={`#${item.id}`}>
                        <div className="loved-card__media">
                            {item.image ? (
                                <img src={item.image} alt={item.name} loading="lazy" />
                            ) : (
                                <div className="loved-card__placeholder" aria-hidden="true" />
                            )}
                        </div>
                        <h3 className="loved-card__name">{item.name}</h3>
                        <p className="loved-card__desc">{item.description}</p>
                        <span className="loved-card__price">₹{item.price.toFixed(2)}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* Core Series ("The Anthology")                                 */
/* ---------------------------------------------------------- */

function CoreSeries() {
    return (
        <section className="coll-section coll-section--anthology">
            <div className="anthology-head">
                <div className="anthology-head__left">
                    <span className="coll-eyebrow coll-eyebrow--plain">The Anthology</span>
                    <h2 className="coll-section__title">Core Series</h2>
                </div>
                <span className="anthology-head__rule" aria-hidden="true" />
                <p className="anthology-head__desc">
                    Our permanent archives. Three distinct olfactory universes built
                    for the modern soul.
                </p>
            </div>

            <div className="series-list">
                {CORE_SERIES.map((series) => (
                    <SeriesRow key={series.id} series={series} />
                ))}
            </div>
        </section>
    );
}

function SeriesRow({ series }) {
    return (
        <div className={`series-row ${series.reverse ? "is-reversed" : ""}`}>
            <div className="series-row__media">
                {series.image ? (
                    <img src={series.image} alt={series.title} loading="lazy" />
                ) : (
                    <div className="series-row__placeholder" aria-hidden="true" />
                )}
            </div>

            <div className="series-row__copy">
                <span className="series-row__tag">
                    {series.index} / {series.label.toUpperCase()}
                </span>
                <h3 className="series-row__title">{series.title}</h3>
                <p className="series-row__description">{series.description}</p>
                <a className="coll-explore" href={`#${series.id}`}>
                    Explore Series
                    <span aria-hidden="true">→</span>
                </a>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------- */
/* Closing marquee                                                */
/* ---------------------------------------------------------- */

function ClosingMarquee() {
    const track = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

    return (
        <section className="marquee" aria-label="Brand highlights">
            <div className="marquee__track">
                {track.map((label, i) => (
                    <span className="marquee__item" key={`${label}-${i}`}>
                        {label}
                        <span className="marquee__dot" aria-hidden="true">
                            ✦
                        </span>
                    </span>
                ))}
            </div>
        </section>
    );
}