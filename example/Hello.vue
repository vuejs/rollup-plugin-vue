<template>
  <div class="hello">
    <h1 class="hello__title">{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello World!'
    }
  }
}
</script>

<style lang="stylus">
.hello {
  &__title {
    color: #42b983;
  }
}
</style>
