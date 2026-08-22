const TOPICS = [
  { label: 'Core Java', category: 'Java' },
  { label: 'Spring Boot', category: 'SpringBoot' },
  { label: 'Python', category: 'Python' },
  { label: 'SQL', category: 'SQL' },
  { label: 'AWS', category: 'AWS' },
];

export default function TopicSelect({ onSelect, loading, error }) {
  return (
    <div className="topic-select">
      <h1>Test Your Knowledge</h1>
      <p className="subtitle">Pick a topic to start a quiz</p>

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
