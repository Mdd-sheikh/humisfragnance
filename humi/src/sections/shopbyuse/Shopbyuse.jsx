import { useRef } from "react";
import "./ShopByUse.css";
import { Assets } from "../../assets/Assests";

const ITEMS = [
    { label: "PARTY WEAR", size: "large", image: Assets.party_wear, alt: "White Oud perfume oil styled with agarwood chips" },
    { label: "OFFICE WEAR", size: "small", image: Assets.office_wear, alt: "Black Musk attar box and bottle" },
    { label: "SUMMER", size: "small", image: Assets.summer_wear, alt: "Mitti attar bottle set in sand" },
    { label: "DAILY WEAR", size: "small", image: Assets.daily_wear, alt: "Rose attar bottle with pink peonies" },
    { label: "WINTER", size: "small", image: Assets.winter_wear, alt: "Dahn Al Oud bottle with driftwood" },
];

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" className="shop-card__arrow-icon" aria-hidden="true">
            <line x1="6" y1="18" x2="18" y2="6" />
            <polyline points="9 6 18 6 18 15" />
        </svg>
    );
}

function ShopCard({ item }) {
    const cardRef = useRef(null);
    const arrowRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        const arrow = arrowRef.current;
        if (!card || !arrow) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        arrow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    return (
        <div
            ref={cardRef}
            className={`shop-card shop-card--${item.size}`}
            onMouseMove={handleMouseMove}
        >
            <span className="shop-card__label">{item.label}</span>

            <div className="shop-card__media">
                {item.image ? (
                    <img className="shop-card__img" src={item.image} alt={item.alt} loading="lazy" />
                ) : (
                    <div className="shop-card__img shop-card__img--placeholder" role="img" aria-label={item.alt}>
                        <span>Image</span>
                    </div>
                )}
            </div>

            <div className="shop-card__shutter" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className="shop-card__blade" style={{ "--i": i }} />
                ))}
            </div>

            <div className="shop-card__tint" aria-hidden="true" />

            <div ref={arrowRef} className="shop-card__arrow" aria-hidden="true">
                <ArrowIcon />
            </div>
        </div>
    );
}

export default function ShopByUse() {
    return (
        <div className="shop-page">
            <section className="shop">
                <h2 className="shop__title">Shop By Use</h2>

                <div className="shop__grid">
                    {ITEMS.map((item) => (
                        <ShopCard item={item} key={item.label} />
                    ))}
                </div>
            </section>
        </div>
    );
}