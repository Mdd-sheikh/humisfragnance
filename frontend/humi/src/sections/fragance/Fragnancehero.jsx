import "./Fragnancehero.css";

const FRAGRANCE_ROWS = [
    { notes: ["FLORAL", "MUSK", "ROSE", "SAFFRON", "JASMINE", "AMBER"], speed: 32 },
    { notes: ["WOODY", "MOGRA", "SANDALWOOD", "MUSK", "CEDAR", "VETIVER"], speed: 40 },
    { notes: ["FRESH", "AMBER", "OUD", "AMBER", "CITRUS", "PATCHOULI"], speed: 26 },
    { notes: ["SPICY", "SAFFRON", "MOGRA", "VETIVER (KHUS)", "MUSK", "ROSE"], speed: 36 },
];

function FragranceArrow() {
    return (
        <svg viewBox="0 0 90 60" className="fragrance__arrow" aria-hidden="true">
            <path
                d="M4 40 C 22 8, 56 2, 78 18"
                fill="none"
                stroke="var(--color-primary-light)"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M62 12 L80 18 L72 34"
                fill="none"
                stroke="var(--color-primary-light)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function FragranceMarqueeRow({ notes, speed }) {
    // Duplicate the list so the track can loop seamlessly at -50%
    const track = [...notes, ...notes];

    return (
        <div className="fragrance__marquee-row">
            <div className="fragrance__marquee-track" style={{ "--duration": `${speed}s` }}>
                {track.map((note, i) => (
                    <span className="fragrance__pill" key={`${note}-${i}`}>
                        {note}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function FragranceShowcase() {
    return (
        <div className="fragrance-page">
            <section className="fragrance-card">
                <div className="fragrance__text">
                    <h1 className="fragrance__heading">
                        A single drop that{" "}
                        <span className="fragrance__highlight">
                            reveals
                            
                        </span>
                        <br />
                        a world of timeless
                        <br />
                        fragrances.
                    </h1>
                </div>

                <div className="fragrance__marquee" aria-hidden="true">
                    {FRAGRANCE_ROWS.map((row, i) => (
                        <FragranceMarqueeRow key={i} notes={row.notes} speed={row.speed} />
                    ))}
                </div>
            </section>
        </div>
    );
}