<template>
  <div class="management-container">
    <div class="management-header">
      <button @click="goBack" class="back-button">
        <ArrowLeftIcon class="icon" />
        Go Back to Management Center
      </button>
      <h1 class="section-heading">NEWS MANAGEMENT</h1>
    </div>

    <div class="management-actions">
      <button @click="openCreateModal" class="action-button">
        <PlusCircleIcon class="icon" />
        Create News
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading news...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading news: {{ error }}</p>
      <button @click="fetchNews" class="retry-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="news.length === 0" class="empty-state">
        <NewspaperIcon class="empty-icon" />
        <p>No news items found. Create your first news item!</p>
      </div>

      <div v-else class="news-grid">
        <div v-for="item in sortedNews" :key="item.id" class="news-card">
          <div v-if="item.image" class="news-image">
            <img :src="getImageUrl(item.image)" :alt="item.title" />
          </div>
          <div class="news-header">
            <div class="date-badge">
              <span class="day">{{ item.day }}</span>
              <span class="month">{{ item.month }}</span>
            </div>
            <div class="news-actions">
              <button @click="openEditModal(item)" class="icon-button">
                <PencilSquareIcon class="icon" />
              </button>
              <button @click="confirmDelete(item.id)" class="icon-button">
                <TrashIcon class="icon" />
              </button>
            </div>
          </div>
          <h3 class="news-title">{{ item.title }}</h3>
          <p class="news-text">{{ truncateText(item.text, 150) }}</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit News" : "Create News" }}</h2>
          <button @click="closeModal" class="close-button">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Date</label>
            <div class="date-inputs">
              <input
                v-model="currentNews.day"
                type="number"
                min="1"
                max="31"
                placeholder="Day"
                required
                class="date-input"
              />
              <select v-model="currentNews.month" required class="date-input">
                <option value="" disabled>Select Month</option>
                <option
                  v-for="(month, index) in months"
                  :key="index"
                  :value="month"
                >
                  {{ month }}
                </option>
              </select>
              <input
                v-model="currentNews.year"
                type="number"
                min="2000"
                max="2100"
                placeholder="Year"
                required
              />
              <div class="form-group"></div>
            </div>
          </div>

          <div class="form-group">
            <label>Title</label>
            <input
              v-model="currentNews.title"
              type="text"
              placeholder="News title"
              required
            />
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea
              v-model="currentNews.text"
              placeholder="News content"
              required
              rows="5"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Image</label>
            <div class="image-upload">
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                ref="fileInput"
                class="file-input"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="upload-button"
              >
                <ArrowUpTrayIcon class="icon" />
                Upload Image
              </button>
              <div v-if="imagePreview" class="image-preview">
                <img :src="getImageUrl(imagePreview)" alt="Preview" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Cancel
            </button>
            <button type="submit" class="submit-button">
              {{ isEditing ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="cancelDelete"
    >
      <div class="modal delete-modal">
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button @click="cancelDelete" class="close-button">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <div class="delete-content">
          <ExclamationTriangleIcon class="warning-icon" />
          <p>
            Are you sure you want to delete this news item? This action cannot
            be undone.
          </p>
        </div>

        <div class="form-actions">
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
          <button @click="deleteNews" class="delete-button">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  NewspaperIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/outline";

export default {
  components: {
    PlusCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    NewspaperIcon,
    ArrowUpTrayIcon,
    ArrowLeftIcon,
  },
  setup() {
    const router = useRouter();
    const news = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const currentNews = ref({
      day: "",
      month: "",
      year: new Date().getFullYear.toString(),
      title: "",
      text: "",
      image: "",
      imageFile: null,
    });
    const imagePreview = ref(null);
    const deleteId = ref(null);
    const months = [
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
    ];
    const sortedNews = computed(() => {
      return [...news.value]
        .map((item) => {
          const monthIndex = months.indexOf(item.month);
          const dayNum = parseInt(item.day, 10);
          const yearNum = parseInt(item.year, 10) || new Date().getFullYear();
          return {
            ...item,
            __dateObj: new Date(yearNum, monthIndex, dayNum),
          };
        })
        .sort((a, b) => b.__dateObj - a.__dateObj);
    });

    const fetchNews = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch("http://localhost:3000/api/news");
        if (!response.ok) throw new Error("Failed to fetch news");
        const data = await response.json();
        news.value = data.news;
      } catch (err) {
        error.value = err.message;
        console.error("Error fetching news:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchNews);

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (imagePreview.value) {
          URL.revokeObjectURL(imagePreview.value);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview.value = event.target.result;
          currentNews.value.imageFile = file;
        };
        reader.readAsDataURL(file);
      }
    };

    const BACKEND_BASE_URL = "http://localhost:3000";
    const getImageUrl = (image) => {
      if (!image) return "";
      if (image.startsWith("data:") || image.startsWith("http")) {
        return image;
      }
      return `${BACKEND_BASE_URL}/${image}`;
    };

    const openCreateModal = () => {
      currentNews.value = {
        day: "",
        month: "",
        title: "",
        text: "",
        image: "",
        imageFile: null,
      };
      imagePreview.value = null;
      isEditing.value = false;
      showModal.value = true;
    };

    const openEditModal = (newsItem) => {
      currentNews.value = {
        ...newsItem,
        year: newsItem.year || new Date().getFullYear().toString(),
        imageFile: null,
      };
      imagePreview.value = newsItem.image || null;
      isEditing.value = true;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
        imagePreview.value = null;
      }
    };

    const submitForm = async () => {
      try {
        let newImagePath = currentNews.value.image;

        if (currentNews.value.imageFile) {
          const formData = new FormData();
          formData.append("image", currentNews.value.imageFile);

          try {
            const uploadResponse = await fetch(
              "http://localhost:3000/api/upload",
              {
                method: "POST",
                body: formData,
              }
            );

            if (!uploadResponse.ok) throw new Error("Upload failed");
            const uploadData = await uploadResponse.json();
            newImagePath = uploadData.imagePath;
          } catch (uploadErr) {
            console.error("Upload error details:", uploadErr);
            throw new Error("Failed to upload image");
          }
        }

        const newsData = {
          day: currentNews.value.day,
          month: currentNews.value.month,
          year: currentNews.value.year,
          title: currentNews.value.title,
          text: currentNews.value.text,
          image: newImagePath,
        };

        const url = isEditing.value
          ? `http://localhost:3000/api/news/${currentNews.value.id}`
          : "http://localhost:3000/api/news";

        const method = isEditing.value ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsData),
        });

        if (!response.ok) throw new Error("Failed to save news");

        fetchNews();
        closeModal();
      } catch (err) {
        error.value = err.message;
        console.error("Error saving news:", err);
      }
    };

    const confirmDelete = (id) => {
      deleteId.value = id;
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      showDeleteModal.value = false;
      deleteId.value = null;
    };

    const deleteNews = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/news/${deleteId.value}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete news");

        fetchNews();
        cancelDelete();
      } catch (err) {
        error.value = err.message;
        console.error("Error deleting news:", err);
      }
    };

    const goBack = () => {
      router.push("/admin");
    };

    return {
      news,
      sortedNews,
      loading,
      error,
      showModal,
      showDeleteModal,
      isEditing,
      currentNews,
      imagePreview,
      months,
      goBack,
      getImageUrl,
      fetchNews,
      truncateText,
      handleImageUpload,
      openCreateModal,
      openEditModal,
      closeModal,
      submitForm,
      confirmDelete,
      cancelDelete,
      deleteNews,
    };
  },
};
</script>

