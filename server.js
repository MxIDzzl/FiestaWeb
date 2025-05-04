// server.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

// Crear la aplicación de Express
const app = express();
const port = 3000;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/fotosfiesta', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err) => console.error('Error al conectar con la base de datos', err));

// Definir el esquema de Foto (nombre del invitado y URL de la foto)
const photoSchema = new mongoose.Schema({
  name: String,
  imagePath: String,
});

const Photo = mongoose.model('Photo', photoSchema);

// Configurar Multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Configurar Express para usar EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Ruta para la página principal con los dos menús (subir foto y galería)
app.get('/', async (req, res) => {
  // Obtener todas las fotos de la base de datos
  const photos = await Photo.find();
  res.render('index', { photos });
});

// Ruta para manejar la subida de fotos
app.post('/upload', upload.array('files', 10), (req, res) => {
  const name = req.body.name;
  const files = req.files;

  if (!name || files.length === 0) {
    return res.status(400).send('Por favor ingresa un nombre y selecciona al menos una foto.');
  }

  // Guardar cada foto en la base de datos
  files.forEach(file => {
    const newPhoto = new Photo({
      name: name,
      imagePath: `/uploads/${file.filename}`,
    });

    newPhoto.save()
      .then(() => console.log('Foto subida y guardada en la base de datos'))
      .catch(err => console.error('Error al guardar la foto:', err));
  });

  res.redirect('/');
});

// Ruta para ver las fotos subidas
app.get('/gallery', async (req, res) => {
  const photos = await Photo.find();
  res.render('gallery', { photos });
});

// Servir las fotos desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
