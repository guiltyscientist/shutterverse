<template>
  <header>
    <router-link to="/" class="logo-desktop" @click.native="handleHomeClick">
      <img
        src="/src/assets/logos/LOGO_Shutterverse_BIG.png"
        height="25"
        alt="Logo"
      />
    </router-link>
    <router-link to="/" class="logo-mobile" @click.native="handleHomeClick">
      <img
        src="/src/assets/logos/LOGO_Shutterverse_ICON.png"
        height="38"
        alt="Logo"
      />
    </router-link>

    <button
      class="hamburger"
      @click="toggleMenu"
      aria-label="Toggle navigation menu"
    >
      {{ isMenuOpen ? "✕" : "☰" }}
    </button>

    <nav :class="{ active: isMenuOpen }" ref="nav">
      <ul class="nav-links">
        <li><a href="#" @click.prevent="navigateToSection('top')">HOME</a></li>
        <li>
          <a href="#news" @click.prevent="navigateToSection('news')">NEWS</a>
        </li>
        <li>
          <a href="#studios" @click.prevent="navigateToSection('studios')"
            >STUDIOS</a
          >
        </li>
        <li>
          <a href="#booking" @click.prevent="navigateToSection('booking')"
            >BOOKING</a
          >
        </li>
        <li
          class="dropdown"
          @mouseenter="!isMobile && (isDropdownOpen = true)"
          @mouseleave="!isMobile && (isDropdownOpen = false)"
        >
          <a
            href="#"
            @click.prevent="handleAboutClick"
            class="dropdown-trigger"
          >
            ABOUT US
            <span class="arrow" :class="{ rotated: isDropdownOpen }">▼</span>
          </a>
          <ul class="dropdown-menu" v-show="isDropdownOpen">
            <li>
              <a href="#team" @click.prevent="navigateToSection('team')"
                >Team</a
              >
            </li>
            <li>
              <a href="#location" @click.prevent="navigateToSection('location')"
                >Location</a
              >
            </li>
            <li>
              <a href="#contact" @click.prevent="navigateToSection('contact')"
                >Contact Us</a
              >
            </li>
          </ul>
        </li>

        <!-- User Authentication Section -->
        <li v-if="!currentUser" class="auth-item">
          <div class="auth-links">
            <router-link to="/login" @click="closeMenu">Login</router-link>
            <span class="separator">|</span>
            <router-link to="/register" @click="closeMenu">Sign Up</router-link>
          </div>
        </li>

        <li
          v-else
          class="user-dropdown"
          @mouseenter="!isMobile && (isUserMenuOpen = true)"
          @mouseleave="!isMobile && (isUserMenuOpen = false)"
        >
          <a href="#" class="user-avatar" @click.prevent="toggleUserMenu">
            <img
              src="/src/assets/icons/user-avatar.png"
              alt="User"
              class="avatar-icon"
            />
            <span class="arrow" :class="{ rotated: isUserMenuOpen }">▼</span>
          </a>
          <ul class="dropdown-menu user-menu" v-show="isUserMenuOpen">
            <li>
              <router-link to="/account" @click="closeMenu"
                >My Account</router-link
              >
            </li>
            <li v-if="isAdmin">
              <router-link to="/admin" @click="closeMenu">Manage</router-link>
            </li>
            <li><a href="#" @click="handleLogout">Logout</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
const authEventBus = {
  events: {},
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  },
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
};

