import { blogPosts } from "../../assets/Assests";
import "./Blog.css";

const Blog = () => {
    const featured = blogPosts.find((post) => post.featured) || blogPosts[0];
    const topStories = blogPosts.filter((post) => post.topStory);
    const moreStories = blogPosts.filter((post) => !post.featured);

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
                    <a href={`/blog/${featured.slug}`} className="blog-read-more">
                        Read more <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </section>

            <section className="blog-top-stories">
                <h3 className="blog-section__title">Top Stories</h3>
                <div className="blog-top-stories__grid">
                    {topStories.map((post) => (
                        <a
                            key={post.id}
                            href={`/blog/${post.slug}`}
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
                        </a>
                    ))}
                </div>
            </section>

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

            <section className="blog-more-stories">
                <h3 className="blog-section__title">More Stories</h3>
                <div className="blog-more-stories__grid">
                    {moreStories.map((post) => (
                        <a
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="blog-more-story"
                        >
                            <img
                                src={post.image}
                                alt={post.imageAlt}
                                className="blog-more-story__thumb"
                            />
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Blog;