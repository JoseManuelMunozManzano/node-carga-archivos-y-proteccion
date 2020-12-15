const express = require('express');

const fs = require('fs');
const path = require('path');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

// Se añade para que verifique token, pero entonces no vamos a estar
// autorizados a ver ninguna imagen.
// Para solucionar esto hay que mandar el token en mitad del url y se va a modificar
// el middleware de verificación
app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {
  const tipo = req.params.tipo;
  const img = req.params.img;

  // Verificamos que existe todo el path de la imagen
  // Si existe se muestra la imagen, si no se muestra no-image.jpg
  const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    // sendFile lee el Content-Type del archivo y eso es lo que regresa.
    // Si es una imagen regresa una imagen, si es un json regresa el json...
    // Hay que especificar el path absoluto de la imagen
    const noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
    res.sendFile(noImagePath);
  }
});

module.exports = app;