<style scoped>
.management-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.back-button {
  background: transparent;
  font-size: large;
  color: var(--turquoise);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: rgba(116, 188, 191, 0.1);
  transform: translateY(-2px);
}

.management-container {
  position: relative;
  background: var(--darkgrey);
  padding: 2rem;
  min-height: calc(100vh - 130px);
  color: var(--whitegrey);
  max-width: 1400px;
  margin: 0 auto;
}

.section-heading {
  color: var(--turquoise);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.management-actions {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.action-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button:hover {
  background: #5da8aa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.news-card {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  border: 1px solid rgba(116, 188, 191, 0.1);
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(116, 188, 191, 0.3);
}

.news-image {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.date-badge {
  background: rgba(116, 188, 191, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 60px;
  text-align: center;
}

.day {
  font-size: 1.8rem;
  font-weight: bold;
  display: block;
  color: var(--turquoise);
}

.month {
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
  color: var(--whitegrey);
}

.news-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-button:hover {
  background: var(--turquoise);
}

.icon-button:hover .icon {
  color: var(--darkgrey);
}

.news-title {
  color: var(--turquoise);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.news-text {
  line-height: 1.6;
  color: var(--whitegrey);
  flex-grow: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--darkgrey);
  border-radius: 15px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px;
  padding: 2rem;
  padding-right: 3.8rem;
  border: 1px solid rgba(116, 188, 191, 0.3);
}

.delete-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(116, 188, 191, 0.3);
  padding-bottom: 1rem;
}

.modal-header h2 {
  color: var(--turquoise);
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--whitegrey);
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--turquoise);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--turquoise);
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(116, 188, 191, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--whitegrey);
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.date-inputs {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  display: none;
}

.upload-button {
  background: rgba(116, 188, 191, 0.2);
  color: var(--turquoise);
  border: 1px dashed var(--turquoise);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.upload-button:hover {
  background: rgba(116, 188, 191, 0.3);
}

.image-preview {
  max-width: 20%;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  background: transparent;
  border: 1px solid var(--turquoise);
  color: var(--turquoise);
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(116, 188, 191, 0.1);
}

.submit-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #5da8aa;
}

.delete-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #ff5252;
}

.delete-content {
  text-align: center;
  padding: 1rem 0;
}

.warning-icon {
  width: 4rem;
  height: 4rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
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

.empty-icon {
  width: 5rem;
  height: 5rem;
  color: rgba(116, 188, 191, 0.3);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .section-heading {
    font-size: 2.2rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }

  .date-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .section-heading {
    font-size: 1.8rem;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
