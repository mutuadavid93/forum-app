<template>
  <!-- Discussion Textarea -->
  <div class="col-large">
    <!-- Force veeform to rerender incase state resets by using a key -->
    <VeeForm @submit="save" :key="formKey">
      <app-form-field
        as="textarea"
        name="text"
        rows="10"
        cols="30"
        rules="required"
        v-model="postCopy.text"
      />

      <div class="form-actions">
        <button class="btn-blue">{{ buttonLabel }}</button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) },
  },
  data() {
    return { postCopy: { ...this.post }, formKey: Math.random() };
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

      // Trigger the form re-render by resetting the key
      this.formKey = Math.random();
    },
  },
};
</script>

<style lang="scss" scoped></style>
