<template>
  <div class="login-view">
    <div class="auth-card">
      <h1 class="auth-title">Login</h1>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          class="auth-input"
        />
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="auth-input"
        />
        <button type="submit" class="auth-button">Login</button>
      </form>
      <router-link to="/register" class="auth-link">
        Create account
      </router-link>
    </div>
  </div>
</template>

<script>
import { authEventBus } from "@/components/website/Header.vue";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        const response = await fetch("https://shutterverse.onrender.com/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }

        const data = await response.json();

        if (data.success) {
          const user = {
            email: this.email,
            role: data.role,
            userId: data.userId,
          };

          localStorage.setItem("user", JSON.stringify(user));
          authEventBus.emit("user-login", user);
          this.$router.push("/admin");
        } else {
          throw new Error(data.error || "Login failed");
        }
      } catch (error) {
        console.error("Login failed:", error);
        this.errorMessage = error.message || "Network error. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--darkgrey);
  padding: 2rem;
}

.auth-card {
  background: var(--darkgrey);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.auth-title {
  font-size: 1.8rem;
  margin-bottom: 1.8rem;
  color: var(--whitegrey);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.auth-input {
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--whitegrey);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.auth-input:focus {
  border-color: var(--turquoise);
  outline: none;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.auth-button {
  background: var(--turquoise);
  color: var(--whitegrey);
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.auth-button:hover {
  background: var(--whitegrey);
  color: var(--turquoise);
}

.auth-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  color: #666666;
}

.auth-link {
  color: var(--turquoise);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-link:hover {
  color: var(--whitegrey);
  text-decoration: underline;
}

.error-message {
  color: #ff6b6b;
  background-color: #fff5f5;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #ffd6d6;
}
</style>
