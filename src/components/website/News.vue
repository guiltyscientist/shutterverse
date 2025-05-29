<template>
  <section id="news" class="news-section">
    <h2 class="section-heading">NEWS</h2>
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
        this.newsData = data.news;
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    },
  },
  mounted() {
    this.fetchNews();
  },
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
