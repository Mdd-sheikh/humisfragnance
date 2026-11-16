import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Context } from "../../context/Context";
import { mapPost } from "./blogApi";
import "./Blog.css";

const Blog = () => {
    const { API_URL } = useContext(Context);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPosts = useCallback(async (signal) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/blog/getallposts`, {
                params: { published: true, limit: 50 },
                signal,
            });
            setPosts((res.data?.data ?? []).map(mapPost));
        } catch (err) {
            if (axios.isCancel(err)) return;
            setError(err.response?.data?.message || "We couldn't load the journal right now.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        const controller = new AbortController();
        loadPosts(controller.signal);
        return () => controller.abort();
    }, [loadPosts]);

    useEffect(() => {
        document.title = "The Journal | Humi's Fragrance";
    }, []);

    if (loading) {
        return (
            <div className="blog-page">
                <p className="blog-state">Loading stories…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-page">
                <div className="blog-state">
                    <p>{error}</p>
                    <button type="button" className="blog-read-more" onClick={() => loadPosts()}>
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="blog-page">
                <header className="blog-header">
                    <h1 className="blog-header__title">The Journal</h1>
                    <p className="blog-header__subtitle">
                        New stories are on their way. Check back soon.
                    </p>
                </header>
            </div>
        );
    }

    const featured = posts.find((post) => post.featured) || posts[0];
    const topStories = posts.filter((post) => post.topStory);
    const moreStories = posts.filter((post) => post.id !== featured.id);

    return (
        <div className="blog-page">
            <div className="blog-banner">
                <span className="blog-banner__tag">Latest</span>
                <p className="blog-banner__text">
                    {featured.bannerText || featured.title}
                </p>
            </div>

            <header className="blog-header">
                <h1 className="blog-header__title">The Journal</h1>
                <p className="blog-header__subtitle">
                    Explore stories of olfactory artistry, meticulous craftsmanship,
                    and the quiet luxury of scent.
                </p>
            </header>

            <section className="blog-featured">
                <div className="blog-featured__image">
                    <img src={featured.image} alt={featured.imageAlt} />
                </div>
                <div className="blog-featured__content">
                    <div className="blog-featured__meta">
                        <span className="blog-tag">{featured.category}</span>
                        <span className="blog-date">{featured.date}</span>
                    </div>
                    <h2 className="blog-featured__title">{featured.title}</h2>
                    <p className="blog-featured__excerpt">{featured.excerpt}</p>
                    <Link to={`/blog/${featured.slug}`} className="blog-read-more">
                        Read more <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </section>

            {topStories.length > 0 && (
                <section className="blog-top-stories">
                    <h3 className="blog-section__title">Top Stories</h3>
                    <div className="blog-top-stories__grid">
                        {topStories.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="blog-top-story"
                            >
                                <img
                                    src={post.image}
                                    alt={post.imageAlt}
                                    className="blog-top-story__thumb"
                                />
                                <div className="blog-top-story__info">
                                    <span className="blog-tag">{post.category}</span>
                                    <h4 className="blog-top-story__title">{post.title}</h4>
                                    <span className="blog-top-story__time">
                                        {post.timeAgo}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="blog-newsletter">
                <h3 className="blog-newsletter__title">The Daily Scent</h3>
                <p className="blog-newsletter__subtitle">
                    Get the latest olfactory news and exclusive stories delivered to
                    your inbox.
                </p>
                <form
                    className="blog-newsletter__form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="email"
                        placeholder="Email address"
                        required
                        className="blog-newsletter__input"
                    />
                    <button type="submit" className="blog-newsletter__button">
                        Subscribe
                    </button>
                </form>
            </section>

            {moreStories.length > 0 && (
                <section className="blog-more-stories">
                    <h3 className="blog-section__title">More Stories</h3>
                    <div className="blog-more-stories__grid">
                        {moreStories.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="blog-more-story"
                                aria-label={post.title}
                            >
                                <img
                                    src={post.image}
                                    alt={post.imageAlt}
                                    className="blog-more-story__thumb"
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Blog;
