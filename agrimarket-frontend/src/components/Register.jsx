import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    rol: 'productor' // Lo dejamos por defecto en productor para tu prueba
  });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/register', formData);
      setMensaje('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => navigate('/'), 2000); // Lo manda al login después de 2 segundos
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Hubo un error al registrar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
          Nuevo Usuario
        </h2>
        
        {/* Muestra tu variable de error si existe */}
        {error && (
          <p className="text-center text-green-700 text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 text-sm">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              onChange={handleChange}
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 text-sm">Correo</label>
            <input
              type="email"
              name="correo"
              onChange={handleChange}
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 text-sm">Contraseña</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 text-sm">Teléfono</label>
            <input
              type="text"
              name="telefono"
              onChange={handleChange}
              className="w-full bg-blue-50 border border-gray-200 rounded p-2 focus:outline-none focus:border-green-600"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-1 text-sm">Rol</label>
            <select
              name="rol"
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none focus:border-green-600"
            >
              <option value="productor">Productor</option>
              <option value="consumidor">Consumidor</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold transition-colors mb-2"
          >
            Registrarse
          </button>
        </form>

        {/* ENLACE COMPLETO AL LOGIN */}
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-green-600 hover:underline font-bold">
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}