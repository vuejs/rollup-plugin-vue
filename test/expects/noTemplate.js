var noTemplate = {
    render(h, c) {
        return h('h1', c.data.title);
    },
    data() {
        return { title: 'Hello' };
    },
};

export default noTemplate;