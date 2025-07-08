<template>
  <section id="contact" class="contact-section">
    <h2 class="section-heading">CONTACT US</h2>

    <div class="contact-container">
      <div class="form-wrapper">
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Name *</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
                placeholder="Your name"
              />
              <div v-if="errors.name" class="error-message">
                {{ errors.name }}
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                required
                placeholder="your.email@example.com"
              />
              <div v-if="errors.email" class="error-message">
                {{ errors.email }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              placeholder="+43 123 456 789"
            />
          </div>

          <div class="form-group">
            <label for="message">Message *</label>
            <textarea
              id="message"
              v-model="formData.message"
              required
              placeholder="How can we help you?"
              rows="5"
            ></textarea>
            <div v-if="errors.message" class="error-message">
              {{ errors.message }}
            </div>
          </div>

          <button type="submit" class="submit-button">
            <span v-if="!isSubmitting">Send Message</span>
            <span v-else class="loading-text">Sending...</span>
          </button>

          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i> {{ successMessage }}
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ContactSection",
  data() {
    return {
      formData: {
        name: "",
        email: "",
        phone: "",
        message: "",
      },
      errors: {
        name: "",
        email: "",
        message: "",
      },
      isSubmitting: false,
      successMessage: "",
    };
  },
  methods: {
    validateForm() {
      this.errors = {
        name: "",
        email: "",
        message: "",
      };

      let isValid = true;

      if (!this.formData.name.trim()) {
        this.errors.name = "Please enter your name";
        isValid = false;
      }

      if (!this.formData.email.trim()) {
        this.errors.email = "Please enter your email";
        isValid = false;
      } else if (!this.validateEmail(this.formData.email)) {
        this.errors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (!this.formData.message.trim()) {
        this.errors.message = "Please enter your message";
        isValid = false;
      } else if (this.formData.message.length < 10) {
        this.errors.message = "Message should be at least 10 characters";
        isValid = false;
      }

      return isValid;
    },
    validateEmail(email) {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    submitForm() {
      if (!this.validateForm()) return;
      this.isSubmitting = true;

      setTimeout(() => {
        console.log("Form submitted:", this.formData);

        this.successMessage =
          "Thank you! Your message has been sent successfully.";
        this.isSubmitting = false;

        setTimeout(() => {
          this.formData = {
            name: "",
            email: "",
            phone: "",
            message: "",
          };
          this.successMessage = "";
        }, 5000);
      }, 1500);
    },
  },
};
</script>

<style scoped>
.contact-section {
  background: var(--darkgrey);
  color: var(--whitegrey);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-heading {
  color: var(--turquoise);
  text-transform: uppercase;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
}

.contact-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.contact-form {
  background: color-mix(in srgb, var(--lightgrey) 15%, transparent);
  border-radius: 20px;
  padding: 3rem;
  padding-right: 5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 800px;
}

.form-row {
  display: flex;
  gap: 3rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--turquoise);
  font-size: 1.1rem;
}

input,
textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(116, 188, 191, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--whitegrey);
  font-size: 1rem;
  transition: all 0.3s ease;
}

input::placeholder,
textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

input:focus,
textarea:focus {
  border-color: var(--turquoise);
  background: rgba(255, 255, 255, 0.12);
  outline: none;
  box-shadow: 0 0 0 4px rgba(116, 188, 191, 0.25);
}

textarea {
  resize: vertical;
  min-height: 150px;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.4rem;
  font-weight: 500;
}

.submit-button {
  background: var(--turquoise);
  color: var(--darkgrey);
  border: none;
  padding: 1.1rem 2rem;
  margin-left: 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(116, 188, 191, 0.4);
}

.submit-button:hover {
  background: #5da8aa;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(116, 188, 191, 0.5);
}

.loading-text {
  display: inline-block;
}

.loading-text::after {
  content: "...";
  animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
  0% {
    content: ".";
  }
  33% {
    content: "..";
  }
  66% {
    content: "...";
  }
  100% {
    content: ".";
  }
}

.success-message {
  background: rgba(46, 204, 113, 0.15);
  border: 1px solid #2ecc71;
  border-radius: 10px;
  padding: 1.2rem;
  margin-top: 1.5rem;
  text-align: center;
  color: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .contact-section {
    margin-left: 4rem;
  }

  .section-heading {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .contact-section {
    margin-left: 2rem;
    padding: 3rem 1rem;
  }

  .section-heading {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }

  .contact-form {
    padding: 2rem;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .section-heading {
    font-size: 1.8rem;
    padding-right: 1.8rem;
  }

  .contact-form {
    padding: 1.8rem;
    padding-right: 4rem;
    margin-left: -2rem;
  }

  .submit-button {
    padding: 1rem;
    font-size: 1.1rem;
  }
}
</style>
