const express = require('express');

const {
  verificaToken,
  verificaAdmin_Role,
} = require('../middlewares/autenticacion');
const categoria = require('../models/categoria');

const app = express();

const Categoria = require('../models/categoria');

// ======================================
// Mostrar todas las categorías
//    Se ordena con sort
//    Se carga información de la tabla
//    de usuarios con populate
// ======================================
app.get('/categoria', verificaToken, (req, res) => {
  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec()
    .then(async categorias => {
      const conteo = await Categoria.countDocuments();
      res.json({
        ok: true,
        categorias,
        cuantos: conteo,
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

// ======================================
// Mostrar una categoría por ID
// ======================================
app.get('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;

  Categoria.findById(id)
    .then(async categoria => {
      if (!categoria) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Categoría no encontrada',
          },
        });
      }

      res.json({
        ok: true,
        categoria,
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

// ======================================
// Crear nueva categoría
// ======================================
app.post('/categoria', verificaToken, (req, res) => {
  const body = req.body;

  const categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });

  categoria
    .save()
    .then(categoriaDB => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Error al crear la categoria',
          },
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

// ======================================
// Actualizar nombre de una categoría
// ======================================
app.put('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  const { descripcion } = req.body;

  Categoria.findByIdAndUpdate(
    id,
    { descripcion },
    {
      new: true,
      runValidators: true,
    }
  )
    .then(categoriaDB => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'No actualizado',
          },
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        err,
      });
    });
});

// ======================================
//  Borrado de categoria
// ======================================
app.delete(
  '/categoria/:id',
  [verificaToken, verificaAdmin_Role],
  (req, res) => {
    const id = req.params.id;

    Categoria.findByIdAndRemove(id)
      .then(categoria => {
        if (!categoria) {
          return res.status(400).json({
            ok: false,
            err: {
              message: 'Categoría no encontrada',
            },
          });
        }

        res.json({
          ok: true,
          message: 'Categoría borrada',
          categoria,
        });
      })
      .catch(err => {
        res.status(500).json({
          ok: false,
          err,
        });
      });
  }
);

module.exports = app;
