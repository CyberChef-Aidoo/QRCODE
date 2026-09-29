import { useId, useState } from "react";
import { pageCopy } from "../site.config.js";
import { CheckIcon, CrossIcon, SelectedIcon } from "./icons.jsx";

const marks = {
  selected: { icon: SelectedIcon, label: pageCopy.quizSelectedLabel },
  correct: { icon: CheckIcon, label: pageCopy.quizCorrectLabel },
  incorrect: { icon: CrossIcon, label: pageCopy.quizIncorrectLabel },
};

function AnswerMark({ type }) {
  const mark = marks[type];
  if (!mark) {
    return null;
  }

  const Icon = mark.icon;
  return (
    <span className={`answer-mark answer-mark--${type}`}>
      <Icon />
      <span>{mark.label}</span>
    </span>
  );
}

export default function AccountingQuiz() {
  const groupName = useId();
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

  function markFor(optionId) {
    if (result && result.status !== "empty") {
      if (optionId === pageCopy.correctOptionId) {
        return "correct";
      }
      if (optionId === result.selected) {
        return "incorrect";
      }
      return "idle";
    }

    return selected === optionId ? "selected" : "idle";
  }

  const feedbackText =
    result?.status === "empty"
      ? pageCopy.quizChooseFirst
      : result
        ? `${pageCopy.quizFeedback[result.selected] || "Check that answer again."} ${pageCopy.quizExplanation}`
        : "";

  const feedbackClass =
    result?.status === "correct" || result?.status === "incorrect" || result?.status === "empty"
      ? `quiz-feedback quiz-feedback--${result.status}`
      : "quiz-feedback";

  return (
    <section className="quiz-card" id="practice" aria-labelledby="quiz-title">
      <h2 id="quiz-title">{pageCopy.quizTitle}</h2>
      <p className="quiz-intro">{pageCopy.quizIntro}</p>
      <form onSubmit={onSubmit}>
        <fieldset className="quiz-fieldset">
          <legend>{pageCopy.quizQuestion}</legend>
          <div className="quiz-options">
            {pageCopy.quizOptions.map((option) => {
              const mark = markFor(option.id);
              return (
                <label key={option.id} className="quiz-option" data-state={mark}>
                  <input
                    type="radio"
                    name={groupName}
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => {
                      setSelected(option.id);
                      setResult(null);
                    }}
                  />
                  <span className="quiz-option__label">{option.label}</span>
                  <AnswerMark type={mark} />
                </label>
              );
            })}
          </div>
        </fieldset>
        <button type="submit" className="check-button">
          {pageCopy.quizCheckLabel}
        </button>
      </form>
      <p className={feedbackClass} role="status" aria-live="polite" aria-atomic="true">
        {result?.status === "correct" ? <CheckIcon /> : null}
        {result?.status === "incorrect" ? <CrossIcon /> : null}
        {feedbackText ? <span>{feedbackText}</span> : null}
      </p>
    </section>
  );
}
