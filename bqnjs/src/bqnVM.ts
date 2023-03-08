import { BODIES } from './bodies';
import { BYTECODE, BYTECODE2, BYTECODE3 } from './bytecode';
import { OBJECTS3 } from './objects';
const has = (x: unknown) => x !== undefined;
const isNum = (x: unknown): x is number => typeof x === 'number';
const isFunc = (x: unknown): x is Function => typeof x === 'function';
const call = (f, x, w) => {
  if (x === undefined) return x;
  if (!isFunc(f)) return f;
  if (f.m) throw Error('Runtime: Cannot call modifier as function');
  return f(x, w);
};

const getRev = names => {
  let m = names.rev;
  if (m) return m;
  m = {};
  names.forEach((s, i) => (m[s] = i));
  return (names.rev = m);
};
const nsGet = x => {
  const rev = getRev(x.ns.names);
  return s => (i => (has(i) ? x[x.ns[i]] : i))(rev[s]);
};
const findKey = (ns, names, i) => {
  let nn = ns.names;
  return ns[nn === names ? i : getRev(nn)[names[i]]];
};
const readNs_sub = (v, names, i) => {
  let ni = findKey(v.ns, names, i);
  if (!has(ni)) throw Error('Unknown namespace key: ' + names[i]);
  return v[ni];
};
const readNs_assign = (v, vid, i) => readNs_sub(v, vid.names, vid[i]);
const readNs = (v, vid, i) => {
  if (!v.ns) throw Error('Key lookup in non-namespace');
  return readNs_sub(v, vid.names, i);
};
const makeNs = (keys, values) => {
  let n = Array(keys.length)
    .fill()
    .map((_, i) => i);
  n.names = keys.map(k => k.toLowerCase());
  values.ns = n;
  return values;
};
const listKeys = x => {
  let s = x.ns,
    k = Object.keys(s).filter(n => !isNaN(n));
  return k.map(n => s.names[+n]).sort();
};

const getV = (a, i) => {
  let v = a[i];
  if (v === null) throw Error('Runtime: Variable referenced before definition');
  return v;
};
const get = x =>
  x.e
    ? getV(x.e, x.p)
    : arr(
        x.map(c => get(c)),
        x.sh,
      );
let preview = false;
const inPreview = () => preview;

const setC = (d, id, v) => {
  if (preview && setEff(id))
    throw { kind: 'previewError', message: 'side effects are not allowed' };
  return set(d, id, v);
};

const setEff = id => {
  if (id.e) return !id.e.inpreview;
  else if (id.match) return false;
  else if (Array.isArray(id))
    return id.some(id => (id.m ? setEff(id.m) : setEff(id)));
  else return false;
};

const set = (d, id, v) => {
  const eq = (a, b) => a.length === b.length && a.every((e, i) => e === b[i]);
  if (id.e) {
    if (!d && id.e[id.p] === null)
      throw Error('↩: Variable modified before definition');
    id.e[id.p] = v;
  } else if (id.match) {
    if (has(id.v) && !call(runtime[18], id.v, v)) throw Error();
  } else if (id.merge) {
    if (!v.sh || v.sh.length < 1)
      throw Error('[…]← or ↩: Value must have rank 1 or more');
    if (id.sh[0] !== v.sh[0])
      throw Error("[…]← or ↩: Target and value lengths don't match");
    let cs = v.sh.slice(1);
    let c = cs.reduce((a, b) => a * b, 1);
    let cell = j => arr(v.slice(c * j, c * j + c), cs, v.fill);
    id.map((n, j) => set(d, n, cell(j)));
  } else if (id.m) {
    throw Error("← or ↩: Can't use alias in list destructuring");
  } else {
    if (v.sh) {
      if (!eq(id.sh, v.sh))
        throw Error("← or ↩: Target and value shapes don't match");
      id.map((n, j) => set(d, n, v[j]));
    } else if (v.ns) {
      id.map(n => {
        if (n.e) {
          let vid = n.e.vid;
          set(d, n, readNs_assign(v, vid, n.p));
        } else if (n.m) {
          set(d, n.m, readNs(v, n.vid, n.a));
        } else {
          throw Error('← or ↩: Cannot extract non-name from namespace');
        }
      });
    } else {
      throw Error('← or ↩: Multiple targets but atomic value');
    }
  }
  return v;
};

const merge = x => {
  return call(runtime[13], x);
};

