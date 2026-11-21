
import { useState } from "react";
import "./PromotionPrediction.css";

const initialForm = {
  department: "Technology",
  education: "Bachelor's",
  gender: "m",
  length_of_service: 4,
  avg_training_score: 82,
};

function PromotionPrediction() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "length_of_service" ||
        name === "avg_training_score"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict/promotion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prediction failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        "Unable to connect to the ML service. Check that FastAPI is running."
      );

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    [
      "department",
      "Department",
      "select",
      [
        "Technology",
        "Analytics",
        "Sales & Marketing",
        "Operations",
        "Procurement",
        "Finance",
        "HR",
        "Legal",
        "R&D",
      ],
    ],

    [
      "education",
      "Education",
      "select",
      [
        "Bachelor's",
        "Master's & above",
        "Below Secondary",
      ],
    ],

    [
      "gender",
      "Gender",
      "select",
      ["m", "f"],
    ],

    [
      "length_of_service",
      "Years of Service",
      "number",
    ],

    [
      "avg_training_score",
      "Average Training Score",
      "number",
    ],
  ];

  return (
    <div className="promotion-page">

      {/* Page Heading */}
      <div className="promotion-heading">
        <span className="promotion-eyebrow">
          SMART HR ANALYTICS
        </span>

        <h1>Employee Promotion Prediction</h1>

        <p>
          Enter employee details to estimate their promotion likelihood.
        </p>
      </div>

      {/* Prediction Form */}
      <form
        className="promotion-form"
        onSubmit={handleSubmit}
      >
        {fields.map(
          ([name, label, type, options]) => (
            <div
              className="promotion-field"
              key={name}
            >
              <label htmlFor={name}>
                {label}
              </label>

              {type === "select" ? (
                <select
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                >
                  {options.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={name}
                  name={name}
                  type="number"
                  value={form[name]}
                  onChange={handleChange}
                  min={
                    name === "length_of_service"
                      ? 0
                      : 0
                  }
                  max={
                    name === "length_of_service"
                      ? 60
                      : name ===
                        "avg_training_score"
                      ? 100
                      : undefined
                  }
                  step="1"
                  required
                />
              )}
            </div>
          )
        )}

        {/* Predict Button */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Predicting..."
            : "Predict Promotion"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <p className="promotion-error">
          {error}
        </p>
      )}

      {/* Prediction Result */}
      {result && (
        <div
          className="promotion-result"
          aria-live="polite"
        >
          <h2>Prediction Result</h2>

          <h3>
            {result.prediction}
          </h3>

          <p>
            Promotion probability:{" "}
            <strong>
              {result.promotion_probability}%
            </strong>
          </p>

          <div className="promotion-progress">
            <div
              style={{
                width: `${result.promotion_probability}%`,
              }}
            />
          </div>

          <small>
            {result.notice}
          </small>
        </div>
      )}
    </div>
  );
}

export default PromotionPrediction;
