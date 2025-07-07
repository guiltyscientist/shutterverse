<template>
  <div class="management-container">
    <div class="management-header">
      <button @click="goBack" class="back-button">
        <ArrowLeftIcon class="icon" />
        Go Back to Management Center
      </button>
      <h1 class="section-heading">TEAM MANAGEMENT</h1>
    </div>

    <div class="management-actions">
      <button @click="openCreateModal" class="action-button">
        <PlusCircleIcon class="icon" />
        Add Team Member
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading team members...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading team: {{ error }}</p>
      <button @click="fetchTeamMembers" class="retry-button">Try Again</button>
    </div>

    <div v-else>
      <div v-if="teamMembers.length === 0" class="empty-state">
        <UserGroupIcon class="empty-icon" />
        <p>No team members found. Add your first team member!</p>
      </div>

      <div v-else class="team-grid">
        <div v-for="member in teamMembers" :key="member._id" class="team-card">
          <div class="card-top">
            <div class="team-image-container">
              <div v-if="member.Image" class="team-image">
                <img :src="getImageUrl(member.Image)" :alt="member.Name" />
              </div>
              <div v-else class="placeholder-image">
                <UserIcon class="placeholder-icon" />
              </div>
            </div>
            <div class="card-actions">
              <button @click="openEditModal(member)" class="action-icon">
                <PencilSquareIcon class="icon" />
              </button>
              <button @click="confirmDelete(member._id)" class="action-icon">
                <TrashIcon class="icon" />
              </button>
            </div>
          </div>

          <h3 class="team-name">{{ member.Name }}</h3>
          <p class="team-occupation">{{ member.Occupation }}</p>
          <p class="team-description">
            {{ truncateText(member.Description, 150) }}
          </p>

          <div v-if="member.SocialMedia" class="social-links">
            <a
              v-for="(url, platform) in member.SocialMedia"
              :key="platform"
              :href="url"
              target="_blank"
              class="social-link"
            >
              {{ platform }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal compact-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? "Edit Team Member" : "Add Team Member" }}</h2>
          <button @click="closeModal" class="close-button">
            <XMarkIcon class="icon" />
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Profile Image</label>
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

          <div class="form-group">
            <label>Team Number</label>
            <input
              v-model="currentMember.teamNo"
              type="text"
              placeholder="Team number"
              required
            />
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="currentMember.Name"
              type="text"
              placeholder="Full name"
              required
            />
          </div>

          <div class="form-group">
            <label>Occupation</label>
            <input
              v-model="currentMember.Occupation"
              type="text"
              placeholder="Occupation"
              required
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="currentMember.Description"
              placeholder="Description"
              required
              rows="5"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Social Media Links</label>
            <div class="social-inputs">
              <div
                v-for="(link, index) in socialMediaLinks"
                :key="index"
                class="social-input-group"
              >
                <select v-model="link.platform" class="social-platform">
                  <option value="">Select Platform</option>
                  <option
                    v-for="platform in socialPlatforms"
                    :key="platform"
                    :value="platform"
                  >
                    {{ platform }}
                  </option>
                </select>
                <input
                  v-model="link.url"
                  type="url"
                  placeholder="Profile URL"
                  class="social-url"
                />
                <button
                  type="button"
                  @click="removeSocialLink(index)"
                  class="remove-social-button"
                >
                  <XMarkIcon class="icon" />
                </button>
              </div>
              <button
                type="button"
                @click="addSocialLink"
                class="add-social-button"
              >
                <PlusCircleIcon class="icon" />
                Add Social Media
              </button>
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
            Are you sure you want to delete this team member? This action cannot
            be undone.
          </p>
        </div>

        <div class="form-actions">
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
          <button @click="deleteMember" class="delete-button">Delete</button>
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
  UserGroupIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

