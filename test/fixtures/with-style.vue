<template>
  <h1 id="test" class="title">Hello {{ name }}!</h1>
</template>

<script>
export default {
  data () {
    return { name: 'John Doe' }
  }
}
</script>

<style>
.title {
  color: red;
}
</style>
