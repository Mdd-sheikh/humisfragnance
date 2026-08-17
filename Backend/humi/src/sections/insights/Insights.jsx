import { Assets } from "../../assets/Assests";
import "./Insights.css";

const INSIGHTS = [
  {
    image: Assets.blog_image_one,
    alt: "Woman holding a small attar bottle up to her face",
    title: "Why Does Rain Smell So Good? The Story of Mitti…",
    date: "JUNE 15, 2026",
    excerpt:
      "Discover why rain smells so good and how Mitti Attar captures the scent of petrichor. Learn the centuries-old Kannauj tradition of bottling the smell of rain.",
  },
  {
    image: Assets.blog_image_two,
    alt: "Rose petals collected in a wide copper vessel",
    title: "Raahi Parfums: Guardian of Tradition in the Heart of Kannauj",
    date: "OCTOBER 19, 2023",
    excerpt:
      "True Indian attars from Kannauj are not merely fragrances; they are stories in a bottle, encapsulating the history, tradition, and innovation of an entire region.",
    featured: true,
  },
  {
    image: Assets.blog_image_three,
    alt: "Basket overflowing with fresh pink rose petals",
    title: "10 Frequently Asked Questions About Attar",
    date: "MAY 29, 2023",
    excerpt:
      "What is attar? Attar is a type of natural perfume oil that is derived from botanical sources such as flowers, herbs, and spices. How is attar made?",
    meta: "3 comments",
  },
];

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
  return (
    <div className="insights-page">
      <section className="insights">
        <header className="insights__header">
          <h2 className="insights__title">Insights</h2>
          <p className="insights__eyebrow">Handcrafted Indian Attar</p>
        </header>

        <div className="insights__grid">
          {INSIGHTS.map((item) => (
            <article className="insights__card" key={item.title}>
              <div className="insights__thumb">
                <ImagePlaceholder src={item.image} alt={item.alt} />
              </div>

              <div className="insights__body">
                <h3
                  className={`insights__card-title${
                    item.featured ? " insights__card-title--featured" : ""
                  }`}
                >
                  {item.title}
                </h3>
                <p className="insights__date">{item.date}</p>
                <p className="insights__excerpt">{item.excerpt}</p>
                {item.meta && <p className="insights__meta">{item.meta}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}