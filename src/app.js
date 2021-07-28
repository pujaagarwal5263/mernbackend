require('dotenv').config();
const express = require("express");
const app = express();
const path=require("path");
const cookieParser = require("cookie-parser");
const auth=require("./middlewares/auth");

//for establishing database connection
require("./db/conn");
const hbs=require("hbs");
const Register = require("./models/registers")

const port= process.env.PORT || 3000;

const static_path=path.join(__dirname,"../public");
const template_path =path.join(__dirname,"../templates/views");
const partials_path =path.join(__dirname,"../templates/partials");

//to get data in readable format
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

//using bcrypt to secure passwords
const bcrypt=require("bcryptjs");

// const securePassword = async (password) =>{
//    const passwordHash= await bcrypt.hash(password, 4);
//    console.log(passwordHash);
// }
// securePassword("thapa@123");
//$2a$04$CjpqtBx7c.tjIwvq6F8hbOTc21G6nTvI5xrUr.2bdxSMSiV4pxUhG

app.get("/", (req,res)=>{
   res.render("index");
})

app.get("/secret", auth, (req,res)=>{
   //console.log(`this is a saved cookie ${req.cookies.jwt}`);
   res.render("secret");
})

app.get("/logout",auth,async(req,res)=>{
   try{
   //Single logout
   // req.user.tokens = req.user.tokens.filter((currElement)=>{
   //   return currElement.token != req.token
   // })

   //logout from all devices
   //req.user.tokens=[];

   //deleting the cookie
    res.clearCookie("jwt");
    console.log("Logout Successful");

    await req.user.save();
    res.render("login");
   }catch(error){
      res.status(500).send(error);
   }
})

app.get("/login", (req,res)=>{
   res.render("login");
})

app.get("/register", (req,res)=>{
   res.render("register");
})

//create a new user in our db
app.post("/register", async (req,res)=>{
   try{
      //req.body.password --> gets value added in input box
     const password=req.body.password;
     const cpassword=req.body.confirmPassword;
     if(password === cpassword){
         const registerEmployee = new Register({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            gender : req.body.gender,
            phone: req.body.phone,
            age: req.body.age,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
         })
      //console.log(`The success part ${registerEmployee}`);

      const token = await registerEmployee.generateAuthToken();
      console.log(`the token part ${token}`);

      //store token into cookies
      //res.cookie(name,value,[options])
      res.cookie("jwt",token,{
         expires:new Date(Date.now() + 60000),
         httpOnly:true
      });

      const registered = await registerEmployee.save();
      res.status(201).render(index);
     }
     else{
        res.send("Passwords are not matching")
     }
   }
   catch(error){
     res.status(400).send(error);
   }
})

//login validation
app.post("/login",async(req,res)=>{
   try{
     const email=req.body.email;
     const password=req.body.password;

     //db.collection.findOne(query,projection)
     //helps to find out document that specifies the criteria
     const useremail = await Register.findOne({email:email});
     const isMatch = await bcrypt.compare(password, useremail.password);

      const token = await useremail.generateAuthToken();
      console.log(`the token part ${token}`);

      res.cookie("jwt",token,{
         expires:new Date(Date.now() + 60000),
         httpOnly:true,
         //secure:true
      });

     //if(useremail.password === password){
      if(isMatch){
       res.status(201).render("index");      
     }else{
        res.send("Passwords are not matching");
     }
   }catch(error){
      res.status(400).send("Invalid Credentials");
   }
})

const jwt = require("jsonwebtoken");

// const createToken=async()=>{
//    //creating a user
//    const token = await jwt.sign({_id:"60ea89973783c704ec1e60b7"},"mynameismisspujaagarwal",{
//       expiresIn:"2 minutes"
//    });
//    console.log(token);

//   //user verification 
//   const userVer =  await jwt.verify(token, "mynameismisspujaagarwal");
//   console.log(userVer);
// }

// createToken();

app.listen(port,()=>{
   console.log(`Listening to ${port}`);
})