import { useId, useState } from "react";
import { pageCopy } from "../site.config.js";

export default function AccountingQuiz() {
  const groupName = useId();
  const feedbackId = useId();
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);

  function onSubmit(event) {
    event.preventDefault();
    if (!selected) {
      setResult({ status: "empty" });
      return;
    }

    const correct = selected === pageCopy.correctOptionId;
    setResult({ status: correct ? "correct" : "incorrect", selected });
  }

  const feedbackText =
    result?.status === "empty"
      ? pageCopy.quizChooseFirst
      : result
        ? `${pageCopy.quizFeedback[result.selected] || "Check that answer again."} ${pageCopy.quizExplanation}`
        : "";

  return (
    <section className="panel" id="practice" aria-labelledby="quiz-title">
      <h2 id="quiz-title">{pageCopy.quizTitle}</h2>
      <p className="panel-intro">{pageCopy.quizIntro}</p>
      <form onSubmit={onSubmit}>
        <fieldset className="quiz-fieldset">
          <legend>{pageCopy.quizQuestion}</legend>
          <div className="quiz-options">
            {pageCopy.quizOptions.map((option) => (
              <label key={option.id} className="quiz-option">
                <input
                  type="radio"
                  name={groupName}
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="check-button">
          {pageCopy.quizCheckLabel}
        </button>
      </form>
      <p
        id={feedbackId}
        className={
          result?.status === "correct"
            ? "quiz-feedback quiz-feedback--correct"
            : result?.status === "incorrect"
              ? "quiz-feedback quiz-feedback--retry"
              : "quiz-feedback"
        }
        role="status"
        aria-live="polite"
      >
        {feedbackText}
      </p>
    </section>
  );
}
