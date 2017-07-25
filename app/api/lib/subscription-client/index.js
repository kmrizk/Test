const Api = require('./api');
const Client = require('./client');

let cache = {};

module.exports = {
  newClient: (url, applicationId, messageType) => {
    let key = `${url}_${applicationId}_${messageType}`;
    if (!cache[key]) {
      cache[key] = new Client({ url, applicationId, messageType, Api });
    }

    return cache[key];
  }
};
