<template lang="html">
<div class="foo bar">test</div>
</template>

<script lang="babel">
export default {}
</script>


<style lang="scss">
$red: red;
.foo {
    color: $red
}
</style>

<style lang="css">
.bar {
    color: blue
}
</style>

<style lang="stylus">
$green = green

.baz
  color $green
</style>
