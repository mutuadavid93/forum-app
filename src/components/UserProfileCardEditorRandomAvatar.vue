<template>
  <div class="text-center" style="margin-bottom:15px;">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
      Random Avatar
    </button>
    <br />
    <small style="opacity: .5">Powered by <a href="https://pixabay.com">Pixabay</a></small>
  </div>
</template>

<script>
import { arrayRandom } from '@/helpers';

export default {
  methods: {
    async getRandomImage() {
      const keywords = ['doctor', 'nurse', 'surgeon', 'hospital'];
      const randomWord = arrayRandom(keywords);
      const res = await fetch(
        `https://pixabay.com/api/?key=24182420-34f51ce1c7fb8852758bc5cc2&q=${randomWord}`,
      );
      const data = await res.json();
      const randomImage = arrayRandom(data.hits);
      this.$emit('hit', randomImage.webformatURL);
    },
  },
};
</script>

<style lang="scss" scoped></style>
