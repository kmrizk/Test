'use strict';

require('./config/env');
const fs = require('fs');
const path = require('path');
const yaml = require('json2yaml');
const debug = require('debug')('helloworld');
const express = require('express');
const auth = require('./api/helpers/auth');
const swaggerExpress = require('swagger-express-mw');
const swaggerDoc = require('swagger-jsdoc');
const app = express();

app.use(express.static(path.join(__dirname, 'client', 'build'), {
  dotfiles: 'ignore',
  etag: true,
  index: 'index.html',
  lastModified: true,
  redirect: true,
  maxAge: 0
}));

let swaggerSpec = swaggerDoc({
  swaggerDefinition: {
    info: {
      title: 'Geeny HelloWorld Application Example',
      version: '1.0.0',
      description: 'Geeny HelloWorld Application Example is a sample application which allows\n' +
      'Geeny Developers to explore Geeny API and start developing geeny\n' +
      'applications in the local environment. The main goal is to demonstrate the\n' +
      'workflow for consuming data from Geeny API. The data consists of message\n' +
      'streams, which are distributed in shards. To consume the messages, a per\n' +
      'shard long polling is used.',
    },
    host: 'localhost:8080',
    basePath: '/api',
    produces: ['application/json'],
    consumes: ['application/json'],
    schemes: ['http']
  },
  apis: [path.join(__dirname, 'api') + '/**/*.js'],
});
fs.writeFileSync(path.join(__dirname, 'api/swagger/swagger.yaml'), yaml.stringify(swaggerSpec));

swaggerExpress.create({
  appRoot: __dirname,
  swaggerSecurityHandlers: { JWT: auth }
}, (err, swaggerExpress) => {
  if (err) { throw err; }

  swaggerExpress.register(app);
  app.listen(process.env.NODE_PORT);

  debug(`listening on http://localhost:${process.env.NODE_PORT}`);
});

debug('booting app...');
module.exports = app;
