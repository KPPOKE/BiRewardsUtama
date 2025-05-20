import express from 'express';
import {
  getUserTransactions,
  addPoints,
  redeemReward,
  getTransactionStats
} from '../Controllers/transactionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get user transactions
router.get('/users/:userId/transactions', getUserTransactions);

// Get transaction statistics
router.get('/users/:userId/transactions/stats', getTransactionStats);

// Add points (admin/cashier only)
router.post('/users/:userId/points', authorize('admin', 'cashier'), addPoints);

// Redeem reward
router.post('/users/:userId/redeem', redeemReward);

export default router; 