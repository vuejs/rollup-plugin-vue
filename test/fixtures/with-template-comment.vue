<template comments>
  <div>
    <h2 class="red" id="test">{{ msg }}</h2>
    <!-- comment here -->
  </div>
</template>

<script>
export default {
  comments: true,
  data() {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
.red {
  color: red;
}
</style>
