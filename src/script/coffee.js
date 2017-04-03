export default function (script) {
    const Compiler = require('coffeescript-compiler')
    const coffee = new Compiler()
    return new Promise((resolve, reject) => {
        coffee.compile(script.code, { bare: true }, (status, output) => {
            if (status === 0) {
                script.code = output

                resolve(script)
            } else {
                reject(`Coffee compiler exited with status code ${status}.`)
            }
        })
    })
}
