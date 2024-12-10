'use client';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

dayjs.locale('id');

interface Notification {
  id: string;
  type: 'status_update' | 'admin_message' | 'system';
  message: string;
  timestamp: Timestamp;
  reportId?: string;
  status?: string;
  read: boolean;
  details?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        orderBy('timestamp', 'desc')
      );

      unsubscribe = onSnapshot(
        notificationsQuery,
        (querySnapshot) => {
          const notificationsList: Notification[] = [];
          querySnapshot.forEach((doc) => {
            notificationsList.push({ id: doc.id, ...doc.data() } as Notification);
          });
          setNotifications(notificationsList);
        },
        (error) => {
          if (error.code !== 'failed-precondition' && error.code !== 'permission-denied') {
            console.error('Error in notifications listener:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleExpandClick = async (notificationId: string) => {
    setExpandedId(expandedId === notificationId ? null : notificationId);
    
    // Mark as read when expanded
    if (!notifications.find(n => n.id === notificationId)?.read) {
      const notificationRef = doc(db, 'notifications', notificationId);
      try {
        await updateDoc(notificationRef, {
          read: true
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      try {
        await deleteDoc(doc(db, 'notifications', notificationToDelete));
        setDeleteDialogOpen(false);
        setNotificationToDelete(null);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const readNotifications = notifications.filter(n => n.read);
      
      // Close dialog first
      setDeleteAllDialogOpen(false);

      // Delete all read notifications
      const deletePromises = readNotifications.map(notification => 
        deleteDoc(doc(db, 'notifications', notification.id))
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'status_update':
        return 'primary';
      case 'admin_message':
        return 'warning';
      case 'system':
        return 'info';
      default:
        return 'default';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'status_update':
        return 'Status Update';
      case 'admin_message':
        return 'Admin';
      case 'system':
        return 'System';
      default:
        return type;
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h5" className="mb-6 font-bold">
        Notifikasi
      </Typography>

      <Paper elevation={2} className="p-0 mb-4">
        {notifications.length === 0 ? (
          <Box className="p-6">
            <Typography variant="body1" color="textSecondary">
              Belum ada notifikasi
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem
                  className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box 
                    className="flex justify-between items-start w-full"
                    onClick={() => handleExpandClick(notification.id)}
                  >
                    <Box className="flex-grow">
                      <Box className="flex items-center gap-2 mb-1">
                        <Chip
                          label={getNotificationLabel(notification.type)}
                          size="small"
                          color={getNotificationColor(notification.type)}
                        />
                        {!notification.read && (
                          <Chip
                            label="Baru"
                            size="small"
                            color="error"
                            className="h-5"
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body1"
                        component="div"
                        className={`${!notification.read ? 'font-medium' : ''}`}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                        className="mt-1"
                      >
                        {dayjs(notification.timestamp.toDate()).format(
                          'DD MMMM YYYY, HH:mm'
                        )}
                      </Typography>
                    </Box>
                    <Box className="flex items-center">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(notification.id);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Collapse in={expandedId === notification.id}>
                    <Box className="mt-2 p-3 bg-gray-50 rounded-md">
                      <Typography variant="body2" color="textSecondary">
                        {notification.details || 'Tidak ada detail tambahan'}
                      </Typography>
                      {notification.reportId && (
                        <Typography variant="body2" className="mt-1">
                          ID Laporan: {notification.reportId}
                        </Typography>
                      )}
                      {notification.status && (
                        <Typography variant="body2" className="mt-1">
                          Status: {notification.status}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Moved Delete All Read Button here */}
      {notifications.some(n => n.read) && (
        <Box className="flex justify-end mt-4">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteAllDialogOpen(true)}
            startIcon={<DeleteOutlineIcon />}
            size="small"
          >
            Hapus Yang Sudah Dibaca
          </Button>
        </Box>
      )}

      {/* Existing Delete Single Notification Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Hapus Notifikasi</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus notifikasi ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Dialog for Delete All Read */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
      >
        <DialogTitle>Hapus Semua Notifikasi yang Sudah Dibaca</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus semua notifikasi yang sudah dibaca? 
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleDeleteAllRead} 
            color="error" 
            variant="contained"
          >
            Hapus Semua
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 