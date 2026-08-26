import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import {
  Clock,
  Truck,
  CheckCircle2,
  Info,
  AlertTriangle,
  Package,
  X,
  MapPin,
} from "lucide-react";
import "./Orders.css";

import { Context } from "../../context/Context";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "placed", label: "Pending" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Completed" },
];

// Adjust to match your real backend route

const STATUS_META = {
  placed: { label: "Pending", icon: Clock, badgeClass: "badge--pending" },
  shipped: { label: "Shipped", icon: Truck, badgeClass: "badge--shipped" },
  delivered: {
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

/**
 * Normalizes a raw order document from MongoDB into the shape
 * the Orders UI expects.
 */
const normalizeOrder = (order) => {
  const items = (order.items ?? []).map((item, idx) => ({
    id: item.product ?? idx,
    name: item.name,
    image: item.image,
    variant: `Qty: ${item.quantity}`,
    quantity: item.quantity,
    price: item.price,
  }));

  return {
    id: order._id,
    customer: order.shippingAddress?.fullName ?? "Unknown",
    date: order.createdAt,
    status: order.orderStatus, // "placed" | "shipped" | "delivered" ...
    price: order.totalAmount,
    itemCount: items.length,
    items,
    subtotal: order.itemsTotal,
    tax: 0,
    shipping: order.shippingFee,
    total: order.totalAmount,
    paymentMode: order.paymentMode,
    paymentStatus: order.paymentStatus,
    courierPartner: order.courierPartner,
    // Full shipping / address details for the popup
    shippingAddress: {
      fullName: order.shippingAddress?.fullName ?? "—",
      phone: order.shippingAddress?.phone ?? "—",
      address: order.shippingAddress?.address ?? "—",
      city: order.shippingAddress?.city ?? "",
      state: order.shippingAddress?.state ?? "",
      pincode: order.shippingAddress?.pincode ?? "",
      country: order.shippingAddress?.country ?? "",
    },
    highValueNote:
      order.totalAmount > 5000
        ? "High-value order detected. Ensure discrete luxury packaging and signature confirmation."
        : null,
  };
};

/**
 * Popup modal that shows full order + product details,
 * including images and the shipping address.
 */
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const meta = STATUS_META[order.status] ?? STATUS_META.placed;
  const StatusIcon = meta.icon;
  const addr = order.shippingAddress;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title">
            <span className={`order-card__icon ${meta.badgeClass}`}>
              <StatusIcon size={16} />
            </span>
            <div>
              <h2>Order #{order.id}</h2>
              <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Products */}
          <div className="modal-section">
            <h3>Products ({order.itemCount})</h3>
            <div className="modal-products">
              {order.items.map((item) => (
                <div className="modal-product" key={item.id}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="modal-product__img"
                    />
                  ) : (
                    <span className="summary-item__placeholder">
                      <Package size={20} />
                    </span>
                  )}
                  <div className="modal-product__info">
                    <p className="modal-product__name">{item.name}</p>
                    <p className="modal-product__variant">{item.variant}</p>
                  </div>
                  <span className="modal-product__price">
                    {formatMoney(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="modal-section">
            <h3>
              <MapPin size={15} style={{ marginRight: 6 }} />
              Shipping Address
            </h3>
            <div className="modal-address">
              <p className="modal-address__name">{addr.fullName}</p>
              <p>{addr.phone}</p>
              <p>{addr.address}</p>
              <p>
                {[addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {addr.country && <p>{addr.country}</p>}
            </div>
          </div>

          {/* Order info */}
          <div className="modal-section">
            <h3>Order Info</h3>
            <div className="summary-row">
              <span>Order Date</span>
              <span>{formatDate(order.date)}</span>
            </div>
            <div className="summary-row">
              <span>Payment Mode</span>
              <span>{order.paymentMode ?? "—"}</span>
            </div>
            <div className="summary-row">
              <span>Payment Status</span>
              <span>{order.paymentStatus ?? "—"}</span>
            </div>
            <div className="summary-row">
              <span>Courier Partner</span>
              <span>{order.courierPartner ?? "—"}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="modal-section">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatMoney(order.shipping)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>

          {order.highValueNote && (
            <div className="system-note">
              <AlertTriangle size={15} />
              <p>
                <strong>System note:</strong> {order.highValueNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, shipped: 0 });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);

  const { API_URL } = useContext(Context);
  console.log(API_URL);

  // Fetches all orders from the backend and normalizes them
  const getAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/order/getAllOrders`);

      const data = res.data;
      // Support either { orders: [...] } or a raw array response
      const rawOrders = Array.isArray(data) ? data : data.orders ?? [];
      const normalized = rawOrders.map(normalizeOrder);

      const filtered =
        activeTab === "all"
          ? normalized
          : normalized.filter((o) => o.status === activeTab);

      setOrders(filtered);
      setStats({
        pending: normalized.filter((o) => o.status === "placed").length,
        shipped: normalized.filter((o) => o.status === "shipped").length,
      });
      setSelectedOrderId((prev) =>
        filtered.some((o) => o.id === prev) ? prev : filtered[0]?.id ?? null
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Opens the product/order details popup
  const openOrderModal = (order) => {
    setSelectedOrderId(order.id);
    setModalOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setModalOrder(null);
  };

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
              const meta = STATUS_META[order.status] ?? STATUS_META.placed;
              const StatusIcon = meta.icon;
              const isCompleted = order.status === "delivered";

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

                  <div className="order-card__items">
                    {order.items.slice(0, 1).map((item) => (
                      <img
                        key={item.id}
                        src={item.image}
                        alt={item.name}
                        className="order-card__item-thumb"
                      />
                    ))}
                    {order.itemCount > 1 && (
                      <span className="order-card__item-more">
                        +{order.itemCount - 1}
                      </span>
                    )}
                  </div>

                  <div className="order-card__actions">
                    <button
                      className="btn-outline"
                      onClick={() => openOrderModal(order)}
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
                {selectedOrder.items.map((item) => (
                  <div className="summary-item" key={item.id}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="summary-item__thumb"
                      />
                    ) : (
                      <span className="summary-item__placeholder">
                        <Package size={16} />
                      </span>
                    )}
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
                  <span>Shipping</span>
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

      {/* Product details popup */}
      {isModalOpen && (
        <OrderDetailsModal order={modalOrder} onClose={closeOrderModal} />
      )}
    </div>
  );
};

export default Orders;