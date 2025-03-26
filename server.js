const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuración
const PORT = 3001;
const JWT_SECRET = 'your-secret-key';
const SALT_ROUNDS = 10;

// Base de datos temporal (en memoria)
let users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', SALT_ROUNDS),
    role: 'admin'
  }
];

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rutas
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

app.get('/api/user', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de autenticación corriendo en http://localhost:${PORT}`);
});
