<template>
  <div class="container">
    <div class="col-full push-top" v-if="forum">
      <div class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <router-link
          :to="{ name: 'ThreadCreate', params: { forumId: forum.id } }"
          class="btn-green btn-small"
          >Start a thread</router-link
        >
      </div>
    </div>

    <div class="col-full push-top">
      <thread-list :threads="threads" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
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
      return findById(this.$store.state.forums, this.id);
    },
    threads() {
      // Make sure the forum exists before trying to access it's threads
      if (!this.forum) return [];
      return this.forum.threads.map((threadId) => this.$store.getters.thread(threadId));
    },
  },
  methods: {
    ...mapActions(['fetchForum', 'fetchThreads', 'fetchUsers']),
  },
  async created() {
    // Tip:: We need to use created() hook, since we are accessing `this.id`
    // which is needed by a forum to function.
    // Otherwise beforeCreate() hook would've been used
    const forum = await this.fetchForum({ id: this.id });
    const threads = await this.fetchThreads({ ids: forum.threads });
    this.fetchUsers({ ids: threads.map((thread) => thread.userId) });
  },
};
</script>

<style lang="scss" scoped></style>
