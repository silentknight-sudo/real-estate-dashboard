import Chat from '../models/chat.js';
import { v4 as uuidv4 } from 'uuid';

// Get or create chat for a user
const getOrCreateChat = async (req, res) => {
    try {
        const { userId, userName, userEmail, userAvatar } = req.body;

        let chat = await Chat.findOne({ userId });

        if (!chat) {
            chat = await Chat.create({
                userId,
                userName,
                userEmail,
                userAvatar,
                messages: [],
                isOpen: true,
            });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { chatId, message, sender, senderName, senderAvatar } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const newMessage = {
            id: uuidv4(),
            sender,
            senderName,
            senderAvatar,
            message,
            timestamp: new Date(),
        };

        chat.messages.push(newMessage);
        chat.lastMessageTime = new Date();
        await chat.save();

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all chats
const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find().sort({ lastMessageTime: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get chat by ID
const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Close chat
const closeChat = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findByIdAndUpdate(
            id,
            { isOpen: false },
            { new: true }
        );

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete chat
const deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        await Chat.findByIdAndDelete(id);

        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getOrCreateChat,
    sendMessage,
    getAllChats,
    getChatById,
    closeChat,
    deleteChat,
};
