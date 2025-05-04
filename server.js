// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error al conectar a MongoDB:', err));

// Esquema de fotos
const photoSchema = new mongoose.Schema({
  name: String,
  imagePath: String,
});
const Photo = mongoose.model('Photo', photoSchema);

// Configuración de subida
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// Middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', async (req, res) => {
  const photos = await Photo.find();
  res.render('index', { photos });
});

app.post('/upload', upload.array('files', 10), (req, res) => {
  const { name } = req.body;
  const files = req.files;

  if (!name || files.length === 0) return res.status(400).send('Nombre y fotos son requeridos.');

  files.forEach(file => {
    const newPhoto = new Photo({
      name: name,
      imagePath: `/uploads/${file.filename}`,
    });
    newPhoto.save().catch(err => console.error('Error al guardar foto:', err));
  });

  res.redirect('/');
});

app.get('/gallery', async (req, res) => {
  const photos = await Photo.find();
  res.render('gallery', { photos });
});

app.listen(port, () => {
  console.log(`Servidor activo en http://localhost:${port}`);
});
