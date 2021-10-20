<template>
  <div class="container" style="width:100%">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <user-profile-card v-if="!edit" :user="user" />
        <user-profile-card-editor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead"> {{ user.name }}'s recent activity </span>
          <a href="#">See only started threads?</a>
        </div>
        <hr />
        <post-list :posts="user.posts" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PostList from '@/components/PostList.vue';
import UserProfileCard from '@/components/UserProfileCard.vue';
import UserProfileCardEditor from '@/components/UserProfileCardEditor.vue';
import asynDataStatus from '@/mixins/asyncDataStatus';

export default {
  name: 'Profile',
  props: {
    edit: { type: Boolean, default: false },
  },
  mixins: [asynDataStatus],
  components: {
    PostList,
    UserProfileCard,
    UserProfileCardEditor,
  },
  computed: {
    // map `this.user` to `this.$store.getters.authUser` via an Object
    ...mapGetters({ user: 'authUser' }),
  },

  async created() {
    await this.$store.dispatch('fetchAuthUsersPosts');
    this.asyncDataStatus_fetched();
  },
};
</script>

<style lang="scss" scoped></style>