const checkM = (v, m) => {
  if (m.m !== v)
    throw Error(
      'Runtime: Only a ' +
        v +
        '-modifier can be called as a ' +
        v +
        '-modifier',
    );
};
const genJs = (B, p, L) => {
  // Bytecode -> Javascript compiler
  let rD = 0;
  let r = L ? 'let l=0;try{' : '';
  const set = L ? 'setC' : 'set';
  const fin = L
    ? '}catch(er){let s=L.map(p=>p[l]);s.sh=[1,2];let m=[s,er.message];m.loc=1;m.src=e.vid.src;m.sh=[2];er.message=m;throw er;}'
    : '';
  let szM = 1;
  const rV = n => {
    szM = Math.max(szM, n + 1);
    return 'v' + n;
  };
  const rP = val => rV(rD++) + '=' + val + ';';
  const rG = () => rV(--rD);
  const num = () => {
    return B[p++];
  };
  const ge = n => 'e' + '.p'.repeat(n);
  loop: while (true) {
    r += '\n';
    if (p > B.length) throw Error('Internal compiler error: Unclosed function');
    if (L) r += 'l=' + p + ';';
    switch (B[p++]) {
      case 0: {
        r += rP('O[' + num() + ']');
        break;
      }
      case 1: {
        r += rP('D[' + num() + '](e)');
        break;
      }
      case 6: {
        rD--;
        break;
      }
      case 7: {
        if (rD !== 1) throw Error('Internal compiler error: Wrong stack size');
        r += 'return v0;';
        break loop;
      }
      case 8: {
        r += 'e.ns=e.vid.ns;return e;';
        break loop;
      }
      case 11:
      case 12:
      case 13:
      case 14: {
        const o = B[p - 1];
        const n = num();
        rD -= n;
        const l =
          'llst([' +
          new Array(n)
            .fill()
            .map((_, i) => rV(rD + i))
            .join(',') +
          '])';
        r += rP(o == 13 ? 'merge(' + l + ')' : l);
        if (o == 14) r += rV(rD - 1) + '.merge=1;';
        break;
      }
      case 16:
      case 18: {
        const f = rG(),
          x = rG();
        r += rP('call(' + f + ',' + x + ')');
        break;
      }
      case 17:
      case 19: {
        const w = rG(),
          f = rG(),
          x = rG();
        r += rP('call(' + f + ',' + x + ',' + w + ')');
        break;
      }
      case 20: {
        const g = rG(),
          h = rG();
        r += rP('train2(' + g + ',' + h + ')');
        break;
      }
      case 21:
      case 23: {
        const f = rG(),
          g = rG(),
          h = rG();
        r += rP('train3(' + f + ',' + g + ',' + h + ')');
        break;
      }
      case 26: {
        const f = rG(),
          m = rG();
        r += 'chkM(1,' + m + ');' + rP(m + '(' + f + ')');
        break;
      }
      case 27: {
        const f = rG(),
          m = rG(),
          g = rG();
        r += 'chkM(2,' + m + ');' + rP(m + '(' + f + ',' + g + ')');
        break;
      }
      case 22: {
        r +=
          'if(undefined===' +
          rV(rD - 1) +
          ")throw Error('Left argument required');";
        break;
      }
      case 32:
      case 34: {
        r += rP('getV(' + ge(num()) + ',' + num() + ')');
        break;
      }
      case 33: {
        r += rP('{e:' + ge(num()) + ',p:' + num() + '}');
        break;
      }
      case 42: {
        const p = rG();
        r +=
          'if(1!==' +
          p +
          '){if(0!==' +
          p +
          ")throw Error('Predicate value must be 0 or 1');break;}";
        break;
      }
      case 43: {
        const m = rG();
        r += rP('{match:1,v:' + m + '}');
        break;
      }
      case 44: {
        r += rP('{match:1}');
        break;
      }
      case 47: {
        const i = rG(),
          v = rG();
        r += 'try{set(1,' + i + ',' + v + ');}catch(e){break;}';
        break;
      }
      case 48: {
        const i = rG(),
          v = rG();
        r += rP(set + '(1,' + i + ',' + v + ')');
        break;
      }
      case 49: {
        const i = rG(),
          v = rG();
        r += rP(set + '(0,' + i + ',' + v + ')');
        break;
      }
      case 50: {
        const i = rG(),
          f = rG(),
          x = rG();
        r += rP(set + '(0,' + i + ',call(' + f + ',' + x + ',get(' + i + ')))');
        break;
      }
      case 51: {
        const i = rG(),
          f = rG();
        r += rP(set + '(0,' + i + ',call(' + f + ',get(' + i + ')))');
        break;
      }
      case 66: {
        const m = rG();
        r += rP('{vid:e.vid,m:' + m + ',a:' + num() + '}');
        break;
      }
      case 64: {
        const v = rG();
        r += rP('readns(' + v + ',e.vid,' + num() + ')');
        break;
      }
    }
  }
  return (
    'let ' +
    new Array(szM)
      .fill()
      .map((_, i) => rV(i))
      .join(',') +
    ';' +
    r +
    fin
  );
};
const run = (
  Bytecode,
  Objects,
  Blocks,
  Bodies,
  Locations,
  Tokenization,
  src,
  env,
) => {
  // Bytecode, Objects, Blocks, Bodies, Locations, Tokenization, source
  const train2 = (g, h) => {
    const t = (x, w) => call(g, call(h, x, w));
    t.repr = () => [2, g, h];
    return t;
  };
  const train3 = (f, g, h) => {
    if (!has(f)) return train2(g, h);
    const t = (x, w) => call(g, call(h, x, w), call(f, x, w));
    t.repr = () => [3, f, g, h];
    return t;
  };
  const repdf = ['', '4,f,mod', '5,f,mod,g'].map(s =>
    s ? 'fn.repr=()=>[' + s + '];' : s,
  );

  const D = Blocks.map(([type, imm, ind], i) => {
    const I = imm ? 0 : 3; // Operand start
    const sp = (type === 0 ? 0 : type + 1) + I;
    const useEnv = i === 0 && env;
    const gen = j => {
      const [pos, varam, vid, vex] = Bodies[j];
      const ns = {};
      if (vex)
        vex.forEach((e, j) => {
          if (e) ns[vid[j]] = j + sp;
        });
      vid = new Array(sp).fill(null).concat(vid);
      vid.src = src;
      vid.ns = ns;
      if (Tokenization)
        ns.names = vid.names = Tokenization[2][0].map(s => s.join(''));
      return [genJs(Bytecode, pos, Locations), vid];
    };

    const ginPreview = e => (Locations ? e + '.inpreview=inpreview()' : '');
    let c, vid, def;
    if (isNum(ind)) {
      [c, vid] = gen(ind);
      c = 'do {' + c + "} while (0);\nthrow Error('No matching case');\n";
      if (useEnv) {
        c = 'const e=env;' + c;
        env.vid = vid;
      } else if (imm)
        c = 'const e=[...e2];' + ginPreview('e') + ';e.vid=vid;e.p=oe;' + c;
      else
        c =
          'const fn=(x, w)=>{const e=[...e2];' +
          ginPreview('e') +
          ';e.vid=vid;e.p=oe;e[0]=fn;e[1]=x;e[2]=w;' +
          c +
          '};' +
          repdf[type] +
          'return fn;';
      def = useEnv ? 'env' : 'new Array(' + vid.length + ').fill(null)';
    } else {
      if (imm !== +(ind.length < 2))
        throw 'Internal error: malformed block info';
      const cache = []; // Avoid generating a shared case twice
      vid = [];
      let g = j => {
        let [c, v] = cache[j] || (cache[j] = gen(j));
        c =
          'const e=[...e1];' +
          ginPreview('e') +
          ';e.vid=vid[' +
          vid.length +
          '];e.p=oe;e.length=' +
          v.length +
          ';e.fill(null,' +
          sp +
          ');' +
          c;
        vid.push(v);
        return 'do {' + c + '} while (0);\n';
      };
      if (ind.length === 3) ind[3] = [];
      const cases = ind.map((js, i) => {
        const e = js.length
          ? 'No matching case'
          : 'Left argument ' + (i ? 'not allowed' : 'required');
        return js
          .map(g)
          .concat(["throw Error('" + e + "');\n"])
          .join('');
      });
      const fn = b =>
        '(x, w)=>{const e1=[...e2];' +
        ginPreview('e1') +
        ';e1[0]=fn;e1[1]=x;e1[2]=w;\n' +
        b +
        '\n};';
      const combine = ([mon, dy]) =>
        fn('if (w===undefined) {\n' + mon + '} else {\n' + dy + '}');
      def = 'new Array(' + sp + ').fill(null)';
      if (imm) c = 'const e1=[...e2];' + ginPreview('e1') + ';' + cases[0];
      else {
        c = 'const fn=' + combine(cases) + repdf[type];
        if (cases.length > 2) {
          c += 'fn.inverse=' + combine(cases.slice(2));
          if (cases[4])
            c +=
              'fn.sinverse=' +
              fn("if(!has(w))throw Error('No matching case');" + cases[4]);
        }
        c += 'return fn;';
      }
    }

    const de2 = 'let e2=' + def + ';' + ginPreview('e2') + ';';
    if (type === 0) c = de2 + c;
    if (type === 1)
      c =
        'const mod=(f  ) => {' +
        de2 +
        ' e2[' +
        I +
        ']=mod;e2[' +
        (I + 1) +
        ']=f;' +
        c +
        '}; mod.m=1;return mod;';
    if (type === 2)
      c =
        'const mod=(f,g) => {' +
        de2 +
        ' e2[' +
        I +
        ']=mod;e2[' +
        (I + 1) +
        ']=f;e2[' +
        (I + 2) +
        ']=g;' +
        c +
        '}; mod.m=2;return mod;';
    return Function(
      "'use strict'; return (chkM,has,call,getV,get,set,setC,llst,merge,train2,train3,readns,O,L,env,vid,inpreview) => D => oe => {" +
        c +
        '};',
    )()(
      checkM,
      has,
      call,
      getV,
      get,
      set,
      setC,
      llst,
      merge,
      train2,
      train3,
      readNs,
      Objects,
      Locations,
      env,
      vid,
      inPreview,
    );
  });
  D.forEach((d, i) => {
    D[i] = d(D);
  });
  return D[0]([]);
};

