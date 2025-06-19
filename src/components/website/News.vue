<template>
  <section id="news" class="news-section">
    <h2 class="section-heading">NEWS</h2>
    
    <!-- New News Notification Button -->
    <div v-if="newNewsAvailable" class="new-news-notification">
      <button @click="showNewNews">
        CHECK OUT NEWEST UPDATE
      </button>
    </div>
    
    <div id="news-container" class="news-container">
      <div v-for="(item, index) in visibleNews" :key="index" class="news-item">
        <div class="news-date">
          <span class="day">{{ item.day }}</span>
          <span class="month">{{ item.month }}</span>
        </div>
        <div class="news-content">
          <h3 v-html="item.title"></h3>
          <p>{{ item.text }}</p>
        </div>
      </div>
    </div>
    <div class="see-more-container">
      <button v-if="showSeeMore" id="see-more-btn" @click="seeMore">
        SEE MORE
      </button>
      <button v-if="showCollapse" id="collapse-btn" @click="collapse">
        COLLAPSE
      </button>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      visibleItems: 5,
      batchSize: 5,
      newsData: [],
      ws: null,
      reconnectAttempts: 0,
      newNewsAvailable: false // Track if new news is available
    };
  },
  computed: {
    visibleNews() {
      return this.newsData.slice(0, this.visibleItems);
    },
    showSeeMore() {
      return this.visibleItems < this.newsData.length;
    },
    showCollapse() {
      return this.visibleItems > 5;
    },
  },
  methods: {
    setupWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsHost = window.location.hostname + ':3000';
      this.ws = new WebSocket(`${protocol}://${wsHost}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'create':
            // Instead of adding directly, show notification button
            this.newNewsAvailable = true;
            break;
            
          case 'update':
            // Update existing item
            const index = this.newsData.findIndex(item => item.id === message.data.id);
            if (index !== -1) {
              this.newsData.splice(index, 1, message.data);
              this.showNotification(`News updated: ${message.data.title}`);
            }
            break;
            
          case 'delete':
            // Remove deleted item
            this.newsData = this.newsData.filter(item => item.id !== message.data);
            this.showNotification(`News deleted`);
            break;
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.reconnect();
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        this.reconnect();
      };
    },
    showNewNews() {
      // Fetch latest news and reset view
      this.fetchNews();
      this.visibleItems = 5;
      this.newNewsAvailable = false;
    },
    reconnect() {
      if (this.reconnectAttempts < 5) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Reconnect attempt ${this.reconnectAttempts}`);
          this.setupWebSocket();
        }, 3000 * this.reconnectAttempts);
      } else {
        console.error('Failed to reconnect after multiple attempts');
      }
    },
    showNotification(message) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'news-notification';
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
      }, 3000);
    },
    seeMore() {
      this.visibleItems = Math.min(
        this.visibleItems + this.batchSize,
        this.newsData.length
      );
    },
    collapse() {
      this.visibleItems = 5;
    },
    async fetchNews() {
      try {
        const response = await fetch("http://localhost:3000/api/news");
        const data = await response.json();
        // Sort by ID descending to show newest first
        this.newsData = data.news.sort((a, b) => b.id - a.id);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    },
  },
  mounted() {
    this.fetchNews();
    this.setupWebSocket();
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }
};
</script>

<style scoped>
.news-section {
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--turquoise);
  height: calc(100vh - 210px);
  margin-left: 7rem;
  margin-top: 10rem;
  padding: 2rem;
  color: var(--darkgrey);
}

.section-heading {
  position: absolute;
  top: -7.5rem;
  left: 0;
  color: var(--whitegrey);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
}

#news-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  height: calc(100vh - 65px);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#news-container::-webkit-scrollbar {
  width: 6px;
  display: none;
}

.news-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border-radius: 8px;
  color: var(--whitegrey);
}

.news-date {
  background: var(--darkgrey);
  width: 6rem;
  height: 4rem;
  padding: 0.5rem 0.5rem;
  border-radius: 5px;
  align-items: center;
  text-align: center;
  margin-right: 1rem;
}

.news-date .day {
  display: block;
  font-size: 2rem;
  font-weight: bold;
}

.news-date .month {
  display: block;
  font-size: 1rem;
  text-transform: uppercase;
}

.news-content h3 {
  margin: 0;
  font-size: 1.6rem;
}

.news-content p {
  margin: 0.3rem 0 0;
  font-size: 1.2rem;
}

.see-more-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

#see-more-btn,
#collapse-btn {
  background: transparent;
  color: var(--darkgrey);
  border: 2px solid var(--darkgrey);
  padding: 0.8rem 2.5rem;
  cursor: pointer;
  border-radius: 25px;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.9rem;
}

#see-more-btn:hover,
#collapse-btn:hover {
  background: var(--darkgrey);
  color: var(--turquoise);
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

/* Responsive styles */
@media (max-width: 768px) {
  .news-section {
    margin-left: 2rem;
    margin-top: 8rem;
    height: auto;
    padding: 1.5rem;
  }

  .section-heading {
    font-size: 2rem;
    top: -5rem;
  }

  .news-date {
    width: 5rem;
    height: 3.5rem;
  }

  .news-date .day {
    font-size: 1.8rem;
  }

  .news-content h3 {
    font-size: 1.2rem;
  }

  .news-content p {
    font-size: 1rem;
  }
}
</style>
