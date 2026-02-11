const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); 

exports.getAllUsers = async (req, res) => {
  try{
    const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    }
  });}
  catch(err){
        res.status(404).json({status:'fail', message:err.message});
  }
};

exports.createUser = async (req, res) => {
  try {

    const hashedPassword = await bcrypt.hash(req.body.passward,12);
    const hashedpasswordConfirm = await bcrypt.hash(req.body.passward,12);

    const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword, //only encrypted code will be save
    passwordConfirm: hashedpasswordConfirm ,
    college: req.body.college,
    role: req.body.role, 
  });
   res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
}
  catch(err) {
    res.status(400).json({ststus: 'fail', message:err.message});
  }
 
};


exports.login=async(req, res) =>  {
   try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user){
        const result = await bcrypt.compare(password,user.passward);
        if(result) {
           return res.json({
            code: 200,
            message: "Login Successfully....",
            data: user
         });
      }else {
         res.json({
            code: 400,
            message: "invalid credentials",
            data: ""
         });
      }
      } 
      
   } catch (error) {
      res.json({
         code: 500,
         message: "internal server error",
         data: ""
      });
   }
};