// Runtime
const assertFn = pre => (x, w) => {
  if (x !== 1) throw { kind: pre, message: has(w) ? w : x };
  return x;
};
const arr = (r, sh, fill) => {
  r.sh = sh;
  r.fill = fill;
  return r;
};
const list = (l, fill) => arr(l, [l.length], fill);
const llst = l => list(l, l.length > 0 && l.every(isNum) ? 0 : undefined);
const str = s => list(Array.from(s), ' ');
const unstr = s => s.join('');
const setRepr = (r, f) => {
  f.repr = r;
  return f;
};
const m1 = m => {
  const r = f => setRepr(() => [4, f, r], m(f));
  r.m = 1;
  return r;
};
const m2 = m => {
  const r = (f, g) => setRepr(() => [5, f, r, g], m(f, g));
  r.m = 2;
  return r;
};
const ctrans = (c, t) => String.fromCodePoint(c.codePointAt(0) + t);
const plus = (x, w) => {
  if (!has(w)) {
    if (!isNum(x)) throw Error('+: Argument must be a number');
    return x;
  }
  const s = typeof w,
    t = typeof x;
  if (s === 'number' && t === 'number') return w + x;
  if (s === 'number' && t === 'string') return ctrans(x, w);
  if (s === 'string' && t === 'number') return ctrans(w, x);
  if (s === 'string' && t === 'string')
    throw Error('+: Cannot add two characters');
  throw Error('+: Cannot add non-data values');
};
const minus = (x, w) => {
  if (!isNum(x)) {
    if (has(w) && typeof w === 'string')
      return w.codePointAt(0) - x.codePointAt(0);
    throw Error('-: Can only negate numbers');
  }
  if (!has(w)) return -x;
  const s = typeof w;
  if (s === 'number') return w - x;
  if (s === 'string') return ctrans(w, -x);
  throw Error('-: Cannot subtract from non-data value');
};
const times = (x, w) => {
  if (isNum(x) && isNum(w)) return x * w;
  throw Error('×: Arguments must be numbers');
};
const divide = (x, w) => {
  if (isNum(x) && (!has(w) || isNum(w)))
    return (has(w) ? w : 1) / (x === 0 ? 0 : x);
  throw Error('÷: Arguments must be numbers');
};
const power = (x, w) => {
  if (isNum(x)) {
    if (!has(w)) return Math.exp(x);
    if (isNum(w)) return Math.pow(w === 0 ? 0 : w, x);
  }
  throw Error('⋆: Arguments must be numbers');
};
const log = (x, w) => {
  if (isNum(x)) {
    if (!has(w)) return Math.log(x);
    if (isNum(w)) return Math.log(x) / Math.log(w);
  }
  throw Error('⋆⁼: Arguments must be numbers');
};
const fc = (dy, mon, gl) => (x, w) => {
  if (has(w)) return dy(w, x);
  if (isNum(x)) return mon(x);
  throw Error(gl + '𝕩: Argument must be a number');
};
const floor = fc(Math.min, Math.floor, '⌊');
const ceil = fc(Math.max, Math.ceil, '⌈');
const abs = (x, w) => {
  if (isNum(x)) return Math.abs(x);
  throw Error('|𝕩: Argument must be a number');
};
const abs_mod = (x, w) => {
  if (!has(w)) return abs(x, w);
  if (isNum(x) && isNum(w)) {
    const r = x % w;
    return x < 0 != w < 0 && r != 0 ? r + w : r;
  }
  throw Error('𝕨|𝕩: Arguments must be numbers');
};
const lesseq = (x, w) => {
  const s = typeof w,
    t = typeof x;
  if (s === 'function' || t === 'function')
    throw Error('𝕨≤𝕩: Cannot compare operations');
  if (w.ns || x.ns) throw Error('𝕨≤𝕩: Cannot compare namespaces');
  return +(s !== t
    ? s <= t
    : s === 'string'
    ? w.codePointAt(0) <= x.codePointAt(0)
    : w <= x);
};
const equals = (x, w) => {
  let a, b;
  if (typeof w !== 'function' || !(a = w.repr)) return x === w;
  if (typeof x !== 'function' || !(b = x.repr)) return false;
  b = b();
  return a().every((e, i) => call(runtime[18], e, b[i])); // ≡
};
const table = m1(
  f => (x, w) =>
    !has(w)
      ? arr(
          x.map(e => call(f, e)),
          x.sh,
        )
      : arr(w.map(d => x.map(e => call(f, e, d))).flat(), w.sh.concat(x.sh)),
);
const scan = m1(f => (x, w) => {
  const s = x.sh;
  if (!s || s.length === 0) throw Error('`: 𝕩 must have rank at least 1');
  if (has(w)) {
    const r = w.sh,
      wr = r ? r.length : 0;
    if (1 + wr !== s.length) throw Error('`: rank of 𝕨 must be cell rank of 𝕩');
    if (!r) w = [w];
    else if (!r.every((l, a) => l === s[1 + a]))
      throw Error('`: shape of 𝕨 must be cell shape of 𝕩');
  }
  const l = x.length,
    r = Array(l);
  if (l > 0) {
    let c = 1;
    for (let i = 1; i < s.length; i++) c *= s[i];
    let i = 0;
    if (!has(w)) {
      for (; i < c; i++) r[i] = x[i];
    } else {
      for (; i < c; i++) r[i] = call(f, x[i], w[i]);
    }
    for (; i < l; i++) r[i] = call(f, x[i], r[i - c]);
  }
  return arr(r, s, x.fill);
});
const cases = m2((f, g) => (x, w) => has(w) ? call(g, x, w) : call(f, x, w));
let save_error;
const catches = m2((f, g) => (x, w) => {
  try {
    return call(f, x, w);
  } catch (e) {
    const c = save_error;
    save_error = e;
    try {
      return call(g, x, w);
    } finally {
      save_error = c;
    }
  }
});
const group_len = (x, w) => {
  // ≠¨⊔ for a valid list argument
  const l = x.reduce((a, b) => Math.max(a, b), (w || 0) - 1);
  const r = Array(l + 1).fill(0);
  x.map(e => {
    if (e >= 0) r[e] += 1;
  });
  return list(r, 0);
};
const group_ord = (x, w) => {
  // ∾⊔x assuming w=group_len(x)
  let l = 0,
    s = w.map(n => {
      const l0 = l;
      l += n;
      return l0;
    });
  const r = Array(l);
  x.map((e, i) => {
    if (e >= 0) r[s[e]++] = i;
  });
  return list(r, x.fill);
};
const type = x =>
  isFunc(x) ? 3 + (x.m || 0) : x.sh ? 0 : x.ns ? 6 : 2 - isNum(x);
