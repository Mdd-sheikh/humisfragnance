import { useState } from "react";
import "./ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email.";
    }
    if (!form.message.trim()) next.message = "Please add a short message.";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitted(false);
      return;
    }
    setSubmitted(true);
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "General Inquiry",
      message: "",
    });
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="rp-page">
      <div className="rp-glow rp-glow-a" aria-hidden="true" />
      <div className="rp-glow rp-glow-b" aria-hidden="true" />

      <div className="rp-container">
        <header className="rp-hero">
          <span className="rp-eyebrow">
            <span className="rp-eyebrow-dot" />
            Reach the atelier
          </span>
          <h1>
            Let's talk <em>fragrance.</em>
          </h1>
          <p>
            Questions about an order, a custom blend, or a partnership —
            write to us, or reach us directly below.
          </p>
        </header>

        <div className="rp-still-strip">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="rp-still-svg"
          >
            <ellipse cx="32" cy="50" rx="16" ry="4" stroke="#755b00" strokeWidth="1.6" />
            <path
              d="M16 50 C16 38, 20 34, 20 28 C20 24, 24 22, 24 18"
              stroke="#755b00"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M48 50 C48 38, 44 34, 44 28 C44 24, 40 22, 40 18"
              stroke="#755b00"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path d="M24 18 C24 12, 40 12, 40 18" stroke="#755b00" strokeWidth="1.6" />
            <circle cx="32" cy="15" r="2.4" fill="#c9a227" />
            <path
              className="rp-vapor"
              d="M27 10 C26 7, 28 6, 27 3"
              stroke="#c9a227"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              className="rp-vapor rp-vapor-2"
              d="M32 9 C31 6, 33 5, 32 2"
              stroke="#c9a227"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              className="rp-vapor rp-vapor-3"
              d="M37 10 C36 7, 38 6, 37 3"
              stroke="#c9a227"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <div className="rp-still-copy">
            <strong>Crafted the Kannauj way</strong>
            Every bottle traces back to the deg-bhapka stills of Kannauj —
            India's perfume capital, and where Raahi begins.
          </div>
        </div>

        <div className="rp-grid">
          {/* FORM CARD */}
          <div className="rp-card rp-card-form">
            <div className="rp-card-head">
              <span className="rp-eyebrow rp-eyebrow-muted">Send a message</span>
              <h2>Write to us</h2>
              <p>
                Use this form for support, order questions, custom orders, or
                partnership enquiries.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="rp-field-row rp-two">
                <div className={`rp-field ${errors.name ? "rp-error" : ""}`}>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="rp-err-msg">{errors.name}</div>}
                </div>

                <div className={`rp-field ${errors.email ? "rp-error" : ""}`}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="rp-err-msg">{errors.email}</div>}
                </div>
              </div>

              <div className="rp-field-row rp-two">
                <div className="rp-field">
                  <label htmlFor="phone">Phone</label>
                  <div className="rp-phone-wrap">
                    <span className="rp-phone-code">+91</span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="98765 43210"
                      autoComplete="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="rp-field">
                  <label htmlFor="subject">Subject</label>
                  <div className="rp-select-wrap">
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Custom Blend</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rp-field-row">
                <div className={`rp-field ${errors.message ? "rp-error" : ""}`}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && (
                    <div className="rp-err-msg">{errors.message}</div>
                  )}
                </div>
              </div>

              <button className="rp-submit-btn" type="submit">
                <span>Send message</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>

              {submitted && (
                <div className="rp-form-status rp-show">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Message sent — we'll reply within a day.
                </div>
              )}
            </form>
          </div>

          {/* DETAILS CARD */}
          <div className="rp-card rp-card-details">
            <div className="rp-card-head">
              <span className="rp-eyebrow rp-eyebrow-muted">Contact details</span>
              <h2>Get in touch</h2>
              <p>Reach us directly through email, WhatsApp, or our business address.</p>
            </div>

            <div className="rp-detail-list">
              <a className="rp-detail-row" href="mailto:raahiparfums@gmail.com">
                <span className="rp-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6l9 7 9-7" />
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                  </svg>
                </span>
                <span className="rp-detail-copy">
                  <span className="rp-label">Email</span>
                  <span className="rp-value">humisiparfums@gmail.com</span>
                </span>
                <span className="rp-detail-arrow">→</span>
              </a>

              <a
                className="rp-detail-row"
                href="https://wa.me/919250353409"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="rp-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.5 12a8.5 8.5 0 1 1-3.9-7.1" />
                    <path d="M21 3l-4 8-3-3z" />
                  </svg>
                </span>
                <span className="rp-detail-copy">
                  <span className="rp-label">WhatsApp</span>
                  <span className="rp-value">+91 7439 553 142</span>
                </span>
                <span className="rp-detail-arrow">→</span>
              </a>

              <div className="rp-detail-row rp-detail-static">
                <span className="rp-detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.3" />
                  </svg>
                </span>
                <span className="rp-detail-copy">
                  <span className="rp-label">Address</span>
                  <span className="rp-value">
                    Patwar bagan lane 
                    <br />
                    rajabazar, amherst street, kolkata,india
                    <br />
                    Pincode: 700009
                  </span>
                </span>
              </div>
            </div>

            <div className="rp-note-strip">
              <strong>Faster on larger orders —</strong> for bulk orders or
              business discussions, WhatsApp usually gets you a same-day
              reply.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}