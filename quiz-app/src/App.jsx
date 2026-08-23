import { useState, useEffect } from 'react';
import TopicSelect from './components/TopicSelect.jsx';
import Quiz from './components/Quiz.jsx';
import Result from './components/Result.jsx';
import OAuth2Redirect from './components/OAuth2Redirect.jsx';
import { createQuiz, getQuiz, submitQuiz } from './api.js';

function getUserFromToken() {
  const token = localStorage.getItem('jwt');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.sub, name: payload.name };
  } catch {
    return null;
  }
}

// App states: 'login' | 'select' | 'loading' | 'quiz' | 'submitting' | 'result'
export default function App() {
  const [stage, setStage] = useState('login');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [quiz, setQuiz] = useState(null); // { id, title, category }
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null); // { score, total }

  // If a token already exists (e.g. page refresh), skip straight past login
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setUser(getUserFromToken());
      if (stage === 'login') setStage('select');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Catch the one-time redirect from Google login before anything else renders
  if (window.location.pathname === '/oauth2/redirect') {
    return (
        <OAuth2Redirect
            onLoginSuccess={() => {
              setUser(getUserFromToken());
              setStage('select');
              window.history.replaceState({}, '', '/');
            }}
        />
    );
  }

  async function handleTopicSelect(topic) {
    setError(null);
    setStage('loading');
    try {
      const title = `${topic.label.replace(/\s+/g, '')}Quiz`;
      const { id } = await createQuiz(title, topic.category);
      const fetchedQuestions = await getQuiz(id);

      if (!fetchedQuestions.length) {
        throw new Error('This quiz has no questions yet. Try a different topic.');
      }

      setQuiz({ id, title, category: topic.category });
      setQuestions(fetchedQuestions);
      setStage('quiz');
    } catch (err) {
      setError(err.message || 'Something went wrong creating the quiz.');
      setStage(err.message?.includes('Session expired') ? 'login' : 'select');
    }
  }

  async function handleQuizFinish(answers) {
    setStage('submitting');
    try {
      const { score, total } = await submitQuiz(quiz.id, answers);
      setResult({ score, total });
      setStage('result');
    } catch (err) {
      setError(err.message || 'Something went wrong submitting the quiz.');
      setStage(err.message?.includes('Session expired') ? 'login' : 'select');
    }
  }

  function handleRestart() {
    setQuiz(null);
    setQuestions([]);
    setResult(null);
    setError(null);
    setStage('select');
  }

  function handleLogout() {
    localStorage.removeItem('jwt');
    setUser(null);
    setStage('login');
  }

  return (
      <div className="app-container">
        {stage !== 'login' && user && (
            <header className="app-header">
              <span>Signed in as {user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </header>
        )}

        {stage === 'login' && (
            <div className="login-container">
              <h1>Quiz App</h1>
              <button
                  onClick={() =>
                      (window.location.href = 'http://localhost:8080/oauth2/authorization/google')
                  }
              >
                Sign in with Google
              </button>
            </div>
        )}

        {(stage === 'select' || stage === 'loading') && (
            <TopicSelect
                onSelect={handleTopicSelect}
                loading={stage === 'loading'}
                error={error}
            />
        )}

        {stage === 'quiz' && (
            <Quiz quiz={quiz} questions={questions} onFinish={handleQuizFinish} />
        )}

        {stage === 'submitting' && <p className="status-text">Submitting your answers...</p>}

        {stage === 'result' && (
            <Result
                quiz={quiz}
                score={result.score}
                total={result.total}
                onRestart={handleRestart}
            />
        )}
      </div>
  );
}