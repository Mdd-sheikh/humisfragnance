import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../../context/Context";
import { mapPost } from "../blogApi";
import "./Blogdetail.css";

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { API_URL } = useContext(Context);

    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const load = async () => {
            setLoading(true);
            setNotFound(false);
            setError(null);
            setPost(null);
            setRelated([]);
            try {
                const res = await axios.get(`${API_URL}/blog/get/${encodeURIComponent(slug)}`, { signal });
                const current = mapPost(res.data.data);
                setPost(current);
                window.scrollTo(0, 0);

                // "More like this": same category, newest first. Failure here is non-fatal.
                try {
                    const list = await axios.get(`${API_URL}/blog/getallposts`, {
                        params: { published: true, category: current.category, limit: 4 },
                        signal,
                    });
                    setRelated(
                        (list.data?.data ?? [])
                            .map(mapPost)
                            .filter((p) => p.slug !== current.slug)
                            .slice(0, 3)
                    );
                } catch {
                    /* ignore */
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                if (err.response?.status === 404) setNotFound(true);
                else setError(err.response?.data?.message || "We couldn't load this story right now.");
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [API_URL, slug]);

    // Page title + meta description for SEO / browser tab
    useEffect(() => {
        if (!post) return;
        const previousTitle = document.title;
        document.title = post.metaTitle || `${post.title} | Humi's Fragrance Journal`;

        let meta = document.querySelector('meta[name="description"]');
        const createdMeta = !meta;
        const previousDescription = meta?.getAttribute("content");
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", post.metaDescription || post.excerpt || "");

        return () => {
            document.title = previousTitle;
            if (createdMeta) meta.remove();
            else if (previousDescription !== null) meta.setAttribute("content", previousDescription);
        };
    }, [post]);

    if (loading) {
        return (
            <div className="blog-detail-page">
                <p className="blog-detail-state">Loading story…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-detail-page">
                <div className="blog-detail-notfound">
                    <h1>Something went wrong</h1>
                    <p>{error}</p>
                    <Link to="/blog" className="blog-read-more">
                        &larr; Back to The Journal
                    </Link>
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="blog-detail-page">
                <div className="blog-detail-notfound">
                    <h1>Story not found</h1>
                    <p>The article you're looking for doesn't exist or has moved.</p>
                    <Link to="/blog" className="blog-read-more">
                        &larr; Back to The Journal
                    </Link>
                </div>
            </div>
        );
    }

    // If the post has no body text, fall back to the excerpt so the page isn't empty
    const paragraphs = post.paragraphs.length > 0 ? post.paragraphs : [post.excerpt];

    return (
        <div className="blog-detail-page">
            <button
                type="button"
                className="blog-detail-back"
                onClick={() => navigate(-1)}
            >
                <span aria-hidden="true">&larr;</span> Back
            </button>

            <header className="blog-detail-header">
                <div className="blog-detail-header__meta">
                    <span className="blog-tag">{post.category}</span>
                    <span className="blog-date">{post.date}</span>
                    {post.timeAgo && (
                        <span className="blog-detail-header__time">{post.timeAgo}</span>
                    )}
                </div>
                <h1 className="blog-detail-header__title">{post.title}</h1>
                {post.excerpt && (
                    <p className="blog-detail-header__excerpt">{post.excerpt}</p>
                )}
                {post.author && (
                    <div className="blog-detail-author">
                        <span className="blog-detail-author__name">
                            By {post.author}
                        </span>
                    </div>
                )}
            </header>

            <div className="blog-detail-hero">
                <img src={post.image} alt={post.imageAlt} />
            </div>

            <article className="blog-detail-content">
                {paragraphs.map((para, index) => (
                    <p key={index}>{para}</p>
                ))}
            </article>

            {post.extraImages.length > 0 && (
                <div className="blog-detail-gallery">
                    {post.extraImages.map((img) => (
                        <img key={img.url} src={img.url} alt={img.alt} loading="lazy" />
                    ))}
                </div>
            )}

            {related.length > 0 && (
                <section className="blog-detail-related">
                    <h3 className="blog-section__title">More Like This</h3>
                    <div className="blog-detail-related__grid">
                        {related.map((r) => (
                            <Link
                                key={r.id}
                                to={`/blog/${r.slug}`}
                                className="blog-top-story"
                            >
                                <img
                                    src={r.image}
                                    alt={r.imageAlt}
                                    className="blog-top-story__thumb"
                                />
                                <div className="blog-top-story__info">
                                    <span className="blog-tag">{r.category}</span>
                                    <h4 className="blog-top-story__title">{r.title}</h4>
                                    <span className="blog-top-story__time">
                                        {r.timeAgo}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default BlogDetail;
