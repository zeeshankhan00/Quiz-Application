import { TOPICS } from '../topics.js';

export default function TopicSelect({ onSelect, loading, error }) {
  return <div className="topic-select">
    <h1>Test Your Knowledge</h1>
    <p className="subtitle">Pick a topic to start a quiz. You have 30 seconds per question. A correct answer earns +1 point and a wrong or unanswered question earns −1 point.</p>
    <div className="topic-grid">{TOPICS.map(t => <button key={t.category} className="topic-card"
      onClick={() => onSelect(t)} disabled={loading}>{t.label}</button>)}</div>
    {loading && <p className="status-text">Creating your quiz…</p>}
    {error && <p className="status-text error-text" role="alert">{error}</p>}
  </div>;
}
