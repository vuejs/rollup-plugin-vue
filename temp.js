class Test {
  ok() {}
}

var evens = [2,4,6,8]
var odds = evens.map(v => v + 1)
export default {
  data() {
    return odds
  }
}