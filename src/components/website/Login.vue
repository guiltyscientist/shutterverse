<template>
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="username" placeholder="Benutzername" required />
        <input v-model="password" type="password" placeholder="Passwort" required />
        <button type="submit">Anmelden</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: ''
      };
    },
    methods: {
      handleLogin() {
        // Simulierter Login
        if (this.username === 'admin' && this.password === 'admin') {
          this.$router.push('/admin-dashboard');
        } else if (this.username === 'user' && this.password === 'user') {
          this.$router.push('/user-profile');
        } else {
          alert('Ungültige Anmeldedaten');
        }
      }
    }
  };
  </script>
  