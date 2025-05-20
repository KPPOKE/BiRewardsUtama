import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserProfile
} from '../Controllers/userController.js'
import multer from 'multer';
import path from 'path';

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
const upload = multer({ storage });

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// New profile endpoints
router.get('/users/:id/profile', getUserProfile);
router.post('/users/:id/profile-image', upload.single('profile_image'), uploadProfileImage);

export default router;