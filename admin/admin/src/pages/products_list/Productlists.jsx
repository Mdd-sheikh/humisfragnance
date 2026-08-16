import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    SlidersHorizontal,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";
import "./Productlists.css";

const FILTERS = ["All Items", "Attar", "EDP", "Sets"];
const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 5;

/**
 * Expects a backend endpoint that returns JSON shaped like:
 * {
 *   items: [
 *     {
 *       id: "HM-092-A",
 *       name: "Oud Al-Fayed",
 *       category: "Attar",
 *       image: "https://.../oud.jpg",
 *       stock: 12,
 *       price: 240.0
 *     },
 *     ...
 *   ],
 *   total: 48
 * }
 *
 * Adjust API_URL and the field names in mapResponse() to match your API.
 */
const API_URL = "/api/products";

const mapResponse = (data) => ({
    items: data.items ?? [],
    total: data.total ?? 0,
});

const Productlists = () => {
    const [products, setProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Items");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            if (searchTerm.trim()) params.set("search", searchTerm.trim());
            if (activeFilter !== "All Items") params.set("category", activeFilter);

            const res = await fetch(`${API_URL}?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load products");

            const data = await res.json();
            const { items, total } = mapResponse(data);
            setProducts(items);
            setTotalItems(total);
        } catch (err) {
            setError(err.message || "Something went wrong");
            setProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, activeFilter, currentPage]);

    // Debounce search so we don't fire a request on every keystroke
    useEffect(() => {
        const handle = setTimeout(() => {
            fetchProducts();
        }, 350);
        return () => clearTimeout(handle);
    }, [fetchProducts]);

    // Reset to page 1 whenever the search term or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    const badgeClass = (category) => {
        const key = category?.toLowerCase();
        if (key === "edp") return "badge badge--muted";
        return "badge badge--outline";
    };

    return (
        <div className="product-list">
            {/* Page header */}
            <div className="product-list__header">
                <div>
                    <h1 className="product-list__title">Inventory Management</h1>
                    <p className="product-list__subtitle">
                        Oversee your olfactory collections and stock levels.
                    </p>
                </div>
                <Link to="/add-product"> <button className="btn-primary">
                    <Plus size={16} strokeWidth={2.5} />
                    New Product
                </button></Link>
            </div>

            {/* Search + filters */}
            <div className="product-list__toolbar">
                <div className="search-box">
                    <Search size={16} className="search-box__icon" />
                    <input
                        type="text"
                        placeholder="Search by name or note..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-pills">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            className={`filter-pill${activeFilter === filter ? " filter-pill--active" : ""}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <button className="advanced-btn">
                    <SlidersHorizontal size={15} />
                    Advanced
                </button>
            </div>

            {/* Table */}
            <div className="product-table">
                <div className="product-table__head">
                    <span>Product</span>
                    <span>Category</span>
                    <span>Stock</span>
                    <span>Price</span>
                    <span className="product-table__actions-label">Actions</span>
                </div>

                <div className="product-table__body">
                    {loading && (
                        <div className="product-table__state">Loading products…</div>
                    )}

                    {!loading && error && (
                        <div className="product-table__state product-table__state--error">
                            {error}
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="product-table__state">
                            No products match your search.
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        products.map((product) => {
                            const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;
                            return (
                                <div className="product-row" key={product.id}>
                                    <div className="product-row__product" data-label="Product">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="product-row__thumb"
                                        />
                                        <div>
                                            <p className="product-row__name">{product.name}</p>
                                            <p className="product-row__id">ID: {product.id}</p>
                                        </div>
                                    </div>

                                    <div data-label="Category">
                                        <span className={badgeClass(product.category)}>
                                            {product.category?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div data-label="Stock">
                                        <p className={`stock-line${isLowStock ? " stock-line--low" : ""}`}>
                                            <span className="stock-dot" />
                                            {product.stock} Units
                                        </p>
                                        <p className={`stock-status${isLowStock ? " stock-status--low" : ""}`}>
                                            {isLowStock ? "Low Stock Alert" : "Status: Healthy"}
                                        </p>
                                    </div>

                                    <div className="product-row__price" data-label="Price">
                                        ${Number(product.price).toFixed(2)}
                                    </div>

                                    <div className="product-row__actions" data-label="Actions">
                                        <button className="icon-btn" aria-label={`Edit ${product.name}`}>
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            aria-label={`Delete ${product.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Footer / pagination */}
                <div className="product-table__footer">
                    <span className="product-table__count">
                        Showing {rangeStart}-{rangeEnd} of {totalItems} items
                    </span>

                    <div className="pagination">
                        <button
                            className="pagination__btn"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(0, 5)
                            .map((page) => (
                                <button
                                    key={page}
                                    className={`pagination__page${page === currentPage ? " pagination__page--active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                        <button
                            className="pagination__btn"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Productlists;