<template>
  <span :title="humanFriendly()">
    {{ sanitizeDate() }}
  </span>
</template>

<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedTime from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedTime);

export default {
  props: {
    timestamp: {
      type: Number,
      required: true,
    },

  },
  methods: {
    sanitizeDate() {
      return dayjs.unix(this.timestamp).fromNow();
    },
    humanFriendly() {
      return dayjs.unix(this.timestamp).format('llll');
    },
  },
};
</script>

<style lang="scss" scoped></style>
