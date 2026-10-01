import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageCopy } from "../site.config.js";
import { pickQuizQuestion } from "./quiz.js";

describe("pickQuizQuestion", () => {
  it("does not repeat the question that is already on screen", () => {
    const next = pickQuizQuestion(pageCopy.quizQuestions, "equipment-cash", () => 0);
    assert.notEqual(next.id, "equipment-cash");
    assert.equal(pageCopy.quizQuestions.some((question) => question.id === next.id), true);
  });

  it("returns the only question when the list has one item", () => {
    const only = pageCopy.quizQuestions[0];
    assert.equal(pickQuizQuestion([only], only.id, () => 0.9).id, only.id);
  });
});
