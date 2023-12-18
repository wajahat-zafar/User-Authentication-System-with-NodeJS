const jwt = require('jsonwebtoken')
const Register = require('../models/userRegister')


const auth = async(req, res , next)=>{
    try {
        const token = req.cookies.jwt
        const verify = jwt.verify(token, process.env.SECRET_KEY)
        console.log(verify);
        const user = await Register.findOne({_id:verify._id})
        console.log(user);

        req.token = token;
        req.user = user;
        next()
        
    } catch (error) {
        res.status(401).send(error)
        
    }

}

module.exports = auth;