import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import "./Productlists.css";
import "./EditProductModal.css";
import EditProductModal from "./EditProductModal";
import { Context } from "../../context/Context";

const FILTERS = ["All Items", "floral", "woody", "musk", "oud", "citrus", "spicy"];
const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 5;
// Stock bar is full at this many units
const HEALTHY_STOCK_LEVEL = 50;
const STOCK_FILTERS = [
    { value: "", label: "All stock" },
    { value: "in", label: "In stock" },
    { value: "low", label: "Low stock" },
    { value: "out", label: "Out of stock" },
];

const getStockState = (stock) => {
    if (stock <= 0) return "out";
    if (stock <= LOW_STOCK_THRESHOLD) return "low";
    return "ok";
};
const STOCK_LABEL = { out: "Out of Stock", low: "Low Stock Alert", ok: "In Stock" };

/**
 * Normalizes a raw product document from the backend
 * (attarModel) into the shape the table UI expects.
 */
const normalizeProduct = (product) => ({
    raw: product, // full document, used to pre-fill the edit form
    id: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0]?.url ?? "",
    category: product.category,
    stock: product.variants?.length
        ? product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
        : product.stock ?? 0,
    variants: (product.variants ?? []).map((v) => ({
        id: v._id,
        size: v.size,
        stock: v.stock ?? 0,
    })),
    price: product.price,
    discountPrice: product.discountPrice,
    isActive: product.isActive,
});

const mapResponse = (data) => ({
    items: (data.products ?? []).map(normalizeProduct),
    total: data.total ?? 0,
    totalPages: data.totalPages ?? 1,
    stats: data.stats ?? { active: 0, inactive: 0, outOfStock: 0, lowStock: 0 },
});

const Productlists = () => {
    const [products, setProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({ active: 0, inactive: 0, outOfStock: 0, lowStock: 0 });
    const [stockFilter, setStockFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Items");
    const [currentPage, setCurrentPage] = useState(1);

    const { API_URL } = useContext(Context);

    const [editing, setEditing] = useState(null);   // normalized product being edited
    const [deleting, setDeleting] = useState(null); // normalized product awaiting delete confirm
    const [deleteBusy, setDeleteBusy] = useState(false);

    // Fetches ALL products (admin view — active + inactive) using axios
    const getAllAttars = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, limit: ITEMS_PER_PAGE };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (activeFilter !== "All Items") params.category = activeFilter;
            if (stockFilter) params.stock = stockFilter;

            const res = await axios.get(`${API_URL}/api/product/getallatter`, { params });

            const { items, total, stats } = mapResponse(res.data);
            setProducts(items);
            setTotalItems(total);
            setStats(stats);
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Something went wrong"
            );
            setProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [API_URL, searchTerm, activeFilter, stockFilter, currentPage]);

    const confirmDelete = async () => {
        if (!deleting) return;
        setDeleteBusy(true);
        try {
            const res = await axios.delete(`${API_URL}/api/product/${deleting.id}`);
            toast.success(res.data?.message || "Product deleted");
            setDeleting(null);
            // If that was the last item on this page, step back one page
            if (products.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
            else getAllAttars();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to delete product");
        } finally {
            setDeleteBusy(false);
        }
    };

    // Debounce search so we don't fire a request on every keystroke
    useEffect(() => {
        const handle = setTimeout(() => {
            getAllAttars();
        }, 350);
        return () => clearTimeout(handle);
    }, [getAllAttars]);

    // Reset to page 1 whenever the search term or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter, stockFilter]);

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

            {/* Stock summary */}
            <div className="stock-summary">
                <div className="stock-summary__tile">
                    <span className="stock-summary__label">Active Products</span>
                    <span className="stock-summary__value">{stats.active}</span>
                </div>
                <div className="stock-summary__tile">
                    <span className="stock-summary__label">Low Stock</span>
                    <span className="stock-summary__value stock-summary__value--warn">{stats.lowStock}</span>
                </div>
                <div className="stock-summary__tile">
                    <span className="stock-summary__label">Out of Stock</span>
                    <span className="stock-summary__value stock-summary__value--danger">{stats.outOfStock}</span>
                </div>
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
                            {filter === "All Items" ? filter : filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>

                <select
                    className="stock-select"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    aria-label="Filter by stock level"
                >
                    {STOCK_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
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
                            const state = getStockState(product.stock);
                            const pct = Math.min(100, (product.stock / HEALTHY_STOCK_LEVEL) * 100);
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
                                        <p className={`stock-line stock-line--${state}`}>
                                            <span className="stock-dot" />
                                            {product.stock} {product.stock === 1 ? "unit" : "units"} left
                                        </p>
                                        <div
                                            className="stock-bar"
                                            role="progressbar"
                                            aria-valuenow={product.stock}
                                            aria-valuemin={0}
                                            aria-valuemax={HEALTHY_STOCK_LEVEL}
                                            aria-label={`${product.name} stock`}
                                        >
                                            <div
                                                className={`stock-bar__fill stock-bar__fill--${state}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className={`stock-status stock-status--${state}`}>
                                            {STOCK_LABEL[state]}
                                        </p>
                                        {product.variants.length > 0 && (
                                            <div className="variant-chips">
                                                {product.variants.map((v) => (
                                                    <span
                                                        key={v.id ?? v.size}
                                                        className={`variant-chip variant-chip--${getStockState(v.stock)}`}
                                                    >
                                                        {v.size}: {v.stock}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="product-row__price" data-label="Price">
                                        ₹{Number(product.price).toFixed(2)}
                                    </div>

                                    <div className="product-row__actions" data-label="Actions">
                                        <button
                                            className="icon-btn"
                                            aria-label={`Edit ${product.name}`}
                                            onClick={() => setEditing(product)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            aria-label={`Delete ${product.name}`}
                                            onClick={() => setDeleting(product)}
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

            {/* Edit modal */}
            {editing && (
                <EditProductModal
                    product={editing.raw}
                    apiUrl={API_URL}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        getAllAttars();
                    }}
                />
            )}

            {/* Delete confirmation */}
            {deleting && (
                <div className="modal-backdrop" onMouseDown={() => !deleteBusy && setDeleting(null)}>
                    <div
                        className="modal modal--sm"
                        role="alertdialog"
                        aria-modal="true"
                        aria-label={`Delete ${deleting.name}`}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="modal__header">
                            <h2 className="modal__title">Delete product?</h2>
                        </div>
                        <p className="modal__text">
                            <strong>{deleting.name}</strong> and its images will be permanently
                            removed. Past orders keep their own copy of the item details. This
                            can&apos;t be undone.
                        </p>
                        <div className="modal__footer">
                            <button
                                className="mbtn-ghost"
                                onClick={() => setDeleting(null)}
                                disabled={deleteBusy}
                            >
                                Cancel
                            </button>
                            <button className="mbtn-danger" onClick={confirmDelete} disabled={deleteBusy}>
                                {deleteBusy ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productlists;