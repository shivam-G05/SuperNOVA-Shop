const userModel=require('../models/user.model');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const redis=require('../db/redis');
const {publishToQueue}=require('../broker/broker');
async function registerUser(req,res){
    try{

        //GET USER DETAILS FROM BODY
    const{username,email,password,fullName:{firstName,lastName},role,addresses:{street,city,state,zip,country}}=req.body;
    //CHECK IF USER ALREADY EXISTS OR NOT WITH USRNAME OR EMAIL
    const isUserAlreadyExists=await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    //IF EXISTS THEN RETURN 
    if(isUserAlreadyExists){
        return res.status(409).json({message:"Username or email already exists"});
    };
    //HASH THE PASSOWRD
    const hash=await bcrypt.hash(password,10);
    //CREATE THE USER IF USER DOSES NOT EXIST ALREADY
    const user=await userModel.create({
        username,
        email,
        password:hash,
        fullName:{
            firstName,
            lastName
        },
        role,
        addresses:{
            street,
            city,
            state,
            zip,
            country
        }
    })
    
    await Promise.all([
        publishToQueue('AUTH_NOTIFICATION.USER_CREATED',{
        id:user._id,
        username:user.username,
        email:user.email,
        fullNamr:user.fullName,
        
    }),
     publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED",user)

    ])

     
    

    //CREATING TOKEN FROM USER INFO
    const token=jwt.sign({
        id:user._id,
        username:user.username,
        email:user.email,
        role:user.role
    },process.env.JWT_SECRET,{expiresIn:'1d'});
    //SET THAT COOKIE IN TOKEN AND PREVENT SERVER SIDE FROM ACCESSING IT 
    res.cookie('token',token,{
        secure:true,
        maxAge: 24*60*60*1000,
    })
    //SENDING SUCCESS RESPONSE ON CREATING USER
    res.status(201).json({
        message:"User created successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role,
            fullName:user.fullName,
            addresses:user.addresses
        }
    });
    }catch(error){
        console.log("Error registering user",error);
    };
    

};

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        // find user with password selected-because we made massword select false in usermodel
        const user = await userModel.findOne({ $or: [ { email }, { username } ] }).select('+password');
        //Check if user exists or not
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        //match the password from body and from mongodb
        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }



        //make the token
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        //set the token in cookie
        res.cookie('token', token, {
            
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        //if user logged in successfully
        return res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        });
    } catch (err) {
        // console.error('Error in loginUser:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function getCurrentUser(req,res){
    try{
        const token=req.cookies.token;
    if(!token){
        return res.status(404).json({
            message:"Token Not Found"
        })
    }
    const decoded_user=jwt.verify(token,process.env.JWT_SECRET)
    const user=await userModel.findById(decoded_user.id)
    return res.status(200).json({
        message:"User fetched successfully",
        user
    });
    }catch(err){
    console.log("Error decoding token:", err);
    return res.status(401).json({ message: "Invalid token" });
    }
    
};

// async function logoutUser(req,res){
//     const token=req.cookies.token;
//     if(token){
//         await redis.set(`blacklist:${token}`,'true','EX',24 * 60 * 60);
//     }
//     res.clearCookie('token',
//         {
//             httpOnly:true,
//             secure:true,
//         }
//     );
//     return res.status(200).json({message: "Logged out successfully"});
// };

async function logoutUser(req, res) {
  const token = req.cookies.token;

//   if (token) {
//     await redis.set(
//       `blacklist:${token}`,
//       "true",
//       "EX",
//       24 * 60 * 60
//     );
//   }

  res.clearCookie("token", {
    
    secure: true,
    sameSite: "lax"
  });

  return res.status(200).json({
    message: "Logged out successfully"
  });
}


async function getUserAddresses(req,res){

    const id =req.user.id;
    const user=await userModel.findById(id).select('addresses');
    
    if(!id){
        return res.status(404).json({
            message:"User not found"
        });
    };
    
    return res.status(200).json({
        message:"User address fetched successfully",
        addresses:user.addresses
    })
};

// async function addUserAddress(req,res){
//     const id =req.user.id;
//     const{street,city,state,zip,country,isDefault}=req.body;
    

//     const user=await userModel.findByIdAndUpdate({_id:id},
//         {
//             $push:{
//                 addresses:{
//                     street,
//                     city,
//                     state,
//                     zip,
//                     country,
//                     isDefault
//                 }

//             }
//         },{new: true});

//     if(!user){
//         return res.status(404).json({
//             message:"USER NOT FOUND"
//         });
//     };

//     return res.status(201).json({
//         message:"Address added successfully",
//         address: user.addresses[user.addresses.length-1]
//     });
// };


async function addUserAddress(req, res) {
    const userId = req.user.id;
    const { street, city, state, pincode, country, isDefault } = req.body;
    

    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "USER NOT FOUND" });
    }

    // ✅ If new address is default → unset all existing defaults
    if (isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    // ✅ Push new address
    user.addresses.push({
        street,
        city,
        state,
        pincode,
        country,
        isDefault: !!isDefault,
    });

    await user.save();

    return res.status(201).json({
        message: "Address added successfully",
        address: user.addresses[user.addresses.length - 1],
    });
}



async function deleteUserAddress(req, res) {
    const userId = req.user.id;
    const { addressId } = req.params;

    // 1. Find logged-in user
    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // 2. Check address exists inside user
    const addressObj = user.addresses.find(
        addr => addr._id.toString() === addressId
    )   ;


    if (!addressObj) {
        return res.status(404).json({ message: "No address exists" });
    }

    // 3. Remove address
    user.addresses.pull({ _id: addressId });
    await user.save();

    // 4. Return final list
    return res.status(200).json({
        message: "Deleted successfully",
        addresses: user.addresses
    });
};


module.exports={
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress
};