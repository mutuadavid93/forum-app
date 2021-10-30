<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <h1>{{ category.name }}</h1>
    <forum-list
      :title="category.name"
      :category-id="category.id"
      :forums="getCategoryForums(category)"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
import asynDataStatus from '@/mixins/asyncDataStatus';
import ForumList from '@/components/ForumList.vue';

export default {
  name: 'Category',
  components: { ForumList },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  mixins: [asynDataStatus],
  computed: {
    category() {
      // Fallback to empty {} if the fetchCategory async request isn't completed yet
      return findById(this.$store.state.categories.items, this.id) || {};
    },
  },
  methods: {
    ...mapActions('categories', ['fetchCategory']),
    ...mapActions('forums', ['fetchForums']),
    getCategoryForums(category) {
      return this.$store.state.forums.items.filter((forum) => forum.categoryId === category.id);
    },
  },

  async created() {
    const category = await this.fetchCategory({ id: this.id });
    await this.fetchForums({ ids: category.forums });
    this.asyncDataStatus_fetched();
  },
};
</script>

<style lang="scss" scoped></style>
