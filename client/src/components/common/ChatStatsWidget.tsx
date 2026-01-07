import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
} from '@pankod/refine-mui';
import {
  Chat,
  ChatBubble,
  People,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

interface ChatStats {
  totalChats: number;
  activeChats: number;
  closedChats: number;
  totalMessages: number;
}

const ChatStatsWidget = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChatStats();
    // Update stats every 30 seconds
    const interval = setInterval(fetchChatStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChatStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/chats/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="#808191">Loading chat statistics...</Typography>
      </Paper>
    );
  }

  if (!stats) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="#808191">Unable to load chat statistics</Typography>
      </Paper>
    );
  }

  const statCards = [
    {
      title: 'Total Chats',
      value: stats.totalChats,
      icon: <Chat sx={{ fontSize: 24, color: '#667eea' }} />,
      color: '#667eea',
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      icon: <ChatBubble sx={{ fontSize: 24, color: '#2ED480' }} />,
      color: '#2ED480',
    },
    {
      title: 'Closed Chats',
      value: stats.closedChats,
      icon: <CheckCircle sx={{ fontSize: 24, color: '#FD8539' }} />,
      color: '#FD8539',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: <People sx={{ fontSize: 24, color: '#475BE8' }} />,
      color: '#475BE8',
    },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Chat sx={{ color: '#667eea' }} />
        <Typography variant="h6" fontWeight={600} color="#11142D">
          Customer Support Overview
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {statCards.map((card, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: `${card.color}10`,
                border: `1px solid ${card.color}20`,
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box display="flex" justifyContent="center" mb={1}>
                {card.icon}
              </Box>
              <Typography variant="h4" fontWeight={700} color={card.color}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="#808191" fontSize="12px">
                {card.title}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={3} pt={2} borderTop="1px solid #e0e0e0">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="#808191">
            Active conversations
          </Typography>
          <Chip
            label={`${stats.activeChats} active`}
            size="small"
            color={stats.activeChats > 0 ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatStatsWidget;