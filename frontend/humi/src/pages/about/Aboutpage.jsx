import React from "react";
import "./AboutPage.css";
import { Assets } from "../../assets/Assests";

/**
 * About Page
 *
 * Section order (top to bottom):
 * 1. Hero            — cinematic dark banner, title + tagline
 * 2. Our Heritage     — origin story, copy left / image right
 * 3. The Atelier      — 3 feature cards (what we do)
 * 4. Meet the Alchemists — founders, image + quote badge left / copy right
 * 5. By the Numbers   — stats band (added — proof points build trust before values)
 * 6. Our Commitments  — Sustainability / Transparency / Innovation
 * 7. Closing CTA      — "Ready to find your signature?"
 *
 * Images are left as placeholders (`image: null`) — same pattern as
 * GiftPage / CollectionPage. Drop real imports in and they render.
 */

const ATELIER_FEATURES = [
    {
        id: "ingredients",
        title: "Rare Ingredients",
        description:
            "We source the world's most precious botanicals, from hand-picked Grasse roses to sustainably harvested Mysore sandalwood.",
        icon: "leaf",
    },
    {
        id: "blending",
        title: "The Art of Blending",
        description:
            "Months of meticulous experimentation go into every scent, balancing top, heart, and base notes to achieve absolute harmony.",
        icon: "flask",
    },
    {
        id: "hand-poured",
        title: "Hand-Poured Excellence",
        description:
            "Every bottle is hand-filled and inspected in our boutique laboratory to ensure the highest standards of luxury.",
        icon: "droplet",
    },
];

const STATS = [
    { id: "years", value: "1+", label: "Years Combined Experience" },
    { id: "ingredients", value: "120+", label: "Botanical Ingredients" },
    { id: "countries", value: "18", label: "Countries Sourced From" },
    { id: "handpoured", value: "100%", label: "Hand-Poured, Always" },
];

const VALUES = [
    {
        id: "sustainability",
        title: "Sustainability",
        description:
            "Refillable bottles and ethically sourced ingredients are at the heart of our environmental commitment.",
        icon: "leaf-outline",
    },
    {
        id: "transparency",
        title: "Transparency",
        description:
            "Full disclosure of our ingredient sourcing and crafting process, because honesty is the foundation of trust.",
        icon: "eye",
    },
    {
        id: "innovation",
        title: "Innovation",
        description:
            "Blending ancient botanical wisdom with cutting-edge extraction techniques to create unique profiles.",
        icon: "bulb",
    },
];

const FOUNDERS = [
    { name: "Clara Humi", role: "Lead Perfumer" },
    { name: "Julian Vane", role: "Creative Director" },
];

export default function AboutPage() {
    return (
        <div className="about-page">
            <AboutHero />
            <Heritage />
            <Atelier />
            <Alchemists />
            <StatsBand />
            <Commitments />
            <ClosingCta />
        </div>
    );
}

/* ---------------------------------------------------------- */
/* 1. Hero                                                       */
/* ---------------------------------------------------------- */

