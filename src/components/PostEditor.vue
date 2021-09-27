<template>
    <!-- Discussion Textarea -->
  <div class="col-large">
    <form @submit.prevent="save">
      <div class="form-group">
        <textarea v-model="postCopy.text" name="" id="" cols="30" rows="10" class="form-input" />
      </div>
      <div class="form-actions">
        <button class="btn-blue">{{buttonLabel}}</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) },
  },
  data() {
    return { postCopy: { ...this.post } };
  },
  computed: {
    buttonLabel() {
      // If post id exists, then we only need to update the post
      return this.post.id ? 'Update post' : 'Submit post';
    },
  },
  methods: {
    save() {
      this.$emit('save', { post: this.postCopy }); // access under eventData.post
      this.postCopy.text = '';
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
