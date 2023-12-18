const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const userData = new mongoose.Schema({
   fName:{
    type: String,
    required: true
   } ,
   email:{
    type: String,
    required: true,
    unique: true
   },
   password:{
    type: String,
    required: true,
    unique: true
    },
    checkbox:{
        type: String,
        required:true
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }]

})
//Using Middlewares

userData.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this.id.toString()}, process.env.SECRET_KEY)
        this.tokens =  this.tokens.concat({token:token})
        await this.save();
        return token;
        

    } catch (error) {
        res.send(error)
        
    }
}


userData.pre("save", async function(next){

        if(this.isModified("password")){
            this.password = await bcrypt.hash(this.password,10);
        }
        next();
})

const registrationData = new mongoose.model('registrationData',userData)

module.exports = registrationData;