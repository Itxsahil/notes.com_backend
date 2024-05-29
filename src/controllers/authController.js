import 'dotenv/config'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js';
import { asyncHandler } from "../utils/asyncHandler.js"


// email validation
const isValidGmail = (email) => {
    // Regular expression for validating Gmail addresses
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(email);
}


const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRfreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // validate before save help us to tackel required field cuz we dont want to change all the data fields before updating

        return { accessToken, refreshToken };
    } catch (error) {
        throw error
    }
}; // a method to generate access and refresh token which accepts the method to generate tokens which is designed in the user_model

const register = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.json({ message: "please provide all creadientials" })
    }
    const v_email = isValidGmail(email)
    if (v_email !== true) return res.json({ message: "please enter a valid email" })
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = await User.create({
            username,
            password,
            email
        })

        user = await User.findById(user._id)
            .select("-password -refreshToken -is_admin -is_manager")

        res.status(201).json({ message: 'User registered', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.isPasswordCorrect(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials(i.e password)' });

        const { accessToken, refreshToken } = await generateAccessRefreshTokens(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }
        const logeduser = await User.findById(user._id).select("-password -refreshToken")
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ 
                message: 'User logged in', 
                logeduser, 
                accessToken, 
                refreshToken 
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            },
        },
        {
            new: true, // it gives the updated value of user in which we dont have the refreshToken valuse
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "user logged out sucessfully" });
});

const applyManger = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if (!userId) return res.status(400).json({ message: "provide your ID" })
    const user = await User.findByIdAndUpdate(userId, {
        isPendingManager: true
    },
        {
            new: true
        }
    )
    if (!user) return res.status(404).json({ message: "user not exist" })
    return res.status(200).json({ message: "request submited", user })
})

const managerRequests = asyncHandler(async (req, res) => {
    const requests = await User.find({ isPendingManager: true, is_manager: false })
        .select("-password -refreshToken -is_admin -is_manager")
    if (requests.length === 0) return res.status(200).json({ message: "no requests till now" })
    res.status(200).json({ message: "the requested users are...", requests })
})

const toggelMaanagerStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) return res.json({ message: "please provide an user id" })
    const user = await User.findByIdAndUpdate(userId).select("-password -refreshToken -is_admin")
    user.is_manager = !user.is_manager
    await user.save()
    return res.status(200).json({ message: "status toggeled sucessfully", user })
})
export {
    register,
    login,
    logout,
    applyManger,
    managerRequests,
    toggelMaanagerStatus
}