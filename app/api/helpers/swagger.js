/**
 * @swagger
 *  '/swagger':
 *    x-swagger-pipe: swagger_raw
 */

/**
 * @swagger
 *  definitions:
 *    Error:
 *      type: object
 *      properties:
 *        code:
 *          type: integer
 *          format: int32
 *          description: Error code
 *        message:
 *          type: string
 *          format: opaque
 *          description: Error message
 */

/**
 * @swagger
 * securityDefinitions:
 *   JWT:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */
module.exports = {};