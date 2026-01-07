import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Badge,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@pankod/refine-mui';
import {
  Send,
  Close,
  Chat,
  Person,
  AccessTime,
  Message,
  SupportAgent,
} from '@mui/icons-material';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  messages: Message[];
  isOpen: boolean;
  lastMessageTime: string;
  createdAt: string;
}

const ChatManagement = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmClose, setConfirmClose] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChats();
    // Set up polling for new messages every 5 seconds
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedChat) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'support',
      senderName: user.name || 'Support Agent',
      senderAvatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=support',
      message: replyMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/api/v1/chats/${selectedChat._id}/messages`,
        {
          message: replyMessage,
          sender: 'support',
          senderName: user.name || 'Support Agent',
          senderAvatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=support',
        }
      );

      setSelectedChat(response.data);
      setReplyMessage('');
      fetchChats(); // Refresh chat list
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      await axios.patch(`http://localhost:8080/api/v1/chats/${chatId}/close`);
      setConfirmClose(null);
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message.length > 50
      ? lastMsg.message.substring(0, 50) + '...'
      : lastMsg.message;
  };

  const getUnreadCount = (chat: Chat) => {
    return chat.messages.filter(msg => msg.sender === 'user').length;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 2 }}>
      {/* Chat List Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: '350px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600} color="#11142D">
            Customer Support Chats
          </Typography>
          <Typography variant="body2" color="#808191" mt={0.5}>
            {chats.filter(chat => chat.isOpen).length} active conversations
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
          {chats.map((chat) => (
            <ListItem
              key={chat._id}
              button
              selected={selectedChat?._id === chat._id}
              onClick={() => setSelectedChat(chat)}
              sx={{
                borderBottom: '1px solid #f0f0f0',
                '&.Mui-selected': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={getUnreadCount(chat)}
                  color="error"
                  invisible={getUnreadCount(chat) === 0}
                >
                  <Avatar src={chat.userAvatar}>
                    {chat.userName[0]}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight={500}>
                      {chat.userName}
                    </Typography>
                    <Chip
                      label={chat.isOpen ? 'Active' : 'Closed'}
                      size="small"
                      color={chat.isOpen ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="#808191" noWrap>
                      {getLastMessage(chat)}
                    </Typography>
                    <Typography variant="caption" color="#808191">
                      {formatTime(chat.lastMessageTime)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {chats.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Chat sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="#808191">
              No chat conversations yet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Chat Conversation Area */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
        }}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedChat.userAvatar}>
                  {selectedChat.userName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedChat.userName}
                  </Typography>
                  <Typography variant="body2" color="#808191">
                    {selectedChat.userEmail}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Chip
                  label={selectedChat.isOpen ? 'Active' : 'Closed'}
                  color={selectedChat.isOpen ? 'success' : 'default'}
                  size="small"
                />
                {selectedChat.isOpen && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => setConfirmClose(selectedChat._id)}
                  >
                    Close Chat
                  </Button>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#fafafa',
              }}
            >
              {selectedChat.messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Message sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="body2" color="#808191">
                    No messages in this conversation yet
                  </Typography>
                </Box>
              ) : (
                selectedChat.messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent:
                        msg.sender === 'support' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        maxWidth: '70%',
                        flexDirection:
                          msg.sender === 'support' ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        src={msg.senderAvatar}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor:
                            msg.sender === 'support' ? '#2ED480' : '#667eea',
                        }}
                      >
                        {msg.senderName[0]}
                      </Avatar>
                      <Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            backgroundColor:
                              msg.sender === 'support'
                                ? '#2ED480'
                                : '#ffffff',
                            color:
                              msg.sender === 'support'
                                ? 'white'
                                : '#11142D',
                            borderRadius: 2,
                            boxShadow: 1,
                          }}
                          elevation={0}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ fontSize: '11px', opacity: 0.8, mb: 0.5 }}
                          >
                            {msg.senderName}
                          </Typography>
                          <Typography variant="body2">
                            {msg.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.6,
                            }}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Reply Input */}
            {selectedChat.isOpen && (
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    multiline
                    maxRows={3}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isLoading}
                    sx={{
                      backgroundColor: '#2ED480',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#25B86F',
                      },
                      '&:disabled': {
                        backgroundColor: '#ccc',
                      },
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
            }}
          >
            <SupportAgent sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="#808191" mb={1}>
              Select a conversation
            </Typography>
            <Typography variant="body2" color="#808191" textAlign="center">
              Choose a chat from the sidebar to view and reply to customer messages
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Confirm Close Dialog */}
      <Dialog open={!!confirmClose} onClose={() => setConfirmClose(null)}>
        <DialogTitle>Close Chat</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to close this chat? The customer will no longer be able to send messages.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(null)}>Cancel</Button>
          <Button
            onClick={() => confirmClose && handleCloseChat(confirmClose)}
            color="error"
            variant="contained"
          >
            Close Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatManagement;
