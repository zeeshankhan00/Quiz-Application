import { useState } from 'react';
import TopicSelect from './components/TopicSelect.jsx';
import Quiz from './components/Quiz.jsx';
import Result from './components/Result.jsx';
import { createQuiz, getQuiz, submitQuiz } from './api.js';

// App states: 'select' | 'loading' | 'quiz' | 'submitting' | 'result'
export default function App() {
  const [stage, setStage] = useState('select');
  const [error, setError] = useState(null);

  const [quiz, setQuiz] = useState(null); // { id, title, category }
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null); // { score, total }

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
      setStage('select');
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
      setStage('select');
    }
  }

  function handleRestart() {
    setQuiz(null);
    setQuestions([]);
    setResult(null);
    setError(null);
    setStage('select');
  }

  return (
    <div className="app-container">
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
