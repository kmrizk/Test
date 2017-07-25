const debug = require('debug')('helloworld');
const url = require('url');
const http = require('http');
const https = require('https');

const ITERATOR_TYPES = {
  IteratorLatest: "LATEST",
  IteratorEarliest: "EARLIEST",
  IteratorAtSequenceNumber: "AT_SEQUENCE_NUMBER",
  IteratorAfterSequenceNumber: "AFTER_SEQUENCE_NUMBER",
  IteratorLastCheckpoint: "LAST_CHECKPOINT"
};

const TIMEOUT_SECONDS = 1000 * 10;

/**
 * Application Broker API wrapper
 */
class SubscriptionApi {
  /**
   * @constructor
   * @param endpoint AppBroker URL endpoint
   */
  constructor(endpoint = '') {
    this._urlParts = this._parse(endpoint);
    this._api = this._urlParts.protocol === "https:" ? https : http;
  }

  /**
   * Checks is HTTP response code OK
   * @param {integer} code
   * @returns {boolean}
   * @private
   */
  _isOK(code = 0) {
    return code >= 200 && code <= 206;
  }

  /**
   * Parses URL endpoint into parts containing hostname, port, path, etc
   * @param endpoint
   * @returns {Array}
   * @private
   */
  _parse(endpoint = '') {
    let urlParts;

    try {
      urlParts = url.parse(endpoint);
      urlParts.path = urlParts.path[urlParts.path.length - 1] === '/' ? urlParts.path : urlParts.path + '/';
    } catch (e) {
      debug('Failed to parse URL %s', endpoint, e);
    }

    return urlParts || [];
  }

  /**
   * Generic response handler
   * @param {object} res http response object
   * @param {function} cb success callback
   * @param {function} eb error callback
   * @param {object} [ct] context
   * @private
   */
  _handleResponse(res, cb = function(){}, eb = function(){}, ct = this) {
    let { statusCode, statusMessage } = res;
    res.setEncoding('utf8');

    if (!this._isOK(statusCode)) {
      let err = new Error(statusMessage);
      err.code = statusCode;
      eb.call(ct, err);
      return;
    }

    let rawData = '';
    res.on('data', chunk => rawData += chunk);

    let parsedData;
    res.on('end', () => {
      try {
        parsedData = JSON.parse(rawData);
      } catch (e) {
        eb.call(ct, e);
      }
      cb.call(ct, parsedData);
    });
  }

  /**
   * Returns iterator types
   * @returns {Promise} promise resolved to a map containing iterator types
   */
  getInteratorTypes() {
    return Promise.resolve(ITERATOR_TYPES);
  }

  /**
   * Describes message type which belongs to a application
   * @param {string} appId
   * @param {string} messageType
   * @returns {Promise} promise which resolves to list of shards
   */
  describe(appId = '', messageType = '') {
    return new Promise((resolve, reject) => {
      let options = {
        hostname: this._urlParts.hostname,
        port: this._urlParts.port,
        path: `${this._urlParts.path}${appId}/messageType/${messageType}`
      };

      const req = this._api.get(options, res => {
        this._handleResponse(res, resolve, reject, this);
      });

      req.on('error', reject);
      req.setTimeout(TIMEOUT_SECONDS, reject);
    });
  }

  /**
   * Creates new iterator per application and message type to iterate over messages
   * @param {string} appId
   * @param {string} messageType
   * @param {string} shard
   * @param {integer} size max batch size
   * @param {string} type iterator type, i.e. LATEST
   * @returns {Promise} promise resolved to a map containing iterator id
   */
  getIterator(appId = '', messageType = '', shard = '', size = 10, type = ITERATOR_TYPES["IteratorLatest"]) {
    return new Promise((resolve, reject) => {
      let options = {
        hostname: this._urlParts.hostname,
        port: this._urlParts.port,
        method: 'POST',
        path: `${this._urlParts.path}${appId}/messageType/${messageType}/iterator`
      };

      let data = {
        shardId: shard,
        maxBatchSize: size,
        iteratorType: type
      };

      const req = this._api.request(options, res => this._handleResponse(res, resolve, reject, this));
      req.on('error', reject);
      req.setTimeout(TIMEOUT_SECONDS, reject);

      req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Iterating over messages
   * @param {string} appId
   * @param {string} messageType
   * @param {string} iterator
   * @returns {Promise} promise resolved to a list of messages and next iterator
   */
  iterate(appId = '', messageType = '', iterator = ''){
    return new Promise((resolve, reject) => {
      let options = {
        hostname: this._urlParts.hostname,
        port: this._urlParts.port,
        path: `${this._urlParts.path}${appId}/messageType/${messageType}/iterator/${iterator}`
      };

      const req = this._api.get(options, res => this._handleResponse(res, resolve, reject, this));

      req.on('error', reject);
      req.setTimeout(TIMEOUT_SECONDS, reject);
    });
  }
}

module.exports = SubscriptionApi;