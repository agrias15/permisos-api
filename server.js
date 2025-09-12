import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Ruta para guardar datos en MySQL
app.post("/guardar", (req, res) => {
  const {
    fecha,
    numero_permiso,
    tipo_permiso,
    descripcion,
    unidad,
    numero_personas,
    empresa,
    equipo,
    coordX,
    coordY
  } = req.body;

  const sql = `INSERT INTO permisos 
    (fecha, numero_permiso, tipo_permiso, descripcion, unidad, numero_personas, empresa, equipo, coordX, coordY) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [fecha, numero_permiso, tipo_permiso, descripcion, unidad, numero_personas, empresa, equipo, coordX, coordY],
    (err, result) => {
      if (err) {
        console.error("❌ Error al insertar:", err);
        return res.status(500).json({ error: "Error al guardar en la BD" });
      }
      res.json({ message: "✅ Guardado en MySQL", id: result.insertId });
    }
  );
});

// Render usa su propia variable PORT, local usamos 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
