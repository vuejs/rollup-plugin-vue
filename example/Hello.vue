<template functional>
  <div class="hello">{{ props.message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>


<style scoped>
.hello {
  color: red;
}
</style>
