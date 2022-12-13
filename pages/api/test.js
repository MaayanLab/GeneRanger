/**
 * @swagger
 * /api/test:
 *   get:
 *     description: This is a test endpoint.  It returns "testing".
 *     responses:
 *       200:
 *         description: testing
 */
export default async function handler(req, res) {

    if (req.method === 'GET') {

        res.status(200).json("testing");

    }
}
