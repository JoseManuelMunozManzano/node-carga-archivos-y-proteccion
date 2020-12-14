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

  const archivo = req.files.archivo;
  const nombreCortado = archivo.name.split('.');
  const extension = nombreCortado[nombreCortado.length - 1].toLowerCase();

  // Extensiones permitidas
  const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          'Las extensiones permitidas son ' + extensionesValidas.join(', '),
        ext: extension,
      },
    });
  }

  archivo.mv(`uploads/${archivo.name}`, err => {
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
