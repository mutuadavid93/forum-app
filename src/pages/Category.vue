<template>
  <h1>{{ category.name }}</h1>
  <forum-list
    :title="category.name"
    :category-id="category.id"
    :forums="getCategoryForums(category)"
  />
</template>

<script>
import { mapActions } from 'vuex';
import { findById } from '@/helpers';
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
  computed: {
    category() {
      // Fallback to empty {} if the fetchCategory async request isn't completed yet
      return findById(this.$store.state.categories, this.id) || {};
    },
  },
  methods: {
    ...mapActions(['fetchCategory', 'fetchForums']),
    getCategoryForums(category) {
      return this.$store.state.forums.filter((forum) => forum.categoryId === category.id);
    },
  },

  async created() {
    const category = await this.fetchCategory({ id: this.id });
    this.fetchForums({ ids: category.forums });
  },
};
</script>

<style lang="scss" scoped></style>
