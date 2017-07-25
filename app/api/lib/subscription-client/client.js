class SubscriptionClient {
  /**
   * Creates subscription client per application & message type
   * @constructor
   * @param {object} config configuration of data provider url, application id and message type
   */
  constructor(config = {}) {
    this._api = new config.Api(config.url);
    this._appId = config.applicationId;
    this._messageType = config.messageType;
  }

  /**
   * Returns list of shards for application & message type
   * @param {function} cb success/error callback which receives two arguments: data, err
   * @param {object} [ct] context
   */
  getShards(cb = function(){}, ct = this) {
    this._api.describe(this._appId, this._messageType)
      .then(data => {
        cb.call(ct, data, null);
      })
      .catch(err => {
        cb.call(ct, null, err);
      });
  }

  /**
   * Pulls data for an application & message type in given batch size
   * Provides next() function as part of resonse to perform next pull request
   * Once data list is empty it means that there is no more data at the moment and calling next is not necessary
   * @param {string} shardId
   * @param {integer} maxBatchSize
   * @param {function} cb success/error callback which receives two arguments: data, err
   * @param {function} [ct] context
   */
  pullData(shardId = '', maxBatchSize = 10, cb = function(){}, ct = this) {
    let retErr = err => {
      cb.call(ct, null, err);
    };

    let pull = iterator => {
      return this._api.iterate(this._appId, this._messageType, iterator)
        .then(data => {
          try {
            let rawMessages = data.messages || [];
            let nextIterator = data.nextIterator;

            let parsedMessages = [];
            rawMessages.forEach((v, k) => {
              parsedMessages[k] = v;
              parsedMessages[k].payload = Buffer.from(v.payload, 'base64').toString('utf8');
            });

            let ret = {
              data: parsedMessages,
              next: pull.bind(this, nextIterator)
            };

            cb.call(ct, ret, null);
          } catch (e) {
            return Promise.reject(e);
          }
        })
        .catch(retErr);
    };

    this._api.getIterator(this._appId, this._messageType, shardId, maxBatchSize)
      .then(data => pull.call(this, data.shardIterator))
      .catch(retErr);
  }

  /**
   * Optional. Creates checkpoint for retreived messages.
   * @param {function} cb success/error callback which receives two arguments: data, err
   * @param {object} [ct] context
   */
  checkpoint(cb = function(){}, ct = this){
    cb.call(ct, "To Be Implemented", null);
  }
}

module.exports = SubscriptionClient;