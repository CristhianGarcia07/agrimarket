import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Catalog from './components/Catalog';
import ProducerDashboard from './components/ProducerDashboard';
import ConsumerDashboard from './components/ConsumerDashboard'; // <- Importa el nuevo componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/producer" element={<ProducerDashboard />} />
        <Route path="/consumer" element={<ConsumerDashboard />} /> {/* <- Agrega la ruta */}
      </Routes>
    </Router>
  );
}

export default App;