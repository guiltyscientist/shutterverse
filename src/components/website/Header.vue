<template>
    <header>
        <router-link to="/" class="logo-desktop" @click="closeMenu">
            <img src="/src/assets/logos/LOGO_Shutterverse_BIG.png" height="25" alt="Logo" />
        </router-link>
        <router-link to="/" class="logo-mobile" @click="closeMenu">
            <img src="/src/assets/logos/LOGO_Shutterverse_ICON.png" height="38" alt="Logo" />
        </router-link>

        <button class="hamburger" @click="toggleMenu" aria-label="Toggle navigation menu">
            {{ isMenuOpen ? "✕" : "☰" }}
        </button>

        <nav :class="{ active: isMenuOpen }" ref="nav">
            <ul class="nav-links">
                <li><router-link to="/" @click="closeMenu">HOME</router-link></li>
                <li>
                    <a href="#news" @click.prevent="
                        scrollToSection('news');
                    closeMenu();
                    ">NEWS</a>
                </li>
                <li>
                    <a href="#studios" @click.prevent="
                        scrollToSection('studios');
                    closeMenu();
                    ">STUDIOS</a>
                </li>
                <li><a href="#">EVENTS</a></li>
                <li><a href="#">BOOKING</a></li>
                <li class="dropdown" @mouseenter="!isMobile && (isDropdownOpen = true)"
                    @mouseleave="!isMobile && (isDropdownOpen = false)"
                    @click="isMobile && (isDropdownOpen = !isDropdownOpen)">
                    <a href="#">
                        ABOUT US
                        <span class="arrow" :class="{ rotated: isDropdownOpen }">▼</span>
                    </a>
                    <ul class="dropdown-menu" v-show="isDropdownOpen">
                        <li><a href="#" @click="closeMenu">Team</a></li>
                        <li><a href="#" @click="closeMenu">Location</a></li>
                        <li><a href="#" @click="closeMenu">Contact Us</a></li>
                    </ul>
                </li>
                <li class="auth-item">
                    <div class="auth-links">
                        <router-link to="/login" @click="closeMenu">Login</router-link>
                        <span class="separator">|</span>
                        <router-link to="/register" @click="closeMenu">Sign Up</router-link>
                    </div>
                </li>
            </ul>
        </nav>
    </header>
</template>

<script>
export default {
    data() {
        return {
            isMenuOpen: false,
            isDropdownOpen: false,
            isMobile: false,
        };
    },
    mounted() {
        this.checkMobile();
        window.addEventListener("resize", this.checkMobile);

        // Add click outside listener
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.checkMobile);
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        scrollToSection(section) {
            if (section === "news" || section === "studios") {
                const sectionElement = document.querySelector(`#${section}`);
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
            }
        },
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            if (this.isMenuOpen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
                this.isDropdownOpen = false;
            }
        },
        closeMenu() {
            this.isMenuOpen = false;
            this.isDropdownOpen = false;
            document.body.style.overflow = "";
        },
        handleClickOutside(event) {
            // Close menu if click is outside nav and not on hamburger button
            const navElement = this.$refs.nav;
            const hamburgerButton = document.querySelector(".hamburger");

            if (
                this.isMenuOpen &&
                !navElement.contains(event.target) &&
                !hamburgerButton.contains(event.target)
            ) {
                this.closeMenu();
            }
        },
    },
    watch: {
        isMenuOpen(newVal) {
            if (!newVal) {
                this.isDropdownOpen = false;
            }
        },
    },
};
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
    transform: rotate(-90deg);
}

.arrow.rotated {
    transform: rotate(0deg);
}

@media (max-width: 768px) {
    header {
        padding: 2 rem;
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
    }

    .hamburger {
        display: block;
        margin-left: auto;
        z-index: 1001;
        font-size: 2rem;
        padding: 10px;
    }
}
</style>
