import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Header from './components/Header';
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/' element={<Header />} />
      </Routes>
    </Router>
  );
}

export default App;
