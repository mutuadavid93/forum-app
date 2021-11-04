import { reactive } from 'vue';

// A variable to store all notifications
const notifications = reactive([]);

const removeNotification = (id) => {
  const index = notifications.findIndex((n) => n.id === id);
  notifications.splice(index, 1);
};

const addNotification = ({ message, timeout = null, type = 'info' }) => {
  const id = Math.random() + Date.now();
  notifications.push({
    id,
    message,
    type,
  });
  if (timeout) {
    setTimeout(() => removeNotification(id), timeout);
  }
};

export default function useNotifications() {
  return { notifications, addNotification, removeNotification };
}
