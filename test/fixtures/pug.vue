<template lang="pug">


  div(class=css.test class='keep-me' v-if="true")
    article
      p foo
  p(v-else)
    | nothing


</template>

<script lang="babel">
export default {}
</script>


<style lang="scss" module>
$var: red;

.test {
    color: $var;
}
</style>
