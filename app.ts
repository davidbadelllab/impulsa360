import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Importar rutas
import companyRoutes from './routes/companyRoutes';

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Montar rutas
app.use('/api/companies', companyRoutes);

// Middleware para manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Recurso no encontrado' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

export default app; 