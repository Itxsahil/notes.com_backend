import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			requiired: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		is_admin: {
			type: Boolean,
			default: false
		},
		is_manager: {
			type: Boolean,
			default: false
		},
		refreshToken: {
			type: String
		},
		isPendingManager: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true
	}
);

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})//it encrypt the passwrd field if it is the field to be update

UserSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password)//it  returns a boolian value by comparing the encrypeted password and the plain text password
}//we can create a number of custom methodes like this by using "methodes"

UserSchema.methods.generateAcessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullname: this.fullname
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY
		}
	)
}

UserSchema.methods.generateRfreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY
		}
	)
}
export const User = mongoose.model('User', UserSchema);
