const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const {
  verificaToken,
  verificaAdmin_Role,
} = require('../middlewares/autenticacion');

const app = express();

// Usando el middleware para recuperar el valor token del header.
app.get('/usuario', verificaToken, (req, res) => {
  const desde = +req.query.desde || 0;
  const limite = +req.query.limite || 5;

  // Sólo usuarios activos
  Usuario.find({ estado: true }, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec()
    .then(async usuarios => {
      const conteo = await Usuario.countDocuments({ estado: true });
      res.json({
        ok: true,
        usuarios,
        cuantos: conteo,
      });
    })
    .catch(err => {
      res.status(400).json({
        ok: false,
        err,
      });
    });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {
  const persona = req.body;

  const usuario = new Usuario({
    nombre: persona.nombre,
    email: persona.email,
    // Encriptación de una sola vía
    password: bcrypt.hashSync(persona.password, 10),
    role: persona.role,
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
  const id = req.params.id;

  const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    }
  );
});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
  const id = req.params.id;

  Usuario.findByIdAndUpdate(id, { estado: false }, { new: true })
    .then(usuarioBorrado => {
      if (usuarioBorrado) {
        res.json({
          ok: true,
          usuario: usuarioBorrado,
        });
      } else {
        res.status(400).json({
          ok: false,
          err: {
            message: 'Usuario no encontrado',
          },
        });
      }
    })
    .catch(err => {
      res.status(400).json({
        ok: false,
        err,
      });
    });
});

module.exports = app;
