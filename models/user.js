const mongoose = require('mongoose');
const Schema    =   mongoose.Schema;

const options = {discriminatorKey:'kind'};

const userSchema = new Schema({
    username:{type:String,required:true},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:Number,required:true},    
    hash:{type:String,required:true},
    salt:{type:String,required:true},
    ads:[{type:mongoose.Schema.Types.ObjectId,ref:'Ad'}],
    pets:[{type:mongoose.Schema.Types.ObjectId,ref:'Pet'}],    
    conversations:[{type:mongoose.Schema.Types.ObjectId,ref:'Conversation'}],    
    survey:[{type:mongoose.Schema.Types.ObjectId,ref:'Survey'}],
    isVerified:{type:Boolean,default:false},
    passwordResetToken:String,
    passwordResetExpires:Date 
},options)

mongoose.model('User',userSchema);
