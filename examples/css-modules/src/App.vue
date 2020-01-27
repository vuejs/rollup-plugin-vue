<script>
export default {
  name: 'App',
}
</script>

<template>
  <div :class="$style.red">
    Hello <span class="green">World</span>!
  </div>
</template>

<style module>
.red {
  color: red;
}
</style>

<style scoped>
.green {
  color: red;
}
</style>
