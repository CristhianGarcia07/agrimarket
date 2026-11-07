import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', credenciales);
      const usuarioLogueado = res.data.usuario;
      
      // Guardamos el usuario en el almacenamiento del navegador
      localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
      
      // Redirigimos dependiendo del rol
      if (usuarioLogueado.rol === 'productor') {
        navigate('/producer');
      } else if (usuarioLogueado.rol === 'consumidor') {
        navigate('/catalog');
      } else {
        // Por si acaso hay algún rol no definido
        navigate('/'); 
      }
      
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">AgriMarket - Ingreso</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Correo</label>
            <input type="email" name="correo" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Entrar</button>
        </form>
      </div>
    </div>
  );
}