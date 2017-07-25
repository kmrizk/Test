const jwt = require('jsonwebtoken');
const debug = require('debug')('helloworld');

module.exports = (req, authOrSecDef, scopesOrApiKey, cb) => {
  let error;

  if ('apiKey' === authOrSecDef.type) {
    jwt.verify(scopesOrApiKey, process.env.GEENY_CONNECT_KEY, {

      algorithms: ["RS512"],
      ignoreExpiration: true,
      ignoreNotBefore: true

    }, (err, decoded) => {
        if (err) {
          err.code = 403;
          return cb(err);
        }

        debug('decoded token: %o', decoded);
        cb();
    });
    return;
  }

  error = new Error('Unknown Authorization Method');
  error.code = 403;
  cb(error);
};