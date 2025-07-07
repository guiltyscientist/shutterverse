<template>
  <div class="admin-dashboard" ref="adminSection">
    <h2 class="section-heading">ADMIN DASHBOARD</h2>

    <div v-if="user" class="user-info">
      <div class="user-details">
        <span class="user-role">{{ user.role }}</span>
        <span class="user-email">{{ user.email }}</span>
      </div>
      <button @click="logout" class="logout-button">Logout</button>
    </div>

    <div class="admin-sections">
      <div
        class="admin-section"
        v-for="section in sections"
        :key="section.name"
      >
        <div class="section-icon">
          <component :is="section.icon" />
        </div>
        <h3>{{ section.name }}</h3>
        <router-link :to="section.path" class="manage-link">
          Manage {{ section.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import {
  NewspaperIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/vue/24/outline";

export default {
  components: {
    NewspaperIcon,
    BuildingStorefrontIcon,
    UserGroupIcon,
    UsersIcon,
  },
  data() {
    return {
      user: null,
      sections: [
        { name: "News", path: "/admin/news", icon: "NewspaperIcon" },
        {
          name: "Studios",
          path: "/admin/studios",
          icon: "BuildingStorefrontIcon",
        },
        { name: "Users", path: "/admin/users", icon: "UsersIcon" },
        { name: "Team", path: "/admin/teams", icon: "UserGroupIcon" },
      ],
    };
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.user = JSON.parse(userData);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  position: relative;
  background: var(--darkgrey);
  padding: 2rem 1rem;
  min-height: calc(100vh - 130px);
  color: var(--whitegrey);
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  width: 100%;
}

.user-info {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(116, 188, 191, 0.2);
  width: 80%;
  max-width: 800px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-role {
  background: rgba(116, 188, 191, 0.2);
  color: var(--turquoise);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.user-email {
  font-size: 1.1rem;
  font-weight: 500;
}

.logout-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-button:hover {
  background: #5da8aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  justify-content: center;
}

.admin-section {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(116, 188, 191, 0.1);
  width: 250px;
  margin: 0 auto;
}

.section-icon {
  width: 80px;
  height: 80px;
  background: rgba(116, 188, 191, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.section-icon svg {
  width: 40px;
  height: 40px;
  color: var(--turquoise);
  stroke-width: 1.5;
}

.admin-section h3 {
  color: var(--turquoise);
  font-size: 1.8rem;
  margin: 0 0 1rem;
  font-weight: 600;
}

.manage-link {
  display: inline-block;
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  text-decoration: none;
  margin-top: 1rem;
  width: 100%;
  max-width: 200px;
}

.manage-link:hover {
  background: #5da8aa;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1024px) {
  .section-heading {
    font-size: 2.5rem;
  }

  .admin-sections {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .section-heading {
    font-size: 2.2rem;
  }

  .user-info {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
    padding: 1.2rem;
  }

  .user-details {
    align-items: center;
    width: 100%;
  }

  .logout-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 1.5rem 0.8rem;
  }

  .section-heading {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .admin-sections {
    grid-template-columns: 1fr;
    max-width: 100%;
  }

  .admin-section {
    padding: 1.8rem 1.2rem;
    max-width: 100%;
  }

  .section-icon {
    width: 70px;
    height: 70px;
  }

  .section-icon svg {
    width: 35px;
    height: 35px;
  }

  .admin-section h3 {
    font-size: 1.6rem;
  }

  .manage-link {
    font-size: 1rem;
    padding: 0.7rem 1.5rem;
    max-width: 180px;
  }

  .user-info {
    padding: 1.2rem;
    margin-bottom: 2rem;
  }
}
</style>
