import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.js'
import { verifyAdmin } from '../middlewares/userStatus.js'
import {
    register,
    login,
    logout,
    applyManger,
    managerRequests,
    toggelMaanagerStatus
} from "../controllers/authController.js"

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(verifyJWT, logout)
router.route("/applyManager").post(verifyJWT, applyManger)
router.route("/managerRequestes").get(verifyJWT, verifyAdmin, managerRequests)
router.route("/toggelMaanagerStatus/:userId").post(verifyJWT, verifyAdmin, toggelMaanagerStatus)

export default router