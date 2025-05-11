<!-- StudioComponent.vue -->
<template>
  <section id="studios" class="studio-section">
    <div class="studio-container">
      <a 
        v-for="(studio, index) in studios" 
        :key="index" 
        :href="'#' + studio.id"
        class="studio-item"
      >
        <img :src="studio.image" :alt="studio.title" class="studio-image">
        <div class="studio-overlay"></div>
        <div class="studio-info">
          <h3>{{ studio.title }}</h3>
        </div>
      </a>
    </div>
  </section>

  <template v-for="(studio, index) in studioDetails" :key="'detail-' + index">
    <SectionDivider />
    <StudioFeature :studio="studio" :reverse="index % 2 !== 0" />
  </template>
</template>

<script>
import StudioFeature from './StudioFeature.vue'
import SectionDivider from './SectionDivider.vue'

export default {
  components: {
    StudioFeature,
    SectionDivider
  },
  data() {
    return {
      studios: [
        { id: 'stud1', image: 'src/assets/studios/IMG_7028.JPG', title: 'Studio_1' },
        { id: 'stud2', image: 'src/assets/studios/IMG_7411.JPG', title: 'Studio_2' }
      ],
      studioDetails: [
        {
          id: 'stud1',
          image: 'src/assets/studios/IMG_7028.JPG',
          title: 'EASTER STUDIO',
          description: `Step into our spring-themed wonderland featuring blooming floral backdrops,
            pastel-colored props, and natural daylight simulation. Perfect for seasonal
            shoots and fresh concept photography.<br><br>
            Available: March 12 - April 30<br>
            Max capacity: 8 people<br>
            Lighting: Natural & artificial mix`
        },
        {
          id: 'stud2',
          image: 'src/assets/studios/IMG_7411.JPG',
          title: 'EASTER STUDIO',
          description: `Step into our spring-themed wonderland featuring blooming floral backdrops,
            pastel-colored props, and natural daylight simulation. Perfect for seasonal
            shoots and fresh concept photography.<br><br>
            Available: March 12 - April 30<br>
            Max capacity: 8 people<br>
            Lighting: Natural & artificial mix`
        }
      ]
    }
  }
}
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
}
</style>