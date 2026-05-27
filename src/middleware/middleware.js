const jwt = require('jsonwebtoken');
const joi = require('joi');


// register
const registerValidation = async (req, res, next) => {
    console.log("request body",req.body);
    const schema = joi.object({
        name: joi.string().required(),
         email: joi.string().email().required(),
        password: joi.string().min(6).required()
    });
    try{
        const value =await schema.validateAsync(req.body);
        console.log("validation successful", value )
        next();
    } catch (error) {
         console.log(" Error Message:", error.details[0].message);
        res.status(400).json({
            message: error.details[0].message
        });
    }

}
// login schema
const loginValidation = async (req, res, next) => {
    console.log("request body ", req.body);
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    });
    try{
        const value = await schema.validateAsync(req.body);
        console.log("validation successful", value)
        next();
    }catch(error){
        console.log("error mmessage: ", error.details[0].message);
        res.status(400).json({
            message: error.details[0].message
        });
    }
}



// get 
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

module.exports = {  registerValidation, loginValidation, tokenVerification };



