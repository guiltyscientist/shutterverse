<template>
  <div class="section-divider" :style="dividerStyle"></div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: 'var(--darkgrey)'
    },
    height: {
      type: String,
      default: '5rem'
    }
  },
  computed: {
    dividerStyle() {
      return {
        backgroundColor: this.color,
        height: this.height
      }
    }
  }
}
</script>

<style scoped>
.section-divider {
  width: 100%;
  margin: 0;
  transition: all 0.3s ease;
}
</style>