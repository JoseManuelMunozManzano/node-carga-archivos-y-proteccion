const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningún archivo',
      },
    });
  }

  // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
  let archivo = req.files.archivo;

  // Use the mv() method to place the file somewhere on your server
  archivo.mv('uploads/filename.jpg', err => {
    if (err)
      return res.status(500).json({
        ok: false,
        err,
      });

    res.json({
      ok: true,
      message: 'Imagen subida correctamente',
    });
  });
});

module.exports = app;
