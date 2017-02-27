import Compiler from 'coffeescript-compiler'

const coffee = new Compiler()

export default function (script) {
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
