/** Picks a practice question, skipping the current one when another is available. */
export function pickQuizQuestion(questions, exceptId, random = Math.random) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const pool = questions.filter((question) => question && question.id !== exceptId);
  const source = pool.length > 0 ? pool : questions;
  const index = Math.min(source.length - 1, Math.floor(random() * source.length));
  return source[index];
}
