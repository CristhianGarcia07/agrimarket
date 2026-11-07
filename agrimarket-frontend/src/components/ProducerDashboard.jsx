import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const [productorId, setProductorId] = useState(null);
  const [productorNombre, setProductorNombre] = useState('');
  const [productos, setProductos] = useState([]);
  
  // Control de vistas: 'lista' o 'formulario'
  const [vista, setVista] = useState('lista'); 
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', 
    descripcion: '', 
    precio: '', 
    unidad: 'Libra', // Cambiado a Libra por defecto
    disponibilidad: '', 
    imagen: '', 
    categoria_id: 1
  });

  // 1. Cargar sesión al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setProductorId(usuario.id);
      setProductorNombre(usuario.nombre);
      cargarMisProductos(usuario.nombre);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 2. Obtener solo los productos de este productor
  const cargarMisProductos = async (nombreProductor) => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      const misProductos = res.data.filter(p => p.productor === nombreProductor);
      setProductos(misProductos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Preparar el formulario para crear uno nuevo
  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setFormData({ nombre: '', descripcion: '', precio: '', unidad: 'Libra', disponibilidad: '', imagen: '', categoria_id: 1 });
    setMensaje('');
    setVista('formulario');
  };

  // 4. Preparar el formulario con los datos del producto a editar
  const abrirFormularioEdicion = (producto) => {
    setModoEdicion(true);
    setProductoEditandoId(producto.id);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      unidad: producto.unidad, // Mantendrá "Libra"
      disponibilidad: producto.disponibilidad,
      imagen: producto.imagen || '',
      categoria_id: 1
    });
    setMensaje('');
    setVista('formulario');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        // Ejecuta la actualización (PUT)
        await axios.put(`http://localhost:3000/api/products/${productoEditandoId}`, {
          ...formData,
          precio: Number(formData.precio),
          disponibilidad: Number(formData.disponibilidad)
        });
        setMensaje('¡Producto actualizado exitosamente!');
      } else {
        // Crea un nuevo producto (POST)
        await axios.post('http://localhost:3000/api/products', {
          ...formData,
          precio: Number(formData.precio),
          disponibilidad: Number(formData.disponibilidad),
          productor_id: productorId 
        });
        setMensaje('¡Producto publicado exitosamente!');
      }
      
      // Recargar la lista y volver a la vista principal
      cargarMisProductos(productorNombre); 
      setTimeout(() => setVista('lista'), 1500); 

    } catch (error) {
      console.error('Error al guardar producto:', error);
      setMensaje('Hubo un error al guardar el producto.');
    }
  };

  // ================= VISTA DE LISTA =================
  if (vista === 'lista') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-green-700">Mi Inventario ({productos.length})</h2>
            <button 
              onClick={abrirFormularioNuevo} 
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center shadow-md transition">
              <span className="text-2xl mr-2">+</span> Publicar Producto
            </button>
          </div>

          {productos.length === 0 ? (
            <div className="text-center text-gray-500 mt-12 bg-white p-8 rounded-lg shadow">
              <p className="text-lg">No tienes productos publicados aún.</p>
              <p className="text-sm mt-2">Haz clic en "Publicar Producto" para empezar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-green-500 flex flex-col">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
                  )}
                  <div className="p-4 flex-grow">
                    <h3 className="font-bold text-xl text-gray-800">{p.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.descripcion}</p>
                    <div className="mt-4 flex justify-between items-center">
                      {/* Precio por libra */}
                      <p className="text-green-700 font-black text-lg">${p.precio} <span className="text-sm text-gray-500 font-normal">/ {p.unidad}</span></p>
                      {/* Inventario en Kilos */}
                      <p className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{p.disponibilidad} Kilos Disp.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t">
                    <button 
                      onClick={() => abrirFormularioEdicion(p)} 
                      className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                      Editar Información
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= VISTA DE FORMULARIO =================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">
            {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button 
            onClick={() => { setVista('lista'); setMensaje(''); }} 
            className="text-gray-500 hover:text-red-500 font-bold">
            X Cancelar
          </button>
        </div>
        
        {mensaje && <p className={`mb-4 text-center font-semibold ${mensaje.includes('⚠️') ? 'text-orange-500' : 'text-green-600'}`}>{mensaje}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Nombre del Producto</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Precio por Libra ($)</label>
              <input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Unidad de Medida</label>
              <input type="text" name="unidad" value={formData.unidad} onChange={handleChange} required className="w-full mt-1 p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Cantidad Disponible (Kilos)</label>
              <input type="number" name="disponibilidad" value={formData.disponibilidad} onChange={handleChange} required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">URL de la Imagen</label>
              <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
          </div>
          <button type="submit" className={`w-full text-white p-3 rounded font-bold transition ${modoEdicion ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {modoEdicion ? 'Actualizar Producto' : 'Publicar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}