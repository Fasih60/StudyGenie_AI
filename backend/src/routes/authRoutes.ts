import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  updateProfile, 
  updatePassword, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);

// Password Recovery Pathways
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Profile & Settings Updates
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;
