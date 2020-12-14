const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
  const body = req.body;

  Usuario.findOne({ email: body.email })
    .then(usuarioDB => {
      if (!usuarioDB) {
        return res.status(400).json({
          ok: false,
          err: {
            // Los paréntesis indican el error. NO HACER EN PRODUCCIÓN
            message: '(Usuario) o contraseña incorrecto',
          },
        });
      }

      // Encriptamos la contraseña y vemos si es la misma
      if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
        return res.status(400).json({
          ok: false,
          err: {
            // Los paréntesis indican el error. NO HACER EN PRODUCCIÓN
            message: 'Usuario o (contraseña) incorrecto',
          },
        });
      }

      const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
        expiresIn: process.env.CADUCIDAD_TOKEN,
      });

      res.json({
        ok: true,
        usuario: usuarioDB,
        token,
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

// Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post('/google', async (req, res) => {
  const token = req.body.idtoken;

  const googleUser = await verify(token).catch(e => {
    return res.status(403).json({ ok: false, err: e });
  });

  Usuario.findOne({ email: googleUser.email })
    .then(usuarioDB => {
      if (usuarioDB) {
        if (!usuarioDB.google) {
          return res.status(400).json({
            ok: false,
            err: {
              message: 'Debe de usar su autenticación normal',
            },
          });
        } else {
          const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN,
          });

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token,
          });
        }
      } else {
        // Si el usuario no existe en nuestra BBDD
        const usuario = new Usuario();

        usuario.nombre = googleUser.nombre;
        usuario.email = googleUser.email;
        usuario.img = googleUser.img;
        usuario.google = true;
        // En realidad no hace falta password, usamos el de google. Se pone carita feliz
        // Si se intenta hacer el login normal lo intetará pasar a un hash de 10 vueltas
        // y nunca va a hacer match.
        // Se deja así para pasar la validación de la BBDD, ya que el password es obligatorio
        usuario.password = ' :)';

        usuario
          .save()
          .then(usuarioDB => {
            const token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
              expiresIn: process.env.CADUCIDAD_TOKEN,
            });

            return res.json({
              ok: true,
              usuario: usuarioDB,
              token,
            });
          })
          .catch(err => {
            res.status(500).json({
              ok: false,
              err,
            });
          });
      }
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

module.exports = app;
