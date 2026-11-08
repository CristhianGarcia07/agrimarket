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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 border-t-4 border-green-500">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Nuevo Usuario</h2>
        
        {mensaje && <p className="mb-4 text-center font-semibold text-green-600">{mensaje}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nombre completo</label>
            <input type="text" name="nombre" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Correo</label>
            <input type="email" name="correo" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Teléfono</label>
            <input type="text" name="telefono" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Rol</label>
            <select name="rol" onChange={handleChange} className="w-full border p-2 rounded">
              <option value="productor">Productor</option>
              <option value="consumidor">Consumidor</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold">Registrarse</button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/" className="text-green-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}