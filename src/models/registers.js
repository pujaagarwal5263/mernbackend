const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
       type: String,
       required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
     },
    gender: {
        type: String,
        required: true
     },
     phone:{
        type: Number,
        required: true,
        unique:true  
     },
     age:{
         type: Number,
         required: true
     },
     password:{
        type: String,
        required: true 
     },
     confirmPassword:{
        type: String,
        required: true
     },
     tokens:[{
        token:{
           type: String,
           required: true
        }
     }]
})

//generate tokens
employeeSchema.methods.generateAuthToken = async function(){
   try{
     //console.log(this._id);
     const token = await jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
     this.tokens = this.tokens.concat({token});
     await this.save();
     return token;
   } catch(error){
      res.send(`The error part ${error}`);
      console.log(error);
   }
}

//middleware
employeeSchema.pre("save", async function(next){
   if(this.isModified("password")){
        //const passwordHash= await bcrypt.hash(password, 4);
        //console.log(`password is ${this.password}`);
        this.password= await bcrypt.hash(this.password,4);
        //console.log(`password is ${this.password}`);

        //so that you don;t store password twice. SAVE SPACE
        this.confirmPassword=await bcrypt.hash(this.password,4);
   }
   next();
})

//creating a collection
const Register = new mongoose.model("Register",employeeSchema);

module.exports = Register;