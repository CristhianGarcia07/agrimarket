import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Register() {
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '', correo: '', password: '', telefono: '', rol: 'consumidor'
  });
  const [mensaje, setMensaje] = useState('');

  // Función para actualizar el estado cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      setMensaje('¡Registro exitoso! Ya puedes iniciar sesión.');
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Registro AgriMarket</h2>
        
        <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
        <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} className="w-full mb-4 p-2 border rounded" />
        
        <select name="rol" onChange={handleChange} className="w-full mb-6 p-2 border rounded">
          <option value="consumidor">Consumidor</option>
          <option value="productor">Productor</option>
        </select>

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Registrarse</button>
        {mensaje && <p className="mt-4 text-center text-sm font-semibold text-gray-700">{mensaje}</p>}
        <p className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta? <Link to="/" className="text-green-600 hover:underline">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}