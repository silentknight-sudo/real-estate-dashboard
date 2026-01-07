import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@pankod/refine-mui';
import {
  Send,
  Close,
  Minimize,
  ExpandMore,
  Support,
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
  messages: Message[];
  isOpen: boolean;
}

const SupportChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await axios.post(
        'http://localhost:8080/api/v1/chats',
        {
          userId: user.userid,
          userName: user.name || 'Guest',
          userEmail: user.email || 'guest@example.com',
          userAvatar: user.avatar || '',
        }
      );

      setChatId(response.data._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    if (!chatId) {
      initializeChat();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user.name || 'You',
      senderAvatar: user.avatar || '',
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/chats/${chatId}/messages`,
        {
          message: inputMessage,
          sender: 'user',
          senderName: user.name || 'You',
          senderAvatar: user.avatar || '',
        }
      );

      setMessages(response.data.messages || []);

      // Simulate support team response after 2 seconds
      setTimeout(() => {
        const supportResponse: Message = {
          id: Date.now().toString(),
          sender: 'support',
          senderName: 'Support Team',
          senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support',
          message:
            'Thank you for your message! Our support team will get back to you shortly. How can we assist you today?',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, supportResponse]);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async () => {
    if (chatId) {
      try {
        await axios.patch(`http://localhost:8080/api/v1/chats/${chatId}/close`);
      } catch (error) {
        console.error('Error closing chat:', error);
      }
    }
    setIsOpen(false);
    setChatId(null);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999,
        }}
      >
        {!isOpen && (
          <Fade in={!isOpen}>
            <Box
              onClick={handleOpenChat}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#667eea',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              <Support sx={{ fontSize: 32 }} />
            </Box>
          </Fade>
        )}
      </Box>

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <Fade in={isOpen && !isMinimized}>
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: { xs: '90%', sm: '400px' },
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              zIndex: 1000,
              backgroundColor: '#FCFCFC',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Support />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    Customer Support
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    We typically reply in minutes
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(true)}
                  sx={{ color: 'white' }}
                >
                  <Minimize sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCloseChat}
                  sx={{ color: 'white' }}
                >
                  <Close sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Welcome Message */}
            {showWelcome && messages.length === 0 && (
              <Box sx={{ p: 2, backgroundColor: '#F8F9FA' }}>
                <Typography variant="body2" color="#11142D" mb={1}>
                  👋 Welcome! How can we help you today?
                </Typography>
                <Typography variant="caption" color="#808191">
                  Our support team is here to assist with any questions about our properties or services.
                </Typography>
              </Box>
            )}

            {/* Messages Container */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#FCFCFC',
                maxHeight: '400px',
              }}
            >
              {messages.length === 0 && !showWelcome && (
                <Typography
                  variant="body2"
                  color="#808191"
                  textAlign="center"
                  sx={{ my: 2 }}
                >
                  No messages yet. Start a conversation!
                </Typography>
              )}

              {messages.map((msg) => (
                <Fade in key={msg.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent:
                        msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        maxWidth: '85%',
                        flexDirection:
                          msg.sender === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        src={msg.senderAvatar}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor:
                            msg.sender === 'user' ? '#667eea' : '#2ED480',
                        }}
                      >
                        {msg.senderName[0]}
                      </Avatar>
                      <Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            backgroundColor:
                              msg.sender === 'user'
                                ? '#667eea'
                                : '#E8E8E8',
                            color:
                              msg.sender === 'user'
                                ? 'white'
                                : '#11142D',
                            borderRadius: 2,
                            wordBreak: 'break-word',
                          }}
                          elevation={0}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ fontSize: '12px', opacity: 0.7, mb: 0.5 }}
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
                </Fade>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* Input Box */}
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                size="small"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  },
                }}
              >
                <Send sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <Fade in={isMinimized}>
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: '300px',
              borderRadius: 3,
              zIndex: 1000,
              backgroundColor: '#667eea',
              color: 'white',
              p: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              },
            }}
            onClick={() => setIsMinimized(false)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Support />
              <Typography fontWeight={600} variant="body2">
                Customer Support
              </Typography>
            </Box>
            <ExpandMore />
          </Paper>
        </Fade>
      )}
    </>
  );
};

export default SupportChatBox;
