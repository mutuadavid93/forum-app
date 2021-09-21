<template>
  <div class="post-list">
    <div class="post" v-for="post in posts" :key="post.id">
      <div class="user-info" v-if="userById(post.userId)">
        <a href="#" class="user-name">{{ userById(post.userId).name }}</a>
        <a href="#">
          <img class="avatar-large" :src="userById(post.userId).avatar" alt="" />
        </a>
        <p class="desktop-only text-small">{{ userById(post.userId).postsCount }} posts</p>
        <p class="desktop-only text-small">{{ userById(post.userId).threadsCount }} threads</p>
      </div>

      <div class="post-content">
        <post-editor v-if="editing === post.id" :post="post" @save="handleUpdate"></post-editor>
        <p v-else>
          {{ post.text }}
        </p>
        <a
          v-if="post.userId === $store.state.authId"
          href="#"
          @click.prevent="toggleEditMode(post.id)"
          style="margin-left: auto; padding-left:10px;"
          class="link-unstyled"
          title="Make a change"
        >
          <fa icon="pencil-alt" />
        </a>
      </div>

      <div class="post-date text-faded">
        <div v-if="post.edited?.at">edited</div>
        <app-date :timestamp="post.publishedAt"></app-date>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PostEditor from '@/components/PostEditor.vue';

export default {
  name: 'PostList',
  props: {
    posts: { type: Array, required: true },
  },
  components: { PostEditor },
  data() {
    return { editing: null };
  },
  methods: {
    ...mapActions(['updatePost']),
    userById(userId) {
      return this.$store.getters.user(userId);
    },
    toggleEditMode(id) {
      // toggler
      this.editing = id === this.editing ? null : id;
    },
    handleUpdate(event) {
      this.updatePost(event.post);
      this.editing = null;
    },
  },
  computed: {
    users() {
      return this.$store.state.users;
    },
  },
};
</script>
