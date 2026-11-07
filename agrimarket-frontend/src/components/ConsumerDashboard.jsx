import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function ConsumerDashboard() {
  const navigate = useNavigate();
  const [consumidorNombre, setConsumidorNombre] = useState('');
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setConsumidorNombre(usuario.nombre);
      cargarMisPedidos(usuario.id);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const cargarMisPedidos = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/requests/consumidor/${id}`);
      setPedidos(res.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* ================= ENCABEZADO DEL CONSUMIDOR (ESTILO PREMIUM) ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-lg border-l-8 border-blue-600">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-blue-100 p-4 rounded-full shadow-inner">
              <span className="text-3xl" title="Consumidor">🛒</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mis Compras</h2>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 mr-2">Cliente:</span>
                <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-bold text-sm border border-blue-200 shadow-sm">
                  {consumidorNombre}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link to="/catalog" className="flex items-center px-5 py-2.5 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-100 hover:shadow transition">
              🛍️ Ir al Catálogo
            </Link>
            <button 
              onClick={() => { localStorage.removeItem('usuario'); navigate('/'); }} 
              className="flex items-center px-5 py-2.5 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 hover:shadow transition">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* TABLA DE HISTORIAL MEJORADA */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Pedidos Realizados</h3>
          
          {pedidos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aún no has realizado ninguna compra.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 border-b">ID</th>
                    <th className="p-3 border-b">Producto</th>
                    <th className="p-3 border-b">Cantidad Solicitada</th>
                    <th className="p-3 border-b">Total a Pagar</th>
                    <th className="p-3 border-b">Productor</th>
                    <th className="p-3 border-b">Contacto</th>
                    <th className="p-3 border-b">Tus Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 border-b">
                      <td className="p-3 text-gray-500 font-mono">#{p.id}</td>
                      <td className="p-3 font-bold text-gray-800">{p.producto}</td>
                      <td className="p-3 text-blue-700 font-bold">{p.cantidad} Libras</td>
                      <td className="p-3 text-green-700 font-black">${p.cantidad * p.precio}</td>
                      <td className="p-3">{p.productor}</td>
                      <td className="p-3 font-semibold text-gray-600">📞 {p.telefono_productor}</td>
                      <td className="p-3 text-sm text-gray-500 italic">{p.observaciones || 'Sin observaciones'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}