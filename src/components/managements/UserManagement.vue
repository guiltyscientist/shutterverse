<template>
  <div class="management-container">
    <div class="management-header">
      <button @click="goBack" class="back-button">
        <ArrowLeftIcon class="icon" />
        Go Back to Management Center
      </button>
      <h1 class="section-heading">USER MANAGEMENT</h1>
    </div>

    <div class="management-actions">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search users..."
          class="search-input"
        />
        <MagnifyingGlassIcon class="search-icon" />
      </div>
      <button @click="showCreateForm = true" class="action-button">
        <PlusCircleIcon class="icon" />
        Create User
      </button>
    </div>

    <!-- Create User Form -->
    <div
      v-if="showCreateForm"
      class="modal-overlay"
      @click.self="showCreateForm = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>Create New User</h2>
          <button @click="showCreateForm = false" class="close-button">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="createUser">
          <div class="form-group">
            <label>Name</label>
            <input
              type="text"
              v-model="newUserName"
              placeholder="Full name"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="newUserEmail"
              placeholder="user@example.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showCreateForm = false"
              class="cancel-button"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading">Creating...</span>
              <span v-else>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading users...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>Error loading users: {{ errorMessage }}</p>
      <button @click="fetchUsers" class="retry-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <UserIcon class="empty-icon" />
        <p>No users found. Create your first user!</p>
      </div>

      <table v-else class="management-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user._id" class="user-row">
            <td>{{ user.name || "N/A" }}</td>
            <td>{{ user.email }}</td>
            <td>
              <input
                type="checkbox"
                :checked="user.role === 'admin'"
                @change="toggleAdmin(user, $event)"
                class="admin-checkbox"
                :disabled="isProcessingAdmin"
              />
            </td>
            <td class="actions-cell">
              <button
                @click="resetPassword(user)"
                class="action-button small"
                :disabled="isProcessingPassword"
              >
                Reset Password
              </button>
              <button
                @click="deleteUser(user)"
                class="action-button small delete"
                :disabled="isProcessingDelete"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

export default {
  components: {
    ArrowLeftIcon,
    PlusCircleIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    UserIcon,
  },
  data() {
    return {
      users: [],
      filteredUsers: [],
      searchQuery: "",
      showCreateForm: false,
      newUserName: "",
      newUserEmail: "",
      isLoading: false,
      isProcessingAdmin: false,
      isProcessingPassword: false,
      isProcessingDelete: false,
      errorMessage: "",
    };
  },
  watch: {
    searchQuery() {
      this.filterUsers();
    },
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    goBack() {
      this.$router.push("/admin");
    },
    filterUsers() {
      if (!this.searchQuery) {
        this.filteredUsers = [...this.users];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(query)) ||
          user.email.toLowerCase().includes(query)
      );
    },
    async fetchUsers() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Unexpected response: ${text}`);
        }

        if (!response.ok) {
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }

        this.users = data.map((u) => ({
          ...u,
          name: u.name || u.email.split("@")[0],
        }));
        this.filterUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
        this.errorMessage = `Failed to load users: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    async createUser() {
      if (!this.newUserEmail) {
        this.errorMessage = "Please enter an email address";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.newUserEmail,
            name: this.newUserName,
          }),
        });

        let data;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Unexpected response: ${text}`);
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to create user");
        }

        this.newUserName = "";
        this.newUserEmail = "";
        this.showCreateForm = false;
        this.fetchUsers();
      } catch (error) {
        console.error("Error creating user:", error);
        this.errorMessage = `Error: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    async resetPassword(user) {
      if (!confirm(`Reset password for ${user.email} to "Password1234"?`))
        return;

      this.isProcessingPassword = true;
      this.errorMessage = "";
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${user._id}/reset-password`,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to reset password");
        }
        alert(`Password reset for ${user.email} was successful!`);
      } catch (error) {
        console.error("Error resetting password:", error);
        this.errorMessage = `Error: ${error.message}`;
      } finally {
        this.isProcessingPassword = false;
      }
    },
    async toggleAdmin(user, event) {
      this.isProcessingAdmin = true;
      this.errorMessage = "";
      try {
        const newRole = user.role === "admin" ? "user" : "admin";
        user.role = newRole;

        const response = await fetch(
          `http://localhost:3000/api/users/${user._id}/toggle-admin`,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          user.role = user.role === "admin" ? "user" : "admin";
          event.target.checked = !event.target.checked;

          const text = await response.text();
          throw new Error(text || "Failed to update role");
        }
      } catch (error) {
        console.error("Error updating role:", error);
        this.errorMessage = `Error: ${error.message}`;
      } finally {
        this.isProcessingAdmin = false;
      }
    },
    async deleteUser(user) {
      if (
        !confirm(
          `Permanently delete user ${user.email}? This cannot be undone.`
        )
      )
        return;

      this.isProcessingDelete = true;
      this.errorMessage = "";
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${user._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to delete user");
        }

        this.users = this.users.filter((u) => u._id !== user._id);
        this.filterUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        this.errorMessage = `Error: ${error.message}`;
        this.fetchUsers();
      } finally {
        this.isProcessingDelete = false;
      }
    },
  },
};
</script>

<style scoped>
.management-container {
  position: relative;
  background: var(--darkgrey);
  padding: 2rem;
  min-height: calc(100vh - 130px);
  color: var(--whitegrey);
  max-width: 1400px;
  margin: 0 auto;
}

.management-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.back-button {
  background: transparent;
  font-size: large;
  color: var(--turquoise);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: rgba(116, 188, 191, 0.1);
  transform: translateY(-2px);
}

.section-heading {
  color: var(--turquoise);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.management-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex-grow: 1;
  width: 80%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1.8rem 0.8rem 2.5rem;
  border-radius: 30px;
  border: 1px solid rgba(116, 188, 191, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--whitegrey);
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2rem;
  color: var(--turquoise);
}

.action-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.action-button:hover {
  background: #5da8aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-button.small {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}

.action-button.delete {
  background: #ff6b6b;
}

.action-button.delete:hover {
  background: #ff5252;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.management-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 15px;
  overflow: hidden;
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.management-table th {
  background: rgba(116, 188, 191, 0.2);
  color: var(--turquoise);
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.management-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-row:hover {
  background: rgba(116, 188, 191, 0.1);
}

.actions-cell {
  display: flex;
  gap: 0.8rem;
}

.admin-checkbox {
  transform: scale(1.5);
  cursor: pointer;
  accent-color: var(--turquoise);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--darkgrey);
  border-radius: 15px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  border: 1px solid rgba(116, 188, 191, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(116, 188, 191, 0.3);
  padding-bottom: 1rem;
}

.modal-header h2 {
  color: var(--turquoise);
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--whitegrey);
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--turquoise);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--turquoise);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(116, 188, 191, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--whitegrey);
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  background: transparent;
  border: 1px solid var(--turquoise);
  color: var(--turquoise);
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(116, 188, 191, 0.1);
}

.submit-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #5da8aa;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.loading-spinner {
  border: 5px solid rgba(116, 188, 191, 0.3);
  border-top: 5px solid var(--turquoise);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  margin: 2rem 0;
}

.retry-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;
}

.retry-button:hover {
  background: #5da8aa;
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  color: rgba(116, 188, 191, 0.3);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .section-heading {
    font-size: 2.2rem;
  }

  .management-actions {
    flex-direction: column;
  }

  .search-container {
    max-width: 100%;
  }

  .actions-cell {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .section-heading {
    font-size: 1.8rem;
  }

  .management-table {
    display: block;
    overflow-x: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
