import { TOPICS, DIFFICULTIES } from './topics.js';

export function buildQuestionPayload(draft) {
  if (!TOPICS.some(topic => topic.category === draft.category)) throw new Error('Choose a valid topic.');
  if (!DIFFICULTIES.includes(draft.difficulty)) throw new Error('Choose a valid difficulty.');
  const text = (value, label, max) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) throw new Error(`${label} is required.`);
    if (trimmed.length > max) throw new Error(`${label} is too long.`);
    return trimmed;
  };
  const question = text(draft.question, 'Question', 10000);
  const options = [1, 2, 3, 4].map(i => text(draft[`option${i}`], `Option ${i}`, 255));
  if (new Set(options).size !== 4) throw new Error('The four options must be distinct.');
  if (!/^[0-3]$/.test(String(draft.correctOption))) throw new Error('Select the correct answer.');
  return { category: draft.category, difficulty: draft.difficulty, question,
    option1: options[0], option2: options[1], option3: options[2], option4: options[3],
    rightAnswer: options[Number(draft.correctOption)] };
}
