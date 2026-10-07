import { useState } from 'react';
import { DIFFICULTIES } from '../topics.js';
import { buildQuestionPayload } from '../questionForm.js';

export default function QuestionForm({ category, initialQuestion, saving, onSave, onCancel }) {
  const options = [1, 2, 3, 4].map(i => initialQuestion?.[`option${i}`] || '');
  const rightIndex = initialQuestion ? options.indexOf(initialQuestion.rightAnswer) : -1;
  const [draft, setDraft] = useState({ category,
    difficulty: DIFFICULTIES.find(d => d.toLowerCase() === initialQuestion?.difficulty?.toLowerCase()) || 'Easy',
    question: initialQuestion?.question || '', option1: options[0], option2: options[1],
    option3: options[2], option4: options[3], correctOption: rightIndex >= 0 ? String(rightIndex) : '',
  });
  const [error, setError] = useState('');
  function change(event) { setDraft(d => ({ ...d, [event.target.name]: event.target.value })); setError(''); }
  function submit(event) {
    event.preventDefault();
    try { const payload = buildQuestionPayload(draft); setError(''); onSave(payload); }
    catch (err) { setError(err.message); }
  }
  return (
    <form className="admin-panel question-form" onSubmit={submit}>
      <h2>{initialQuestion ? `Edit question #${initialQuestion.id}` : 'Create a question'}</h2>
      <p className="admin-muted">Topic: {category}</p>
      <fieldset disabled={saving}>
        <label htmlFor="question-difficulty">Difficulty</label>
        <select id="question-difficulty" name="difficulty" value={draft.difficulty} onChange={change}>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        <label htmlFor="question-text">Question</label>
        <textarea id="question-text" name="question" rows={5} maxLength={10000} required
          value={draft.question} onChange={change} />
        {[1, 2, 3, 4].map(i => <div key={i}>
          <label htmlFor={`option-${i}`}>Option {i}</label>
          <input id={`option-${i}`} name={`option${i}`} maxLength={255} required
            value={draft[`option${i}`]} onChange={change} />
        </div>)}
        <label htmlFor="correct-option">Correct answer</label>
        <select id="correct-option" name="correctOption" value={draft.correctOption} required onChange={change}>
          <option value="">Choose an option</option>
          {[1, 2, 3, 4].map((i) => <option key={i} value={String(i - 1)} disabled={!draft[`option${i}`].trim()}>
            Option {i}: {draft[`option${i}`] || '(empty)'}
          </option>)}
        </select>
        {error && <p className="error-text" role="alert">{error}</p>}
        <div className="admin-actions">
          <button className="admin-primary" type="submit">{saving ? 'Saving…' : initialQuestion ? 'Save changes' : 'Create question'}</button>
          {initialQuestion && <button className="admin-secondary" type="button" onClick={onCancel}>Cancel edit</button>}
        </div>
      </fieldset>
    </form>
  );
}
