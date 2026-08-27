import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const REDIRECT_SECONDS = 5;
const REDIRECT_PATH = "/orders";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate(REDIRECT_PATH);
    }, REDIRECT_SECONDS * 1000);

    const countdownTimer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownTimer);
    };
  }, [navigate]);

  return (
    <div className="poc-page">
      <div className="poc-rings" aria-hidden="true">
        <span className="poc-ring poc-ring-4" />
        <span className="poc-ring poc-ring-3" />
        <span className="poc-ring poc-ring-2" />
        <span className="poc-ring poc-ring-1" />
        <span className="poc-core">
          <svg viewBox="0 0 24 24" className="poc-check" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <h1 className="poc-title">Order placed</h1>
      <p className="poc-subtitle">
        Thanks for your purchase — we&apos;re getting it ready.
      </p>

      <button
        type="button"
        className="poc-skip"
        onClick={() => navigate(REDIRECT_PATH)}
      >
        View order now
      </button>

      <p className="poc-timer">
        Redirecting in {secondsLeft}s
        <span className="poc-progress" aria-hidden="true">
          <span
            className="poc-progress-fill"
            style={{ animationDuration: `${REDIRECT_SECONDS}s` }}
          />
        </span>
      </p>
    </div>
  );
}