const mongoose = require('mongoose');
const Schema    = mongoose.Schema;

const petSchema = new Schema({
    species:{type:String,required:true},
    breed:{type:String,required:true},
    name:{type:String,required:true},
    gender:{type:String,required:true},
    dob:{type:Date,required:true},    
    neutered:{type:Boolean,required:true},
    vaccinated:{type:Boolean,required:true},
    bio:{type:String,required:true},
    city:{type:String,required:true},
    country:{type:String,required:true},
    province:{type:String,required:true},
    pictures:[{type:mongoose.Schema.Types.ObjectId,ref:'Picture'}],
    videos:[{type:mongoose.Schema.Types.ObjectId,ref:'Videos'}],
    owner: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
    ad:{type:mongoose.Schema.Types.ObjectId,ref:'Ad'} 
});

module.exports = mongoose.model('Pet',petSchema);
