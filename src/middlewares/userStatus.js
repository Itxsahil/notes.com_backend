import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'


const verifyAdmin = async (req, res, next) => {
    const user = req.user
    if (user.is_admin === true) {
        next()
    } else {
        return res.status(403).json({ message: 'You are not admin to do this Func' });
    }
};


const verifyManagerorAdmin = async (req, res, next) => {
    const user = req.user
    if (user.is_manager === true || user.is_admin === true) {
        next()
    } else {
        return res.status(403).json({ message: 'You need to be admin or a manager to perform this operation' });
    }
};


export {
    verifyAdmin,
    verifyManagerorAdmin
}
