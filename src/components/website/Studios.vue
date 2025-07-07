<template>
  <section id="studios">
    <div class="studio-section">
      <div class="studio-container">
        <a
          v-for="(studio, index) in studios"
          :key="index"
          :href="'#' + studio.id"
          class="studio-item"
        >
          <img
            :src="'http://localhost:3000/' + studio.image"
            :alt="studio.title"
            class="studio-image"
          />
          <div class="studio-overlay"></div>
          <div class="studio-info">
            <h3>{{ studio.title }}</h3>
          </div>
        </a>
      </div>
    </div>

    <template v-for="(studio, index) in studios" :key="'feature-' + index">
      <SectionDivider />
      <section
        :id="studio.id"
        class="feature-section"
        :class="{ 'reverse-order': index % 2 !== 0 }"
      >
        <div class="studio-image-container">
          <img
            :src="'http://localhost:3000/' + studio.image"
            :alt="studio.details.name"
            class="studio-image"
          />
        </div>
        <div class="studio-info-container">
          <div class="studio-text-content">
            <button class="return-button" @click="scrollToTop">
              ← Studio Overview
            </button>
            <h2 class="studio-title">{{ studio.details.name }}</h2>
            <div class="studio-divider"></div>
            <p
              class="studio-description"
              v-html="studio.details.description"
            ></p>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script>
import SectionDivider from "./SectionDivider.vue";

export default {
  components: {
    SectionDivider,
  },
  data() {
    return {
      studios: [],
    };
  },
  async mounted() {
    try {
      const response = await fetch("http://localhost:3000/api/studios");
      const data = await response.json();
      this.studios = data.studios;
    } catch (error) {
      console.error("Error fetching studios:", error);
    }
  },
  methods: {
    scrollToTop() {
      const studiosSection = document.getElementById("studios");
      if (studiosSection) {
        studiosSection.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
};
</script>

<style scoped>
.studio-section {
  height: 100vh;
  width: 100%;
  background: var(--darkgrey);
}

.studio-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.studio-item {
  flex: 1;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.studio-item:hover .studio-image {
  transform: scale(1.02);
}

.studio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.studio-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  transition: background 0.3s ease;
}

.studio-item:hover .studio-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.studio-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--whitegrey);
  padding: 1.5rem 3rem;
  background: color-mix(in srgb, var(--lightgrey) 60%, transparent);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.studio-info h3 {
  margin: 0;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.studio-item:hover .studio-info {
  background: color-mix(in srgb, var(--turquoise) 90%, transparent);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.feature-section {
  height: 100vh;
  width: 100%;
  display: flex;
  background: var(--darkgrey);
}

.reverse-order {
  flex-direction: row-reverse;
}

.studio-image-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.studio-info-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.studio-text-content {
  max-width: 600px;
  color: var(--whitegrey);
  position: relative;
}

.studio-title {
  font-size: 3.5rem;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--turquoise);
}

.studio-divider {
  width: 120px;
  height: 3px;
  background: var(--turquoise);
  margin: 1.5rem 0;
}

.studio-description {
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.9;
}

.return-button {
  position: absolute;
  top: -1.5rem;
  left: 0;
  background: transparent;
  border: 2px solid var(--turquoise);
  color: var(--turquoise);
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  z-index: 10;
}

.return-button:hover {
  background: color-mix(in srgb, var(--turquoise) 15%, transparent);
}

.reverse-order .return-button {
  left: 0;
  right: auto;
}

@media (max-width: 1024px) {
  .studio-title {
    font-size: 2.8rem;
    margin-top: -2rem;
  }

  .studio-description {
    font-size: 1.1rem;
  }

  .return-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
    top: -5rem;
  }
}

@media (max-width: 768px) {
  .studio-container {
    flex-direction: column;
  }

  .studio-item {
    height: 50vh;
  }

  .studio-info h3 {
    font-size: 1.5rem;
    padding: 1rem 2rem;
  }

  .feature-section {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .studio-image-container,
  .studio-info-container {
    width: 100%;
    height: 50vh;
  }

  .studio-info-container {
    padding: 1.5rem;
    align-items: flex-start;
  }

  .studio-text-content {
    width: 100%;
    padding-top: 1rem;
  }

  .studio-title {
    font-size: 2.2rem;
    margin-top: 1.5rem;
  }

  .studio-divider {
    margin: 1rem 0;
    width: 90px;
  }

  .studio-description {
    font-size: 1rem;
    line-height: 1.5;
  }

  .return-button {
    position: absolute;
    top: -1rem;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid var(--turquoise);
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    z-index: 10;
    backdrop-filter: blur(4px);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .return-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .reverse-order .return-button {
    left: 0;
    right: auto;
  }
}

@media (max-width: 480px) {
  .studio-info h3 {
    font-size: 1.3rem;
    padding: 0.8rem 1.5rem;
  }

  .studio-image-container,
  .studio-info-container {
    height: 45vh;
  }

  .studio-title {
    font-size: 1.8rem;
    margin-top: -12rem;
  }

  .studio-description {
    font-size: 0.95rem;
  }

  .return-button {
    padding: 0.5rem 0.9rem;
    font-size: 0.8rem;
    top: -15rem;
  }

  .studio-text-content {
    padding-top: 0.5rem;
  }
}

@media (max-width: 360px) {
  .studio-title {
    font-size: 1.6rem;
    margin-top: 1rem;
  }

  .studio-description {
    font-size: 0.9rem;
  }

  .return-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    top: -1rem;
  }
}
</style>
