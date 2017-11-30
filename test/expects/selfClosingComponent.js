var evens = [2,4,6,8];
var odds = evens.map(v => v + 1);
var Basic = { template: "<h1 :id=\"id\" @click=\"hi\">hello</h1> <input type=\"text\">",
  data() {
    return odds
  }
};

var selfClosingComponent = { template: "<main> <basic/> <h1>Hey</h1> </main>",
  components: {
    Basic
  }
};

export default selfClosingComponent;
