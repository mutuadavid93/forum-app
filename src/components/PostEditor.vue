<template>
    <!-- Discussion Textarea -->
  <div class="col-large">
    <form @submit.prevent="addPost">
      <div class="form-group">
        <textarea v-model="newPostText" name="" id="" cols="30" rows="10" class="form-input" />
      </div>
      <div class="form-actions">
        <button class="btn-blue">Submit post</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return { newPostText: '' };
  },
  methods: {
    addPost() {
      const post = {
        text: this.newPostText,
      };
      this.$emit('save-post', { post }); // access under eventData.post
      this.newPostText = '';
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
