<template>
  <span :title="humanFriendly">
    {{ sanitizeDate }}
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
      type: [Number, Object],
      required: true,
    },
  },
  computed: {
    normalizedTimestamp() {
      return this.timestamp?.seconds ?? this.timestamp;
    },
    sanitizeDate() {
      return dayjs.unix(this.normalizedTimestamp).fromNow();
    },
    humanFriendly() {
      return dayjs.unix(this.normalizedTimestamp).format('llll');
    },
  },
};
</script>

<style lang="scss" scoped></style>