function AboutHero() {
    return (
        <section className="about-hero">
            <div className="about-hero__media" aria-hidden="true">
                <img src={Assets.humis_shop_banner} alt="" />
                <div className="about-hero__overlay" />
            </div>

            <div className="about-hero__content">
                <h1 className="about-hero__title">The Soul of Fragrance</h1>
                <p className="about-hero__tagline">Refining the Art of Scent</p>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 2. Our Heritage                                                */
/* ---------------------------------------------------------- */

function Heritage() {
    return (
        <section className="about-section">
            <div className="heritage">
                <div className="heritage__copy">
                    <span className="about-eyebrow">Our Heritage</span>
                    <h2 className="about-heading">Crafting Emotions into Liquid Form</h2>
                    <p>
                        Our story began in a small atelier tucked away in the
                        countryside, born from a singular obsession: to capture the
                        ephemeral beauty of memory. What started as a private
                        exploration of botanical alchemy has evolved into a
                        world-renowned house of artisanal perfumery.
                    </p>
                    <p>
                        We believe that a fragrance is more than an accessory — it is an
                        invisible bridge to our past and a lingering promise for the
                        future. Every bottle is a chapter of a story waiting to be told
                        on your skin.
                    </p>
                </div>

                <div className="heritage__media">
                    <img src={Assets.product_six} alt="" />
                    <div className="heritage__placeholder" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 3. The Atelier                                                 */
/* ---------------------------------------------------------- */

function Atelier() {
    return (
        <section className="about-section about-section--muted">
            <div className="about-section__head about-section__head--center">
                <h2 className="about-heading">The Atelier</h2>
                <p className="about-section__subtitle">
                    Where tradition meets modern innovation in the pursuit of
                    perfection.
                </p>
            </div>

            <div className="feature-grid">
                {ATELIER_FEATURES.map((feature) => (
                    <div key={feature.id} className="feature-card">
                        <span className="feature-card__icon">
                            <Icon name={feature.icon} />
                        </span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 4. Meet the Alchemists                                         */
/* ---------------------------------------------------------- */

function Alchemists() {
    return (
        <section className="about-section">
            <div className="alchemists">
                <div className="alchemists__media">
                    <span className="alchemists__eyebrow-top">
                        About — Our Story &amp; Craft
                    </span>
                    <video
                        className="alchemists__video"
                        src={Assets.humis_video}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    
                    <blockquote className="alchemists__quote">
                        "Fragrance is the most intense form of memory."
                    </blockquote>
                </div>

                <div className="alchemists__copy">
                    <span className="about-eyebrow">The Visionaries</span>
                    <h2 className="about-heading">Meet the Alchemists</h2>
                    <p>
                        Founded by Clara Humi and Julian Vane, our house was built on
                        the principle that true luxury is found in the details. With
                        over four decades of combined experience in high-end perfumery,
                        they lead our creative team with a vision of quiet elegance and
                        uncompromising quality.
                    </p>
                    <ul className="alchemists__founders">
                        {FOUNDERS.map((founder) => (
                            <li key={founder.name}>
                                <span className="alchemists__dash" aria-hidden="true" />
                                {founder.name}, {founder.role}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 5. By the Numbers (added)                                      */
/* ---------------------------------------------------------- */

function StatsBand() {
    return (
        <section className="stats-band">
            <div className="stats-band__inner">
                {STATS.map((stat) => (
                    <div key={stat.id} className="stats-band__item">
                        <span className="stats-band__value">{stat.value}</span>
                        <span className="stats-band__label">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 6. Our Commitments                                             */
/* ---------------------------------------------------------- */

function Commitments() {
    return (
        <section className="about-section">
            <div className="values-grid">
                {VALUES.map((value) => (
                    <div key={value.id} className="value-card">
                        <span className="value-card__icon">
                            <Icon name={value.icon} />
                        </span>
                        <h4>{value.title}</h4>
                        <p>{value.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* 7. Closing CTA                                                 */
/* ---------------------------------------------------------- */

function ClosingCta() {
    return (
        <section className="closing-cta">
            <h2 className="about-heading">Ready to find your signature?</h2>
            <button type="button" className="about-btn about-btn--gold">
                Explore the Collection
            </button>
        </section>
    );
}

/* ---------------------------------------------------------- */
/* Icons                                                          */
/* ---------------------------------------------------------- */

function Icon({ name }) {
    switch (name) {
        case "leaf":
        case "leaf-outline":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                    <path d="M5 19c2-4 5-7 9-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            );
        case "flask":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M10 3h4M10.5 3v6l-5 9.5a1.5 1.5 0 001.3 2.2h10.4a1.5 1.5 0 001.3-2.2L13.5 9V3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M8.5 16h7" stroke="currentColor" strokeWidth="1.4" />
                </svg>
            );
        case "droplet":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 11-13 0C5.5 10.2 12 3 12 3z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        case "eye":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.4" />
                </svg>
            );
        case "bulb":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M9 18h6M10 21h4M7 10.5a5 5 0 118.7 3.4c-.8.9-1.4 1.6-1.4 2.6H9.7c0-1-.6-1.7-1.4-2.6A4.98 4.98 0 017 10.5z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        default:
            return null;
    }
}