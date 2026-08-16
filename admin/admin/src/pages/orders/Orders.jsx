import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Truck,
  CheckCircle2,
  Info,
  AlertTriangle,
  Package,
} from "lucide-react";
import "./Orders.css";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
];

/**
 * Expects a backend endpoint returning JSON shaped like:
 * {
 *   stats: { pending: 12, shipped: 48 },
 *   orders: [
 *     {
 *       id: "HE-1024",
 *       customer: "Aurelius Thorne",
 *       date: "2023-10-24",
 *       status: "pending" | "shipped" | "completed",
 *       price: 284.00,
 *       itemCount: 2,
 *       review: "Beautifully packaged, the scent profile is exactly as described.", // completed orders only
 *       items: [
 *         { id, name: "Amber Noir", variant: "50ML • Eau de Parfum", price: 180.0 },
 *         { id, name: "Midnight Santal", variant: "220G • Soy Wax", price: 65.0 }
 *       ],
 *       subtotal: 245.0,
 *       tax: 19.6,
 *       shipping: 19.4,
 *       total: 284.0,
 *       highValueNote: "High-value order detected. Ensure discrete luxury packaging and signature confirmation." // optional
 *     }
 *   ]
 * }
 *
 * Adjust API_URL and field names below to match your API.
 */
const API_URL = "/api/orders";

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, badgeClass: "badge--pending" },
  shipped: { label: "Shipped", icon: Truck, badgeClass: "badge--shipped" },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass: "badge--completed",
  },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (value) => `$${Number(value ?? 0).toFixed(2)}`;

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, shipped: 0 });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load orders");

      const data = await res.json();
      const fetchedOrders = data.orders ?? [];
      setOrders(fetchedOrders);
      setStats(data.stats ?? { pending: 0, shipped: 0 });
      setSelectedOrderId((prev) =>
        fetchedOrders.some((o) => o.id === prev)
          ? prev
          : fetchedOrders[0]?.id ?? null
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  return (
    <div className="orders">
      {/* Header */}
      <div className="orders__header">
        <div>
          <h1 className="orders__title">Orders Management</h1>
          <p className="orders__subtitle">
            Curating and overseeing the olfactory journeys of our discerning
            clientele.
          </p>
        </div>

        <div className="orders__stats">
          <div className="stat-card">
            <span className="stat-card__label">Pending</span>
            <span className="stat-card__value">{stats.pending}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Shipped</span>
            <span className="stat-card__value">{stats.shipped}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="orders__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`orders__tab${activeTab === tab.key ? " orders__tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="orders__layout">
        {/* Order list */}
        <div className="orders__list">
          {loading && <div className="orders__state">Loading orders…</div>}

          {!loading && error && (
            <div className="orders__state orders__state--error">{error}</div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="orders__state">No orders found.</div>
          )}

          {!loading &&
            !error &&
            orders.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const StatusIcon = meta.icon;
              const isCompleted = order.status === "completed";

              return (
                <div className="order-card" key={order.id}>
                  <div className="order-card__top">
                    <div className="order-card__identity">
                      <span className={`order-card__icon ${meta.badgeClass}`}>
                        <StatusIcon size={16} />
                      </span>
                      <div>
                        <p className="order-card__id">Order #{order.id}</p>
                        <p className="order-card__meta">
                          {order.customer} • {formatDate(order.date)}
                        </p>
                      </div>
                    </div>

                    <div className="order-card__right">
                      <span className={`badge ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span className="order-card__price">
                        {formatMoney(order.price)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card__divider" />

                  {isCompleted && order.review ? (
                    <p className="order-card__review">"{order.review}"</p>
                  ) : (
                    <div className="order-card__items">
                      <span className="order-card__item-placeholder">
                        <Package size={18} />
                      </span>
                      {order.itemCount > 1 && (
                        <span className="order-card__item-more">
                          +{order.itemCount - 1}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="order-card__actions">
                    <button
                      className="btn-outline"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      View Details
                    </button>
                    {isCompleted ? (
                      <button className="btn-outline">Archive</button>
                    ) : (
                      <button className="btn-solid">Update Status</button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Order summary sidebar */}
        <aside className="order-summary">
          <div className="order-summary__header">
            <h2>Order Summary</h2>
            <Info size={16} />
          </div>

          {!selectedOrder && (
            <p className="orders__state">Select an order to see details.</p>
          )}

          {selectedOrder && (
            <>
              <div className="order-summary__items">
                {(selectedOrder.items ?? []).map((item) => (
                  <div className="summary-item" key={item.id}>
                    <span className="summary-item__placeholder">
                      <Package size={16} />
                    </span>
                    <div className="summary-item__info">
                      <p className="summary-item__name">{item.name}</p>
                      <p className="summary-item__variant">{item.variant}</p>
                    </div>
                    <span className="summary-item__price">
                      {formatMoney(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-summary__totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatMoney(selectedOrder.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (Est.)</span>
                  <span>{formatMoney(selectedOrder.tax)}</span>
                </div>
                <div className="summary-row">
                  <span>Express Shipping</span>
                  <span>{formatMoney(selectedOrder.shipping)}</span>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Total</span>
                  <span>{formatMoney(selectedOrder.total)}</span>
                </div>
              </div>

              <button className="btn-dark">Print Packing Slip</button>

              {selectedOrder.highValueNote && (
                <div className="system-note">
                  <AlertTriangle size={15} />
                  <p>
                    <strong>System note:</strong> {selectedOrder.highValueNote}
                  </p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Orders;