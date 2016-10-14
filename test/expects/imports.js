var evens = [2,4,6,8];
var odds = evens.map(v => v + 1);
var Basic = { template: "<h1 :id=\"id\" @click=\"hi\">hello</h1><input type=\"text\">",
  data() {
    return odds
  }
};

var imports = { template: "<main><basic></basic></main>",
  components: {
    Basic
  }
};

export default imports;