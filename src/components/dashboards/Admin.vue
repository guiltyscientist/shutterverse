<template>
  <div class="admin-dashboard">
    <h2>Admin Dashboard</h2>
    
    <div v-if="user" class="user-info">
      Welcome, {{ user.email }} ({{ user.role }})
      <button @click="logout" class="logout-button">Logout</button>
    </div>
    
    <div class="admin-sections">
      <div class="admin-section">
        <h3>News Management</h3>
        <router-link to="/admin/news">Manage News</router-link>
      </div>
      
      <div class="admin-section">
        <h3>Studio Management</h3>
        <router-link to="/admin/studios">Manage Studios</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.user-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.admin-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-section h3 {
  margin-top: 0;
  color: #343a40;
}

.admin-section a {
  display: inline-block;
  margin-top: 1rem;
  color: #4361ee;
  text-decoration: none;
  font-weight: 500;
}

.admin-section a:hover {
  text-decoration: underline;
}
</style>