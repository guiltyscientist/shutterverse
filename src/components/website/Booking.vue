<template>
  <section id="booking" class="booking-section" ref="bookingSection">
    <h2 class="section-heading">BOOK A STUDIO</h2>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading studios...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading studios: {{ error }}</p>
      <button @click="fetchStudios" class="retry-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="selectedStudio" class="split-container">
        <div class="studio-info-container">
          <div class="studio-info-card">
            <div class="info-header">
              <h3>{{ selectedStudio.name }}</h3>
              <button @click="deselectStudio" class="change-studio">
                ← Back to Studios
              </button>
            </div>
            <p>{{ selectedStudio.description }}</p>
            <div class="features">
              <h4>Features:</h4>
              <ul>
                <li
                  v-for="(feature, index) in selectedStudio.features"
                  :key="index"
                >
                  {{ feature }}
                </li>
              </ul>
            </div>
            <div class="pricing">
              <h4>Pricing:</h4>
              <div class="pricing-card">
                <h5>Standard Rate</h5>
                <div class="price">120€ / Session<span>/hour</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-container" ref="calendar">
          <div class="calendar-wrapper">
            <iframe
              :src="`https://tidycal.com/${selectedStudio.tidycalPath}`"
              frameborder="0"
              scrolling="no"
              class="tidycal-iframe"
            ></iframe>
          </div>
        </div>
      </div>

      <div v-else class="studio-cards">
        <div
          class="studio-card"
          v-for="(studio, index) in studios"
          :key="index"
        >
          <div class="card-content">
            <div class="image-container">
              <img
                :src="studio.imageUrl"
                :alt="studio.name"
                class="studio-image"
              />
            </div>
            <h3>{{ studio.name }}</h3>
            <p>{{ studio.shortDescription }}</p>
            <button class="select-studio" @click="selectStudio(studio)">
              Book This Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      selectedStudio: null,
      sectionHeight: null,
      studios: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchStudios() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch("https://shutterverse.onrender.com/api/studios");
        if (!response.ok) throw new Error("Failed to fetch studios");
        const data = await response.json();

        this.studios = data.studios.map((studio) => ({
          id: studio.id,
          name: studio.details.name,
          description: studio.details.description,
          shortDescription:
            studio.details.description.substring(0, 100) + "...",
          features: studio.details.features
            ? studio.details.features.split(",").map((f) => f.trim())
            : [],
          tidycalPath: studio.booking,
          // Use the image directly (it's now a Cloudinary URL)
          imageUrl: studio.image || "",
        }));
      } catch (err) {
        this.error = err.message;
        console.error("Error fetching studios:", err);
      } finally {
        this.loading = false;
      }
    },
    selectStudio(studio) {
      this.selectedStudio = studio;
      this.$nextTick(() => {
        this.sectionHeight = this.$refs.bookingSection.offsetHeight;
        this.$refs.bookingSection.style.height = "auto";
        this.$refs.bookingSection.style.minHeight = "calc(100vh - 130px)";
        this.$refs.bookingSection.scrollIntoView({ behavior: "smooth" });
      });
    },
    deselectStudio() {
      this.$refs.bookingSection.style.height = `${this.sectionHeight}px`;
      setTimeout(() => {
        this.selectedStudio = null;
        this.$refs.bookingSection.style.height = "";
        this.$refs.bookingSection.style.minHeight = "";
        this.$refs.bookingSection.scrollIntoView({ behavior: "smooth" });
      }, 350);
    },
  },
  async mounted() {
    await this.fetchStudios();
  },
};
</script>

<style scoped>
.booking-section {
  position: relative;
  background: var(--darkgrey);
  padding-top: 2rem;
  height: calc(100vh - 130px);
  transition: height 0.4s ease, min-height 0.4s ease;
  overflow: hidden;
  color: var(--whitegrey);
}

.section-heading {
  color: var(--turquoise);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
}

