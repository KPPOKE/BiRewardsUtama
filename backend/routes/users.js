import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserProfile,
  loginUser
} from '../Controllers/userController.js'
import multer from 'multer';
import path from 'path';
import { validate, schemas } from '../middleware/validate.js';

const router = express.Router();

// Multer setup for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(ext);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'));
  }
});

router.get('/users', getAllUsers);
router.post('/users', validate(schemas.user.create), createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// New profile endpoints
router.get('/users/:id/profile', getUserProfile);
router.post('/users/:id/profile-image', upload.single('profile_image'), uploadProfileImage);

// Login endpoint
router.post('/users/login', validate(schemas.user.login), loginUser);

export default router;