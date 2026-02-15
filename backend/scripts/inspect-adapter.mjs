import pkg from '@prisma/adapter-pg'

console.log('export keys:', Object.keys(pkg))
console.dir(pkg, { depth: 2 })

if (typeof pkg === 'function') console.log('package is a function')
if (pkg.default) console.log('has default export')
if (pkg.adapter) console.log('has adapter export')
