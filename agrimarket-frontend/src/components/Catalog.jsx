import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [consumidorId, setConsumidorId] = useState(null);
  const [usuarioRol, setUsuarioRol] = useState('');
  
  // Estados para el Modal de compra
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 1. Validar sesión y cargar catálogo
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setConsumidorId(usuario.id);
      setUsuarioRol(usuario.rol);
      cargarCatalogo();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const cargarCatalogo = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      setProductos(res.data);
    } catch (error) {
      console.error('Error al cargar el catálogo:', error);
    }
  };

  // 2. Manejar la apertura y cierre del modal
  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad('');
    setObservaciones('');
    setMensaje('');
  };

  const cerrarModal = () => {
    setProductoSeleccionado(null);
  };

  // 3. Enviar la solicitud de compra al backend
  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/requests', {
        consumidor_id: consumidorId,
        producto_id: productoSeleccionado.id,
        cantidad: Number(cantidad),
        observaciones: observaciones
      });
      
      setMensaje('¡Pedido enviado con éxito al productor!');
      setTimeout(() => cerrarModal(), 2000);
    } catch (error) {
      console.error('Error al hacer el pedido:', error);
      setMensaje('Hubo un error al procesar el pedido.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow border-b-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-700">Catálogo AgriMarket</h2>
          <div className="space-x-4">
            {/* Si es productor, botón a su panel. Si es cliente, botón a su historial */}
            {usuarioRol === 'productor' ? (
              <button onClick={() => navigate('/producer')} className="text-blue-600 font-bold hover:underline">
                Volver a mi Panel
              </button>
            ) : (
              <button onClick={() => navigate('/consumer')} className="text-blue-600 font-bold hover:underline">
                Ver mis pedidos
              </button>
            )}
            <button onClick={() => { localStorage.removeItem('usuario'); navigate('/'); }} className="text-red-500 font-bold hover:underline">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {productos.length === 0 ? (
          <p className="text-center text-gray-500 mt-12 bg-white p-8 rounded shadow">No hay productos disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
                <div className="p-4 flex-grow">
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">{p.categoria}</span>
                  <h3 className="font-bold text-xl text-gray-800 mt-2">{p.nombre}</h3>
                  <p className="text-sm text-gray-500">Vendido por: <span className="font-semibold">{p.productor}</span></p>
                  
                  <div className="mt-4 border-t pt-4">
                    <p className="text-green-700 font-black text-xl">${p.precio} <span className="text-sm text-gray-500 font-normal">/ {p.unidad}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Disponible: {p.disponibilidad} Kilos</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <button 
                    onClick={() => abrirModal(p)} 
                    className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition">
                    Hacer Pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL DE COMPRA */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Comprar {productoSeleccionado.nombre}</h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            {mensaje && <p className={`mb-4 text-center font-bold ${mensaje.includes('éxito') ? 'text-green-600' : 'text-red-500'}`}>{mensaje}</p>}

            <form onSubmit={handleSubmitPedido} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">Cantidad deseada</label>
                <input 
                  type="number" 
                  value={cantidad} 
                  onChange={(e) => setCantidad(e.target.value)} 
                  required 
                  min="1"
                  placeholder="Libras"
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Observaciones (Opcional)</label>
                <textarea 
                  value={observaciones} 
                  onChange={(e) => setObservaciones(e.target.value)} 
                  placeholder="Ej: Por favor, que estén bien maduras."
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition">
                Confirmar Pedido
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}