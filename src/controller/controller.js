const jwt =  require('jsonwebtoken');
const connection = require('../../db');
const bcrypt = require('bcrypt');

// Middleware to authenticate JWT token

const register = async (req , res) => {
    try{
        const { name , email, password } = req.body;
    //   all fields are required
        if(!name || !email || !password){
            return res.status(400).json({ message: 'All fields are required'})
        }
        // Validate that `name`, `email`, and `password` are present.

  const [UserIsExists] = await connection.query(
   'SELECT * FROM users WHERE email = ?',
   [email]
);

if (UserIsExists.length > 0) {

            return res.status(409).json({
                message: 'User already exists'
            });

        }


// password must be at least 6 characters long
        if( password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'})
        }
       
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        const [userRegistered] = await connection.query(

            'INSERT INTO users(name,email,password) VALUES(?,?,?)',

            [name, email, hashedPassword]

        );

        res.status(201).json({ message: 'User registerd successfully',
        data : {id: userRegistered.insertId ,
             name ,
            email}
       })
    }
    catch(error){
        res.status(500).json({ message: 'Server error', error: error.message})
    }
}





// login

const login = async (req , res) => {
    try{
        const {email,password} = req.body;
        // validation for email and password
        if(!email || !password){
            return res.status(400).json({ message: 'Email and Password are required'})
        }
        // check if user exists
        const [userIsExists] = await connection.query(
            'SELECT * FROM users WHERE email = ?',[email])
            if(userIsExists.length === 0 ){
                return res.status(401).json({ message: 'Invalid email '})
            }
            const token = jwt.sign(
                { userId : userIsExists.id,
                    email :userIsExists.email},
                    process.env.JWT_SECRET,
                    { expiresIn : process.env.JWT_EXPIRES_IN
                }
            );
            res.setHeader('Authorization', token);
            res.status(200).json({ message: 'Login successful', token})
    }
    catch(error){
        res.status(500).json({ message: 'Server error', error: error.message})
    }
}



// get user data

const getUserData = async (req , res) => {
    try{
        const userId = req.params.id;
        const [userData] = await connection.query(
            'SELECT id, name, email FROM users WHERE id = ?',
            [userId]
        );
        if (userData.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User data retrieved successfully', data: userData[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {register, login, getUserData}