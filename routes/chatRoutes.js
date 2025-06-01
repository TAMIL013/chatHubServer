import express from 'express';
import { startChat, continueChat, getAllChats,getChat } from '../controllers/chatController.js';

const router = express.Router();

// Start a new chat
router.post('/send', startChat);

// Continue an existing chat
router.post('/send/:id', continueChat);

// Get all chat sessions for the logged-in user
router.get('/history', getAllChats);

// Get a single chat by ID  
router.get('/:id', getChat);
export default router;
