<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Editing in <i>{{ thread.title }}</i>
    </h1>
    <thread-editor
      :title="thread.title"
      :text="text"
      @update-post="savePost"
      @cancel="cancel"
      @dirty="formIsDirty = true"
      @clean="formIsDirty = false"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
import asynDataStatus from '@/mixins/asyncDataStatus';
import ThreadEditor from '@/components/ThreadEditor.vue';

export default {
  components: { ThreadEditor },
  name: 'ThreadEdit',
  props: {
    id: { type: String, required: true },
  },
  mixins: [asynDataStatus],
  data() {
    return {
      formIsDirty: false,
    };
  },
  computed: {
    thread() {
      return findById(this.$store.state.threads.items, this.id);
    },
    text() {
      const post = findById(this.$store.state.posts.items, this.thread.posts[0]);
      return post ? post.text : '';
    },
  },
  methods: {
    ...mapActions('threads', ['updateThread', 'updateThread', 'fetchThread']),
    ...mapActions('posts', ['fetchPost']),
    async savePost({ title, text }) {
      const thread = await this.updateThread({
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
  async created() {
    const thread = await this.fetchThread({ id: this.id });
    await this.fetchPost({ id: thread.posts[0] });
    this.asyncDataStatus_fetched();
  },
  // eslint-disable-next-line consistent-return
  beforeRouteLeave() {
    if (this.formIsDirty) {
      // prettier-ignore
      const confirmed = window.confirm(
        'Are you sure you want to leave? Unsaved changes will be lost!',
      );
      if (!confirmed) return false;
    }
  },
};
</script>

<style lang="scss" scoped></style>
