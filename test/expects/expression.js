var expression = { template: "<ol class=\"options\" v-show=\"foo && bar === 1\"></ol>",
    data() {
        return {
            foo: false,
            bar: 2,
        };
    },
};

export default expression;