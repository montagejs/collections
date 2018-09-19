
const {
    Set
} = require('./set')

let mySet = new Set()

mySet.add(1)
mySet.add(2)
mySet.add(3)
mySet.add(4)
mySet.add(5)
mySet.add(6)
mySet.add(7)

const reducer = (accumulator, currentvalue) => console.log(currentvalue)

mySet.reduceRight(reducer, 0)