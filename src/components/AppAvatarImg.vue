<template>
  <img :src="src || '/user-profile-holder.png'" alt="User Placeholder" />
</template>

<script>
export default {
  props: { src: { type: String } },
};
</script>

<style lang="css" scoped>
img {
  object-fit: cover;
}
</style>
