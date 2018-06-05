<template>
  <h1>Hello {{ name }}</h1>
</template>

<script lang="ts">
// @ts-ignore
import Vue, { VueConstructor } from 'vue'

export default Vue.extend<{ name: string }, {/* methods */}, {/* computed */}, {/* props */}>({
  data() {
    return { name: 'Jane Doe' }
  }
})
</script>

<style scoped>
h1 {
  color: red;
}
</style>
