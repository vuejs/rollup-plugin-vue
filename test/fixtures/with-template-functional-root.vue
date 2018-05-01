<template>
  <div>
    <functional>
      <span>hello</span>
      <div slot="slot2">Second slot</div>
      <template slot="scoped" scope="scope">{{ scope.msg }}</template>
    </functional>
  </div>
</template>

<script>
import Functional from './with-template-functional.vue'
export default {
  components: {
    Functional
  }
}
</script>
