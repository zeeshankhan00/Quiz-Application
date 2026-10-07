import { useCallback, useEffect, useRef, useState } from 'react';
import TopicSelect from './components/TopicSelect.jsx';
import Quiz from './components/Quiz.jsx';
import Result from './components/Result.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { API_BASE_URL, createQuiz, getQuiz, submitQuiz, getCurrentUser } from './api.js';
import { beginGoogleLogin, clearSession, getStoredUser } from './auth.js';

export default function App({ initialError = null }) {
  const [user, setUser] = useState(getStoredUser);
  const [stage, setStage] = useState(() => getStoredUser() ? 'checking' : 'login');
  const [error, setError] = useState(initialError);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const sessionEpoch = useRef(0);

  const logout = useCallback((message = null) => {
    sessionEpoch.current += 1; clearSession();
    setUser(null); setQuiz(null); setQuestions([]); setResult(null);
    setError(message); setStage('login');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;
    const controller = new AbortController();
    const epoch = sessionEpoch.current;
    let active = true;
    getCurrentUser({ signal: controller.signal }).then(verified => {
      if (!active || epoch !== sessionEpoch.current) return;
      if (verified?.email !== stored.email || !['USER', 'ADMIN'].includes(verified?.role))
        throw new Error('Invalid account response. Please sign in again.');
      const intent = sessionStorage.getItem('loginIntent');
      sessionStorage.removeItem('loginIntent');
      setUser({ ...stored, ...verified });
      setStage(intent === 'admin' ? verified.role === 'ADMIN' ? 'admin' : 'denied' : 'select');
    }).catch(err => {
      if (active && epoch === sessionEpoch.current && err.name !== 'AbortError') logout(err.message);
    });
    return () => { active = false; controller.abort(); };
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => logout('Session expired. Please sign in again.'),
      Math.min(Math.max(user.exp * 1000 - Date.now(), 0), 2147483647));
    return () => clearTimeout(timer);
  }, [user, logout]);

  function resetQuiz() {
    setQuiz(null); setQuestions([]); setResult(null); setError(null); setStage('select');
  }
  function handleApiError(err) {
    if (err.status === 401) logout(err.message);
    else { setError(err.message); setStage('select'); }
  }
  async function handleTopicSelect(topic) {
    const epoch = sessionEpoch.current;
    setError(null); setStage('loading');
    try {
      const title = `${topic.label.replace(/\s+/g, '')}Quiz`;
      const { id } = await createQuiz(title, topic.category);
      if (epoch !== sessionEpoch.current) return;
      const fetched = await getQuiz(id);
      if (epoch !== sessionEpoch.current) return;
      if (!fetched.length) throw new Error('This quiz has no questions yet. Try a different topic.');
      setQuiz({ id, title, category: topic.category }); setQuestions(fetched); setStage('quiz');
    } catch (err) { if (epoch === sessionEpoch.current) handleApiError(err); }
  }
  async function handleQuizFinish(answers) {
    const epoch = sessionEpoch.current;
    setStage('submitting');
    try {
      const response = await submitQuiz(quiz.id, answers);
      if (epoch !== sessionEpoch.current) return;
      setResult(response); setStage('result');
    } catch (err) { if (epoch === sessionEpoch.current) handleApiError(err); }
  }
  const canNavigate = ['select', 'result', 'admin', 'denied'].includes(stage);
  return <div className="app-container">
    <button className="theme-toggle-button" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      aria-label="Toggle dark mode">{theme === 'light' ? '🌙' : '☀️'}</button>
    {user && stage !== 'login' && stage !== 'checking' && <header className={`app-header ${stage === 'admin' ? 'admin-header' : ''}`}>
      <span>Signed in as {user.name}{user.role === 'ADMIN' && <span className="admin-role">Admin</span>}</span>
      <div className="header-actions">
        {user.role === 'ADMIN' && canNavigate && <button onClick={() => {
          setError(null); if (stage === 'admin') resetQuiz(); else setStage('admin');
        }}>{stage === 'admin' ? 'Take a quiz' : 'Manage questions'}</button>}
        <button onClick={() => logout()}>Logout</button>
      </div>
    </header>}
    {stage === 'login' && <div className="login-container">
      <h1>Quiz App</h1><p className="admin-muted">Learn, practice, and test your knowledge.</p>
      <div className="login-actions">
        <button onClick={() => beginGoogleLogin(API_BASE_URL, 'user')}>Sign in with Google</button>
        <button className="admin-login-button" onClick={() => beginGoogleLogin(API_BASE_URL, 'admin')}>Sign in as Admin</button>
      </div>
      <p className="admin-muted">Admin access is available to approved accounts.</p>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>}
    {stage === 'checking' && <p className="status-text" role="status">Checking your account…</p>}
    {stage === 'denied' && <div className="login-container">
      <h1>Admin access unavailable</h1><p>Your account does not have admin access.</p>
      <div className="login-actions">
        <button onClick={() => setStage('select')}>Continue to quizzes</button>
        <button className="admin-login-button" onClick={() => beginGoogleLogin(API_BASE_URL, 'admin')}>Use another Google account</button>
      </div>
    </div>}
    {stage === 'admin' && user?.role === 'ADMIN' && <AdminDashboard onSessionExpired={logout} />}
    {(stage === 'select' || stage === 'loading') && <TopicSelect onSelect={handleTopicSelect} loading={stage === 'loading'} error={error} />}
    {stage === 'quiz' && <Quiz quiz={quiz} questions={questions} onFinish={handleQuizFinish} onGiveUp={resetQuiz} />}
    {stage === 'submitting' && <p className="status-text">Submitting your answers…</p>}
    {stage === 'result' && <Result quiz={quiz} score={result.score} total={result.total}
      questionResults={result.questionResults} onRestart={resetQuiz} />}
  </div>;
}
