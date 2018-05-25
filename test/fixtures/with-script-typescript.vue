<template>
  <h1 id="test" :style="style">Hello</h1>
</template>

<script lang="ts">
// @ts-ignore
import Vue, { VueConstructor } from 'vue'

export default Vue.extend({
  data() {
    return {
      style: { color: 'red' }
    }
  }
})
</script>