.studio-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.studio-card {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-placeholder {
  height: 220px;
  background: var(--lightgrey);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.image-placeholder::before {
  content: "Studio Image";
  color: var(--darkgrey);
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 1;
}

.image-placeholder::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(116, 188, 191, 0.2) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
}

.studio-card h3 {
  color: var(--turquoise);
  font-size: 1.8rem;
  margin-bottom: 0.001rem;
  text-align: center;
}

.studio-card p {
  line-height: 1.7;
  margin-bottom: 1rem;
  text-align: center;
  flex-grow: 1;
}

.feature-highlights {
  padding-left: 1.2rem;
  margin-bottom: 2rem;
}

.feature-highlights li {
  margin-bottom: 0.8rem;
  position: relative;
  padding-left: 1.5rem;
}

.feature-highlights li::before {
  content: "✓";
  color: var(--turquoise);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.select-studio {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-size: 1.1rem;
  margin-top: auto;
}

.select-studio:hover {
  background: #5da8aa;
  transform: translateY(-3px);
}

.split-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.studio-info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.studio-info-card {
  background: color-mix(in srgb, var(--lightgrey) 20%, transparent);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-header h3 {
  color: var(--turquoise);
  font-size: 2.2rem;
  margin: 0;
  flex: 1;
}

.change-studio {
  background: transparent;
  border: 1px solid var(--turquoise);
  color: var(--turquoise);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
  white-space: nowrap;
}

.change-studio:hover {
  background: rgba(116, 188, 191, 0.1);
}

.studio-info-card p {
  line-height: 1.7;
  font-size: 1.1rem;
}

.features h4 {
  color: var(--turquoise);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(116, 188, 191, 0.3);
  padding-bottom: 0.5rem;
}

.features ul {
  padding-left: 1.5rem;
}

.features li {
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

.pricing {
  margin-top: auto;
}

.pricing h4 {
  color: var(--turquoise);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(116, 188, 191, 0.3);
  padding-bottom: 0.5rem;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.1rem;
  text-align: center;
}

.pricing-card h5 {
  color: var(--turquoise);
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.price {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
}

.price span {
  font-size: 1rem;
  font-weight: normal;
  color: var(--lightgrey);
}

.pricing-card button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-size: 1.1rem;
}

.pricing-card button:hover {
  background: #5da8aa;
}

.calendar-container {
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
}

.calendar-wrapper {
  width: 100%;
  min-height: 1200px;
}

.tidycal-iframe {
  width: 100%;
  height: 1200px;
  border: none;
}

.studio-card p {
  margin-bottom: 1.5rem;
}

.studio-info-container {
  align-self: flex-start;
}

.studio-info-card {
  height: auto !important;
}

.image-container {
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.studio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 100% 60%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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

@media (max-width: 1200px) {
  .split-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .studio-info-container,
  .calendar-container {
    width: 100%;
  }

  .calendar-wrapper,
  .tidycal-iframe {
    min-height: 1000px;
    height: auto;
  }

  .studio-info-card {
    padding: 1.5rem;
  }

  .info-header h3 {
    font-size: 2rem;
  }
}

@media (max-width: 1024px) {
  .booking-section {
    margin-left: 4rem;
    padding: 2rem 1.5rem;
  }

  .section-heading {
    font-size: 2.5rem;
  }

  .studio-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.8rem;
  }

  .studio-info-card p,
  .features li {
    font-size: 1rem;
  }

  .pricing-card h5 {
    font-size: 1.3rem;
  }

  .price {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .booking-section {
    margin-left: 2rem;
    padding: 1.5rem 1rem;
    height: auto;
    min-height: calc(100vh - 130px);
  }

  .section-heading {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .info-header {
    flex-direction: column;
    gap: 1rem;
  }

  .change-studio {
    align-self: flex-start;
    padding: 0.7rem 1.3rem;
    font-size: 0.95rem;
    margin-left: 0;
  }

  .studio-info-card h3 {
    font-size: 1.8rem;
  }

  .features h4,
  .pricing h4 {
    font-size: 1.2rem;
  }

  .calendar-wrapper,
  .tidycal-iframe {
    min-height: 900px;
  }

  .studio-card h3 {
    font-size: 1.6rem;
  }

  .select-studio {
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .booking-section {
    margin-left: 0.1rem;
    padding: 1rem 0.5rem;
  }

  .section-heading {
    font-size: 1.8rem;
    padding: 0 0.5rem;
  }

  .studio-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 0.5rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .image-container {
    height: 180px;
  }

  .studio-info-card {
    padding: 1.2rem;
  }

  .studio-info-card h3 {
    font-size: 1.6rem;
  }

  .studio-info-card p {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .features ul {
    padding-left: 1.2rem;
  }

  .features li {
    font-size: 0.95rem;
  }

  .pricing-card h5 {
    font-size: 1.2rem;
  }

  .price {
    font-size: 2rem;
  }

  .calendar-wrapper,
  .tidycal-iframe {
    height: 1100px;
  }

  .change-studio {
    padding: 0.6rem 1.1rem;
    font-size: 0.9rem;
  }

  .select-studio {
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .section-heading {
    font-size: 1.6rem;
  }

  .studio-info-card h3 {
    font-size: 1.4rem;
  }

  .studio-info-card p {
    font-size: 0.9rem;
  }

  .price {
    font-size: 1.8rem;
  }

  .calendar-wrapper,
  .tidycal-iframe {
    height: 1100px;
  }

  .image-container {
    height: 160px;
  }
}
</style>