export default {
  components: {
    PlusCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    ArrowUpTrayIcon,
    ArrowLeftIcon,
    UserIcon,
  },
  setup() {
    const router = useRouter();
    const teamMembers = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const currentMember = ref({
      teamNo: "",
      Name: "",
      Occupation: "",
      Description: "",
      Image: "",
      SocialMedia: {},
      imageFile: null,
    });
    const socialMediaLinks = ref([]);
    const imagePreview = ref(null);
    const deleteId = ref(null);

    const socialPlatforms = [
      "Instagram",
      "Facebook",
      "Twitter",
      "LinkedIn",
      "YouTube",
      "TikTok",
      "Pinterest",
      "Website",
    ];

    const fetchTeamMembers = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch("http://localhost:3000/api/team-members");
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();
        teamMembers.value = data.teamMembers;
      } catch (err) {
        error.value = err.message;
        console.error("Error fetching team members:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchTeamMembers);

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
          currentMember.value.imageFile = file;
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
      currentMember.value = {
        teamNo: "",
        Name: "",
        Occupation: "",
        Description: "",
        Image: "",
        SocialMedia: {},
        imageFile: null,
      };
      socialMediaLinks.value = [];
      imagePreview.value = null;
      isEditing.value = false;
      showModal.value = true;
    };

    const openEditModal = (member) => {
      currentMember.value = {
        ...member,
        imageFile: null,
      };

      socialMediaLinks.value = [];
      if (member.SocialMedia) {
        Object.entries(member.SocialMedia).forEach(([platform, url]) => {
          socialMediaLinks.value.push({ platform, url });
        });
      }

      imagePreview.value = member.Image || null;
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

    const addSocialLink = () => {
      socialMediaLinks.value.push({ platform: "", url: "" });
    };

    const removeSocialLink = (index) => {
      socialMediaLinks.value.splice(index, 1);
    };

    const submitForm = async () => {
      try {
        const socialMedia = {};
        socialMediaLinks.value.forEach((link) => {
          if (link.platform && link.url) {
            socialMedia[link.platform] = link.url;
          }
        });

        let newImagePath = currentMember.value.Image;

        if (currentMember.value.imageFile) {
          const formData = new FormData();
          formData.append("image", currentMember.value.imageFile);

          try {
            const uploadResponse = await fetch(
              "http://localhost:3000/api/upload/team",
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

        const memberData = {
          teamNo: currentMember.value.teamNo,
          Name: currentMember.value.Name,
          Occupation: currentMember.value.Occupation,
          Description: currentMember.value.Description,
          Image: newImagePath,
          SocialMedia: socialMedia,
        };

        const url = isEditing.value
          ? `http://localhost:3000/api/team-members/${currentMember.value._id}`
          : "http://localhost:3000/api/team-members";

        const method = isEditing.value ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        });

        if (!response.ok) throw new Error("Failed to save team member");

        fetchTeamMembers();
        closeModal();
      } catch (err) {
        error.value = err.message;
        console.error("Error saving team member:", err);
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

    const deleteMember = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/team-members/${deleteId.value}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete team member");

        fetchTeamMembers();
        cancelDelete();
      } catch (err) {
        error.value = err.message;
        console.error("Error deleting team member:", err);
      }
    };

    const goBack = () => {
      router.push("/admin");
    };

    return {
      teamMembers,
      loading,
      error,
      showModal,
      showDeleteModal,
      isEditing,
      currentMember,
      socialMediaLinks,
      socialPlatforms,
      imagePreview,
      goBack,
      getImageUrl,
      fetchTeamMembers,
      truncateText,
      handleImageUpload,
      openCreateModal,
      openEditModal,
      closeModal,
      addSocialLink,
      removeSocialLink,
      submitForm,
      confirmDelete,
      cancelDelete,
      deleteMember,
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

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.team-card {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  border: 1px solid rgba(116, 188, 191, 0.1);
  display: flex;
  flex-direction: column;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(116, 188, 191, 0.3);
}

.card-top {
  position: relative;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.card-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  z-index: 20;
}

.action-icon {
  background: rgba(255, 255, 255, 0.85);
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-icon:hover {
  background: var(--turquoise);
  transform: scale(1.05);
}

.action-icon .icon {
  width: 20px;
  height: 20px;
  color: var(--darkgrey);
}

.action-icon:hover .icon {
  color: white;
}

.team-image-container {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
}

.team-image {
  width: 100%;
  height: 100%;
}

.team-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.team-card:hover .team-image img {
  transform: scale(1.03);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: rgba(116, 188, 191, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  color: rgba(116, 188, 191, 0.3);
}

.team-name {
  color: var(--turquoise);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.team-occupation {
  color: var(--whitegrey);
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.team-description {
  line-height: 1.6;
  color: var(--whitegrey);
  margin-bottom: 1rem;
  flex-grow: 1;
  font-size: 0.95rem;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.social-link {
  background: rgba(116, 188, 191, 0.1);
  color: var(--turquoise);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--turquoise);
  color: var(--darkgrey);
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

.social-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.social-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.social-platform {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(116, 188, 191, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--whitegrey);
  font-size: 1rem;
}

.social-url {
  flex: 2;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(116, 188, 191, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--whitegrey);
  font-size: 1rem;
}

.remove-social-button {
  background: rgba(255, 107, 107, 0.1);
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

.remove-social-button:hover {
  background: #ff6b6b;
}

.remove-social-button .icon {
  width: 1rem;
  height: 1rem;
  color: #ff6b6b;
}

.remove-social-button:hover .icon {
  color: white;
}

.add-social-button {
  background: rgba(116, 188, 191, 0.1);
  color: var(--turquoise);
  border: 1px dashed var(--turquoise);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.add-social-button:hover {
  background: rgba(116, 188, 191, 0.2);
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

  .team-grid {
    grid-template-columns: 1fr;
  }

  .social-input-group {
    flex-direction: column;
  }

  .social-platform,
  .social-url {
    width: 100%;
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
