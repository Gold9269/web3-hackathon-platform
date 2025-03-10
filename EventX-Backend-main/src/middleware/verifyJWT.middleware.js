import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const verifyJWT = async (req, res, next) => {
    
    try {
        const token = req.cookies?.accessToken;
    
        if(!token) return res.status(401).json({message:"Access token is missing"})
    
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decoded._id)
    
        if(!user) throw new Error("Invalid Access Token")
    
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(403).json({ message: "Unauthorized: Invalid or expired token" });
    }
}