const toFill = x =>
  isFunc(x)
    ? undefined
    : x.sh
    ? arr(x.map(toFill), x.sh, x.fill)
    : isNum(x)
    ? 0
    : ' ';
const fill = (x, w) => {
  if (has(w)) {
    return arr(x.slice(), x.sh, toFill(w));
  } else {
    const f = x.fill;
    if (!has(f)) throw Error('Fill does not exist');
    return f;
  }
};
const fill_by = (f, g) => (x, w) => {
  let r = f(x, w);
  const a2fill = x => (isFunc(x) ? x : isNum(x) ? 0 : ' ');
  const xf = x.sh ? x.fill : a2fill(x);
  if (r.sh && has(xf)) {
    r = arr(r.slice(), r.sh);
    try {
      const wf = !has(w)
        ? w
        : !w.sh
        ? a2fill(w)
        : has(w.fill)
        ? w.fill
        : runtime[43];
      r.fill = toFill(g(xf, wf));
    } catch (e) {
      r.fill = undefined;
    }
  }
  return r;
};
fill_by.m = 2;

const provide = [
  type, // Type
  fill, // Fill
  log, // Log
  group_len, // GroupLen
  group_ord, // GroupOrd
  assertFn(''), // !
  plus, // +
  minus, // -
  times, // ×
  divide, // ÷
  power, // ⋆
  floor, // ⌊
  (x, w) => (has(w) ? +equals(x, w) : x.sh ? x.sh.length : 0), // =
  lesseq, // ≤
  (x, w) => list(x.sh, 0), // ≢
  (x, w) => arr(x.slice(), has(w) ? w : [x.length], x.fill), // ⥊
  (x, w) => x[w], // ⊑
  (x, w) =>
    list(
      Array(x)
        .fill()
        .map((_, i) => i),
      0,
    ), // ↕
  table, // ⌜
  scan, // `
  fill_by, // _fillBy_
  cases, // ⊘
  catches, // ⎊
];

