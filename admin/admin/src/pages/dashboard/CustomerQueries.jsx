import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MessageSquare, Mail, Phone, Check, Trash2, ChevronDown, RotateCcw } from "lucide-react";
import { Context } from "../../context/Context";
import "./CustomerQueries.css";

const TABS = [
    { key: "", label: "All", countKey: "all" },
    { key: "new", label: "New", countKey: "new" },
    { key: "read", label: "Read", countKey: "read" },
    { key: "resolved", label: "Resolved", countKey: "resolved" },
];

const PAGE_SIZE = 8;

const formatWhen = (value) =>
    new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });

const CustomerQueries = () => {
    const { API_URL } = useContext(Context);

    const [queries, setQueries] = useState([]);
    const [counts, setCounts] = useState({ all: 0, new: 0, read: 0, resolved: 0 });
    const [tab, setTab] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/query/getall`, {
                params: { status: tab || undefined, page, limit: PAGE_SIZE },
            });
            setQueries(res.data.queries ?? []);
            setCounts(res.data.counts ?? { all: 0, new: 0, read: 0, resolved: 0 });
            setTotalPages(res.data.pagination?.totalPages || 1);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load customer queries");
        } finally {
            setLoading(false);
        }
    }, [API_URL, tab, page]);

    useEffect(() => {
        setLoading(true);
        load();
    }, [load]);

    const changeTab = (key) => {
        setTab(key);
        setPage(1);
        setOpenId(null);
        setConfirmDeleteId(null);
    };

    const setStatus = async (id, status, { silent = false } = {}) => {
        setBusyId(id);
        try {
            await axios.patch(`${API_URL}/api/query/${id}/status`, { status });
            if (!silent) toast.success(`Marked as ${status}`);
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update message");
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (id) => {
        setBusyId(id);
        try {
            await axios.delete(`${API_URL}/api/query/${id}`);
            toast.success("Message deleted");
            setConfirmDeleteId(null);
            setOpenId(null);
            if (queries.length === 1 && page > 1) setPage((p) => p - 1);
            else await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete message");
        } finally {
            setBusyId(null);
        }
    };

    // Opening a new message marks it as read
    const toggle = (query) => {
        const opening = openId !== query._id;
        setOpenId(opening ? query._id : null);
        setConfirmDeleteId(null);
        if (opening && query.status === "new") setStatus(query._id, "read", { silent: true });
    };

    return (
        <div className="panel">
            <div className="panel__header">
                <div>
                    <h2 className="panel__title">
                        Customer Queries
                        {counts.new > 0 && <span className="cq-new-count">{counts.new} new</span>}
                    </h2>
                    <p className="panel__subtitle">Messages sent from the contact form</p>
                </div>
            </div>

            <div className="cq-tabs" role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={tab === t.key}
                        className={`cq-tab${tab === t.key ? " is-active" : ""}`}
                        onClick={() => changeTab(t.key)}
                    >
                        {t.label} <span className="cq-tab__count">{counts[t.countKey] ?? 0}</span>
                    </button>
                ))}
            </div>

            {error && <div className="dashboard__state dashboard__state--error">{error}</div>}
            {loading && <div className="dashboard__state">Loading messages…</div>}
            {!loading && !error && queries.length === 0 && (
                <div className="dashboard__state">
                    {tab ? `No ${tab} messages.` : "No customer messages yet."}
                </div>
            )}

            {!loading && queries.length > 0 && (
                <ul className="cq-list">
                    {queries.map((q) => {
                        const open = openId === q._id;
                        const busy = busyId === q._id;
                        return (
                            <li key={q._id} className={`cq-item cq-item--${q.status}`}>
                                <button
                                    className="cq-item__head"
                                    onClick={() => toggle(q)}
                                    aria-expanded={open}
                                >
                                    <span className="cq-item__icon">
                                        <MessageSquare size={16} />
                                    </span>
                                    <span className="cq-item__main">
                                        <span className="cq-item__top">
                                            <strong className="cq-item__name">{q.name}</strong>
                                            <span className="cq-subject">{q.subject}</span>
                                        </span>
                                        <span className="cq-item__preview">{q.message}</span>
                                    </span>
                                    <span className="cq-item__side">
                                        <span className={`cq-status cq-status--${q.status}`}>{q.status}</span>
                                        <span className="cq-item__time">{formatWhen(q.createdAt)}</span>
                                    </span>
                                    <ChevronDown size={16} className={`cq-chevron${open ? " is-open" : ""}`} />
                                </button>

                                {open && (
                                    <div className="cq-item__body">
                                        <p className="cq-message">{q.message}</p>

                                        <div className="cq-contact">
                                            <span><Mail size={14} /> {q.email}</span>
                                            {q.phone && <span><Phone size={14} /> +91 {q.phone}</span>}
                                        </div>

                                        <div className="cq-actions">
                                            {q.status !== "resolved" ? (
                                                <button
                                                    className="cq-btn cq-btn--primary"
                                                    disabled={busy}
                                                    onClick={() => setStatus(q._id, "resolved")}
                                                >
                                                    <Check size={14} /> Mark resolved
                                                </button>
                                            ) : (
                                                <button
                                                    className="cq-btn"
                                                    disabled={busy}
                                                    onClick={() => setStatus(q._id, "new")}
                                                >
                                                    <RotateCcw size={14} /> Reopen
                                                </button>
                                            )}

                                            {confirmDeleteId === q._id ? (
                                                <>
                                                    <button
                                                        className="cq-btn cq-btn--danger"
                                                        disabled={busy}
                                                        onClick={() => remove(q._id)}
                                                    >
                                                        Confirm delete
                                                    </button>
                                                    <button className="cq-btn" onClick={() => setConfirmDeleteId(null)}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="cq-btn cq-btn--ghost-danger"
                                                    disabled={busy}
                                                    onClick={() => setConfirmDeleteId(q._id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="cq-pager">
                    <button className="cq-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button className="cq-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerQueries;
