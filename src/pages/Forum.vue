<template>
  <div class="container">
    <div class="col-full push-top">
      <div class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <a href="new-thread.html" class="btn-green btn-small">Start a thread</a>
      </div>
    </div>

    <div class="col-full push-top">
      <thread-list :threads="threads" />
    </div>
  </div>
</template>

<script>
import sourceData from '@/seed.json';
import ThreadList from '@/components/ThreadList.vue';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: { ThreadList },
  computed: {
    forum() {
      return sourceData.forums.find((forum) => forum.id === this.id);
    },
    threads() {
      return sourceData.threads.filter((thread) => thread.forumId === this.id);
    },
  },
};
</script>

<style lang="scss" scoped></style>