const select = (x, w) => {
  const s = x.sh,
    k = s.length,
    f = x.fill,
    t = w.sh,
    c = 1;
  if (k !== 1) {
    for (let i = 1; i < k; i++) c *= s[i];
    t = t.concat(s.slice(1));
  }
  const r = Array(w.length * c);
  let j = 0;
  w.forEach(i => {
    for (let k = 0; k < c; k++) r[j++] = x[i * c + k];
  });
  return arr(r, t, f);
};
const fold = f => (x, w) => {
  let l = x.sh[0];
  let r = has(w) ? w : x[(l = l - 1)];
  for (let i = l; i--; ) r = call(f, r, x[i]);
  return r;
};
const runtime_0 = [
  floor, // ⌊
  ceil, // ⌈
  abs, // |
  (x, w) => (has(w) ? 1 - lesseq(w, x) : arr([x], [], toFill(x))), // <
  (x, w) => 1 - lesseq(x, w), // >
  (x, w) => (x.sh && x.sh.length ? x.sh[0] : 1), // ≠
  (x, w) => lesseq(w, x), // ≥
  (x, w) => x, // ⊢
  (x, w) => (has(w) ? w : x), // ⊣
  (x, w) => arr(w.concat(x), [w.sh[0] + x.sh[0]]), // ∾
  (x, w) => list(has(w) ? [w, x] : [x]), // ⋈
  (x, w) => arr(x.slice(0, w), [w]), // ↑
  (x, w) => arr(x.slice(w), [x.sh[0] - w]), // ↓
  select, // ⊏
  m1(f => (x, w) => f), // ˙
  m1(f => (x, w) => call(f, has(w) ? w : x, x)), // ˜
  m1(
    f => (x, w) =>
      arr(
        x.map((e, i) => call(f, e, w[i])),
        x.sh,
      ),
  ), // ¨
  m1(fold), // ´
  m2((f, g) => (x, w) => call(f, call(g, x, w))), // ∘
  m2((f, g) => (x, w) => call(f, call(g, x), has(w) ? call(g, w) : w)), // ○
  m2((f, g) => (x, w) => call(g, x, call(f, has(w) ? w : x))), // ⊸
  m2((f, g) => (x, w) => call(f, call(g, x), has(w) ? w : x)), // ⟜
  m2((f, g) => (x, w) => call(g[call(f, x, w)], x, w)), // ◶
  m2((f, g) => (x, w) => call(g, x, w) ? call(f, x, w) : x), // ⍟
];

const [runtime, setPrims, setInv] = run(
  BYTECODE2,
  OBJECTS(provide, runtime_0, str),
  BLOCKS,
  BODIES,
);

// Use high-precision modulus (⚇0)
abs_mod.prim = 8;
runtime[8] = runtime[61](abs_mod, 0);

// Cache inverse calls and handle block inverses
setInv(
  inv => f => !isFunc(f) ? inv(f) : f.inverse || (f.inverse = inv(f)),
  snv => f => !isFunc(f) ? snv(f) : f.sinverse || (f.sinverse = snv(f)),
);

let rtAssert = (runtime[43] = assertFn('!'));
runtime.map((r, i) => {
  r.prim = i;
});
let decompose = x =>
  list(
    !isFunc(x) ? [-1, x] : has(x.prim) ? [0, x] : x.repr ? x.repr() : [1, x],
  );
setPrims(list([decompose, x => (has(x.prim) ? x.prim : runtime.length)]));
let glyphs = [
  '+-×÷⋆√⌊⌈|¬∧∨<>≠=≤≥≡≢⊣⊢⥊∾≍⋈↑↓↕«»⌽⍉/⍋⍒⊏⊑⊐⊒∊⍷⊔!',
  '˙˜˘¨⌜⁼´˝`',
  '∘○⊸⟜⌾⊘◶⎉⚇⍟⎊',
];
let gl = glyphs.join('');
let glyph = x => {
  let g = gl[x.prim];
  if (!has(g)) throw Error('•Glyph 𝕩: 𝕩 must be a primitive');
  return g;
};

// Compiler
runtime[43] = assertFn('Compiler');
const compGen_raw = run(
  BYTECODE3,
  OBJECTS3(provide, runtime),
  [
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 2],
    [1, 1, 3],
    [0, 0, [[], [4]]],
    [0, 0, [[], [5]]],
    [0, 0, [[], [6]]],
    [0, 0, [[], [7]]],
    [0, 0, [[], [8]]],
    [0, 0, [[], [9]]],
    [0, 0, 10],
    [0, 0, 11],
    [0, 0, 12],
    [0, 0, 13],
    [0, 0, [[], [14]]],
    [0, 0, [[], [15]]],
    [2, 1, 16],
    [0, 0, 17],
    [2, 1, 18],
    [0, 0, 19],
    [1, 0, 20],
    [0, 0, 21],
    [0, 0, [[], [22]]],
    [0, 0, 23],
    [0, 0, 24],
    [0, 0, 25],
    [0, 0, 26],
  ],
  [
    [0, 0],
    [3, 46],
    [661, 5],
    [680, 6],
    [851, 58],
    [3054, 23],
    [3879, 212],
    [12786, 19],
    [13024, 3],
    [13032, 3],
    [13076, 3],
    [13093, 3],
    [13138, 3],
    [13155, 3],
    [13172, 3],
    [13198, 3],
    [13234, 3],
    [13260, 10],
    [13481, 3],
    [13543, 3],
    [13593, 5],
    [13619, 3],
    [13641, 3],
    [13699, 3],
    [13752, 3],
    [13814, 3],
    [13835, 3],
  ],
);
const compGen = sys => {
  const gl = sys.glyphs,
    rt = sys.runtime;
  const comp = compGen_raw(list(gl));
  return (sys.comps = sysargs => {
    const system = (x, w) => {
      const r = table(s => sysvals[unstr(s)])(x);
      if (r.some(v => !has(v))) {
        const m = x
          .filter((_, i) => !has(r[i]))
          .map(s => '•' + unstr(s))
          .join(' ');
        throw Error('Unknown system values (see •listSys for available): ' + m);
      }
      return table(v => (v.dynamic ? v(sysargs) : v))(r);
    };
    const rts = list([rt, system].concat(sysargs.addrt || []));
    return src => {
      const s = str(src),
        c;
      try {
        c = comp(s, rts);
      } catch (e) {
        if (typeof e.message !== 'string') e.message.src = s;
        throw e;
      }
      c.push(s);
      return c;
    };
  });
};
const sysArgs = { runtime, glyphs: glyphs.map(str) };
const compile = compGen(sysArgs)(sysArgs);
const bqn = src => run(...compile(src));
runtime[43] = rtAssert;

