<template>
<div class="test">Foo</div>
</template>

<script lang="babel">
export default {}
</script>

<style lang="css" scoped>
.test /deep/ a {
    color: red;
}

.test >>> .text {
    background-color: red;
}

@keyframes test {
    0% {
        color: red;
    }

    50% {
        color: green;
    }

    100% {
        color: yellow;
    }
}
</style>
