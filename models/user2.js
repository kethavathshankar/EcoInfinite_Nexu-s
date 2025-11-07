const { createHmac, randomBytes } = require("crypto");

const {Schema,model} = require('mongoose')

const userSchema = new Schema({
    wasteType: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    
    },
    price:{
        type: String,
        required: true,
        
    },
   

},
{timestamps:true }
);


const User2 = model('user2',userSchema)

module.exports = User2;
