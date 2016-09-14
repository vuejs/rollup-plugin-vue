<template>
    <ol class="options" v-show="foo && bar === 1"></ol>
</template>

<script>
export default {
    data() {
        return {
            foo: false,
            bar: 2,
        };
    },
};
</script>