// Formatter
const fmtNum = x =>
  str(
    x == Infinity
      ? '∞'
      : x == -Infinity
      ? '¯∞'
      : ('' + x).replace(/-/g, '¯').replace(/\+/g, ''),
  );
const placeholder = ['array', 'function', '1-modifier', '2-modifier'].map(s =>
  str('*' + s + '*'),
);
const rePop = x =>
  x.ns
    ? str('{' + listKeys(x).join('‿') + '⇐}')
    : gl[x.prim] || placeholder[type(x) - 2];
const [fmt1, repr] = run(
  BYTECODE,
  OBJECTS(runtime, str),
  [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 2],
    [0, 0, 3],
    [0, 0, 4],
    [0, 0, [[], [5]]],
    [0, 0, 6],
    [0, 0, [[], [7]]],
    [0, 0, 8],
    [0, 0, 9],
    [0, 0, 10],
    [1, 0, 11],
    [1, 0, 12],
    [0, 0, 13],
    [0, 0, [[], [14]]],
    [0, 0, 15],
    [2, 0, 16],
    [0, 0, 17],
    [0, 0, 18],
    [0, 0, 19],
    [0, 0, 20],
    [0, 0, 21],
    [0, 0, 22],
    [0, 0, 23],
    [0, 0, 24],
  ],
  [
    [0, 0],
    [3, 31],
    [798, 3],
    [864, 6],
    [964, 3],
    [1015, 4],
    [1054, 3],
    [1084, 4],
    [1207, 3],
    [1245, 3],
    [1284, 3],
    [1337, 9],
    [1567, 7],
    [1640, 8],
    [1883, 3],
    [1918, 3],
    [1932, 13],
    [2227, 4],
    [2272, 6],
    [2319, 4],
    [2392, 3],
    [2400, 3],
    [2452, 7],
    [2655, 3],
    [2711, 5],
  ],
)(list([type, decompose, rePop, fmtNum]));
const fmt = x => unstr(fmt1(x));

const errHasSrc = (w, a) => (w && w.loc) || (!a && w.sh && w.sh[0] === 2);
const fmtErr = e => {
  const a = e.kind === '!',
    w = e.message,
    loc = [];
  while (errHasSrc(w, a)) {
    const s = w.src,
      is;
    [is, w] = w;
    let n = is.sh ? is.sh[0] : 0,
      i = n ? is[0] : is;
    const pair = n && is.sh.length > 1;
    if (pair) n *= 2;
    const to = i =>
      s
        .slice(0, i)
        .join('')
        .split('\n')
        .map(l => Array.from(l));
    const ll = to(i),
      l = ll.length - 1,
      j = ll[l].length,
      m = to()[l];
    let k = 1,
      o = i - j,
      cl = j;
    while (k < n && (cl = is[k] - o) < m.length) k++;
    const ol = k < n;
    if (pair) {
      if (k % 2) cl = m.length;
      else {
        cl = is[--k] - o + 1;
      }
    }
    const c = Array(cl).fill(0);
    c[j] = 1;
    for (let h = 1; h < k; h++)
      c[(j = Math.max(j, is[h] - o + (pair ? h % 2 : 0)))] ^= 1;
    if (pair) for (let h = 1; h < cl; h++) c[h] ^= c[h - 1];
    const add = ['', m.join(''), c.map(t => (t ? '^' : ' ')).join('')];
    loc = add.concat(ol ? ['(and other lines)'] : [], loc);
  }
  if (a) w = w ? fmt(w).replace(/^/gm, '! ') : '! Error';
  else w = w.sh ? w.join('') : w;
  return [w].concat(loc).join('\n');
};
const currentError = (x, w) => {
  const e = save_error;
  if (!has(e)) throw Error('No error is currently caught by ⎊');
  const a = e.kind === '!';
  w = e.message;
  while (errHasSrc(w, a)) w = w[1];
  return a || w.sh ? w : str(w);
};

const dynSys = f => {
  f.dynamic = 1;
  return f;
};
const isStr = x =>
  x.sh && x.sh.length == 1 && x.every(c => typeof c === 'string');
const unixTime = (x, w) => Date.now() / 1000;
const req1str = (e, x, w) => {
  if (!isStr(x)) throw Error(e + ': 𝕩 must be a string');
  if (has(w)) throw Error(e + ': 𝕨 not allowed');
  return unstr(x);
};
const doJs = (x, w) => {
  const s = req1str('•JS', x, w);
  const r = Function("'use strict'; return (" + s + ')')();
  const toBQN = x => {
    if (isNum(x)) return x;
    if (x === undefined) return '\0';
    if (typeof x === 'string') {
      if (Array.from(x).length !== 1)
        throw Error(
          '•JS: JS strings are one character; use Array.from for BQN strings',
        );
      return x;
    }
    if (x instanceof Array)
      return arr(
        x.map(toBQN),
        x.sh || [x.length],
        has(x.fill) ? toFill(toBQN(x.fill)) : x.fill,
      );
    if (isFunc(x)) {
      const f = (a, b) => toBQN(x(a, b));
      f.m = x.m;
      return f;
    }
    throw Error('•JS: Unrecognized JS result');
  };
  return toBQN(r);
};

let update_state = (st, w) => w; // Modified by Node version to handle •state
let push_state = st => st;
const copy_state = st_old => {
  const st = { ...st_old };
  st.addrt = [];
  push_state(st);
  return st;
};
const makeBQN = (proc, fn) => st => (x, w) => {
  const src = proc(x, w, update_state, st);
  return fn(st.comps(st)(src));
};
const makeBQNFn = (e, fn) =>
  makeBQN((x, w, u, s) => req1str(e, x, u(s, w)), fn);
