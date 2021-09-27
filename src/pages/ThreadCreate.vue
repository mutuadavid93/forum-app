<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor @update-post="savePost" @cancel="cancel" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
import asynDataStatus from '@/mixins/asyncDataStatus';
import ThreadEditor from '@/components/ThreadEditor.vue';

export default {
  components: { ThreadEditor },
  name: 'ThreadCreate',
  props: {
    forumId: { type: String, required: true },
  },
  mixins: [asynDataStatus],
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
  async created() {
    // make sure the forum is always available by fetching it from store
    await this.fetchForum({ id: this.forumId });
    this.asyncDataStatus_fetched();
  },
};
</script>

<style lang="scss" scoped></style>
