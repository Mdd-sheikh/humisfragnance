import { useState } from "react";
import "./FAQAccordion.css";

const FAQS = [
  {
    note: "Top",
    question: "How do I choose the right fragrance for me?",
    answer:
      "Start with the note you're drawn to first — citrus and spice for energy, wood and amber for depth, or floral and musk for something soft. Our attars are grouped by these families, and every listing shows the top, heart, and base notes so you know how the scent will move on your skin over time.",
  },
  {
    note: "Heart",
    question: "How long do attars last on the skin?",
    answer:
      "Because attars are oil-based and alcohol-free, they sit closer to the skin and unfold slowly. Most last 6–10 hours, often longer on warmer skin or fabric. You'll notice the top note in the first half hour, with the heart and base carrying the scent through the rest of the day.",
  },
  {
    note: "Base",
    question: "Are your perfumes alcohol-free?",
    answer:
      "Yes. Every fragrance in this collection is built on a pure oil base with no alcohol, so it's gentler on sensitive skin and doesn't evaporate as quickly. This is also why attars are traditionally applied in small amounts to pulse points rather than sprayed.",
  },
  {
    note: "Top",
    question: "How should I apply attar for best results?",
    answer:
      "Dab a small amount on pulse points — wrists, behind the ears, base of the throat — where skin is warmest. Rub gently rather than rubbing hard, which can break down the top note early. A little goes further than spray perfume, so start light and layer if needed.",
  },
  {
    note: "Heart",
    question: "Are these fragrances suitable for daily use?",
    answer:
      "Most of our attars are formulated to be light enough for everyday wear while still leaving a trace. If you're new to a scent, we recommend one application in the morning — you can always layer more from our travel vials for evening depth.",
  },
];

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="faq-icon" aria-hidden="true">
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div className="faq-page">
    <section className="faq" aria-labelledby="faq-heading">
      <div className="faq__header">
        <div>
          <span className="faq__eyebrow">The Scent Guide</span>
          <h2 id="faq-heading" className="faq__title">
            Frequently Asked Questions
          </h2>
        </div>
        <a className="faq__cta" href="#read-more">
          Read the full guide
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <ul className="faq__list">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li className={`faq__item${isOpen ? " is-open" : ""}`} key={item.question}>
              <button
                className="faq__row"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-control-${i}`}
                onClick={() => toggle(i)}
              >
                <span className={`faq__note faq__note--${item.note.toLowerCase()}`}>
                  {item.note}
                </span>
                <span className="faq__question">{item.question}</span>
                <span className="faq__toggle">
                  <PlusIcon />
                </span>
              </button>
              <div
                className="faq__panel"
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-control-${i}`}
              >
                <p className="faq__answer">{item.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
    </div>
  );
}