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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
          AgriMarket - Ingreso
        </h2>
        
        {/* Muestra tu variable de error si existe */}
        {error && (
          <p className="text-center text-red-500 text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 text-sm">Correo</label>
            <input
              type="email"
              name="correo"
              onChange={handleChange} // O tu función de estado correspondiente
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-1 text-sm">Contraseña</label>
            <input
              type="password"
              name="password"
              onChange={handleChange} // O tu función de estado correspondiente
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold transition-colors"
          >
            Entrar
          </button>
        </form>

        {/* ENLACE COMPLETO AL REGISTRO */}
        <div className="mt-6 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-green-600 hover:underline font-bold">
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}