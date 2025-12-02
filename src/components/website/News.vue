<template>
  <section id="news" class="news-events-section">
    <h2 class="section-heading">NEWS & EVENTS</h2>

    <div v-if="newNewsAvailable" class="new-news-notification">
      <button @click="showNewNews">CHECK OUT NEWEST UPDATE</button>
    </div>

    <div class="carousel-container">
      <button
        @click="scroll('left')"
        class="carousel-button left"
        :disabled="currentPage === 0"
      >
        ‹
      </button>

      <div class="carousel">
        <div
          v-for="(item, index) in visibleNews"
          :key="index"
          class="event-card"
        >
          <div class="image-container">
            <img
              v-if="item.image"
              :src="getImageUrl(item.image)"
              :alt="item.title"
              class="news-image"
            />
            <div v-else class="image-placeholder">
              <div class="placeholder-text">News Image</div>
            </div>
          </div>

          <div class="date-badge">
            <div class="day">{{ item.day }}</div>
            <div class="month">{{ item.month }}</div>
          </div>

          <div class="news-content">
            <h3 v-html="item.title"></h3>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>

      <button
        @click="scroll('right')"
        class="carousel-button right"
        :disabled="currentPage >= totalPages - 1"
      >
        ›
      </button>

      <div v-if="showLoadMore" class="mobile-load-more">
        <button @click="loadOlderNews">LOAD OLDER NEWS</button>
      </div>
    </div>

    <div class="navigation-controls">
      <button v-if="currentPage > 0" class="go-to-newest" @click="goToNewest">
        Go to the newest News & Events
      </button>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      newsData: [],
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      ws: null,
      reconnectAttempts: 0,
      newNewsAvailable: false,
      currentPage: 0,
      pageSize: 3,
      backendBaseUrl: "https://shutterverse.onrender.com",
      windowWidth: window.innerWidth,
      mobileItemsToShow: 3,
    };
  },
  computed: {
    pageSize() {
      if (this.windowWidth < 768) return 100;
      if (this.windowWidth < 1024) return 2;
      return 3;
    },
    sortedNewsData() {
      return [...this.newsData]
        .map((item) => {
          const monthIndex = this.monthNames.indexOf(item.month);
          const day = parseInt(item.day, 10);
          const year = parseInt(item.year) || new Date().getFullYear();

          return {
            ...item,
            dateObject: new Date(year, monthIndex, day),
          };
        })
        .sort((a, b) => b.dateObject - a.dateObject);
    },
    totalPages() {
      return Math.ceil(this.sortedNewsData.length / this.pageSize);
    },
    visibleNews() {
      if (this.windowWidth < 768) {
        return this.sortedNewsData.slice(0, this.mobileItemsToShow);
      }
      const start = this.currentPage * this.pageSize;
      return this.sortedNewsData.slice(start, start + this.pageSize);
    },
    showLoadMore() {
      return (
        this.windowWidth < 768 &&
        this.mobileItemsToShow < this.sortedNewsData.length
      );
    },
  },
  methods: {
    setupWebSocket() {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost = window.location.hostname + ":3000";
      this.ws = new WebSocket(`${protocol}://${wsHost}`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "create":
            this.newNewsAvailable = true;
            break;

          case "update":
            const index = this.newsData.findIndex(
              (item) => item.id === message.data.id
            );
            if (index !== -1) {
              this.newsData.splice(index, 1, message.data);
            }
            break;

          case "delete":
            this.newsData = this.newsData.filter(
              (item) => item.id !== message.data
            );
            break;
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.reconnect();
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...");
        this.reconnect();
      };
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    getImageUrl(path) {
      if (path.startsWith("http")) {
        return path;
      }
      return `${this.backendBaseUrl}/${path}`;
    },
    showNewNews() {
      this.fetchNews();
      this.currentPage = 0;
      this.newNewsAvailable = false;
      this.mobileItemsToShow = 3;
    },
    goToNewest() {
      this.currentPage = 0;
    },
    reconnect() {
      if (this.reconnectAttempts < 5) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Reconnect attempt ${this.reconnectAttempts}`);
          this.setupWebSocket();
        }, 3000 * this.reconnectAttempts);
      } else {
        console.error("Failed to reconnect after multiple attempts");
      }
    },
    scroll(direction) {
      if (direction === "left" && this.currentPage > 0) {
        this.currentPage--;
      } else if (
        direction === "right" &&
        this.currentPage < this.totalPages - 1
      ) {
        this.currentPage++;
      }
    },
    loadOlderNews() {
      this.mobileItemsToShow += 3;
    },
    async fetchNews() {
      try {
        const response = await fetch(`${this.backendBaseUrl}/api/news`);
        const data = await response.json();
        this.newsData = data.news;
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    },
  },
  mounted() {
    this.fetchNews();
    this.setupWebSocket();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
    window.removeEventListener("resize", this.handleResize);
  },
  watch: {
    pageSize() {
      this.currentPage = 0;
    },
  },
};
</script>

<style scoped>
.news-events-section {
  position: relative;
  background: var(--turquoise);
  border-top-left-radius: 6rem;
  border-bottom-left-radius: 6rem;
  min-height: calc(100vh - 130px);
  height: auto;
  padding: 2rem;
  margin-left: 7rem;
  color: var(--darkgrey);
}

.section-heading {
  color: var(--whitegrey);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  margin-left: 9rem;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.carousel {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  width: 100%;
  overflow: hidden;
}

.event-card {
  position: relative;
  background: var(--whitegrey);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  background: var(--lightgrey);
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: var(--darkgrey);
  font-weight: bold;
  text-align: center;
  padding: 0 1rem;
}

.date-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--darkgrey);
  color: var(--whitegrey);
  text-align: center;
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  z-index: 1;
}

.date-badge .day {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.2;
}

.date-badge .month {
  font-size: 0.9rem;
  text-transform: uppercase;
}

.news-content h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--darkgrey);
  min-height: 3.5rem;
}

.news-content p {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--darkgrey);
  height: 100px;
  overflow: hidden;
}

.carousel-button {
  background: transparent;
  border: none;
  color: var(--darkgrey);
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.carousel-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.2);
}

.carousel-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.left {
  margin-right: 1rem;
}

.right {
  margin-left: 1rem;
}

.new-news-notification {
  position: sticky;
  top: 1rem;
  z-index: 10;
  text-align: center;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.new-news-notification button {
  background: var(--darkgrey);
  color: var(--whitegrey);
  border: 2px solid var(--whitegrey);
  padding: 0.8rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.new-news-notification button:hover {
  background: var(--whitegrey);
  color: var(--darkgrey);
  transform: scale(1.05);
}

.navigation-controls {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.go-to-newest {
  background: transparent;
  color: var(--darkgrey);
  border: 2px solid var(--darkgrey);
  padding: 0.8rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.go-to-newest:hover {
  background: var(--darkgrey);
  color: var(--turquoise);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.image-container {
  width: 100%;
  height: 200px;
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--lightgrey);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .news-events-section {
    margin-left: 1rem;
    padding: 1rem;
    padding-bottom: 4rem;
  }

  .section-heading {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .carousel-container {
    flex-direction: column;
    align-items: stretch;
  }

  .carousel {
    flex-direction: column;
    gap: 2rem;
    overflow: visible;
    padding: 0;
  }

  .event-card {
    max-width: 100%;
    margin-bottom: 1.5rem;
  }

  .carousel-button {
    display: none;
  }

  .navigation-controls {
    position: static;
    margin-top: 1rem;
    padding: 0 1rem;
  }

  .go-to-newest {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }

  .image-container,
  .image-placeholder {
    height: 220px;
  }

  .date-badge {
    top: 1rem;
    right: 1rem;
  }

  .news-content p {
    height: auto;
    max-height: none;
  }

  .mobile-load-more {
    text-align: center;
    margin-top: 1.5rem;
    width: 100%;
  }

  .mobile-load-more button {
    background: var(--darkgrey);
    color: var(--whitegrey);
    border: 2px solid var(--whitegrey);
    padding: 0.8rem 2.5rem;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    text-transform: uppercase;
  }

  .mobile-load-more button:hover {
    background: var(--whitegrey);
    color: var(--darkgrey);
    transform: scale(1.05);
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .event-card {
    max-width: 280px;
  }

  .news-content h3 {
    font-size: 1.2rem;
  }

  .news-content p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .news-events-section {
    margin-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .event-card {
    flex: 0 0 85%;
    margin: 0 7.5%;
    width: 300px;
  }

  .carousel-button {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }

  .section-heading {
    font-size: 1.8rem;
  }

  .image-container,
  .image-placeholder {
    height: 130px;
  }

  .section-heading {
    font-size: 1.8rem;
    text-align: center;
    padding: 0 0.5rem;
  }

  .event-card {
    padding: 1.2rem;
  }

  .image-container,
  .image-placeholder {
    height: 200px;
  }

  .date-badge {
    top: 0.8rem;
    right: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .date-badge .day {
    font-size: 1.3rem;
  }

  .date-badge .month {
    font-size: 0.8rem;
  }

  .news-content h3 {
    font-size: 1.2rem;
  }

  .new-news-notification button,
  .go-to-newest {
    font-size: 0.9rem;
    padding: 0.7rem 1.5rem;
  }

  .mobile-load-more button {
    padding: 0.7rem 2rem;
    font-size: 0.9rem;
    width: 100%;
    max-width: 300px;
  }
}

.carousel-button:disabled {
  visibility: hidden;
}
</style>
