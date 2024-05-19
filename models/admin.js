const mongoose  = require('mongoose');
const bcrypt = require('bcrypt');
const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    }
})

adminSchema.pre('save',async function(next){
    const person = this
    //hash the password only when it's been modified or is new.
    if(!person.isModified('password')) return next();
    try{
        //generate the salt
        const salt = await bcrypt.genSalt(10);
        //generate hash
        const hashedPassword = await bcrypt.hash(person.password,salt);
        person.password = hashedPassword;
    }catch(err){
        return next(err);
    }
    next();
})

adminSchema.methods.comparePassword = async function(candidatePassword){
    try{
        const isMatch = await bcrypt.compare(candidatePassword,this.password);
        return isMatch
    }catch(err){
        throw err
    }
}

const Admin = mongoose.model('Admin',adminSchema);
module.exports = Admin;