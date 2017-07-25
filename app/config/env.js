const fs = require('fs');
const path = require('path');

process.env.NODE_PORT = process.env.NODE_PORT || '8080';
process.env.APP_NAME = process.env.APP_NAME || 'example';
process.env.GEENY_APPBROKER = process.env.GEENY_APPBROKER || 'http://localhost:1319/app/';
process.env.GEENY_CONNECT = process.env.GEENY_CONNECT || 'http://localhost:3000';
process.env.GEENY_CONNECT_KEY = process.env.GEENY_CONNECT_KEY || fs.readFileSync(path.join(__dirname, 'pubkey.pem'), {
  encoding: 'utf8'
});