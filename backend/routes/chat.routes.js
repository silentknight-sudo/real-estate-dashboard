import express from 'express';
import {
    getOrCreateChat,
    sendMessage,
    getAllChats,
    getChatById,
    closeChat,
    deleteChat,
    getChatStats,
    markChatAsRead,
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', getOrCreateChat);
router.post('/:id/messages', sendMessage);
router.get('/', getAllChats);
router.get('/stats', getChatStats);
router.get('/:id', getChatById);
router.patch('/:id/close', closeChat);
router.patch('/:id/read', markChatAsRead);
router.delete('/:id', deleteChat);

export default router;
