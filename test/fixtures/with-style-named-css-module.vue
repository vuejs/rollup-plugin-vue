<template>
  <h1 id="test" :class="[$style.title, my.title]">Hello {{ name }}!</h1>
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
  text-decoration: underline;
}
</style>

<style module="my">
.title {
  color: red;
}
</style>
