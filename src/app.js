require('dotenv').config();
const express =  require("express");
const app = express();
const path = require('path')
const hbs = require('hbs')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser') 
const auth = require('./middleware/auth')
require('./db/conn')
const Register = require('./models/userRegister')
const staticPath = path.join(__dirname, '../public')
const templatePath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials')
app.set('view engine', 'hbs');
app.set('views', templatePath)
hbs.registerPartials(partialsPath)
app.use(express.static(staticPath))
app.use(express.json());
app.use(cookieParser()) 
app.use(express.urlencoded({extended:false}));



app.get('/', (req,res)=>{
    res.render('register')
})

app.get('/secret', auth ,(req,res)=>{
  console.log(`This is the cookie ${req.cookies.jwt}`);
  res.render('secret')
})

app.get('/logout', auth, async(req,res)=>{
  try {
    //Signingout only current user
    // req.user.tokens = req.user.tokens.filter((currElement)=>{
    //   return currElement.token != req.token
    // })

    req.user.tokens = [];  //Signing out all  users
    res.clearCookie('jwt')
    console.log("Logged Out!");
    await req.user.save();
    res.render('register')
    
  } catch (error) {
      res.status(500).send(error)
    
  }
})
app.post('/register', async (req, res) => {
    try {
      
      const emailExists = await Register.exists({ email: req.body.email });
  
      if (emailExists) {
        console.error('Email address already exists');
        
        res.status(400).send('Email address already exists');
      } else {
        
        const registerUser = new Register({
          fName: req.body.fName,
          email: req.body.email,
          password: req.body.password,
          checkbox: req.body.checkbox,
        });
        const token = await registerUser.generateAuthToken();
        res.cookie("jwt",token, {
          expires: new Date(Date.now()+30000),
          httpOnly:true
        })

        const savedUser = await registerUser.save();
        res.render('index');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/login' ,async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const checkEmail = await Register.findOne({email:email})
        const isMatch = await bcrypt.compare(password, checkEmail.password)
        const token = await checkEmail.generateAuthToken();
        // console.log(token);
        res.cookie("jwt",token, {
          expires: new Date(Date.now()+600000),
          httpOnly:true
        })
        if(isMatch){
            res.status(201).render('index')
        }else{

          res.send('Invalid Credentials')
        }
    } catch (error) {
        res.status(400).send('Invalid Credentials')
        
    }
})




app.listen(port, ()=>{
    console.log(`App is listening at port number ${port}`)
})