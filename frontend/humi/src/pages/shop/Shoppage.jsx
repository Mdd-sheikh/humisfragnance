import React, { useContext, useMemo, useState } from "react";
import "./ShopPage.css";
import { PRODUCTS } from "../../assets/Assests";
import { Context } from "../../context/Context";

/**
 * All Fragrances — shop page
 *
 * Layout: title + toolbar + filters live together in a left column that's
 * sticky on desktop/tablet, so they stay in view while only the product
 * grid on the right scrolls. On mobile the left column stacks normally,
 * and the filter panel becomes a fixed drawer that slides in front of
 * (on top of) the header when the Filter button is tapped.
 */
/*

];*/

const GENDER_OPTIONS = [
    { value: "her", label: "For Her" },
    { value: "him", label: "For Him" },
    { value: "unisex", label: "Unisex" },
];

const NOTE_OPTIONS = [
    { value: "woody", label: "Woody" },
    { value: "floral", label: "Floral" },
    { value: "citrus", label: "Citrus" },
    { value: "oriental", label: "Oriental" },
];

const SORT_OPTIONS = [
    { value: "bestselling", label: "Bestselling" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
];


const PRICE_MIN = 50;
const PRICE_MAX = 500;

export default function ShopPage() {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
    const [sortBy, setSortBy] = useState("bestselling");
    const [sortOpen, setSortOpen] = useState(false);
    const [addedId, setAddedId] = useState(null);

    const toggleValue = (list, setList, value) => {
        setList(
            list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
        );
    };

    const filteredProducts = useMemo(() => {
        let result = PRODUCTS.filter((product) => {
            const matchesGender =
                selectedGenders.length === 0 || selectedGenders.includes(product.gender);
            const matchesNotes =
                selectedNotes.length === 0 ||
                selectedNotes.some((note) => product.olfactory.includes(note));
            const matchesPrice = product.price <= maxPrice;
            return matchesGender && matchesNotes && matchesPrice;
        });

        switch (sortBy) {
            case "price-asc":
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // bestselling = original curated order
                break;
        }
        return result;
    }, [selectedGenders, selectedNotes, maxPrice, sortBy]);

    const handleBuyNow = (product) => {
        setAddedId(product.id);
        window.clearTimeout(handleBuyNow._t);
        handleBuyNow._t = window.setTimeout(() => setAddedId(null), 1400);
    };

    const clearAll = () => {
        setSelectedGenders([]);
        setSelectedNotes([]);
        setMaxPrice(PRICE_MAX);
    };

    const activeSortLabel =
        SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? "Bestselling";

    return (
        <div className="shop-page">
            <div className="shop-layout">
                {/* Left column: title + toolbar + filters — sticky on desktop,
            becomes a front-of-header overlay drawer on mobile */}
                <aside className="shop-aside">
                    <header className="shop-hero">
                        <h2 className="shop-hero__title">All Fragrances</h2>
                        <p className="shop-hero__subtitle">
                            Discover our curated collection of artisanal scents, handcrafted
                            for the discerning soul.
                        </p>
                    </header>

                    <div className="shop-toolbar">
                        <button
                            type="button"
                            className={`shop-toolbar__filter ${filtersOpen ? "is-active" : ""}`}
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="shop-filter-panel"
                        >
                            <SlidersIcon />
                            <span>Filter</span>
                        </button>

                        <div className="shop-toolbar__sort">
                            <span className="shop-toolbar__sort-label">Sort by</span>
                            <div className="shop-sort">
                                <button
                                    type="button"
                                    className="shop-sort__trigger"
                                    onClick={() => setSortOpen((open) => !open)}
                                    aria-expanded={sortOpen}
                                >
                                    <span>{activeSortLabel}</span>
                                    <ChevronIcon open={sortOpen} />
                                </button>
                                {sortOpen && (
                                    <ul className="shop-sort__menu" role="listbox">
                                        {SORT_OPTIONS.map((opt) => (
                                            <li key={opt.value}>
                                                <button
                                                    type="button"
                                                    className={`shop-sort__option ${opt.value === sortBy ? "is-selected" : ""
                                                        }`}
                                                    onClick={() => {
                                                        setSortBy(opt.value);
                                                        setSortOpen(false);
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile-only backdrop; sits behind the panel, in front of the header */}
                    <div
                        className={`shop-filter-backdrop ${filtersOpen ? "is-open" : ""}`}
                        onClick={() => setFiltersOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        id="shop-filter-panel"
                        className={`shop-sidebar ${filtersOpen ? "is-open" : ""}`}
                        aria-label="Product filters"
                    >
                        <div className="shop-sidebar__mobile-head">
                            <span>Filters</span>
                            <button
                                type="button"
                                className="shop-sidebar__close"
                                onClick={() => setFiltersOpen(false)}
                                aria-label="Close filters"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <FilterGroup title="Gender">
                            {GENDER_OPTIONS.map((opt) => (
                                <Checkbox
                                    key={opt.value}
                                    label={opt.label}
                                    checked={selectedGenders.includes(opt.value)}
                                    onChange={() =>
                                        toggleValue(selectedGenders, setSelectedGenders, opt.value)
                                    }
                                />
                            ))}
                        </FilterGroup>

                        <FilterGroup title="Olfactory Notes">
                            {NOTE_OPTIONS.map((opt) => (
                                <Checkbox
                                    key={opt.value}
                                    label={opt.label}
                                    checked={selectedNotes.includes(opt.value)}
                                    onChange={() =>
                                        toggleValue(selectedNotes, setSelectedNotes, opt.value)
                                    }
                                />
                            ))}
                        </FilterGroup>

                        <FilterGroup title="Price Range">
                            <div className="price-range">
                                <input
                                    type="range"
                                    min={PRICE_MIN}
                                    max={PRICE_MAX}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="price-range__input"
                                    style={{
                                        "--range-progress": `${((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
                                            }%`,
                                    }}
                                    aria-label="Maximum price"
                                />
                                <div className="price-range__labels">
                                    <span>${PRICE_MIN}</span>
                                    <span className="price-range__current">${maxPrice}</span>
                                </div>
                            </div>
                        </FilterGroup>

                        <button type="button" className="shop-sidebar__clear" onClick={clearAll}>
                            Clear all filters
                        </button>

                        <button
                            type="button"
                            className="shop-sidebar__apply"
                            onClick={() => setFiltersOpen(false)}
                        >
                            Show {filteredProducts.length} results
                        </button>
                    </div>
                </aside>

                {/* Right column: product grid — this is the part that scrolls */}
                <main className="shop-grid-wrap">
                    {filteredProducts.length === 0 ? (
                        <p className="shop-grid__empty">
                            No fragrances match your filters. Try clearing a few.
                        </p>
                    ) : (
                        <div className="shop-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onBuyNow={handleBuyNow}
                                    justAdded={addedId === product.id}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ProductCard({ product }) {
    const { addToCart, updateQty, removeFromCart } = useContext(Context);
    const [qty, setQty] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => Math.min(20, q + 1));

    const handleAdd = () => {
        addToCart(product, qty);
        setJustAdded(true);
        setQty(1);
        window.clearTimeout(handleAdd._t);
        handleAdd._t = window.setTimeout(() => setJustAdded(false), 1300);
    };

    return (
        <article className="product-card">
            <div className="product-card__media">
                {product.badge && (
                    <span className="product-card__badge">{product.badge}</span>
                )}
                <img src={product.image} alt={product.name} loading="lazy" />
            </div>

            <div className="product-card__body">
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__notes">{product.notes}</p>

                <div className="product-card__footer">
                    <span className="product-card__price">${product.price.toFixed(2)}</span>
                    <button
                        type="button"
                        className={`product-card__buy ${justAdded ? "is-added" : ""}`}
                        onClick={handleAdd}
                    >
                        {justAdded ? "Added ✓" : "Buy Now"}
                    </button>
                </div>
            </div>
        </article>
    );
}

function FilterGroup({ title, children }) {
    return (
        <div className="filter-group">
            <h4 className="filter-group__title">{title}</h4>
            <div className="filter-group__body">{children}</div>
        </div>
    );
}

function Checkbox({ label, checked, onChange }) {
    return (
        <label className="filter-checkbox">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="filter-checkbox__box" aria-hidden="true">
                <CheckIcon />
            </span>
            <span className="filter-checkbox__label">{label}</span>
        </label>
    );
}

function SlidersIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h7M12 4h2M4 12h10M2 12h0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M2 8h4M9 8h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="9.5" cy="4" r="1.6" fill="currentColor" />
            <circle cx="6.5" cy="8" r="1.6" fill="currentColor" />
            <circle cx="7.5" cy="12" r="1.6" fill="currentColor" />
        </svg>
    );
}

function ChevronIcon({ open }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`chevron-icon ${open ? "is-open" : ""}`}
            aria-hidden="true"
        >
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
                d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 5L4 7.5L8.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}