export default {
  data() {
    return {
      isMenuOpen: false,
      isDropdownOpen: false,
      isUserMenuOpen: false,
      isMobile: false,
      currentUser: null,
    };
  },
  computed: {
    isAdmin() {
      return this.currentUser?.role === "admin";
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    document.addEventListener("click", this.handleClickOutside);
    this.loadUser();

    authEventBus.on("user-login", this.handleUserLogin);
    authEventBus.on("user-logout", this.handleUserLogout);

    window.addEventListener("storage", this.handleStorageChange);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkMobile);
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("storage", this.handleStorageChange);

    authEventBus.off("user-login", this.handleUserLogin);
    authEventBus.off("user-logout", this.handleUserLogout);
  },
  methods: {
    navigateToSection(section) {
      this.closeMenu();

      if (this.$route.path === "/") {
        this.scrollToSection(section);
      } else {
        this.$router.push("/").then(() => {
          setTimeout(() => {
            this.scrollToSection(section);
          }, 50);
        });
      }
    },

    toggleUserMenu() {
      if (this.isMobile) {
        this.isUserMenuOpen = !this.isUserMenuOpen;
      }
    },

    handleAboutClick() {
      if (this.isMobile) {
        this.isDropdownOpen = !this.isDropdownOpen;
      } else {
        this.navigateToSection("team");
      }
    },

    loadUser() {
      try {
        const userData = localStorage.getItem("user");
        this.currentUser = userData ? JSON.parse(userData) : null;
      } catch (e) {
        console.error("Error loading user data:", e);
        this.currentUser = null;
      }
    },

    handleStorageChange(event) {
      if (event.key === "user") {
        this.loadUser();
      }
    },

    handleUserLogin(user) {
      this.currentUser = user;
      this.closeMenu();
    },

    handleUserLogout() {
      this.currentUser = null;
      this.closeMenu();
    },

    handleLogout() {
      localStorage.removeItem("user");
      this.currentUser = null;
      this.closeMenu();
      this.$router.push("/");
      authEventBus.emit("user-logout");
    },

    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    scrollToSection(section) {
      this.$nextTick(() => {
        setTimeout(() => {
          const sectionElement = document.getElementById(section);
          const header = document.querySelector("header");

          if (sectionElement && header) {
            const headerHeight = header.offsetHeight;
            const sectionPosition =
              sectionElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = sectionPosition - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 0);
      });
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      if (this.isMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        this.isDropdownOpen = false;
        this.isUserMenuOpen = false;
      }
    },

    closeMenu() {
      this.isMenuOpen = false;
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;
      document.body.style.overflow = "";
    },

    handleClickOutside(event) {
      const navElement = this.$refs.nav;
      const hamburgerButton = document.querySelector(".hamburger");

      if (
        this.isMenuOpen &&
        !navElement.contains(event.target) &&
        (!hamburgerButton || !hamburgerButton.contains(event.target))
      ) {
        this.closeMenu();
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    handleHomeClick() {
      if (this.$route.path === "/") {
        this.scrollToTop();
      } else {
        this.$router.push("/");
      }
      this.closeMenu();
    },
  },
  watch: {
    isMenuOpen(newVal) {
      if (!newVal) {
        this.isDropdownOpen = false;
        this.isUserMenuOpen = false;
      }
    },
  },
};

export { authEventBus };
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  background: var(--darkgrey);
  padding: 0 3rem;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.logo-desktop {
  display: block;
}

.logo-mobile {
  display: none;
}

.logo-desktop,
.logo-mobile {
  cursor: pointer;
}

nav {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.nav-links {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 1rem auto;
  gap: 2rem;
  justify-content: center;
}

.auth-item {
  margin-left: 15rem;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  color: var(--whitegrey);
  font-weight: bold;
}

nav a,
router-link {
  text-decoration: none;
  color: var(--whitegrey);
  text-transform: uppercase;
  font-family: Arial, sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  white-space: nowrap;
  transition: color 0.3s ease;
  padding: 10px 15px;
  display: inline-block;
  justify-content: center;
}

nav li,
router-link {
  justify-content: center;
  text-align: center;
}

nav a:hover {
  color: var(--turquoise);
  justify-content: center;
}

nav router-link:hover {
  color: var(--turquoise);
  justify-content: center;
}

.about-us {
  margin-left: auto;
  position: static;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown a {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
}

.dropdown .arrow {
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--darkgrey);
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  min-width: 6rem;
  z-index: 1001;
}

.user-menu {
  min-width: 10rem;
}

.dropdown-menu li {
  justify-content: center;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-menu a {
  justify-content: center;
  text-align: center;
  padding: 12px;
  color: white;
  text-transform: none;
}

.dropdown-menu a:hover {
  background: var(--lightgrey);
}

.menu-toggle {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  pointer-events: none;
}

.hamburger {
  display: none;
  font-size: 1.5rem;
  background: none;
  border: none;
  color: var(--whitegrey);
  cursor: pointer;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  margin-left: 5px;
  font-size: 0.7rem;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: relative;
  margin-left: 15rem;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.avatar-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 768px) {
  header {
    padding: 2rem;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo-desktop {
    display: none;
  }

  .logo-mobile {
    display: block;
    margin-right: auto;
    cursor: pointer;
  }

  nav {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--darkgrey);
    flex-direction: column;
    display: none;
    padding: 0;
    box-sizing: border-box;
  }

  .auth-item {
    margin-left: 0;
    padding: 1rem 0;
  }

  .user-dropdown {
    margin-left: 0;
    padding: 1rem 0;
    width: 100%;
    text-align: center;
  }

  .auth-links {
    justify-content: center;
    padding: 15px 0;
  }

  nav router-link {
    padding-top: 3rem;
  }

  nav.active {
    display: flex;
  }

  .nav-links {
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding: 0;
  }

  .nav-links li {
    padding: 12px 0;
    width: 100%;
    box-sizing: border-box;
  }

  .dropdown-menu {
    position: relative;
    width: 100%;
    left: 0;
    transform: none;
    text-align: center;
    box-shadow: none;
  }

  .user-menu {
    position: relative;
    width: 100%;
    left: 0;
    transform: none;
    text-align: center;
  }

  .hamburger {
    display: block;
    margin-left: auto;
    z-index: 1001;
    font-size: 2rem;
    padding: 10px;
  }

  .dropdown-trigger {
    cursor: pointer;
  }

  .user-avatar {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
}
</style>
