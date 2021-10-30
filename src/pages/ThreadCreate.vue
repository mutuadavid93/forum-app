<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <thread-editor
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
  name: 'ThreadCreate',
  props: {
    forumId: { type: String, required: true },
  },
  data() {
    return { formIsDirty: false };
  },
  mixins: [asynDataStatus],
  computed: {
    forum() {
      return findById(this.$store.state.forums.items, this.forumId);
    },
  },
  methods: {
    ...mapActions('forums', ['fetchForum']),
    ...mapActions('threads', ['createThread']),
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

  // useful when the user was working on a page or had unfinished process and
  // navigates away
  // eslint-disable-next-line consistent-return
  beforeRouteLeave() {
    if (this.formIsDirty) {
      // prettier-ignore
      const confirmed = window.confirm(
        'Are you sure you want to leave? Unsaved changes will be lost',
      );
      // To abort a navigation we return false from a guard i.e. when we cancel
      if (!confirmed) return false;
    }
  },
};
</script>

<style lang="scss" scoped></style>
