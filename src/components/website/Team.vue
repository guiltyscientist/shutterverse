<template>
  <section id="team" class="team-section">
    <h2 class="section-heading">OUR CREATIVE TEAM</h2>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading team members...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading team: {{ error }}</p>
      <button @click="fetchTeamMembers" class="retry-button">Try Again</button>
    </div>

    <div
      v-else
      class="carousel-container"
      :class="{ 'center-mode': shouldCenter }"
    >
      <div class="carousel" :class="{ centered: shouldCenter }" ref="carousel">
        <div
          v-for="(member, index) in teamMembers"
          :key="index"
          class="team-member"
        >
          <div class="member-image-container">
            <div class="circle-image">
              <template v-if="member.imageUrl">
                <img
                  :src="'http://localhost:3000/' + member.imageUrl"
                  :alt="member.name"
                />
              </template>
              <template v-else>
                <div class="image-placeholder">
                  <span>{{ member.initials }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="member-info">
            <h3>{{ member.name }}</h3>
            <div class="member-role">{{ member.role }}</div>
            <p>{{ member.description }}</p>

            <div class="social-links">
              <a
                v-for="(social, socialIndex) in member.social"
                :key="socialIndex"
                :href="social.link"
                class="social-link"
                target="_blank"
                :aria-label="social.platform"
              >
                <img
                  v-if="social.icon"
                  :src="social.icon"
                  :alt="social.platform + ' icon'"
                  class="social-icon"
                />
                <span v-else>{{ social.platform }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "TeamSection",
  data() {
    return {
      teamMembers: [],
      loading: true,
      error: null,
    };
  },
  async mounted() {
    await this.fetchTeamMembers();
  },
  methods: {
    async fetchTeamMembers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch("http://localhost:3000/api/team-members");
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();

        this.teamMembers = data.teamMembers.map((member) => {
          const names = member.Name.split(" ");
          const initials =
            names.length > 1
              ? `${names[0][0]}${names[names.length - 1][0]}`
              : member.Name.substring(0, 2);

          const social = [];
          if (member.SocialMedia) {
            for (const [platform, link] of Object.entries(member.SocialMedia)) {
              const iconMap = {
                Instagram:
                  "src/api/assets/icons/social-medias/Instagram_icon.png",
                Twitter: "src/api/assets/icons/social-medias/Twitter_icon.png",
                Facebook:
                  "src/api/assets/icons/social-medias/Facebook_icon.png",
                LinkedIn:
                  "src/api/assets/icons/social-medias/LinkedIn_icon.png",
                Vimeo: "src/api/assets/icons/social-medias/Vimeo_icon.png",
                YouTube: "src/api/assets/icons/social-medias/YouTube_icon.png",
                SoundCloud:
                  "src/api/assets/icons/social-medias/SoundCloud_icon.png",
                Pinterest:
                  "src/api/assets/icons/social-medias/Pinterest_icon.png",
                Behance: "src/api/assets/icons/social-medias/Behance_icon.png",
              };

              if (iconMap[platform]) {
                social.push({
                  icon: iconMap[platform],
                  link: link,
                  platform: platform,
                });
              }
            }
          }

          return {
            id: member._id,
            name: member.Name,
            role: member.Occupation,
            description: member.Description,
            imageUrl: member.Image,
            initials: initials,
            social: social,
          };
        });
      } catch (err) {
        this.error = err.message;
        console.error("Error fetching team members:", err);
      } finally {
        this.loading = false;
      }
    },

    getInitials(name) {
      const names = name.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : name.substring(0, 2);
    },
  },
  computed: {
    shouldCenter() {
      return this.teamMembers.length <= 4;
    },
  },
};
</script>

<style scoped>
.team-section {
  background: var(--turquoise);
  color: var(--darkgrey);
  padding: 2rem;
  height: calc(100vh - 130px);
  overflow: hidden;
}

