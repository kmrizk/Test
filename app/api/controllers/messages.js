'use strict';

const Client = require('../lib/subscription-client');

/**
 * @swagger
 *  '/{message_type}/{shard_id}/messages':
 *    # binds a127 app logic to a route
 *    x-swagger-router-controller: messages
 *    get:
 *      security:
 *        - JWT: []
 *      tags:
 *        - messages
 *      summary: Retrieves the messages of a shard.
 *      # used as the method name of the controller
 *      operationId: getMessages
 *      parameters:
 *        - name: message_type
 *          in: path
 *          type: string
 *          format: opaque
 *          required: true
 *        - name: shard_id
 *          in: path
 *          type: string
 *          format: opaque
 *          required: true
 *        - name: amount
 *          in: query
 *          type: integer
 *          default: 20
 *      responses:
 *        '200':
 *          description: The Messages.
 *          schema:
 *            $ref: '#/definitions/Messages'
 *        '500':
 *          description: Internal server error.
 *          schema:
 *            $ref: '#/definitions/Error'
 */

/**
 * @swagger
 *  definitions:
 *    Messages:
 *      type: object
 *      properties:
 *        messages:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Message'
 *    Message:
 *      type: object
 *      properties:
 *        sequenceNumber:
 *          type: string
 *          format: opaque
 *        thingId:
 *          type: string
 *          format: opaque
 *        messageId:
 *          type: string
 *          format: opaque
 *        userId:
 *          type: string
 *          format: opaque
 *        payload:
 *          type: string
 *          format: binary
 */

const getMessages = (req, res) => {
  let messageType = req.swagger.params.message_type.value;
  let shardId = req.swagger.params.shard_id.value;
  let maxBatchSize = req.swagger.params.amount.value;

  const client = Client.newClient(
    process.env.GEENY_APPBROKER,
    process.env.APP_NAME,
    messageType
  );

  client.pullData(shardId, maxBatchSize, (ret, err) => {
    if (err) {
      let code = err.code && typeof err.code === 'number' ? err.code : 500,
        message = err.message || "";

      return res.status(code).send({
        code: code,
        message: message
      });
    }
    res.json({ messages: ret.data });
  });
};

module.exports = {
  getMessages: getMessages
};
