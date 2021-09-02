<template>
  <forum-list
    v-for="category in categories"
    :key="category.id"
    :forums="getCategoryForums(category)"
    :title="category.name"
    :category-id="category.id"
  />
</template>

<script>
import sourceData from '@/seed.json';
import ForumList from '@/components/ForumList.vue';

export default {
  name: 'CategoryList',
  props: {
    categories: {
      type: Array,
      required: true,
    },
  },
  components: {
    ForumList,
  },
  methods: {
    getCategoryForums(category) {
      return sourceData.forums.filter((forum) => forum.categoryId === category.id);
    },
  },
};
</script>

<style lang="scss" scoped></style>
