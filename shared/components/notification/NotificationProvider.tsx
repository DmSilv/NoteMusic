import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Modal } from 'react-native';
import Notification from './Notification';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, ...notification }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      <Modal transparent visible={notifications.length > 0} animationType="none">
        <View style={{ flex: 1 }}>
          {notifications.map((notification, index) => (
            <Notification
              key={notification.id}
              type={notification.type}
              message={notification.message}
              title={notification.title}
              duration={notification.duration}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </View>
      </Modal>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

