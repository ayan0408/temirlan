<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="login" style="width: 300px">
      <q-input v-model="username" label="Username" outlined required />
      <q-input v-model="password" label="Password" type="password" outlined required />
      <q-btn label="Login" type="submit" color="primary" class="full-width" />
      <q-banner v-if="error" type="negative" class="q-mt-md">{{ error }}</q-banner>
    </q-form>
  </q-page>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
    }
  },
  methods: {
    async login() {
      this.error = ''
      try {
        const response = await axios.post('https://your-api.com/api/login', {
          username: this.username,
          password: this.password,
        })
        const token = response.data.token
        localStorage.setItem('auth_token', token)
        this.$router.push('/') // редирект после логина
      } catch (e) {
        this.error = 'Неверный логин или пароль'
      }
    },
  },
}
</script>
