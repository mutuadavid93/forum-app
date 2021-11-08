<template>
  <VeeForm @submit="save">
    <app-form-field label="Title" name="title" v-model="form.title" rules="required" />
    <app-form-field
      as="textarea"
      name="text"
      label="Content"
      v-model="form.text"
      rules="required"
      rows="8"
      cols="140"
    />

    <div class="btn-group">
      <button class="btn btn-ghost" @click.prevent="$emit('cancel')">Cancel</button>
      <button class="btn btn-blue" type="submit" name="Publish">
        {{ existing ? 'Update' : 'Publish' }}
      </button>
    </div>
  </VeeForm>
</template>

<script>
export default {
  name: 'ThreadEditor',
  props: {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  data() {
    return {
      form: {
        title: this.title,
        text: this.text,
      },
    };
  },
  computed: {
    existing() {
      // Convert any variable to a Boolean by prepending double bang i.e. `!!`
      return !!this.title;
    },
  },
  methods: {
    save() {
      this.$emit('clean');
      this.$emit('update-post', { ...this.form });
    },
  },

  watch: {
    // writing a watcher as a property allows to specify more options
    form: {
      handler() {
        // Check whether state and props are different
        if (this.form.title !== this.title || this.form.text !== this.text) {
          this.$emit('dirty');
        } else {
          this.$emit('clean');
        }
      },

      // `deep` checks for change on the underlying properties change too
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
