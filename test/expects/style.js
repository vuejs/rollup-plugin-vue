var evens = [2,4,6,8]
var odds = evens.map(v => v + 1)
var style = { template: "<h1 :id=id @click=hi>hello</h1><input type=text>",
  data() {
    return odds
  }
}

export default style;