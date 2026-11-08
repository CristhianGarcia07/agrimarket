import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const [productorId, setProductorId] = useState(null);
  const [productorNombre, setProductorNombre] = useState('');
  
  const [productos, setProductos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  
  const [tabActiva, setTabActiva] = useState('inventario');
  const [vista, setVista] = useState('lista'); 
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', unidad: 'Libra', disponibilidad: '', imagen: '', categoria_id: 1
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setProductorId(usuario.id);
      setProductorNombre(usuario.nombre);
      cargarMisProductos(usuario.nombre);
      cargarMisSolicitudes(usuario.id);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const cargarMisProductos = async (nombreProductor) => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      const misProductos = res.data.filter(p => p.productor === nombreProductor);
      setProductos(misProductos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarMisSolicitudes = async (idProductor) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/requests/productor/${idProductor}`);
      setSolicitudes(res.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setFormData({ nombre: '', descripcion: '', precio: '', unidad: 'Libra', disponibilidad: '', imagen: '', categoria_id: 1 });
    setMensaje('');
    setVista('formulario');
  };

  const abrirFormularioEdicion = (producto) => {
    setModoEdicion(true);
    setProductoEditandoId(producto.id);
    setFormData({
      nombre: producto.nombre, descripcion: producto.descripcion, precio: producto.precio, 
      unidad: producto.unidad, disponibilidad: producto.disponibilidad, imagen: producto.imagen || '', categoria_id: 1
    });
    setMensaje('');
    setVista('formulario');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await axios.put(`http://localhost:3000/api/products/${productoEditandoId}`, {
          ...formData, precio: Number(formData.precio), disponibilidad: Number(formData.disponibilidad)
        });
        setMensaje('¡Producto actualizado exitosamente!');
      } else {
        await axios.post('http://localhost:3000/api/products', {
          ...formData, precio: Number(formData.precio), disponibilidad: Number(formData.disponibilidad), productor_id: productorId 
        });
        setMensaje('¡Producto publicado exitosamente!');
      }
      cargarMisProductos(productorNombre); 
      setTimeout(() => setVista('lista'), 1500); 
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje('Hubo un error al guardar el producto.');
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/products/${id}`);
        cargarMisProductos(productorNombre);
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('No se pudo eliminar el producto. Es posible que tenga pedidos asociados.');
      }
    }
  };

  const cambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:3000/api/requests/${id}/status`, { estado: nuevoEstado });
      cargarMisSolicitudes(productorId);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('No se pudo actualizar el estado de la solicitud.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* ================= ENCABEZADO DEL PRODUCTOR (ESTILO PREMIUM) ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-lg border-l-8 border-green-600">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-green-100 p-4 rounded-full shadow-inner">
              <span className="text-3xl" title="Productor">👨‍🌾</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Panel de Control</h2>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 mr-2">Productor:</span>
                <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full font-bold text-sm border border-green-200 shadow-sm">
                  {productorNombre}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/catalog')} 
              className="flex items-center px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 hover:bg-blue-100 hover:shadow transition">
              👁️ Ver Catálogo
            </button>
            <button 
              onClick={() => { localStorage.removeItem('usuario'); navigate('/'); }} 
              className="flex items-center px-5 py-2.5 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 hover:shadow transition">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN (TABS) */}
        <div className="flex space-x-4 mb-8 bg-white p-4 rounded-lg shadow">
          <button 
            onClick={() => { setTabActiva('inventario'); setVista('lista'); }} 
            className={`px-6 py-2 font-bold rounded transition ${tabActiva === 'inventario' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'}`}>
            📦 Mi Inventario
          </button>
          <button 
            onClick={() => setTabActiva('pedidos')} 
            className={`px-6 py-2 font-bold rounded transition ${tabActiva === 'pedidos' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'}`}>
            🛒 Pedidos Recibidos ({solicitudes.length})
          </button>
        </div>

        {/* ================= PESTAÑA: INVENTARIO ================= */}
        {tabActiva === 'inventario' && vista === 'lista' && (
          <>
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-green-700">Productos Publicados</h2>
              <button onClick={abrirFormularioNuevo} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">
                + Nuevo Producto
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-green-500 flex flex-col">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>}
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-xl text-gray-800">{p.nombre}</h3>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-green-700 font-black text-lg">${p.precio} <span className="text-sm font-normal">/ {p.unidad}</span></p>
                      <p className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{p.disponibilidad} Kilos Disp.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t flex gap-2">
                    <button 
                      onClick={() => abrirFormularioEdicion(p)} 
                      className="w-1/2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarProducto(p.id, p.nombre)} 
                      className="w-1/2 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= SUBVISTA: FORMULARIO (Crear/Editar) ================= */}
        {tabActiva === 'inventario' && vista === 'formulario' && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-700">{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => { setVista('lista'); setMensaje(''); }} className="text-gray-500 hover:text-red-500 font-bold">X Cancelar</button>
            </div>
            {mensaje && <p className="mb-4 text-center font-semibold text-green-600">{mensaje}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block font-medium">Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full mt-1 p-2 border rounded" /></div>
              <div><label className="block font-medium">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required className="w-full mt-1 p-2 border rounded" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block font-medium">Precio ($)</label><input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="w-full mt-1 p-2 border rounded" /></div>
                <div><label className="block font-medium">Unidad</label><input type="text" name="unidad" value={formData.unidad} onChange={handleChange} required className="w-full mt-1 p-2 border rounded bg-gray-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block font-medium">Inventario (Kilos)</label><input type="number" name="disponibilidad" value={formData.disponibilidad} onChange={handleChange} required className="w-full mt-1 p-2 border rounded" /></div>
                <div><label className="block font-medium">URL Imagen</label><input type="text" name="imagen" value={formData.imagen} onChange={handleChange} className="w-full mt-1 p-2 border rounded text-sm" /></div>
              </div>
              <button type="submit" className="w-full text-white p-3 rounded font-bold bg-green-600 hover:bg-green-700">Guardar Producto</button>
            </form>
          </div>
        )}

        {/* ================= PESTAÑA: PEDIDOS RECIBIDOS ================= */}
        {tabActiva === 'pedidos' && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Pedidos Recibidos</h2>
            {solicitudes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aún no tienes pedidos de clientes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 border-b">ID</th>
                      <th className="p-3 border-b">Producto</th>
                      <th className="p-3 border-b">Cantidad</th>
                      <th className="p-3 border-b">Total Venta</th>
                      <th className="p-3 border-b">Cliente</th>
                      <th className="p-3 border-b">Contacto</th>
                      <th className="p-3 border-b">Estado</th>
                      <th className="p-3 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 border-b">
                        <td className="p-3 text-gray-500">#{s.id}</td>
                        <td className="p-3 font-bold text-gray-800">{s.producto}</td>
                        <td className="p-3 text-green-700 font-bold">{s.cantidad} Libras</td>
                        <td className="p-3 text-green-700 font-black">${s.cantidad * s.precio}</td>
                        <td className="p-3">{s.cliente}</td>
                        <td className="p-3 text-sm">
                          <p>📞 {s.telefono_cliente}</p>
                          <p className="text-gray-500">{s.correo}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            s.estado === 'Aceptado' ? 'bg-green-100 text-green-800' :
                            s.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {s.estado || 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-3 space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => cambiarEstadoSolicitud(s.id, 'Aceptado')} 
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition">
                            Aceptar
                          </button>
                          <button 
                            onClick={() => cambiarEstadoSolicitud(s.id, 'Rechazado')} 
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition">
                            Rechazar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}