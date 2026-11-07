import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Catalog() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
      }
    };
    fetchProductos();
  }, []);

  const handleSolicitarCompra = async (productoId) => {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
      alert('Debes iniciar sesión para poder comprar.');
      return;
    }
    
    const usuario = JSON.parse(usuarioStr);
    const cantidad = prompt('¿Cuántas unidades deseas solicitar?');
    
    if (!cantidad || cantidad <= 0) return;

    try {
      await axios.post('http://localhost:3000/api/requests', {
        consumidor_id: usuario.id,
        producto_id: productoId,
        cantidad: parseInt(cantidad),
        observaciones: "Solicitud generada desde el catálogo web"
      });
      alert('¡Solicitud enviada exitosamente al productor!');
    } catch (error) {
      alert('Hubo un error al generar la solicitud.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Catálogo AgriMarket</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {productos.map(producto => (
          <div key={producto.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800">{producto.nombre}</h3>
            <p className="text-gray-600 my-2">{producto.descripcion}</p>
            <p className="text-2xl font-bold text-green-600">${producto.precio} <span className="text-sm text-gray-500">x {producto.unidad}</span></p>
            <p className="text-sm text-gray-500 mt-2">🧑‍🌾 Productor: {producto.productor}</p>
            <button 
              onClick={() => handleSolicitarCompra(producto.id)}
              className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Solicitar Compra
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}