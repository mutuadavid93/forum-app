<template>
  <div class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor @update-post="savePost" @cancel="cancel" />
  </div>
</template>

<script>
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
    async savePost({ title, text }) {
      const thread = await this.$store.dispatch('createThread', {
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
};
</script>

<style lang="scss" scoped></style>
