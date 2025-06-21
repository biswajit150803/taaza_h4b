import express from 'express';
import { getUserProducts, saveScannedProd } from '../controllers/userController.js';
const userRouter = express.Router();

// userRouter.get('/profile',storeCivicUserIfNotExists, getUserProfile);
userRouter.post('/save-product', saveScannedProd);
userRouter.get('/user-inventory/:userId', getUserProducts);

export default userRouter;