import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  PriorityHigh,
  CalendarToday,
  AccessTime,
  Person
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const announcements = [
  {
    id: 1,
    title: 'Annual Company Retreat 2024',
    content: 'Join us for our annual company retreat at the mountain resort.',
    priority: 'High',
    date: 'Feb 15, 2024',
    time: '10:00 AM',
    author: 'HR Department'
  },
  {
    id: 2,
    title: 'New Health Insurance Benefits',
    content: 'We have upgraded our health insurance plan with better coverage.',
    priority: 'High',
    date: 'Feb 14, 2024',
    time: '2:30 PM',
    author: 'Benefits Team'
  }
];

const AnnouncementsList = () => {
  return (
    <Box>
     

      <List sx={{ p: 0 }}>
        {announcements.map((announcement, index) => (
          <React.Fragment key={announcement.id}>
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                      {announcement.title}
                    </Typography>
                    <Chip
                      label={announcement.priority}
                      size="small"
                      sx={{
                        backgroundColor:
                          announcement.priority === 'High' ? alpha('#dc2626', 0.1) :
                            announcement.priority === 'Medium' ? alpha('#d97706', 0.1) :
                              alpha('#059669', 0.1),
                        color:
                          announcement.priority === 'High' ? '#dc2626' :
                            announcement.priority === 'Medium' ? '#d97706' :
                              '#059669',
                        fontSize: '0.7rem',
                        height: 20,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {announcement.content}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        <CalendarToday sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        {announcement.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <AccessTime sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                        {announcement.time}
                      </Typography>
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < announcements.length - 1 && (
              <Divider sx={{ mx: 0 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AnnouncementsList;