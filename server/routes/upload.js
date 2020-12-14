const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');

app.use(fileUpload({ useTempFiles: true }));

// Imagen de tipo usuario o tipo producto
app.put('/upload/:tipo/:id', function (req, res) {
  const tipo = req.params.tipo;
  const id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningún archivo',
      },
    });
  }

  // Valida tipo
  const tiposValidos = ['productos', 'usuarios'];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
        tipo,
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
          'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
        ext: extension,
      },
    });
  }

  // Cambiar nombre al archivo
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads//${tipo}/${nombreArchivo}`, err => {
    if (err)
      return res.status(500).json({
        ok: false,
        err,
      });

    // Aquí, imagen cargada
    // La respuesta se pasa por referencia
    imagenUsuario(id, res, nombreArchivo);
  });
});

async function imagenUsuario(id, res, nombreArchivo) {
  try {
    const usuarioDB = await Usuario.findById(id);

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no existe',
        },
      });
    }

    usuarioDB.img = nombreArchivo;

    usuarioGuardado = await usuarioDB.save();
    res.json({
      ok: true,
      message: 'Imagen subida correctamente',
      usuario: usuarioGuardado,
      img: nombreArchivo,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      err,
    });
  }
}

function imagenProducto() {}

module.exports = app;
