import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, Paper, List, ListItem, 
  ListItemText, Divider, FormControl, InputLabel, Select, MenuItem, 
  Pagination, Chip, CircularProgress
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EventIcon from '@mui/icons-material/Event';

// Stage 1 Deterministic Priority Matrix
const TYPE_WEIGHTS = { "Placement": 3, "Result": 2, "Event": 1 };

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Tab 0 State (Direct Query Parameters)
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5; 

  // Tab 1 State (Computed Priority Inbox)
  const [priorityNotifications, setPriorityNotifications] = useState([]);

  // Local state tracking for Read/Unread Status
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem('viewed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // FETCH EFFECT FOR TAB 0: Runs dynamically whenever page or filters change using backend query params
  useEffect(() => {
    const fetchWithQueryParams = async () => {
      setLoading(true);
      try {
        // Constructing the URL string with mandatory assignment query items
        let url = `http://4.224.186.213/evaluation-service/notifications?page=${page}&limit=${limit}`;
        if (typeFilter) {
          url += `&notification_type=${typeFilter}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error running query parameters fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentTab === 0) {
      fetchWithQueryParams();
    }
  }, [page, typeFilter, currentTab]);

  // FETCH EFFECT FOR TAB 1: Fetches the base dataset once to compute deterministic Stage 1 Priority Order
  useEffect(() => {
    const fetchPriorityInbox = async () => {
      try {
        const response = await fetch('http://4.224.186.213/evaluation-service/notifications');
        const data = await response.json();
        const rawList = data.notifications || [];

        // Sorting Matrix: Category Weight (Desc), then Recency Timestamp (Desc)
        const sorted = [...rawList].sort((a, b) => {
          const wA = TYPE_WEIGHTS[a.Type] || 0;
          const wB = TYPE_WEIGHTS[b.Type] || 0;
          if (wB !== wA) return wB - wA;
          return new Date(b.Timestamp) - new Date(a.Timestamp);
        });
        
        setPriorityNotifications(sorted.slice(0, 10));
      } catch (error) {
        console.error("Error setting up priority sorting execution:", error);
      }
    };

    if (currentTab === 1) {
      fetchPriorityInbox();
    }
  }, [currentTab]);

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      const updated = [...viewedIds, id];
      setViewedIds(updated);
      localStorage.setItem('viewed_notifications', JSON.stringify(updated));
    }
  };

  const getIcon = (type) => {
    if (type === "Placement") return <NotificationImportantIcon color="error" sx={{ mr: 2 }} />;
    if (type === "Result") return <TaskAltIcon color="success" sx={{ mr: 2 }} />;
    return <EventIcon color="info" sx={{ mr: 2 }} />;
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Paper elevation={4} style={{ padding: '24px', borderRadius: '12px' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
          Campus Microservice Hub
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} centered variant="fullWidth">
            <Tab label="All Updates (Filtered via API Parameters)" />
            <Tab label="Priority Inbox (Deterministic Sorting)" />
          </Tabs>
        </Box>

        {/* TAB 0: Query Parameter Controlled Feeds */}
        {currentTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="medium">Query Parameter Filters</Typography>
              
              <FormControl size="small" style={{ minWidth: 200 }}>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Notification Type"
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                >
                  <MenuItem value=""><em>All Formats</em></MenuItem>
                  <MenuItem value="Placement">Placement</MenuItem>
                  <MenuItem value="Result">Result</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
            ) : (
              <List>
                {notifications.map((item) => {
                  const isNew = !viewedIds.includes(item.ID);
                  return (
                    <React.Fragment key={item.ID}>
                      <ListItem 
                        button 
                        onClick={() => markAsViewed(item.ID)}
                        sx={{ backgroundColor: isNew ? 'action.hover' : 'transparent', borderRadius: '6px', my: 0.5 }}
                      >
                        {getIcon(item.Type)}
                        <ListItemText 
                          primary={item.Message} 
                          secondary={`${item.Timestamp} • Category: ${item.Type}`}
                          primaryTypographyProps={{ fontWeight: isNew ? 'bold' : 'normal' }}
                        />
                        <Chip label={isNew ? "New" : "Read"} color={isNew ? "secondary" : "default"} size="small" variant={isNew ? "filled" : "outlined"} />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination 
                count={10} // Simulating total pages constraint from microservice payload metadata limits
                page={page} 
                onChange={(e, p) => setPage(p)} 
                color="primary" 
              />
            </Box>
          </Box>
        )}

        {/* TAB 1: Stage 1 Priority Matrix View */}
        {currentTab === 1 && (
          <Box>
            <Typography variant="h6" fontWeight="medium" mb={2} color="error.main">
              Top 10 High-Importance Streams
            </Typography>
            <List>
              {priorityNotifications.map((item, index) => {
                const isNew = !viewedIds.includes(item.ID);
                return (
                  <React.Fragment key={item.ID}>
                    <ListItem 
                      button
                      onClick={() => markAsViewed(item.ID)}
                      sx={{ backgroundColor: isNew ? 'error.light' : 'transparent', opacity: isNew ? 0.95 : 0.8, borderRadius: '6px', my: 0.5 }}
                    >
                      <Box sx={{ mr: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>#{index + 1}</Box>
                      {getIcon(item.Type)}
                      <ListItemText 
                        primary={item.Message} 
                        secondary={`Deterministic Rank weight: ${item.Type} | Post Date: ${item.Timestamp}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                      <Chip label={item.Type} size="small" color="primary" />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App;