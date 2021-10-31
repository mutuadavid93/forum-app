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

        <!--
          Place infinite scroll at the end of the posts' list so that it
          can intersect at the end with the screen firing load event.
          Dispatch fetching of more posts
         -->
        <app-infinite-scroll @load="fetchUserPosts" :done="user.posts.length == user.postsCount" />
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
    // map state via an Object
    ...mapGetters('auth', { user: 'authUser' }),
    lastPostFetched() {
      if (this.user.posts.length === 0) return null;
      return this.user.posts[this.user.posts.length - 1];
    },
  },
  methods: {
    fetchUserPosts() {
      return this.$store.dispatch('auth/fetchAuthUsersPosts', { startAfter: this.lastPostFetched });
    },
  },

  async created() {
    await this.fetchUserPosts();
    await this.asyncDataStatus_fetched();
  },
};
</script>

<style lang="scss" scoped></style>
