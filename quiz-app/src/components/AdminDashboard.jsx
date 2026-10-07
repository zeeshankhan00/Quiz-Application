import { useEffect, useRef, useState } from 'react';
import { TOPICS } from '../topics.js';
import QuestionForm from './QuestionForm.jsx';
import { ADMIN_MUTATIONS_ENABLED, getAdminQuestions, createAdminQuestion,
  updateAdminQuestion, deleteAdminQuestion } from '../api.js';

export default function AdminDashboard({ onSessionExpired }) {
  const [category, setCategory] = useState(TOPICS[0].category);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [formVersion, setFormVersion] = useState(0);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(''); setQuestions([]);
    getAdminQuestions(category, { signal: controller.signal }).then(data => {
      if (active) setQuestions(data);
    }).catch(err => {
      if (!active || err.name === 'AbortError') return;
      if (err.status === 401) onSessionExpired(err.message);
      else setError(err.message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [category, refresh, onSessionExpired]);

  function handleError(err) {
    if (err.status === 401) onSessionExpired(err.message);
    else setError(err.message);
  }
  async function save(payload) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (editing) await updateAdminQuestion(editing.id, payload);
      else await createAdminQuestion(payload);
      if (!mounted.current) return;
      setNotice(editing ? 'Question updated.' : 'Question created.');
      setEditing(null); setFormVersion(v => v + 1); setRefresh(v => v + 1);
    } catch (err) { if (mounted.current) handleError(err); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function remove(question) {
    if (busy || !window.confirm(`Delete question #${question.id}?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await deleteAdminQuestion(question.id);
      if (!mounted.current) return;
      setNotice('Question deleted.');
      if (editing?.id === question.id) { setEditing(null); setFormVersion(v => v + 1); }
      setRefresh(v => v + 1);
    } catch (err) { if (mounted.current) handleError(err); }
    finally { if (mounted.current) setBusy(false); }
  }
  function changeCategory(event) {
    setCategory(event.target.value); setEditing(null); setNotice(''); setFormVersion(v => v + 1);
  }
  return <section className="admin-dashboard">
    <div className="admin-heading"><div><h1>Question management</h1><p className="admin-muted">Manage your question bank by topic.</p></div>
      <label>Topic<select aria-label="Question topic" value={category} onChange={changeCategory} disabled={busy}>
        {TOPICS.map(t => <option key={t.category} value={t.category}>{t.label}</option>)}
      </select></label>
    </div>
    {error && <p className="admin-alert error-text" role="alert">{error}</p>}
    {notice && <p className="admin-alert success-text" role="status">{notice}</p>}
    <div className="admin-grid">
      <QuestionForm key={`${category}-${editing?.id || 'new'}-${formVersion}`} category={category}
        initialQuestion={editing} saving={busy} onSave={save} onCancel={() => setEditing(null)} />
      <div className="admin-panel question-list">
        <div className="admin-list-heading"><h2>Questions {!loading && `(${questions.length})`}</h2>
          <button className="admin-secondary" disabled={busy || loading} onClick={() => setRefresh(v => v + 1)}>Refresh</button>
        </div>
        {loading ? <p role="status">Loading questions…</p>
          : !questions.length ? <p className="admin-muted">No questions in this topic yet.</p>
          : questions.map(q => <article className="admin-question" key={q.id}>
            <div className="admin-question-meta"><span>#{q.id}</span><span className="difficulty-badge">{q.difficulty}</span></div>
            <h3>{q.question}</h3>
            <ol>{[q.option1, q.option2, q.option3, q.option4].map((option, index) =>
              <li key={index} className={option === q.rightAnswer ? 'correct-answer' : ''}>{option}
                {option === q.rightAnswer && <span> — Correct answer</span>}</li>)}</ol>
            <div className="admin-actions">
              <button className="admin-secondary" disabled={busy || !ADMIN_MUTATIONS_ENABLED}
                title={!ADMIN_MUTATIONS_ENABLED ? 'Editing is currently unavailable' : undefined}
                onClick={() => { setEditing(q); setError(''); setNotice(''); }}>Edit</button>
              <button className="admin-danger" disabled={busy || !ADMIN_MUTATIONS_ENABLED}
                title={!ADMIN_MUTATIONS_ENABLED ? 'Deletion is currently unavailable' : undefined}
                onClick={() => remove(q)}>Delete</button>
            </div>
          </article>)}
      </div>
    </div>
  </section>;
}
