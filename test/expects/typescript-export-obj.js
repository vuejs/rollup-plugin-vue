var app = {
 hello: 'world!'
};

var __$app = Object.assign(app, { template: "<h1 :id=\"id\" @click=\"hi\">hello</h1><input type=\"text\">",});
    __$app.prototype = app.prototype;

export default __$app;
