<template>
  <div class="notifications">
    <transition-group name="notification">
      <div
        :class="`notification-type-${notification.type}`"
        class="notification"
        v-for="notification in notifications"
        :key="notification.id"
      >
        <span>{{ notification.message }}</span>
        <button @click="removeNotification(notification.id)">x</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import useNotifications from '@/composables/useNotifications';

export default {
  setup() {
    const { notifications, removeNotification } = useNotifications();
    // return {} to expose data to the rest of the application
    return { notifications, removeNotification };
  },
};
</script>

<style lang="css" scoped></style>
