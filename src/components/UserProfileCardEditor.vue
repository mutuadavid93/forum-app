<template>
  <div class="profile-card">
    <VeeForm @submit="save">
      <p class="text-center avatar-edit">
        <label for="avatar">
          <app-avatar-img
            :src="activeUser.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <div class="avatar-upload-overlay">
            <app-spinner v-if="uploadingImage" color="white" />
            <fa v-else icon="camera" size="3x" :style="{ color: 'white', opacity: '0.8' }" />
          </div>
          <!-- Since initially the image is here...we hide input field -->
          <input
            accept="image/*"
            v-show="false"
            type="file"
            id="avatar"
            @change="handleAvatarChange"
          />
        </label>
      </p>

      <user-profile-card-editor-random-avatar @hit="activeUser.avatar = $event" />

      <AppFormField
        label="Username"
        name="username"
        v-model="activeUser.username"
        :rules="`required|unique:users,username,${user.username}`"
      />

      <AppFormField label="Full Name" name="name" v-model="activeUser.name" rules="required" />

      <AppFormField
        label="Bio"
        name="bio"
        as="textarea"
        v-model="activeUser.bio"
        placeholder="Write a few words about yourself."
      />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />

      <AppFormField label="Website" name="website" v-model="activeUser.website" rules="url" />
      <AppFormField
        label="Email"
        name="email"
        v-model="activeUser.email"
        :rules="`required|email|unique:users,email,${user.email}`"
      />

      <!-- Use mouseenter event to only load locations if user touches the control -->
      <app-form-field
        label="Location"
        name="location"
        v-model="activeUser.location"
        list="locations"
        @mouseenter="loadLocationOptions"
      />

      <datalist id="locations">
        <option
          v-for="location in locationOptions"
          :key="location.name.common"
          :value="location.name.common"
        />
      </datalist>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </VeeForm>
    <user-profile-card-editor-reauthenticate
      v-model="needsReAuth"
      @success="onReaAuthenticated"
      @fail="onReaAuthenticatedFailed"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import UserProfileCardEditorRandomAvatar from '@/components/UserProfileCardEditorRandomAvatar.vue';
import UserProfileCardEditorReauthenticate from '@/components/UserProfileCardEditorReauthenticate.vue';
import useNotifications from '@/composables/useNotifications';

export default {
  components: { UserProfileCardEditorRandomAvatar, UserProfileCardEditorReauthenticate },
  name: 'UserProfileCardEditor',
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { addNotification } = useNotifications();
    return { addNotification };
  },
  data() {
    // NB:: If you need to update state you can't do it directly thus
    // you have to clone the state e.g. user into local state
    return {
      activeUser: { ...this.user },
      uploadingImage: false,
      locationOptions: [],
      needsReAuth: false,
    };
  },
  methods: {
    ...mapActions('auth', ['uploadAvatar']),
    async loadLocationOptions() {
      // Prevent reloading locations everytime user hovers location field
      // by returning early
      if (this.locationOptions.length) return;
      const req = await fetch('https://restcountries.com/v3.1/all');
      this.locationOptions = await req.json();
    },
    async handleAvatarChange(event) {
      this.uploadingImage = true;
      const [file] = event.target.files;
      const uploadedImage = await this.uploadAvatar({ file });
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar;
      this.uploadingImage = false;
    },
    async handleRandomAvatarUpload() {
      // Pixabay refrains you from Hotlinking their URLs into your app parmanently
      const genaratedAvatar = this.activeUser.avatar.startsWith('https://pixabay.com');
      if (genaratedAvatar) {
        // Tip:: use fetch to turn the image into a blob
        const image = await fetch(this.activeUser.avatar);
        const blob = await image.blob();
        this.activeUser.avatar = await this.uploadAvatar({ file: blob, filename: 'random' });
      }
    },
    async onReaAuthenticatedFailed() {
      this.addNotification({ message: 'Error updating user', type: 'error', timeout: 3000 });
      this.$router.push({ name: 'Profile' });
    },
    async onReaAuthenticated() {
      await this.$store.dispatch('auth/updateEmail', { email: this.activeUser.email });
      this.saveUserData();
    },
    async saveUserData() {
      // We still need to clone the user inside state not update it directly
      await this.$store.dispatch('users/updateUser', {
        ...this.activeUser,
        // Overwrite thread ids on the user payload b4 passing the user into the action
        threads: this.activeUser.threadIds,
      });
      // Redirect the user on save
      this.$router.push({ name: 'Profile' });
      this.addNotification({ message: 'User updated successfully', timeout: 3000 });
    },
    async save() {
      await this.handleRandomAvatarUpload();

      const emailChanged = this.activeUser.email !== this.user.email;
      if (emailChanged) {
        this.needsReAuth = true;
      } else {
        await this.saveUserData();
      }
    },
    cancel() {
      this.$router.push({ name: 'Profile' });
    },
  },
};
</script>

<style lang="scss" scoped></style>
