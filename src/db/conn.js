const mongoose = require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/UserData').then(()=>{
    console.log('Connection Successfull');
}).catch((err)=>{
    console.log("There is some error occured!",err)
})