const dynSys_copy = fn => dynSys(st => (x, w) => fn(copy_state(st))(x, w));

const reBqn = dynSys_copy(state => (x, w) => {
  const req = (r, s) => {
    if (!r) throw Error('•ReBQN: ' + s);
  };
  req(!has(w), '𝕨 not allowed');
  req(x.ns, '𝕩 must be a namespace');
  let [repl, primitives] = ['repl', 'primitives'].map(nsGet(x));

  if (has(primitives)) {
    addPrimitives(state, primitives);
  }
  const cmp = makeBQNFn('•ReBQN evaluation', r => r)(state);

  repl = has(repl) ? ['none', 'loose', 'strict'].indexOf(unstr(repl)) : 0;
  req(repl >= 0, 'invalid value for 𝕩.repl');
  return repl ? rerepl(repl, cmp, state) : (x, w) => run(...cmp(x, w));
});
const addPrimitives = (state, p) => {
  const req = (r, s) => {
    if (!r) throw Error('•ReBQN 𝕩.primitives: ' + s);
  };
  req(p.sh && p.sh.length === 1, 'Must be a list');
  req(
    p.every(e => e.sh && e.sh.length === 1 && e.sh[0] === 2),
    'Must consist of glyph-primitive pairs',
  );
  const pr = glyphs.map(_ => []),
    rt = pr.map(_ => []);
  p.forEach(([gl, val]) => {
    req(typeof gl === 'string', 'Glyphs must be characters');
    req(isFunc(val), 'Primitives must be operations');
    const k = val.m || 0;
    pr[k].push(gl);
    rt[k].push(val);
  });
  state.glyphs = pr.map(str);
  state.runtime = list(rt.flat());
  compGen(state);
};
const rerepl = (repl, cmp, state) => {
  const rd = repl > 1 ? 0 : -1;
  const vars0, names0, redef0;
  const vars = [],
    names = [],
    redef = [];
  vars.inpreview = true;
  state.addrt = [names, redef];
  const copyArr = (to, src) => {
    to.length = src.length;
    for (let i = 0; i < to.length; i++) to[i] = src[i];
  };
  const f = (x, w) => {
    if (preview) {
      vars0 = vars.slice(0);
      names0 = names.slice(0);
      redef0 = redef.slice(0);
    }
    names.sh = redef.sh = [names.length];
    const c = cmp(x, w);
    const pNames = c[5][2][0];
    const newV = c[3][0][2].slice(vars.length);
    names.push(...newV.map(i => pNames[i]));
    redef.push(...newV.map(i => rd));
    vars.push(...newV.map(i => null));
    try {
      return run(...c, vars);
    } finally {
      if (preview) {
        copyArr(vars, vars0);
        copyArr(names, names0);
        copyArr(redef, redef0);
      }
    }
  };
  f.preview = (x, w) => {
    preview = true;
    try {
      return f(x, w);
    } finally {
      preview = false;
    }
  };
  return f;
};
const primitives = dynSys(state => {
  const gl = state.glyphs.flat(),
    rt = state.runtime;
  return list(gl.map((g, i) => list([g, rt[i]])));
});

const parsefloat = (x, w) => {
  const n = req1str('•ParseFloat', x, w);
  if (!/^-?(\.[0-9]+|[0-9]+\.?[0-9]*)([eE][-+]?[0-9]+)?$/.test(n))
    throw Error('•ParseFloat: invalid float format');
  return parseFloat(n);
};

const isInt = (n): n is number => isNum(n) && n === (n | 0);
const isNat = (n): n is number => isInt(n) && n >= 0;
const fact = (x, w) => {
  if (has(w)) throw Error('•math.Fact: Left argument not allowed');
  if (!isNat(x))
    throw Error(
      '•math.Fact: Argument other than a natural number not yet supported',
    );
  let p = 1;
  while (x > 0 && p < Infinity) {
    p *= x;
    x--;
  }
  return p;
};
const comb = (x, w) => {
  if (!has(w)) throw Error('•math.Comb: Left argument required');
  if (!(isInt(w) && isInt(x)))
    throw Error('•math.Comb: Non-integer arguments not yet supported');
  let n = w,
    k = Math.min(x, n - x);
  let sgn = 1;
  if (n >= 0) {
    if (k < 0) return 0;
  } else {
    const j = n - k;
    if (j < 0) return 0;
    if (j & 1) sgn = -1;
    const t = Math.min(j, -1 - n);
    n = -1 - k;
    k = t;
  }
  if (k > 514) return Infinity;
  let p = 1;
  for (let i = 0; i < k; i++) {
    p *= (n - i) / (k - i);
    if (p === Infinity) return sgn * p;
  }
  return sgn * Math.round(p);
};
const gcd = (x, w) => {
  if (!has(w)) throw Error('•math.GCD: Left argument required');
  if (!(isNat(w) && isNat(x)))
    throw Error(
      '•math.GCD: Arguments other than natural numbers not yet supported',
    );
  while (w) {
    const t = w;
    w = x % w;
    x = t;
  }
  return x;
};
const lcm = (x, w) => (w === 0 ? 0 : (w / gcd(x, w)) * x);
const pervfn = f => {
  f.prim = null;
  return runtime[61](f, 0);
}; // ⚇
const mathFn = f => {
  const p = pervfn(f);
  return f !== Math.atan2 && f !== Math.hypot
    ? (x, w) => {
        if (has(w)) throw Error('Left argument not allowed');
        return p(x);
      }
    : (x, w) => {
        if (!has(w)) throw Error('Left argument required');
        return p(x, w);
      };
};
const trig = 'cos cosh sin sinh tan tanh'.split(' ');
const mathKeys = trig.concat(
  trig.map(n => 'a' + n),
  'cbrt expm1 hypot log10 log1p log2 round trunc atan2'.split(' '),
);
const mathNs = makeNs(
  mathKeys.concat(['fact', 'comb', 'gcd', 'lcm']),
  mathKeys.map(k => mathFn(Math[k])).concat([fact, comb, gcd, lcm].map(pervfn)),
);
trig.map((_, i) => {
  const f = mathNs[i],
    g = mathNs[i + trig.length];
  f.inverse = g;
  g.inverse = f;
});

