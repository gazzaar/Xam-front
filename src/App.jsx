import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import Landing from './components/Landing';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login initialMode="login" />} />
        <Route path="/signup" element={<Login initialMode="signup" />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
