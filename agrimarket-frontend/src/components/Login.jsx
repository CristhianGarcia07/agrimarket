import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      setMensaje(`¡Bienvenido, ${response.data.usuario.nombre}!`);
      
      // Guardamos los datos del usuario en la memoria del navegador
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      // Aquí va la redirección, justo después de saber que el login fue exitoso
      navigate('/catalog'); 
      
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Iniciar Sesión</h2>
        
        <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Entrar</button>
        {mensaje && <p className="mt-4 text-center text-sm font-semibold text-gray-700">{mensaje}</p>}
        
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-green-600 hover:underline">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}