const nsNs = (() => {
  const keys = (x, w) => {
    if (has(w) || !x.ns) throw Error('•ns.Keys: Takes one namespace argument');
    return list(listKeys(x).map(str));
  };
  const req1name = (e, x, w) =>
    req1str(e, x, w).replaceAll('_', '').toLowerCase();
  const getQ = (e, x, w) => {
    if (!has(w) || !w.ns) throw Error(e + ': 𝕨 must be a namespace');
    return nsGet(w)(req1name('•ns.' + e, x));
  };
  const hasQ = (x, w) => +has(getQ('Has', x, w));
  const get = (x, w) => {
    const v = getQ('Get', x, w);
    if (!has(v)) throw Error('•ns.Get: key not found');
    return v;
  };
  const map = (x, w) => {
    if (has(w) || !x.ns) throw Error('•ns.Map: Takes one namespace argument');
    const g = nsGet(x),
      getq = (e, x, w) => g(req1name('Namespace map.' + e, x, w));
    const hasq = (x, w) => +has(getq('Has', x, w));
    const get = (x, w) => {
      const v = getq('Get', x);
      if (has(v)) return v;
      if (has(w)) return w;
      throw Error('Namespace map.Has: key not found');
    };
    return makeNs(['has', 'get'], [hasq, get]);
  };
  return makeNs(['keys', 'has', 'get', 'map'], [keys, hasQ, get, map]);
})();

const rand = (() => {
  const reqnat = (e, x) => {
    if (!isNum(x) || x < 0 || x != Math.floor(x))
      throw Error('•rand.' + e + ' must be a natural number');
  };
  const randnat = n => Math.floor(n * Math.random());
  const range = (x, w) => {
    reqnat('Range: 𝕩', x);
    const r = x ? () => randnat(x) : Math.random;
    if (!has(w)) return r();
    let n = 1;
    if (!w.sh) reqnat('Range: 𝕨', (n = w));
    else {
      if (w.sh.length > 1)
        throw Error('Range: array 𝕨 must have rank at most 1');
      w.map(m => {
        reqnat('Range: 𝕨 element', m);
        n *= m;
      });
    }
    return arr(Array(n).fill().map(r), w.sh ? w : [n], 0);
  };
  const iota = x =>
    Array(x)
      .fill()
      .map((_, i) => i);
  const deal_err = e => (x, w) => {
    reqnat(e + ': 𝕩', x);
    if (!has(w)) w = x;
    else {
      reqnat(e + ': 𝕨', w);
      if (w > x)
        throw Error('•rand.' + e + ': 𝕨 must be less than or equal to 𝕩');
    }
    const r = iota(x);
    for (let i = 0; i < w; i++) {
      const j = i + randnat(x - i);
      const t = r[i];
      r[i] = r[j];
      r[j] = t;
    }
    r.length = w;
    return list(r, 0);
  };
  const deal = deal_err('Deal');
  const subset = (x, w) => {
    reqnat('Subset: 𝕩', x);
    if (!has(w))
      return list(
        iota(x).filter(_ => Math.random() < 0.5),
        0,
      );
    return deal_err('Subset')(x, w).sort((a, b) => a - b);
  };
  return makeNs(['range', 'deal', 'subset'], [range, deal, subset]);
})();

const sysvals = {
  bqn: dynSys_copy(makeBQNFn('•BQN', r => run(...r))),
  rebqn: reBqn,
  primitives,
  type,
  glyph,
  decompose,
  fmt: fmt1,
  repr,
  currenterror: currentError,
  unixtime: unixTime,
  js: doJs,
  parsefloat,
  math: mathNs,
  ns: nsNs,
  rand,
  listsys: dynSys(_ => list(Object.keys(sysvals).sort().map(str))),
};

const make_timed = tfn => {
  const timed = f => (x, w) => {
    const n = has(w) ? w : 1;
    if (!isNum(n) || n !== Math.floor(n) || n < 1)
      throw Error('•_timed: 𝕨 must be an integer above 1');
    return (
      tfn(() => {
        for (let i = 0; i < n; i++) f(x);
      }) / n
    );
  };
  timed.m = 1;
  return timed;
};
if (typeof process !== 'undefined') {
  const sec = t => t[0] + t[1] / 1e9;
  sysvals.monotime = (x, w) => sec(process.hrtime());
  sysvals.timed = make_timed(f => {
    const t0 = process.hrtime();
    f();
    return sec(process.hrtime(t0));
  });
} else if (typeof performance !== 'undefined') {
  sysvals.monotime = (x, w) => performance.now() / 1000;
  sysvals.timed = make_timed(f => {
    const t0 = performance.now();
    f();
    return (performance.now() - t0) / 1000;
  });
}

if (typeof module !== 'undefined') {
  // Node.js
  bqn.fmt = fmt;
  bqn.fmtErr = fmtErr;
  bqn.compile = compile;
  bqn.run = run;
  bqn.sysargs = sysArgs;
  bqn.sysvals = sysvals;
  bqn.makebqn = fn => makeBQN(fn, r => run(...r));
  bqn.makerepl = (st, repl) =>
    rerepl(
      repl,
      makeBQN(
        x => x,
        r => r,
      )(st),
      st,
    );
  bqn.util = { has, list, str, unstr, dynsys: dynSys, req1str, makens: makeNs };
  bqn.setexec = (u, p) => {
    update_state = u;
    push_state = p;
  };
  module.exports = bqn;
}
