const jwt = require('jsonwebtoken');

// =========================================================================
// Verificar Token
// En la cabecera del header del get se ha añadido el key token obtenido
// en Postman con el Post Login: Normal. Tiene vigencia de un mes
// Si caduca se genera otro.
// =========================================================================
module.exports.verificaToken = async (req, res, next) => {
  try {
    // leyendo header
    const token = req.get('token');
    // decoded contiene todo el payload
    const decoded = await jwt.verify(token, process.env.SEED);
    req.usuario = decoded.usuario;
    next();
  } catch (err) {
    res.status(401).json({
      ok: false,
      err: {
        message: 'Token no válido',
      },
    });
  }
};

// =========================================================================
// Verificar ADMIN_ROLE
// Sólo usuarios con el rol de Administrador y que estén de alta pueden
// dar de alta, actualizar y borrar usuarios
// Para tener un token de administrador, en POSTMAN generar un token
//  usando un usuario con el rol 'ADMIN_ROLE'
// =========================================================================
module.exports.verificaAdmin_Role = async (req, res, next) => {
  if (req.usuario.role !== 'ADMIN_ROLE' || req.usuario.estado === false) {
    return res.status(401).json({
      ok: false,
      err: {
        message: 'El usuario no es administrador',
      },
    });
  }
  next();
};
