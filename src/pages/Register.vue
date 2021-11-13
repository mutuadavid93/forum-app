<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <!-- veeform assumes prevent modifier by default -->
      <VeeForm @submit="register" class="card card-form">
        <h1 class="text-center">Register</h1>

        <app-form-field v-model="form.name" name="name" label="Name" rules="required" />
        <app-form-field v-model="form.username" name="username" label="Username" rules="required" />
        <app-form-field
          v-model="form.email"
          name="email"
          type="email"
          label="Email address"
          rules="required|email"
        />
        <app-form-field
          v-model="form.password"
          name="password"
          type="password"
          label="Password"
          rules="required|min:8"
        />

        <div class="form-group">
          <label for="avatar"
            >Avatar
            <div v-if="avatarPreview">
              <img class="avatar-xlarge" :src="avatarPreview" :alt="form?.name?.toUpperCase()" />
            </div>
          </label>
          <VeeField
            name="avatar"
            v-show="!avatarPreview"
            @change="handleImageUpload"
            id="avatar"
            type="file"
            class="form-input"
            accept="image/*"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </VeeForm>
      <div class="text-center push-top">
        <button @click="registerWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      avatarPreview: null,
      form: {
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: '',
      },
    };
  },
  methods: {
    async register() {
      await this.$store.dispatch('auth/registerUserWithEmailAndPassword', this.form);
      this.$router.push('/');
    },
    async registerWithGoogle() {
      await this.$store.dispatch('auth/signInWithGoogle');
      this.$router.push('/');
    },

    handleImageUpload(event) {
      // Don't upload to firestore
      // eslint-disable-next-line prefer-destructuring
      this.form.avatar = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.avatarPreview = evt.target.result;
      };
      reader.readAsDataURL(this.form.avatar);
    },
  },

  // You must emit the 'ready' event for the router to render the page
  created() {
    this.$emit('ready');
  },
};
</script>

<style lang="scss" scoped></style>