.section-heading {
  color: var(--whitegrey);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.center-mode {
  justify-content: center !important;
  overflow-x: hidden !important;
}

.centered {
  min-width: unset !important;
  width: auto !important;
  flex-wrap: wrap;
  justify-content: center;
}

.carousel-container {
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
  padding-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  width: max-content;
  min-width: calc(4 * (300px + 1.5rem));
}

.team-member {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  width: 275px;
  min-height: 480px;
  scroll-snap-align: start;
  flex-shrink: 0;
}

.member-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}

.circle-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--turquoise);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lightgrey);
}

.circle-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--darkgrey);
  color: white;
  font-weight: bold;
  font-size: 2.5rem;
}

.member-info {
  text-align: center;
  padding: 0 0.5rem;
  color: var(--darkgrey);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.member-info h3 {
  color: var(--darkgrey);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.member-role {
  color: var(--darkgrey);
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.member-info p {
  line-height: 1.6;
  color: var(--darkgrey);
  font-size: 0.95rem;
  flex-grow: 1;
  margin-bottom: 1rem;
}

.social-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.social-links {
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  padding-top: 0.8rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  color: white;
  transform: translateY(-3px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid var(--whitegrey);
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
  color: #d32f2f;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
}

.retry-button {
  background: var(--whitegrey);
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
  background: var(--lightgrey);
}

.carousel-container::-webkit-scrollbar {
  height: 8px;
}

.carousel-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.carousel-container::-webkit-scrollbar-thumb {
  background: var(--whitegrey);
  border-radius: 4px;
}

.carousel-container::-webkit-scrollbar-thumb:hover {
  background: var(--darkgrey);
}

@media (max-width: 768px) {
  .team-section {
    padding: 1.5rem 1rem;
    margin-left: 0;
    height: auto;
    min-height: calc(100vh - 130px);
  }

  .section-heading {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
  }

  .carousel-container {
    overflow-x: hidden;
    overflow-y: auto;
    height: calc(100vh - 200px);
    flex-direction: column;
    align-items: center;
    padding: 0 0.5rem;
  }

  .carousel {
    flex-direction: column;
    width: 100%;
    max-width: 450px;
    min-width: unset;
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .team-member {
    width: 100%;
    min-height: unset;
    height: auto;
    padding: 1.2rem;
    margin: 0 auto;
  }

  .carousel-container::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .circle-image {
    width: 130px;
    height: 130px;
  }

  .member-info h3 {
    font-size: 1.4rem;
  }

  .member-role {
    font-size: 0.95rem;
  }

  .member-info p {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .social-icon {
    width: 32px;
    height: 32px;
  }

  .center-mode {
    justify-content: flex-start !important;
  }

  .centered {
    flex-wrap: wrap !important;
    width: 100% !important;
    min-width: unset !important;
  }
}

@media (max-width: 480px) {
  .section-heading {
    font-size: 1.8rem;
    padding: 0 0.5rem;
  }

  .carousel {
    gap: 1.2rem;
  }

  .team-member {
    padding: 1rem;
    width: 300px;
  }

  .circle-image {
    width: 110px;
    height: 110px;
  }

  .member-info h3 {
    font-size: 1.3rem;
  }

  .member-role {
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }

  .member-info p {
    font-size: 0.85rem;
  }

  .social-icon {
    width: 28px;
    height: 28px;
  }

  .social-links {
    gap: 0.6rem;
  }

  .image-placeholder {
    font-size: 2rem;
  }

  .loading-container,
  .error-container {
    height: 250px;
  }
}

@media (max-width: 360px) {
  .team-section {
    padding: 1rem 0.5rem;
  }

  .section-heading {
    font-size: 1.6rem;
  }

  .team-member {
    padding: 0.9rem;
  }

  .circle-image {
    width: 100px;
    height: 100px;
  }

  .member-info h3 {
    font-size: 1.2rem;
  }

  .member-info p {
    font-size: 0.8rem;
  }

  .social-icon {
    width: 26px;
    height: 26px;
  }
}
</style>
