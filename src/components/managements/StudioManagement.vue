<template>
  <div class="management-container">
    <div class="management-header">
      <button @click="goBack" class="back-button">
        <ArrowLeftIcon class="icon" />
        Go Back to Management Center
      </button>
      <h1 class="section-heading">STUDIO MANAGEMENT</h1>
    </div>

    <div class="management-actions">
      <button @click="openCreateModal" class="action-button">
        <PlusCircleIcon class="icon" />
        Create Studio
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading studios...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading studios: {{ error }}</p>
      <button @click="fetchStudios" class="retry-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="studios.length === 0" class="empty-state">
        <BuildingOfficeIcon class="empty-icon" />
        <p>No studios found. Create your first studio!</p>
      </div>

      <div v-else class="studio-grid">
        <div v-for="studio in studios" :key="studio.id" class="studio-card">
          <div v-if="studio.image" class="studio-image">
            <img :src="getImageUrl(studio.image)" :alt="studio.title" />
          </div>
          <div class="studio-header">
            <div class="studio-actions">
              <button @click="openEditModal(studio)" class="icon-button">
                <PencilSquareIcon class="icon" />
              </button>
              <button @click="confirmDelete(studio.id)" class="icon-button">
                <TrashIcon class="icon" />
              </button>
            </div>
          </div>
          <h3 class="studio-title">{{ studio.title }}</h3>
          <p class="studio-text">
            {{ truncateText(studio.details.description, 150) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal compact-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit Studio" : "Create Studio" }}</h2>
          <button @click="closeModal" class="close-button">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Studio Title</label>
            <input
              v-model="currentStudio.title"
              type="text"
              placeholder="Studio title"
              required
            />
          </div>

          <div class="form-group">
            <label>Studio Name</label>
            <input
              v-model="currentStudio.details.name"
              type="text"
              placeholder="Studio name"
              required
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="currentStudio.details.description"
              placeholder="Studio description"
              required
              rows="5"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Features (comma separated)</label>
            <textarea
              v-model="currentStudio.details.features"
              placeholder="Feature 1, Feature 2, Feature 3"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>TidyCal Booking Path</label>
            <input
              v-model="currentStudio.booking"
              type="text"
              placeholder="username/booking-path"
            />
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
            Are you sure you want to delete this studio? This action cannot be
            undone.
          </p>
        </div>

        <div class="form-actions">
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
          <button @click="deleteStudio" class="delete-button">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from "@heroicons/vue/24/outline";

export default {
  components: {
    PlusCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    ArrowUpTrayIcon,
    ArrowLeftIcon,
    BuildingOfficeIcon,
  },
  setup() {
    const router = useRouter();
    const studios = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
const currentStudio = ref({
  id: "",
  title: "",
  image: "",
  booking: "",
  details: {
    name: "",
    description: "",
    features: "",
  },
  publicId: null, // Add this
  imageFile: null,
});
    const imagePreview = ref(null);
    const deleteId = ref(null);

    const fetchStudios = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch("https://shutterverse.onrender.com/api/studios");
        if (!response.ok) throw new Error("Failed to fetch studios");
        const data = await response.json();
        studios.value = data.studios;
      } catch (err) {
        error.value = err.message;
        console.error("Error fetching studios:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchStudios);

    const truncateText = (text, maxLength) => {
      if (!text) return "";
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
          currentStudio.value.imageFile = file;
        };
        reader.readAsDataURL(file);
      }
    };

const getImageUrl = (image) => {
  if (!image) return "";
  // If it's already a full URL (from Cloudinary) or data URL, use it directly
  if (image.startsWith("http") || image.startsWith("data:")) {
    return image;
  }
  // Fallback for any remaining local paths (during migration)
  return `https://shutterverse.onrender.com/${image}`;
};

    const openCreateModal = () => {
      currentStudio.value = {
        id: "",
        title: "",
        image: "",
        booking: "",
        details: {
          name: "",
          description: "",
          features: "",
        },
        imageFile: null,
      };
      imagePreview.value = null;
      isEditing.value = false;
      showModal.value = true;
    };

    const openEditModal = (studio) => {
      currentStudio.value = {
        ...studio,
        details: {
          ...studio.details,
          features: studio.details.features || "",
        },
        booking: studio.booking || "",
        imageFile: null,
      };
      imagePreview.value = studio.image || null;
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
    let newImagePath = currentStudio.value.image;
    let newPublicId = currentStudio.value.publicId || null;

    if (currentStudio.value.imageFile) {
      const formData = new FormData();
      formData.append("image", currentStudio.value.imageFile);

      try {
        const uploadResponse = await fetch(
          "https://shutterverse.onrender.com/api/upload/studio",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) throw new Error("Upload failed");
        const uploadData = await uploadResponse.json();
        newImagePath = uploadData.imagePath; // Cloudinary URL
        newPublicId = uploadData.publicId; // Cloudinary public_id
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
        throw new Error("Failed to upload image");
      }
    }

    // Parse features string into array if it exists
    let features = null;
    if (currentStudio.value.details.features) {
      features = currentStudio.value.details.features
        .split(",")
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }

    const studioData = {
      title: currentStudio.value.title,
      image: newImagePath,
      booking: currentStudio.value.booking,
      details: {
        name: currentStudio.value.details.name,
        description: currentStudio.value.details.description,
        features: features, // Send as array or null
      },
      publicId: newPublicId, // Include publicId for backend
    };

    const url = isEditing.value
      ? `https://shutterverse.onrender.com/api/studios/${currentStudio.value.id}`
      : "https://shutterverse.onrender.com/api/studios";

    const method = isEditing.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studioData),
    });

    if (!response.ok) throw new Error("Failed to save studio");

    fetchStudios();
    closeModal();
  } catch (err) {
    error.value = err.message;
    console.error("Error saving studio:", err);
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

    const deleteStudio = async () => {
      try {
        const response = await fetch(
          `https://shutterverse.onrender.com/api/studios/${deleteId.value}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete studio");

        fetchStudios();
        cancelDelete();
      } catch (err) {
        error.value = err.message;
        console.error("Error deleting studio:", err);
      }
    };

    const goBack = () => {
      router.push("/admin");
    };

    return {
      studios,
      loading,
      error,
      showModal,
      showDeleteModal,
      isEditing,
      currentStudio,
      imagePreview,
      goBack,
      getImageUrl,
      fetchStudios,
      truncateText,
      handleImageUpload,
      openCreateModal,
      openEditModal,
      closeModal,
      submitForm,
      confirmDelete,
      cancelDelete,
      deleteStudio,
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

.studio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.studio-card {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  border: 1px solid rgba(116, 188, 191, 0.1);
  display: flex;
  flex-direction: column;
}

.studio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(116, 188, 191, 0.3);
}

.studio-image {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.studio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.studio-header {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.studio-badge {
  background: rgba(116, 188, 191, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.initials {
  font-size: 1.8rem;
  font-weight: bold;
  display: block;
  color: var(--turquoise);
}

.studio-actions {
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

.studio-title {
  color: var(--turquoise);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.studio-text {
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

.compact-modal {
  padding: 1.5rem;
  max-height: 90vh;
  padding-right: 3rem;
  overflow-y: auto;
}

.compact-modal .form-group {
  margin-bottom: 1rem;
}

.compact-modal .form-group textarea {
  min-height: 80px;
  font-size: 0.95rem;
  padding: 0.6rem;
}

.compact-modal .form-group input {
  padding: 0.6rem;
}

.compact-modal .image-upload {
  gap: 0.8rem;
}

.compact-modal .upload-button {
  padding: 0.6rem 1rem;
}

.compact-modal .image-preview {
  max-height: 150px;
}

.compact-modal .form-actions {
  margin-top: 0.5rem;
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

.form-group textarea.features-textarea {
  min-height: 100px;
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
}

.date-input {
  flex: 1;
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
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 20%;
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

  .studio-grid {
    grid-template-columns: 1fr;
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
