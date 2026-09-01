import { useParams, Link, useNavigate } from "react-router-dom";
import { blogPosts } from "../../../assets/Assests";
import "./Blogdetail.css";

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const post = blogPosts.find((p) => p.slug === slug);

    // Fallback content paragraphs if the data source doesn't provide a
    // dedicated "content" array — splits the excerpt so the page still
    // renders something reasonable.
    const paragraphs =
        post?.content && post.content.length > 0
            ? post.content
            : post
                ? [post.excerpt]
                : [];

    const related = post
        ? blogPosts
            .filter((p) => p.slug !== post.slug && p.category === post.category)
            .slice(0, 3)
        : [];

    if (!post) {
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
                        {post.authorImage && (
                            <img
                                src={post.authorImage}
                                alt={post.author}
                                className="blog-detail-author__avatar"
                            />
                        )}
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