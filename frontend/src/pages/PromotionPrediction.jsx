
import { useState } from "react";
import "./PromotionPrediction.css";

const initialForm = {
  department: "Technology",
  region: "region_7",
  education: "Bachelor's",
  gender: "m",
  recruitment_channel: "sourcing",
  no_of_trainings: 1,
  age: 29,
  previous_year_rating: 4,
  length_of_service: 4,
  awards_won: 0,
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
      [name]: [
        "no_of_trainings",
        "age",
        "previous_year_rating",
        "length_of_service",
        "awards_won",
        "avg_training_score",
      ].includes(name)
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
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
    ["department", "Department", "select", ["Technology", "Analytics", "Sales & Marketing", "Operations", "Procurement", "Finance", "HR", "Legal", "R&D"]],
    ["region", "Region", "text"],
    ["education", "Education", "select", ["Bachelor's", "Master's & above", "Below Secondary"]],
    ["gender", "Gender", "select", ["m", "f"]],
    ["recruitment_channel", "Recruitment Channel", "select", ["sourcing", "referred", "other"]],
    ["no_of_trainings", "Number of Trainings", "number"],
    ["age", "Age", "number"],
    ["previous_year_rating", "Previous Year Rating", "number"],
    ["length_of_service", "Years of Service", "number"],
    ["awards_won", "Awards Won (0 or 1)", "select", ["0", "1"]],
    ["avg_training_score", "Average Training Score", "number"],
  ];

  return (
    <div className="promotion-page">
      <div className="promotion-heading">
        <span className="promotion-eyebrow">SMART HR ANALYTICS</span>
        <h1>Employee Promotion Prediction</h1>
        <p>Enter employee details to estimate their promotion likelihood.</p>
      </div>

      <form className="promotion-form" onSubmit={handleSubmit}>
        {fields.map(([name, label, type, options]) => (
          <div className="promotion-field" key={name}>
            <label htmlFor={name}>{label}</label>

            {type === "select" ? (
              <select
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                min={
                  name === "age" ? 18 :
                  name === "previous_year_rating" ? 1 : 0
                }
                max={
                  name === "age" ? 100 :
                  name === "previous_year_rating" ? 5 :
                  name === "length_of_service" ? 60 :
                  name === "avg_training_score" ? 100 :
                  name === "no_of_trainings" ? 100 : undefined
                }
                step={name === "previous_year_rating" ? 0.5 : 1}
                required
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict Promotion"}
        </button>
      </form>

      {error && <p className="promotion-error">{error}</p>}

      {result && (
        <div className="promotion-result" aria-live="polite">
          <h2>Prediction Result</h2>
          <h3>{result.prediction}</h3>
          <p>
            Promotion probability:{" "}
            <strong>{result.promotion_probability}%</strong>
          </p>
          <div className="promotion-progress">
            <div
              style={{ width: `${result.promotion_probability}%` }}
            />
          </div>
          <small>{result.notice}</small>
        </div>
      )}
    </div>
  );
}

export default PromotionPrediction;
