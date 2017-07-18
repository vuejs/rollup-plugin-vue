var component = { template: "<h1 :id=\"id\" @click=\"hi\">hello</h1><input type=\"text\">",
    data: function () { return ({
        hello: 'world!'
    }); },
    methods: {
        hello: function () {
            return this.hello;
        }
    }
};

export default component;
