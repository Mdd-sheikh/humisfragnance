import { useState, useEffect, useRef, useCallback } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./Hero.css";
import { Assets } from "../../assets/Assests";

// Replace `image` with your real product photo path for each slide.
const slides = [
  {
    eyebrow: "New Collection",
    title: "Essence of Elegance",
    description:
      "Discover a curated selection of rare notes, blended meticulously for those who appreciate the poetry of scent.",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    image: Assets.daily_wear,
  },
  {
    eyebrow: "Limited Edition",
    title: "Whispers of Amber",
    description:
      "A warm, resinous signature scent layered with vanilla and soft musk — made for evenings that linger.",
    ctaText: "Explore",
    ctaLink: "/collections/amber",
    image: Assets.party_wear,
  },
  {
    eyebrow: "Bestseller",
    title: "Velvet Bloom",
    description:
      "Delicate florals wrapped in silk-soft powder notes. Our most-loved fragrance, now restocked.",
    ctaText: "Shop Now",
    ctaLink: "/shop/velvet-bloom",
    image: Assets.summer_wear,
  },
];

const AUTOPLAY_MS = 3000;

function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const dragStartX = useRef(null);
  const dragDeltaX = useRef(0);
  const sliderRef = useRef(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const goTo = useCallback((index) => {
    setCurrent(() => (index + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isPaused, current, prefersReducedMotion]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  // Swipe / drag support
  const handleDragStart = (clientX) => {
    dragStartX.current = clientX;
    setIsPaused(true);
  };

  const handleDragMove = (clientX) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = clientX - dragStartX.current;
  };

  const handleDragEnd = () => {
    const threshold = 50;
    if (dragDeltaX.current > threshold) {
      goPrev();
    } else if (dragDeltaX.current < -threshold) {
      goNext();
    }
    dragStartX.current = null;
    dragDeltaX.current = 0;
    setIsPaused(false);
  };

  return (
    <section
      className="hero"
      ref={sliderRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => e.buttons === 1 && handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
    >
      <div className="hero-track">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === current ? "active" : ""}`}
            aria-hidden={index !== current}
          >
            {/* Background image layer */}
            <div className="hero-bg">
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=""
                  className="hero-bg-image"
                  draggable="false"
                />
              ) : (
                <div className="hero-bg-placeholder" aria-hidden="true" />
              )}
              <div className="hero-overlay" />
            </div>

            {/* Text overlaid on top of the image */}
            <div className="hero-content">
              <span className="hero-eyebrow">{slide.eyebrow}</span>

              <h1 className="hero-title">{slide.title}</h1>

              <p className="hero-description">{slide.description}</p>

              <a href={slide.ctaLink} className="hero-cta">
                {slide.ctaText}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        className="hero-arrow hero-arrow-left"
        onClick={goPrev}
        aria-label="Previous slide"
      >
        <FiArrowLeft />
      </button>

      <button
        className="hero-arrow hero-arrow-right"
        onClick={goNext}
        aria-label="Next slide"
      >
        <FiArrowRight />
      </button>

      {/* Dots + progress */}
      <div className="hero-dots" role="tablist" aria-label="Slide navigation">
        {slides.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === current}
            aria-label={`Go to slide ${index + 1}`}
            className={`hero-dot ${index === current ? "active" : ""}`}
            onClick={() => goTo(index)}
          >
            {index === current && !isPaused && !prefersReducedMotion && (
              <span
                key={progressKey}
                className="hero-dot-progress"
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Hero;