import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'

const generateAccessAndRefreshTokens = async(UserId)=>{
    try {
        const user = await User.findById(UserId);
        
        const accessToken = await user.generateAccessToken();
        
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken
        
        await user.save({validateBeforeSave: false}) // yeh isliye kiya h kyuki vrna yeh dubara sara data validate krta password vagera ab yeh bs tokens save krega

        return {accessToken,refreshToken}

    } catch (error) {
        throw new Error("Failed to generate tokens")
    }
}

export const registerUser = async(req,res)=>{
    console.log(req.body);
    
    try {
        const {name,email,password,role} = req.body;
    
        if(
            [name,email,password,role].some((field)=> field?.trim()==="" )
        ){
            throw new Error("Fill all the fields");
        }

        const existedUser = await User.findOne({email})

        if(existedUser){
            return res.status(400).json({ message: "User already exists" });
        }
        
        const user = await User.create({
            name,
            email,
            role,
            password
        })
        console.log("User created");

        const accessToken = await user.generateAccessToken();
        
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        await user.save()

        const options = {
            httpOnly: true, 
            secure: true,
            sameSite: "lax"
        }
        
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            {
                User:user.name,
                message:"User created successfully",
                status:200
            }
        )
    } catch (error) {
        console.log("Error while registration: ",error.message);
    }
}

export const loginUser = async(req,res)=>{
    
    
    try {
        const {email, password} = req.body;
       
        
    
        if([email,password].some((field)=>field?.trim()=="")) throw new Error("Fill all the fields");
    
        const user = await User.findOne({
            $or: [{email}]
        });
    
        if(!user) throw new Error("Invalid user credentials");
        
        const isMatch = await user.isPasswordCorrect(password);
    
    
        if(!isMatch)throw new Error("Invalid user credentials");
        
        const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -createdAt -updatedAt");
        
        const options = {
            httpOnly: true, 
            secure: true
        }
        
        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(
                        {
                            user:loggedInUser,
                            message: "User logged in successfully",
                            status:200
                        }
                )
    } catch (error) {
        console.log("Error while logging in the user",error.message)
    }

}

export const logoutUser = async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,                                                         // sirf server se modify krskte h frontend se nhi kr skte
        secure: true
    }

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json({message: "User logged out successfully"})   
}

export const refreshAccessToken = async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken                                                                              // req.cookies se token ko uthalete h

    if(!incomingRefreshToken){
        throw new Error("Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify( 
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new Error("Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new Error("Invalid Token is expired or used")
        }
    
        
    
        const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id);
        const newRefreshToken = refreshToken;

        await user.save({validateBeforeSave: false})
        
        const options = {
            httpOnly: true,                                                         // sirf server se modify krskte h frontend se n
            secure: true
        }
    
        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",newRefreshToken,options)
                .json(
                    {
                        message: "Access Token Refreshed"
                    }
                )
    } catch (error) {
        console.log("Error while generating access token",error);
    }
}

export const changeCurrentPassword = async(req,res)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new Error("Invalid old password");
    }

    user.password = newPassword
    user.save({validateBeforeSave: false}) // saves data directly without validation

    return res
            .status(200)
            .json(
                {
                message:"Password changed successfully"
                }
            )
}

export const getCurrentUser = async(req,res)=>{
    return res
            .status(200)
            .json({
                user: req.user,
                message:"Current user fetched successfully"
            })
}

export const updateAccountDetails = async(req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new Error("Please fill in all fields");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name: name,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
            .status(200)
            .json(
                {
                message:"Account details updated successfully"
                }
            )
}

export const updateUserAvatar = async(req,res)=>{

    const avatarLocalPath = req.file.path;

    if(!avatarLocalPath){
        throw new Error("Please upload an avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new Error("Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
            .status(200)
            .json(
                {
                    message:"avatar updated successfully"
                }
            )
}

export const authenticateWithMetaMask = async (req, res) => {
    try {
        const { walletAddress } = req.body; 
        if (!walletAddress) {
            return res.status(400).json({ message: "Wallet address required!" });
        }

        let user = await User.findOne({ walletAddress });
        
        if (!user) {
            user = await User.findOne(req.user._id)
            if (!user) {
                return res.status(404).json({ message: "User not found! Please register first." });
            }
            user.walletAddress = walletAddress;
            await user.save();
            console.log("✅ Wallet address linked:", user.email);
        }

        res.status(200).json({ message: "User authenticated", user });
    } catch (error) {
        console.error("❌ MetaMask authentication error", error);
        res.status(500).json({ message: "Server error" });
    }
};

