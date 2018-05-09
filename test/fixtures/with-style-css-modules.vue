<template>
  <h1 id="test" :class="$style.title">Hello {{ name }}!</h1>
</template>

<script>
export default {
  data() {
    return { name: 'John Doe' }
  }
}
</script>

<style module>
.title {
  color: red;
}
</style>
