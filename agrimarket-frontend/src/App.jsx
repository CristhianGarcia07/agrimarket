import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Catalog from './components/Catalog';
import ProducerDashboard from './components/ProducerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/producer" element={<ProducerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;