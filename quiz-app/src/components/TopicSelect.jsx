const TOPICS = [
  { label: 'Core Java', category: 'Java' },
    { label: 'Advance Java', category: 'Advance Java' },
  { label: 'Spring Boot', category: 'Spring Boot' },
  { label: 'Spring Security', category: 'Spring Security' },
    { label: 'Spring JDBC', category: 'Spring JDBC' },
  { label: 'SQL', category: 'SQL' },
  { label: 'AWS', category: 'AWS' },
    { label: 'Docker', category: 'Docker' }
];

export default function TopicSelect({ onSelect, loading, error }) {
  return (
    <div className="topic-select">
      <h1>Test Your Knowledge</h1>
      <p className="subtitle">Pick a topic to start a quiz. Each Quiz consists of 12 questions each. You will be given 30 seconds to answer each question. Each correct question will give you +1 point and each wrong question gives you -1 point.</p>

      <div className="topic-grid">
        {TOPICS.map((t) => (
          <button
            key={t.category}
            className="topic-card"
            onClick={() => onSelect(t)}
            disabled={loading}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="status-text">Creating your quiz...</p>}
      {error && <p className="status-text error-text">{error}</p>}
    </div>
  );
}
