import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizAttempt from './pages/QuizAttempt';
import Results from './pages/Results';
import Progress from './pages/Progress';
import CreateQuiz from './pages/CreateQuiz';
// ...inside <Routes>:
<Route path="/create" element={<CreateQuiz />} />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz/:id" element={<QuizAttempt />} />
        <Route path="/results/:attemptId" element={<Results />} />
        <Route path="/progress/:userId" element={<Progress />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;