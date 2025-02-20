import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
