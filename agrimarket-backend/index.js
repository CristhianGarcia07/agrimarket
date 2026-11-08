const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const pool = require('./db'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CU-01: Endpoint de Registro de Usuario
app.post('/api/auth/register', async (req, res) => {
    // 1. Agregamos 'direccion' aquí
    const { nombre, correo, password, telefono, rol, direccion } = req.body;

    try {
        // 2. Exigimos que la dirección no venga vacía
        if (!nombre || !correo || !password || !rol || !direccion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Validar que el rol sea correcto según las reglas de negocio
        if (rol !== 'productor' && rol !== 'consumidor') {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Verificar si el correo ya existe en la base de datos
        const userExists = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insertar el nuevo usuario en PostgreSQL incluyendo el campo direccion
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, correo, rol, direccion',
            [nombre, correo, passwordHash, telefono, rol, direccion]
        );

        // Retornar éxito sin exponer la contraseña
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: newUser.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-02: Endpoint de Inicio de Sesión
app.post('/api/auth/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // 1. Validar que se envíen las credenciales
        if (!correo || !password) {
            return res.status(400).json({ error: 'Faltan correo o contraseña' });
        }

        // 2. Buscar el usuario en la base de datos
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' }); // Correo no existe
        }

        const user = result.rows[0];

        // 3. Comparar la contraseña ingresada con el hash guardado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' }); // Contraseña incorrecta
        }

        // 4. Retornar éxito (En un MVP completo usaríamos un token JWT, aquí devolvemos los datos básicos)
        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-04: Registrar Producto
app.post('/api/products', async (req, res) => {
    const { productor_id, categoria_id, nombre, descripcion, precio, unidad, disponibilidad, imagen } = req.body;

    try {
        // 1. Validar campos obligatorios
        if (!productor_id || !nombre || !precio || !unidad || disponibilidad === undefined) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // 2. Insertar el producto en la base de datos
        const newProduct = await pool.query(
            `INSERT INTO productos 
            (productor_id, categoria_id, nombre, descripcion, precio, unidad, disponibilidad, imagen) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [productor_id, categoria_id, nombre, descripcion, precio, unidad, disponibilidad, imagen]
        );

        // 3. Retornar éxito
        res.status(201).json({
            mensaje: 'Producto publicado exitosamente',
            producto: newProduct.rows[0]
        });

    } catch (error) {
        console.error('Error al publicar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-05: Actualizar Producto
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, unidad, disponibilidad, imagen } = req.body;

    try {
        const updateProduct = await pool.query(
            `UPDATE productos 
             SET nombre = $1, descripcion = $2, precio = $3, unidad = $4, disponibilidad = $5, imagen = $6 
             WHERE id = $7 RETURNING *`,
            [nombre, descripcion, precio, unidad, disponibilidad, imagen, id]
        );

        if (updateProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({
            mensaje: 'Producto actualizado exitosamente',
            producto: updateProduct.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-06: Eliminar Producto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await pool.query(
            'DELETE FROM productos WHERE id = $1 RETURNING *',
            [id]
        );

        if (deleteProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error del servidor (es posible que este producto tenga pedidos asociados)' });
    }
});

// CU-07: Consultar Catálogo de Productos
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.nombre, p.descripcion, p.precio, p.unidad, p.disponibilidad, p.imagen, c.nombre AS categoria, u.nombre AS productor
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            JOIN usuarios u ON p.productor_id = u.id
            WHERE p.estado = 'activo'
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar el catálogo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-11: Generar Solicitud de Compra
app.post('/api/requests', async (req, res) => {
    const { consumidor_id, producto_id, cantidad, observaciones } = req.body;
    try {
        if (!consumidor_id || !producto_id || !cantidad || cantidad <= 0) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        const newRequest = await pool.query(
            `INSERT INTO solicitudes (consumidor_id, producto_id, cantidad, observaciones) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [consumidor_id, producto_id, cantidad, observaciones]
        );
        res.status(201).json(newRequest.rows[0]);
    } catch (error) {
        console.error('Error al generar solicitud:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Consultar Solicitudes por ID de Productor
app.get('/api/requests/productor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT s.id, s.cantidad, s.observaciones, s.estado,
                   p.nombre AS producto, p.precio, 
                   u.nombre AS cliente, u.telefono AS telefono_cliente, u.correo, u.direccion AS direccion_cliente
            FROM solicitudes s
            JOIN productos p ON s.producto_id = p.id
            JOIN usuarios u ON s.consumidor_id = u.id
            WHERE p.productor_id = $1
            ORDER BY s.id DESC
        `, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar solicitudes:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
})

// CU-12: Consultar Historial de Compras (Consumidor)
app.get('/api/requests/consumidor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT s.id, s.cantidad, s.observaciones, s.estado,
                   p.nombre AS producto, p.precio, p.unidad,
                   u.nombre AS productor, u.telefono AS telefono_productor, u.direccion AS direccion_productor
            FROM solicitudes s
            JOIN productos p ON s.producto_id = p.id
            JOIN usuarios u ON p.productor_id = u.id
            WHERE s.consumidor_id = $1
            ORDER BY s.id DESC
        `, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al consultar historial del consumidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// CU-13: Actualizar Estado de Solicitud (Aceptar/Rechazar)
app.patch('/api/requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.status(200).json({ 
            mensaje: 'Estado actualizado exitosamente', 
            solicitud: result.rows[0] 
        });
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CU-13: Actualizar Estado de Solicitud (Aceptar/Rechazar)
app.patch('/api/requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.status(200).json({ 
            mensaje: 'Estado actualizado exitosamente', 
            solicitud: result.rows[0] 
        });
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('API de AgriMarket funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});