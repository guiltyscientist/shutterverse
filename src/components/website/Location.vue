<template>
  <section id="location" class="location-section">
    <h2 class="section-heading">THE LOCATION</h2>

    <div class="location-container">
      <div class="split-layout">
        <div class="location-info">
          <div class="info-section">
            <h3>Address:</h3>
            <p>Mühlgasse 8<br />2544 Leobersdorf<br />Austria</p>
          </div>

          <div class="info-section">
            <h3>Public Transportation (from Vienna):</h3>
            <p>
              REX 1 to Wr.Neustadt Hbf → Leobersdorf →<br />
              R 96 to Weissenbach/Triesting-Neuhaus Bhf →<br />
              Wittmannsdorf NÖ Bahnhof
            </p>
          </div>

          <div class="info-section">
            <h3>By Car (from Vienna):</h3>
            <p>over S highway/E59</p>
            <a
              href="https://www.google.com/maps?q=Mühlgasse+8,+2544+Leobersdorf,+Austria"
              target="_blank"
              class="map-button"
            >
              Open in Maps
            </a>
          </div>
        </div>

        <div class="map-container">
          <div class="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2673.6857852605704!2d16.209722676410905!3d47.92311697122066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDfCsDU1JzIzLjIiTiAxNsKwMTInNDQuMyJF!5e0!3m2!1sde!2sat!4v1751746503782!5m2!1sde!2sat"
              frameborder="0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LocationSection",
};
</script>

<style scoped>
.location-section {
  background: var(--darkgrey);
  color: var(--whitegrey);
  height: calc(100vh - 130px);
}

.section-heading {
  color: var(--turquoise);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.location-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.split-layout {
  display: flex;
  gap: 2rem;
  height: 100%;
}

.location-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--turquoise);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.map-container {
  flex: 1.5;
}

.map-wrapper {
  position: relative;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
  background: var(--lightgrey);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.map-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.info-section {
  padding: 1rem;
  background: white;
  border-radius: 10px;
  color: var(--darkgrey);
}

.info-section h3 {
  color: var(--turquoise);
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.info-section p {
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.map-button {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--darkgrey);
  color: white;
  border-radius: 30px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.map-button:hover {
  background: #1a1a1a;
  transform: translateY(-3px);
}

@media (max-width: 1024px) {
  .location-section {
    margin-left: 4rem;
  }

  .section-heading {
    font-size: 2.5rem;
  }

  .split-layout {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .location-section {
    margin-left: 2rem;
    padding: 2rem 1rem;
    height: auto;
    min-height: calc(100vh - 130px);
  }

  .section-heading {
    font-size: 2.2rem;
  }

  .split-layout {
    flex-direction: column;
  }

  .location-info,
  .map-container {
    flex: 1;
  }

  .map-wrapper {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .section-heading {
    font-size: 1.8rem;
  }

  .location-info {
    padding: 1rem;
    margin-left: -1.5rem;
  }

  .info-section {
    padding: 1rem;
  }

  .map-wrapper {
    height: 300px;
    margin-left: -1.5rem;
  }
}
</style>
