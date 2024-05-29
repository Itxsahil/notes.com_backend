import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'


const verifyJWT = async (req, res, next) => {
    const token =  req.header("Authorization")?.replace("Bearer ", "") || req.cookies.accessToken
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) return res.json({message : "Invalid Access Token" })
        req.user = user;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

export {
    verifyJWT
}
