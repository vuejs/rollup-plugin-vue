<template lang="pug">
div(class=css.test class='keep-me') foo
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
