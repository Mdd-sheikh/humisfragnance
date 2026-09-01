import { Link } from "react-router-dom";
import { blogPosts } from "../../assets/Assests";
import "./Insights.css";

function ImagePlaceholder({ src, alt }) {
  if (src) {
    return <img className="insights__img" src={src} alt={alt} loading="lazy" />;
  }
  return (
    <div className="insights__img insights__img--placeholder" role="img" aria-label={alt}>
      <span>Image</span>
    </div>
  );
}

export default function Insights() {
  const featuredInsights = blogPosts.slice(0, 3);

  return (
    <div className="insights-page">
      <section className="insights">
        <header className="insights__header">
          <h2 className="insights__title">Insights</h2>
          <p className="insights__eyebrow">Handcrafted Indian Attar</p>
        </header>

        <div className="insights__grid">
          {featuredInsights.map((item) => (
            <article className="insights__card" key={item.id ?? item.slug}>
              <Link to={`/blog/${item.slug}`} className="insights__card-link">
                <div className="insights__thumb">
                  <ImagePlaceholder src={item.image} alt={item.imageAlt} />
                </div>

                <div className="insights__body">
                  {item.category && (
                    <p className="insights__category">{item.category}</p>
                  )}
                  <h3
                    className={`insights__card-title${item.featured ? " insights__card-title--featured" : ""
                      }`}
                  >
                    {item.title}
                  </h3>
                  <p className="insights__date">{item.date}</p>
                  <p className="insights__excerpt">{item.excerpt}</p>
                  {item.meta && <p className="insights__meta">{item.meta}</p>}
                  <span className="blog-read-more">
                    Read more <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}