import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    messages: [
      {
        id: String,
        sender: {
          type: String,
          enum: ["user", "support"],
          required: true,
        },
        senderName: String,
        senderAvatar: String,
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isOpen: {
      type: Boolean,
      default: true,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", chatSchema);

export default ChatModel;
