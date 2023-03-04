const bqn = require("./bqnVM.js");
const args = process.argv.slice(2).join(" ");

const res = bqn.compile(args);

console.log(bqn.fmt(bqn.run(...res)));
