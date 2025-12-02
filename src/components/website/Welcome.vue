<template>
  <div class="welcome-container" ref="container">
    <img
      id="welcome-image"
      :src="images[currentIndex]"
      alt="Welcome to Shutterverse"
      class="welcome-image"
    />
    <div class="overlay"></div>
    <div class="welcome-text">
      <h1
        id="welcome-heading"
        :style="{ transform: `scale(${scale})`, opacity: opacity }"
      >
        Welcome to the<br />Shutterverse Studio!
      </h1>
    </div>
    <div class="arrow-area left" @click="previousImage">
      <span class="arrow-icon">&#10094;</span>
    </div>
    <div class="arrow-area right" @click="nextImage">
      <span class="arrow-icon">&#10095;</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [],
      currentIndex: 0,
      scale: 1,
      opacity: 1,
    };
  },
  methods: {
    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    previousImage() {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    handleScroll() {
      const containerRect = this.$refs.container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (containerRect.bottom <= 0) {
        this.scale = 0.6;
        this.opacity = 0;
        return;
      }

      const visibleRatio = Math.max(
        0,
        Math.min(1, containerRect.bottom / windowHeight)
      );
      this.scale = 0.3 + 0.7 * visibleRatio;
      this.opacity = 0.3 + 0.7 * visibleRatio;
    },
    fetchStudios() {
      fetch("https://shutterverse.onrender.com/api/studios")
        .then((response) => response.json())
        .then((data) => {
          this.images = data.studios.map(
            (studio) => `https://shutterverse.onrender.com/${studio.image}`
          );
        })
        .catch((error) => {
          console.error("Error fetching studios:", error);
        });
    },
  },
  mounted() {
    this.fetchStudios();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style scoped>
.welcome-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 65px);
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.welcome-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.welcome-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.welcome-text h1 {
  font-size: 3rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: center;
}

.arrow-area {
  position: absolute;
  top: 0;
  width: 33.33%;
  height: 100%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-area.left {
  left: -140px;
}

.arrow-area.right {
  right: -140px;
}

.arrow-icon {
  font-size: 2.5rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 1024px) {
  .welcome-container {
    height: calc(100vh - 60px);
  }

  .welcome-text h1 {
    font-size: 2.1rem;
  }
}

@media (max-width: 768px) {
  .welcome-text h1 {
    font-size: 2rem;
  }
}
</style>
