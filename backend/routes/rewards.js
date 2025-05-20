import express from 'express';
import {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getRewardById,
  getAvailableRewards
} from '../Controllers/rewardController.js';

const router = express.Router();

// Get all rewards
router.get('/rewards', getAllRewards);

// Get reward by ID
router.get('/rewards/:id', getRewardById);

// Create new reward
router.post('/rewards', createReward);

// Update reward
router.put('/rewards/:id', updateReward);

// Delete reward
router.delete('/rewards/:id', deleteReward);

// Get available rewards for user
router.get('/users/:userId/rewards', getAvailableRewards);

export default router;
