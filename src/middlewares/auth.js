import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'


const verifyJWT = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) throw new ApiError(401, "Invalid Access Token")
        req.user = user;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

export {
    verifyJWT
}
