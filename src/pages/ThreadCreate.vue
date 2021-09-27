<template>
  <div v-if="forum" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor @update-post="savePost" @cancel="cancel" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
import ThreadEditor from '@/components/ThreadEditor.vue';

export default {
  components: { ThreadEditor },
  name: 'ThreadCreate',
  props: {
    forumId: { type: String, required: true },
  },
  computed: {
    forum() {
      return findById(this.$store.state.forums, this.forumId);
    },
  },
  methods: {
    ...mapActions(['fetchForum', 'createThread']),
    async savePost({ title, text }) {
      const thread = await this.createThread({
        title,
        text,
        forumId: this.forum.id,
      });
      this.$router.push({ name: 'ThreadShow', params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: 'Forum', params: { id: this.forum.id } });
    },
  },
  created() {
    // make sure the forum is always available by fetching it from store
    this.fetchForum({ id: this.forumId });
  },
};
</script>

<style lang="scss" scoped></style>
