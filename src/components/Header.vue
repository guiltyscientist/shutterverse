<template>
    <header>
        <a href="#" class="logo-desktop"><img src="../assets/logos/LOGO_Shutterverse_BIG.png" height="25"
                alt="Logo"></a>
        <a href="#" class="logo-mobile"><img src="../assets/logos/LOGO_Shutterverse_ICON.png" height="38"
                alt="Logo"></a>

        <input type="checkbox" id="menu-toggle" class="menu-toggle" v-model="isMenuOpen" aria-hidden="true">
        <label for="menu-toggle" class="hamburger" aria-label="Toggle navigation menu">☰</label>

        <nav :class="{ active: isMenuOpen }">
            <ul class="nav-links">
                <li><a href="#">HOME</a></li>
                <li><a href="#news" @click.prevent="scrollToSection('news')">NEWS</a></li>
                <li><a href="#studios">STUDIOS</a></li>
                <li><a href="#">EVENTS</a></li>
                <li><a href="#">BOOKING</a></li>
                <li class="dropdown" @mouseenter="!isMobile && (isDropdownOpen = true)"
                    @mouseleave="!isMobile && (isDropdownOpen = false)"
                    @click="isMobile && (isDropdownOpen = !isDropdownOpen)">
                    <a href="#">
                        ABOUT US <span class="arrow" :class="{ rotated: isDropdownOpen }">▼</span>
                    </a>
                    <ul class="dropdown-menu" v-show="isDropdownOpen">
                        <li><a href="#">Team</a></li>
                        <li><a href="#">Location</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
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
            isMobile: false
        }
    },
    mounted() {
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile);
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        scrollToSection(section) {
      if (section === 'news') {
        const newsHeading = document.querySelector('#news .section-heading');
        const header = document.querySelector('header');
        
        if (newsHeading && header) {
          const headerHeight = header.offsetHeight;
          const headingPosition = newsHeading.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = headingPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
    },
    watch: {
        isMenuOpen(newVal) {
            if (!newVal) {
                this.isDropdownOpen = false;
            }
            if (newVal && this.isMobile) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
}
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

nav a {
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

nav li {
    justify-content: center;
    text-align: center;
}

nav a:hover {
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
    /* Default state (right-facing) */
}

.arrow.rotated {
    transform: rotate(0deg);
    /* Open state (down-facing) */
}

@media (max-width: 768px) {
    .logo-desktop {
        display: none;
    }

    .logo-mobile {
        display: block;
        margin-right: auto;
    }

    nav {
        display: none;
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        background: var(--darkgrey);
        flex-direction: column;
    }

    nav.active {
        display: flex;
    }

    .nav-links {
        flex-direction: column;
        gap: 0;
        width: 100%;
    }

    .nav-links li {
        padding: 10px 0;
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
    }
}
</style>