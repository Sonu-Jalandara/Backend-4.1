import { asyncHandler } from "../utils/asyncHandler.js";
import { User }  from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler ( async (req,res)=>{
    // res.status(200).json({
    //     message : "Sonu"
    // })

//    Step 1.-- get user details from frontend

    const {fullname, email, password, username} = req.body
    // console.log("email :", email)
    // console.log("fullname:", fullname)
    // console.log("password :", password)
    // console.log("username :", username)

    console.log(`email:${email}, 
        password:${password},
         username:${username}, 
         fullname:${fullname}`)

                              // step 2 -- checking fields are not empty

                              // method 1
        if(
            [fullname,email,password,username].some(
                (field)=>field?.trim() === ""
            )
        ) 
            {
            throw new ApiError(400, "All fields are required")
            }

        
                               // method 2

        //  if(fullname === ""){
        //   throw new  ApiError (400, "Fullname is required")
        //  }
        //  if(email === ""){
        //   throw new  ApiError (400, "email is required")
        //  }
        //  if(password === ""){
        //   throw new  ApiError (400, "password is required")
        //  }
        //  if(username === ""){
        //   throw new  ApiError (400, "username is required")
        //  }

        //        Step 3. -- checking user already exits or not by : email, username

      const existedUser =  User.findOne({
            $or:[
                { username},
                { email }
            ]
        })
        if(existedUser){
            throw new ApiError(400, "User is already exits with this email or username")
        }

        //   Step 4. --- Check for Image 
       const avatarLocalPath =  req.files?.avatar[0]?.path;
       const coverImageLocalPath = req.files?.coverImage[0]?.path;

       if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
       }

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!avatar){
        throw new ApiError(400, "Avatar file is required")
      }
       // Step 6. --- creating a user object in database
     const user = await  User.create ({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || " "

       })

       // Step 7. --- checking user is created and removing password, refreshToken field.
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser){
        throw new ApiError( 500, "Something went wrong while registration")
      }

       // Step 8. --- Return Response
 
       return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
       )
})

export { 
    registerUser,

 }