const jwt = require('jsonwebtoken');

const tokenVerification = (req, res, next) => {

    try {

        const token = req.headers["authorization"];

        // token missing
        if (!token) {
            return res.status(401).json({
                message: "Please enter token in header"
            });
        }

        // verify token
        jwt.verify(token, 'jwt_secret_key', (error, decodedToken) => {
            if (error) {
                return res.status(401).json({
                    message: error.message
                });
            }

            // store user id
            req.userId = decodedToken.userId;

            // next middleware/controller
            next();

        });

    } catch (error) {

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });

    }

};

module.exports = { tokenVerification };