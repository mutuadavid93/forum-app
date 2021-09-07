<template>
  <div class="col-full push-top">
    <h1>
      Editing in <i>{{ thread.title }}</i>
    </h1>
    <thread-editor :title="thread.title" :text="text" @update-post="savePost" @cancel="cancel" />
  </div>
</template>

<script>
import { findById } from '@/helpers';
import ThreadEditor from '@/components/ThreadEditor.vue';

export default {
  components: { ThreadEditor },
  name: 'ThreadEdit',
  props: {
    id: { type: String, required: true },
  },
  computed: {
    thread() {
      return findById(this.$store.state.threads, this.id);
    },
    text() {
      return this.$store.state.posts.find((post) => post.id === this.thread.posts[0]).text;
    },
  },
  methods: {
    async savePost({ title, text }) {
      const thread = await this.$store.dispatch('updateThread', {
        id: this.id,
        title,
        text,
      });
      this.$router.push({ name: 'ThreadShow', params: { id: thread.id } });
    },
    cancel() {
      this.$router.push({ name: 'ThreadShow', params: { id: this.id } });
    },
  },
};
</script>

<style lang="scss" scoped></style>
