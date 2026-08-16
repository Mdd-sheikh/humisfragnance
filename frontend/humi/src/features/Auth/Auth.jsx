import React, { useState, useContext } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../../context/Context";

export default function Auth({ onClose, setIsAuthOpen }) {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // NEW: tracks submit state
    const navigate = useNavigate();

    const { API_URL, setToken } = useContext(Context);

    const handleClose = () => {
        if (loading) return; // prevent closing mid-submit
        setIsAuthOpen(false);
        navigate("/");
    };

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [shake, setShake] = useState(false);

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validate = () => {
        const nextErrors = {};

        if (mode === "signup" && fullName.trim().length < 2) {
            nextErrors.fullName = "Enter your full name";
        }

        if (!email.trim()) {
            nextErrors.email = "Email or phone is required";
        } else if (email.includes("@") && !isValidEmail(email)) {
            nextErrors.email = "That email address doesn't look right";
        }

        if (!password) {
            nextErrors.password = "Password is required";
        } else if (password.length < 6) {
            nextErrors.password = "Password must be at least 6 characters";
        }

        return nextErrors;
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const nextErrors = validate();
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            triggerShake();
            return;
        }

        setLoading(true); // disable inputs + start button animation

        try {
            if (mode === "signup") {
                const signupData = { username: fullName, email, password };
                const response = await axios.post(`${API_URL}/auth/register`, signupData);

                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                toast.success("Account created successfully!");
                setIsAuthOpen(false);
                navigate("/");

            } else {
                const loginData = { email, password };
                const response = await axios.post(`${API_URL}/auth/login`, loginData);

                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                toast.success("Logged in successfully!");
                setIsAuthOpen(false);
                navigate("/");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false); // re-enable inputs, whether success or failure
        }
    };

    const switchMode = (nextMode) => {
        if (loading) return;
        setMode(nextMode);
        setErrors({});
    };

    const clearFieldError = (field) => {
        if (errors[field]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };

    return (
        <div className="elixir-overlay">
            <div
                className={`elixir-modal${shake ? " elixir-shake" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="elixir-title"
            >
                <button
                    type="button"
                    className="elixir-close"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close login dialog"
                >
                    &times;
                </button>

                <div className="elixir-brand"></div>
                <h1 id="elixir-title" className="elixir-heading">
                    {mode === "login" ? "Welcome Back" : "Create Account"}
                </h1>

                <form className="elixir-form" onSubmit={submitHandler} noValidate>
                    {mode === "signup" && (
                        <div className="elixir-field">
                            <label htmlFor="elixir-fullname" className="elixir-label">
                                FULL NAME
                            </label>
                            <input
                                id="elixir-fullname"
                                type="text"
                                className={`elixir-input${errors.fullName ? " elixir-input-error" : ""}`}
                                placeholder="Enter your full name"
                                value={fullName}
                                disabled={loading}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    clearFieldError("fullName");
                                }}
                            />
                            {errors.fullName && (
                                <p className="elixir-error">{errors.fullName}</p>
                            )}
                        </div>
                    )}

                    <div className="elixir-field">
                        <label htmlFor="elixir-email" className="elixir-label">
                            EMAIL OR PHONE
                        </label>
                        <input
                            id="elixir-email"
                            type="text"
                            className={`elixir-input${errors.email ? " elixir-input-error" : ""}`}
                            placeholder="Enter your email address"
                            value={email}
                            disabled={loading}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearFieldError("email");
                            }}
                        />
                        {errors.email && <p className="elixir-error">{errors.email}</p>}
                    </div>

                    <div className="elixir-field">
                        <div className="elixir-field-row">
                            <label htmlFor="elixir-password" className="elixir-label">
                                PASSWORD
                            </label>
                            {mode === "login" && (
                                <a href="#forgot" className="elixir-link">
                                    FORGOT PASSWORD?
                                </a>
                            )}
                        </div>
                        <div className="elixir-password-wrap">
                            <input
                                id="elixir-password"
                                type={showPassword ? "text" : "password"}
                                className={`elixir-input${errors.password ? " elixir-input-error" : ""}`}
                                placeholder="Enter your password"
                                value={password}
                                disabled={loading}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearFieldError("password");
                                }}
                            />
                            <button
                                type="button"
                                className="elixir-eye"
                                onClick={() => setShowPassword((s) => !s)}
                                disabled={loading}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.3 5.3A10.4 10.4 0 0112 5c6 0 9.5 6 9.5 7a11.7 11.7 0 01-3 3.6M6.4 6.7C3.9 8.3 2.5 10.7 2.5 12c0 1 3.5 7 9.5 7 1.2 0 2.3-.2 3.4-.6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />
                                        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="elixir-error">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`elixir-submit${loading ? " elixir-submit-loading" : ""}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="elixir-spinner" aria-label="Loading"></span>
                        ) : mode === "login" ? (
                            "LOGIN"
                        ) : (
                            "SIGN UP"
                        )}
                    </button>
                </form>

                <div className="elixir-divider">
                    <span>OR</span>
                </div>

                <div className="elixir-social-row">
                    <button type="button" className="elixir-social-btn" disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path
                                fill="#FFC107"
                                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
                            />
                            <path
                                fill="#FF3D00"
                                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7.6 0-14.2 4.3-17.7 10.2z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.4 0-9.8-3.1-11.3-7.4l-6.5 5C9.7 39.1 16.3 43.5 24 43.5z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 4.9l6.2 5.2c-.4.4 6.7-4.9 6.7-15.1 0-1.2-.1-2.3-.4-3.5z"
                            />
                        </svg>
                        GOOGLE
                    </button>
                    <button type="button" className="elixir-social-btn" disabled={loading}>
                        <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5c0 25.7 4.7 52.3 14.1 79.7 12.4 36.6 57.2 126.4 103.9 124.9 24.5-.6 41.8-17.4 73.7-17.4 30.9 0 46.9 17.4 74.1 17.4 47.1-.7 87.6-82.6 99.4-119.3-63.2-29.8-51-87.4-51.5-90.1zM256.5 84.9c26.6-31.6 24.2-60.4 23.4-70.9-23.5 1.4-50.7 16.2-66.3 34.4-17.2 19.4-27.4 43.4-25.2 70.3 25.6 2 48.9-11.1 68.1-33.8z" />
                        </svg>
                        APPLE
                    </button>
                </div>

                <p className="elixir-footer">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                className="elixir-link-btn"
                                onClick={() => switchMode("signup")}
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="elixir-link-btn"
                                onClick={() => switchMode("login")}
                            >
                                Login
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}