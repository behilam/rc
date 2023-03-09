const args = process.argv.slice(2)[0];

const res = Function(`return ${args}`)();
if (Array.isArray(res)) return res.forEach(x => console.log(x));
if (typeof res !== 'undefined') console.log(res);
