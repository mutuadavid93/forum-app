<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <div class="col-full push-top" v-if="forum">
      <AppHead>
        <title>{{ forum?.name }}</title>
        <meta property="og:title" :content="forum?.name" />
        <meta name="twitter:title" :content="forum?.name" />
      </AppHead>
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

      <!-- Place pagination below threads' list -->
      <v-pagination v-model="page" :pages="totalPages" active-color="#4E9C7F" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
import asynDataStatus from '@/mixins/asyncDataStatus';
import ThreadList from '@/components/ThreadList.vue';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      page: +this.$route.query.page || 1,
      perPage: 3,
    };
  },
  mixins: [asynDataStatus],
  components: { ThreadList },
  computed: {
    forum() {
      return findById(this.$store.state.forums.items, this.id);
    },
    threads() {
      // Make sure the forum exists before trying to access it's threads
      if (!this.forum) return [];
      return this.$store.state.threads.items
        .filter((thread) => thread.forumId === this.forum.id)
        .map((thread) => this.$store.getters['threads/thread'](thread.id));
    },
    threadCount() {
      return this.forum.threads?.length || 0;
    },
    totalPages() {
      if (!this.threadCount) return 0;
      return Math.ceil(this.threadCount / this.perPage);
    },
  },
  methods: {
    ...mapActions('forums', ['fetchForum']),
    ...mapActions('threads', ['fetchThreadsByPage']),
    ...mapActions('users', ['fetchUsers']),
  },
  async created() {
    // Tip:: We need to use created() hook, since we are accessing `this.id`
    // which is needed by a forum to function.
    // Otherwise beforeCreate() hook would've been used
    const forum = await this.fetchForum({ id: this.id });
    const threads = await this.fetchThreadsByPage({
      ids: forum.threads,
      page: this.page,
      perPage: this.perPage,
    });
    await this.fetchUsers({ ids: threads.map((thread) => thread.userId) });
    this.asyncDataStatus_fetched();
  },
  watch: {
    async page() {
      // Navigate to the new page
      // Vue router will trigger the Forum component to be destoyed thus
      // firing created() which takes care of fetching new threads.
      this.$router.push({ query: { page: this.page } });
    },
  },
};
</script>

<style lang="scss" scoped></style>
