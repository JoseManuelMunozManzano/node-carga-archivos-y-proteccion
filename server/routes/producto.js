const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// ======================================
// Obtener productos
// ======================================
app.get('/producto', verificaToken, async (req, res) => {
  // trae todos los productos
  // populate: usuario categoria
  // paginado
  const desde = +req.query.desde || 0;
  const limite = +req.query.limite || 5;

  try {
    const productos = await Producto.find({ disponible: true })
      .skip(desde)
      .limit(limite)
      .populate('usuario', 'nombre email')
      .populate('categoria', 'descripcion');

    if (!productos) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'No hay productos',
        },
      });
    }

    res.json({
      ok: true,
      productos,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      err,
    });
  }
});

// ======================================
// Obtener un producto por ID
// ======================================
app.get('/producto/:id', verificaToken, async (req, res) => {
  // populate: usuario categoria
  const id = req.params.id;

  try {
    const productoDB = await Producto.findById(id)
      .populate('usuario', 'nombre email')
      .populate('categoria', 'descripcion');

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Error al obtener los datos del producto',
        },
      });
    }

    res.json({
      ok: true,
      producto: productoDB,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      err,
    });
  }
});

// ======================================
// Buscar productos
// ======================================
app.get('/producto/buscar/:termino', verificaToken, async (req, res) => {
  const termino = req.params.termino;

  // i -> insensible a mayúsculas y minúsculas
  let regex = new RegExp(termino, 'i');

  try {
    productos = await Producto.find({ nombre: regex }).populate(
      'categoria',
      'descripcion'
    );

    res.json({
      ok: true,
      productos,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      err,
    });
  }
});

// ======================================
// Crear un nuevo producto
// ======================================
app.post('/producto', verificaToken, (req, res) => {
  // grabar el usuario
  // grabar una categoría del listado
  const body = req.body;

  const producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: true,
    categoria: body.categoria,
    usuario: req.usuario._id,
  });

  producto
    .save()
    .then(productoDB => {
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Error al grabar el producto',
          },
        });
      }

      res.status(201).json({
        ok: true,
        producto: productoDB,
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
// Actualizar un producto
// ======================================
app.put('/producto/:id', verificaToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Producto.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  })
    .then(productoDB => {
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Error al actualizar',
          },
        });
      }

      res.json({
        ok: true,
        producto: productoDB,
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
// Borrar un producto
// ======================================
app.delete('/producto/:id', verificaToken, async (req, res) => {
  // disponible pasa a false
  // El producto ha sido deshabilitado
  const id = req.params.id;

  try {
    let productoDB = await Producto.findById(id);

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe',
        },
      });
    }

    if (!productoDB.disponible) {
      return res.status(412).json({
        ok: false,
        err: {
          message: 'El producto ya esta deshabilitado',
        },
      });
    }

    productoDB = await Producto.findByIdAndUpdate(
      id,
      { disponible: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Error al deshabilitar un producto',
        },
      });
    }

    res.json({
      ok: true,
      producto: productoDB,
      message: 'El producto ha sido deshabilitado',
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      err,
    });
  }
});

module.exports = app;
