<template>
  <h1>{{ category.name }}</h1>
  <forum-list
    :title="category.name"
    :category-id="category.id"
    :forums="getCategoryForums(category)"
  />
</template>

<script>
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
      return findById(this.$store.state.categories, this.id);
    },
  },
  methods: {
    getCategoryForums(category) {
      return this.$store.state.forums.filter((forum) => forum.categoryId === category.id);
    },
  },
};
</script>

<style lang="scss" scoped></style>
