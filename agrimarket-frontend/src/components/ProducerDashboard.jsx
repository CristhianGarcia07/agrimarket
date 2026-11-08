import React, { useState, useEffect } from 'react';

const ProducerDashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Al cargar la pantalla, obtenemos el usuario logueado y sus pedidos
  useEffect(() => {
    const userStored = JSON.parse(localStorage.getItem('usuario'));
    if (userStored) {
      setUsuario(userStored);
      cargarPedidos(userStored.id);
    }
  }, []);

  const cargarPedidos = async (productorId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/requests/productor/${productorId}`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  // Función para Aceptar o Rechazar el pedido
  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:3000/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        // Actualizamos la tabla visualmente sin tener que recargar la página
        setPedidos((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
          )
        );
      } else {
        alert('No se pudo actualizar el estado de la solicitud.');
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Cargando panel...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Tarjeta de Encabezado */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-600 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <span className="text-2xl">👨‍🌾</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500 text-sm">
              Productor: <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">{usuario.nombre}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/'} // O la ruta de tu catálogo
            className="text-gray-600 font-medium hover:text-green-600 flex items-center gap-2"
          >
            👁 Ver Catálogo
          </button>
          <button 
            onClick={handleLogout}
            className="text-red-500 font-medium hover:text-red-700 flex items-center gap-2 bg-red-50 px-4 py-2 rounded-md"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="max-w-6xl mx-auto flex gap-4 mb-6 bg-white p-2 rounded-lg shadow-sm">
        <button className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-md">
          📦 Mi Inventario
        </button>
        <button className="px-6 py-2 bg-green-700 text-white font-medium rounded-md shadow-sm">
          🧾 Pedidos Recibidos ({pedidos.length})
        </button>
      </div>

      {/* Tabla de Pedidos */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border-t-4 border-green-600 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-green-800">Pedidos Recibidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Cantidad</th>
                <th className="p-4 font-semibold">Total Venta</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-500 text-sm">#{pedido.id}</td>
                    <td className="p-4 font-medium text-gray-800">{pedido.producto}</td>
                    <td className="p-4 text-green-700 font-medium">
                      {pedido.cantidad} {pedido.unidad}
                    </td>
                    <td className="p-4 font-bold text-green-700">
                      ${(pedido.cantidad * pedido.precio).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-700">{pedido.cliente}</td>
                    <td className="p-4 text-sm text-gray-500">
                      📞 {pedido.telefono_cliente} <br />
                      <span className="text-xs">{pedido.correo}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pedido.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        pedido.estado === 'Aceptado' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {pedido.estado === 'Pendiente' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(pedido.id, 'Aceptado')}
                            className="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800 transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleStatusChange(pedido.id, 'Rechazado')}
                            className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800 transition-colors"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium italic">
                          Gestión finalizada
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Aún no tienes pedidos recibidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;