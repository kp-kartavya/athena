import { useState } from "react";
import { Send, Star, X } from "lucide-react";

import { getCsrfHeaders } from "../../../api/csrf";
import "./feedback.css";

const Feedback = ({ theme, currentUser, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [feedback, setFeedback] = useState("");
  const [improvement, setImprovement] = useState("");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    if (!feedback.trim()) {
      setError("Please tell us about your experience.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
          improvement: improvement.trim(),
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to submit your feedback.",
        );
      }

      setSuccess(true);
      setRating(0);
      setHoverRating(0);
      setFeedback("");
      setImprovement("");
      setEmail("");
    } catch (submitError) {
      console.error("Feedback submission failed:", submitError);

      setError(
        submitError.message ||
          "Unable to submit your feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose?.();
    }
  };

  return (
    <div
      className={`feedback-overlay ${
        theme === "dark" ? "feedback-dark" : "feedback-light"
      }`}
      onMouseDown={handleOverlayClick}
    >
      <div
        className="feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="feedback-close-button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close feedback"
          title="Close"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">✓</div>

            <h2 id="feedback-title">Thank you for your feedback!</h2>

            <p>
              Your feedback has been sent to the Athena team. We really
              appreciate you taking the time to help us improve.
            </p>

            <button
              type="button"
              className="feedback-primary-button"
              onClick={onClose}
            >
              Back to Athena
            </button>
          </div>
        ) : (
          <>
            <div className="feedback-header">
              <div className="feedback-icon">✦</div>

              <h2 id="feedback-title">Share your feedback</h2>

              <p>Tell us how Athena worked for you and what we can improve.</p>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="feedback-field">
                <label>How was your experience?</label>

                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);

                    return (
                      <button
                        key={star}
                        type="button"
                        className={`feedback-star-button ${
                          active ? "active" : ""
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} out of 5`}
                        disabled={submitting}
                      >
                        <Star
                          size={32}
                          fill={active ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                </div>

                <span className="feedback-rating-label">
                  {rating === 0 ? "Select a rating" : `${rating} out of 5`}
                </span>
              </div>

              <div className="feedback-field">
                <label htmlFor="feedback">What did you think of Athena?</label>

                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Tell us what worked well for you..."
                  maxLength={2000}
                  rows={4}
                  disabled={submitting}
                />

                <span className="feedback-character-count">
                  {feedback.length}/2000
                </span>
              </div>

              <div className="feedback-field">
                <label htmlFor="improvement">
                  What could we improve?
                  <span>Optional</span>
                </label>

                <textarea
                  id="improvement"
                  value={improvement}
                  onChange={(event) => setImprovement(event.target.value)}
                  placeholder="Anything you'd like us to improve..."
                  maxLength={2000}
                  rows={3}
                  disabled={submitting}
                />

                <span className="feedback-character-count">
                  {improvement.length}/2000
                </span>
              </div>

              <div className="feedback-inline-fields">
                <div className="feedback-field">
                  <label htmlFor="feedback-name">
                    Name
                    <span>Optional</span>
                  </label>

                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    disabled={submitting}
                  />
                </div>

                <div className="feedback-field">
                  <label htmlFor="feedback-email">
                    Email
                    <span>Optional</span>
                  </label>

                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    maxLength={254}
                    disabled={submitting}
                  />
                </div>
              </div>

              {error && <div className="feedback-error">{error}</div>}

              <button
                type="submit"
                className="feedback-primary-button"
                disabled={submitting}
              >
                <Send size={17} />

                {submitting ? "Sending feedback..." : "Send Feedback"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
