import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../models/User';
import TempUser from '../models/TempUser'; 
import crypto from 'crypto';
import { sendResetEmail } from '../utils/email';

export const register = async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;
  console.log('req.body', req.body);

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }
      if (existingUser.phone === phone) {
        res.status(400).json({ message: 'Phone number already registered' });
        return;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);


    await TempUser.findOneAndDelete({ email });
   
    await TempUser.create({
      email,
      phone,
      password: hashedPassword,
      otp,
      expires
    });

    const html = `
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendResetEmail(email, 'Email Verification OTP', html);

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Error processing registration' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
     console.log("resendotp called ",req.body)
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      res.status(400).json({ message: 'No pending registration found for this email' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes


    tempUser.otp = otp;
    tempUser.expires = expires;
    await tempUser.save();

    const html = `
      <p>Your new OTP for email verification is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendResetEmail(email, 'Email Verification OTP', html);

    res.status(200).json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    console.error('Error in resending OTP:', error);
    res.status(500).json({ message: 'Error resending OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      res.status(400).json({ message: 'No pending registration found for this email' });
      return;
    }

    if (tempUser.expires < new Date()) {
      await TempUser.findOneAndDelete({ email });
      res.status(400).json({ message: 'OTP has expired. Please register again.' });
      return;
    }

    if (tempUser.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const user = new User({
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });
    await user.save();

    await TempUser.findOneAndDelete({ email });

    res.status(201).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("req.body", req.body);
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(200).json({ message: 'Password reset instructions have been sent to your email address if it exists in our system.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
   
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
      <p>You requested a password reset</p>
      <p>Click this link to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link is valid for 1 hour</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    await sendResetEmail(user.email, 'Password Reset Request', html);
    
    res.status(200).json({ message: 'Password reset instructions have been sent to your email address.'  });
  
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }
    
    user.password = await bcrypt.hash(password, 10);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};