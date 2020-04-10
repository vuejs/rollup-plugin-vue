<template>
  <div class="component-root-node">
    <h1>Hello {{ name }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return { name: 'Jane Doe' }
  }
}
</script>

<style scoped>
.component-root-node {
  background: blue;
}

h1 {
  color: red;
}
</style>
