import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mail';
import { AuthRequest } from '../middleware/auth';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log('[Registration] Request received for email:', email, 'fullName:', fullName);

    // 1. Validation Requirements
    if (!fullName || !email || !password || !confirmPassword) {
      console.log('[Registration] Error: Missing required fields');
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[Registration] Error: Invalid email format:', email);
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    // Password length validation
    if (password.length < 6) {
      console.log('[Registration] Error: Password too short');
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Password and confirm password must match
    if (password !== confirmPassword) {
      console.log('[Registration] Error: Passwords do not match');
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Prevent duplicate emails
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      console.log('[Registration] Error: User already exists with email:', email);
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Generate secure random verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours expiry

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user marked as unverified
    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    if (user) {
      console.log('[Registration] User document created successfully in DB (ID:', user._id, ')');
      // Send verification email
      console.log('[Registration] Attempting to send verification email to:', user.email);
      await sendVerificationEmail(user.email, user.fullName, verificationToken);
      console.log('[Registration] Verification email sent successfully to:', user.email);

      res.status(201).json({
        message: 'Registration successful! A verification email has been sent. Please verify your email to log in.',
      });
    } else {
      console.log('[Registration] Error: Failed to create user document');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[Registration] Error occurred:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: 'Verification token is required' });
      return;
    }

    // Find user with matching token that has not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired email verification token' });
      return;
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      message: 'Your email address has been verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Only verified users should be allowed to login
    if (!user.isVerified) {
      res.status(401).json({
        message: 'Please verify your email address before logging in.',
        notVerified: true,
      });
      return;
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      res.status(400).json({ message: 'Full name and email are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    const userId = req.user._id;

    const emailTaken = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: userId }
    });

    if (emailTaken) {
      res.status(400).json({ message: 'Email address is already in use by another user' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email: email.toLowerCase().trim() },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json({ message: 'All password fields are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ message: 'New passwords do not match' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ message: 'Server Error updating password' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    console.log('[Forgot Password] Request received for email:', email);

    if (!email) {
      console.log('[Forgot Password] Error: Email address is required but not provided');
      res.status(400).json({ message: 'Email address is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('[Forgot Password] User NOT found in database for email:', email);
      res.status(200).json({ message: 'If that email address exists, a password reset link has been sent.' });
      return;
    }

    console.log('[Forgot Password] User found in database:', user.email, '(ID:', user._id, ')');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour expiry
    await user.save();
    console.log('[Forgot Password] Reset password token generated and saved in DB');

    console.log('[Forgot Password] Attempting to send reset email via nodemailer to:', user.email);
    await sendPasswordResetEmail(user.email, user.fullName, resetToken);
    console.log('[Forgot Password] Password reset email sent successfully to:', user.email);

    res.status(200).json({ message: 'If that email address exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('[Forgot Password] Error occurred:', error);
    res.status(500).json({ message: 'Server Error sending reset link' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server Error resetting password' });
  }
};

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};
