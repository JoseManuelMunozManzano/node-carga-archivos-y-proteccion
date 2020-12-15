const express = require('express');

const fs = require('fs');
const path = require('path');

let app = express();

app.get('/imagen/:tipo/:img', (req, res) => {
  const tipo = req.params.tipo;
  const img = req.params.img;

  const pathImg = `./uploads/${tipo}/${img}`;

  // sendFile lee el Content-Type del archivo y eso es lo que regresa.
  // Si es una imagen regresa una imagen, si es un json regresa el json...
  // Hay que especificar el path absoluto de la imagen
  const noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
  res.sendFile(noImagePath);
});

module.exports = app;
