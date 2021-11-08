<template>
  <div class="form-group">
    <label :for="name">{{ label }}</label>
    <VeeField
      :name="name"
      :modelValue="modelValue"
      @input="$emit('modelUpdate', $event)"
      :id="name"
      class="form-input"
      :label="label"
      v-bind="$attrs"
    />
    <VeeErrorMessage :name="name" class="form-error" />
  </div>
</template>

<script>
export default {
  // Prevent attributes from being added to root element too `div.form-group`
  // Instead let v-bind add them alone.
  // Caveat :: It forces events to be fired twice e.g. mouseenter
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
  },
};
</script>

<style lang="scss" scoped></style>
