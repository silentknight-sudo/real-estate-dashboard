import express from 'express';
import {
    getOrCreateChat,
    sendMessage,
    getAllChats,
    getChatById,
    closeChat,
    deleteChat,
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', getOrCreateChat);
router.post('/:id/messages', sendMessage);
router.get('/', getAllChats);
router.get('/:id', getChatById);
router.patch('/:id/close', closeChat);
router.delete('/:id', deleteChat);

export default router;
