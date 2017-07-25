'use strict';

const Client = require('../lib/subscription-client');

/**
 * @swagger
 *  '/{message_type}/shards':
 *    # binds a127 app logic to a route
 *    x-swagger-router-controller: shards
 *    get:
 *      security:
 *        - JWT: []
 *      tags:
 *        - shards
 *      summary: A list of message type shards.
 *      description: >
 *        Developers are able to fetch the list of shards for a message type.
 *        Shards are used to retrieve messages.
 *      # used as the method name of the controller
 *      operationId: getShards
 *      parameters:
 *        - name: message_type
 *          in: path
 *          type: string
 *          format: opaque
 *          required: true
 *      responses:
 *        '200':
 *          description: Shard list.
 *          schema:
 *            $ref: '#/definitions/ShardList'
 *        '500':
 *          description: Internal server error.
 *          schema:
 *            $ref: '#/definitions/Error'
 */

/**
 * @swagger
 *  definitions:
 *    Shard:
 *      type: object
 *      properties:
 *        shardId:
 *          type: string
 *          format: opaque
 *          description: Unique ID of the shard.
 *    ShardList:
 *      type: object
 *      properties:
 *        shards:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Shard'
 */

const getShards = (req, res) => {
  const messageType = req.swagger.params.message_type.value;
  const client = Client.newClient(
    process.env.GEENY_APPBROKER,
    process.env.APP_NAME,
    messageType
  );

  client.getShards((data, err) => {
    if (err) {
      let code = err.code && typeof err.code === 'number' ? err.code : 500,
        message = err.message || "";

      return res.status(code).send({
        code: code,
        message: message
      });
    }
    res.json(data);
  });
};

module.exports = {
  getShards: getShards
};
