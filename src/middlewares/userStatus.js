import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'


const verifyAdmin = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) throw new Error({ message: "Invalid Access Token" })
        if (user.is_admin !== true) throw new Error({ message: "unautharized request" })
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};


const verifyManagerorAdmin = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) throw new Error({ message: "Invalid Access Token" })
        if (user.is_manager === true || user.is_admin === true){
            next()
        } else{
            return res.status(403).json({ message: 'Unauthorized access' });
        }
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};


export {
    verifyAdmin,
    verifyManagerorAdmin
}
