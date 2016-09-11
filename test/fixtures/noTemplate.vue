<script>
    export default {
        render(h, c) {
            return h('h1', c.data.title);
        },
        data() {
            return { title: 'Hello' };
        },
    };
</script>
