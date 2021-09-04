<template>
  <h1>{{ category.name }}</h1>
  <forum-list
    :title="category.name"
    :category-id="category.id"
    :forums="getCategoryForums(category)"
  />
</template>

<script>
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
      return this.$store.state.categories.find((category) => category.id === this.id);
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
