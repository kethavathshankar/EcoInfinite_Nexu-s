const { createHmac, randomBytes } = require("crypto");

const {Schema,model} = require('mongoose')

const userSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true }, // link to User
    image: {
        type: String,
        required: false,
    
    },
    address: {
        type: String,
        required: true,
    
    },
    city:{
        type: String,
        required: true,
        
    },
    state:{
        type: String,
        required: true,
        
    },
    pincode:{
        type: String,
        required: true,
        
    },
    landmark:{
        type: String,
        required: true,
        
    },

    phone:{
        type: String,
        required: true,
        
    },
    wasteType:{
        type: String,
        required: true,
        
    },
    imageDescription:{
        type: String,
        required: true,
        
    },
   

},
{timestamps:true }
);


const User3 = model('user3',userSchema)

module.exports = User3;
