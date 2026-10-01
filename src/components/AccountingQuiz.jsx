import { useId, useState } from "react";
import { pickQuizQuestion } from "../lib/quiz.js";
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
  const [question, setQuestion] = useState(() => pickQuizQuestion(pageCopy.quizQuestions));
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    setNotice("");
    if (!selected) {
      setResult({ status: "empty" });
      return;
    }

    const correct = selected === question.correctOptionId;
    setResult({ status: correct ? "correct" : "incorrect", selected });
  }

  function showAnother() {
    setQuestion(pickQuizQuestion(pageCopy.quizQuestions, question.id));
    setSelected("");
    setResult(null);
    setNotice("Next question.");
  }

  function markFor(optionId) {
    if (result && result.status !== "empty") {
      if (optionId === question.correctOptionId) {
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
        ? `${question.feedback[result.selected] || "Check that answer again."} ${question.explanation}`
        : notice;

  const feedbackClass =
    result?.status === "correct" || result?.status === "incorrect" || result?.status === "empty"
      ? `quiz-feedback quiz-feedback--${result.status}`
      : "quiz-feedback";

  return (
    <section className="quiz-card" id="practice" aria-labelledby="quiz-title">
      <h2 id="quiz-title">{pageCopy.quizTitle}</h2>
      <p className="quiz-intro">{pageCopy.quizIntro}</p>
      <form onSubmit={onSubmit}>
        <fieldset className="quiz-fieldset" key={question.id}>
          <legend>{question.question}</legend>
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
                      setNotice("");
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
        {pageCopy.quizQuestions.length > 1 ? (
          <button type="button" className="quiz-next" onClick={showAnother}>
            {pageCopy.quizAnotherLabel}
          </button>
        ) : null}
      </form>
      <p className={feedbackClass} role="status" aria-live="polite" aria-atomic="true">
        {result?.status === "correct" ? <CheckIcon /> : null}
        {result?.status === "incorrect" ? <CrossIcon /> : null}
        {feedbackText ? <span>{feedbackText}</span> : null}
      </p>
    </section>
  );
}
