/*
  server.js
  API REST sencilla (Express) para insertar "permisos" en una base MySQL
  Pensado para desarrollo local y pruebas con Clever Cloud (MySQL).

  INSTRUCCIONES RÁPIDAS:
  1. Crea un archivo .env en la raíz con las variables (ejemplo más abajo).
  2. Instala dependencias: npm install express mysql2 dotenv cors
  3. (Opcional dev) npm install -D nodemon y usa npm run dev
  4. Arranca: node server.js  (o npm run dev)
  5. Prueba: GET /ping   POST /guardar   GET /listar

  EJEMPLO .env (NO subir a git):
  DB_HOST=b47wczq53cmwawf0dftr-mysql.services.clever-cloud.com
  DB_PORT=3306
  DB_USER=tu_usuario
  DB_PASS=tu_contraseña
  DB_NAME=tu_base_de_datos
  PORT=3000

  SQL para crear la tabla de ejemplo (ejecutar en tu MySQL si aún no existe):
  CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    numero_permiso VARCHAR(50) NOT NULL,
    tipo_permiso VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    unidad VARCHAR(100),
    numero_personas INT,
    empresa VARCHAR(150),
    equipo VARCHAR(150),
    coordX DECIMAL(6,4),
    coordY DECIMAL(6,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
*/

// Importamos librerías
import express from "express";         // framework web
import mysql from "mysql2/promise";   // cliente MySQL con promesas
import cors from "cors";              // para manejar CORS en desarrollo
import dotenv from "dotenv";         // para cargar .env

// Cargamos variables de entorno desde .env
dotenv.config();

// Creamos la aplicación Express
const app = express();

// Middlewares
app.use(cors());            // Permite llamadas desde cualquier origen (ajustar en producción)
app.use(express.json());    // Parseo automático de JSON en el body

// Creamos un pool de conexiones (más estable para producción que una sola conexión)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
  // Opcionalmente puedes agregar: decimalNumbers: true
});

// --- RUTA: /ping
// Uso: comprobar que el servidor y la conexión básica funcionan
app.get("/ping", async (req, res) => {
  try {
    // Ejecutamos una consulta simple
    const [rows] = await pool.query("SELECT 1+1 AS result");
    // Enviamos el resultado
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    console.error("Error en /ping:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- RUTA: /guardar
// Inserta un permiso en la tabla 'permisos'
app.post("/guardar", async (req, res) => {
  try {
    // Desestructuramos los campos esperados desde el body
    const {
      fecha,
      numero_permiso,
      tipo_permiso,
      descripcion,
      condicion_permiso,
      unidad,
      numero_personas,
      empresa,
      equipo,
      coordX,
      coordY
    } = req.body;

    // Validaciones básicas: aseguramos que los campos obligatorios existan
    if (!fecha || !numero_permiso || !tipo_permiso || !descripcion || !condicion_permiso || !unidad) {
      return res.status(400).json({ error: "Faltan campos obligatorios: fecha, numero_permiso, tipo_permiso o descripcion" });
    }

    // Consulta parametrizada (previene inyección SQL)
    const sql = `INSERT INTO permisos
      (fecha, numero_permiso, tipo_permiso, descripcion,condicion_permiso, unidad, numero_personas, empresa, equipo, coordX, coordY)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

    // Preparamos los parámetros: convertimos los valores numéricos cuando aplica
    const params = [
      fecha,
      numero_permiso,
      tipo_permiso,
      descripcion,
      condicion_permiso,
      unidad || null,
      numero_personas ? Number(numero_personas) : null,
      empresa || null,
      equipo || null,
      coordX ? Number(coordX) : null,
      coordY ? Number(coordY) : null
    ];

    // Ejecutamos la inserción con el pool (await porque usamos promesas)
    const [result] = await pool.execute(sql, params);

    // Respondemos con el id insertado
    res.json({ message: "✅ Guardado en MySQL", id: result.insertId });
  } catch (err) {
    // Capturamos errores y los devolvemos
    console.error("Error en /guardar:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- RUTA: /listar
// Devuelve los últimos 50 permisos para facilitar debugging desde el front
app.get("/listar", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM permisos ORDER BY id DESC LIMIT 50");
    res.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    console.error("Error en /listar:", err);
    res.status(500).json({ error: err.message });
  }
});

// Puerto donde va a escuchar el servidor
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
