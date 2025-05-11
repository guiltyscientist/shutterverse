<!-- StudioFeature.vue -->
<template>
  <section :id="studio.id" class="feature-section" :class="{ 'reverse-order': reverse }">
    <div class="studio-image-container">
      <img :src="studio.image" :alt="studio.title" class="studio-image">
    </div>
    <div class="studio-info-container">
      <div class="studio-text-content">
        <h2 class="studio-title">{{ studio.title }}</h2>
        <div class="studio-divider"></div>
        <p class="studio-description" v-html="studio.description"></p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    studio: {
      type: Object,
      required: true
    },
    reverse: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
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

.studio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.studio-info-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.studio-text-content {
  max-width: 600px;
  color: var(--whitegrey);
}

.studio-title {
  font-size: 3.5rem;
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

@media (max-width: 768px) {
  .feature-section {
    flex-direction: column;
  }

  .studio-image-container,
  .studio-info-container {
    width: 100%;
    height: 100%;
  }

  .studio-title {
    font-size: 2.5rem;
  }

  .studio-description {
    font-size: 1rem;
  }
}
</style>