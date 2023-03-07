'use strict';
// Virtual machine
let has = (x: unknown) => x !== undefined;
let isNum = (x: unknown) => typeof x === 'number';
let isFunc = (x: unknown): x is Function => typeof x === 'function';
let call = (f, x, w) => {
  if (x === undefined) return x;
  if (!isFunc(f)) return f;
  if (f.m) throw Error('Runtime: Cannot call modifier as function');
  return f(x, w);
};

let getrev = names => {
  let m = names.rev;
  if (m) return m;
  m = {};
  names.forEach((s, i) => (m[s] = i));
  return (names.rev = m);
};
let nsget = x => {
  let rev = getrev(x.ns.names);
  return s => (i => (has(i) ? x[x.ns[i]] : i))(rev[s]);
};
let findkey = (ns, names, i) => {
  let nn = ns.names;
  return ns[nn === names ? i : getrev(nn)[names[i]]];
};
let readns_sub = (v, names, i) => {
  let ni = findkey(v.ns, names, i);
  if (!has(ni)) throw Error('Unknown namespace key: ' + names[i]);
  return v[ni];
};
let readns_assign = (v, vid, i) => readns_sub(v, vid.names, vid[i]);
let readns = (v, vid, i) => {
  if (!v.ns) throw Error('Key lookup in non-namespace');
  return readns_sub(v, vid.names, i);
};
let makens = (keys, vals) => {
  let n = Array(keys.length)
    .fill()
    .map((_, i) => i);
  n.names = keys.map(k => k.toLowerCase());
  vals.ns = n;
  return vals;
};
let listkeys = x => {
  let s = x.ns,
    k = Object.keys(s).filter(n => !isNaN(n));
  return k.map(n => s.names[+n]).sort();
};

let getv = (a, i) => {
  let v = a[i];
  if (v === null) throw Error('Runtime: Variable referenced before definition');
  return v;
};
let get = x =>
  x.e
    ? getv(x.e, x.p)
    : arr(
        x.map(c => get(c)),
        x.sh,
      );
let preview = false;
let inpreview = () => preview;

let setc = (d, id, v) => {
  if (preview && seteff(id))
    throw { kind: 'previewError', message: 'side effects are not allowed' };
  return set(d, id, v);
};

let seteff = id => {
  if (id.e) return !id.e.inpreview;
  else if (id.match) return false;
  else if (Array.isArray(id))
    return id.some(id => (id.m ? seteff(id.m) : seteff(id)));
  else return false;
};

let set = (d, id, v) => {
  let eq = (a, b) => a.length === b.length && a.every((e, i) => e === b[i]);
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
          set(d, n, readns_assign(v, vid, n.p));
        } else if (n.m) {
          set(d, n.m, readns(v, n.vid, n.a));
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

let merge = x => {
  return call(runtime[13], x);
};

let chkM = (v, m) => {
  if (m.m !== v)
    throw Error(
      'Runtime: Only a ' +
        v +
        '-modifier can be called as a ' +
        v +
        '-modifier',
    );
};
let genjs = (B, p, L) => {
  // Bytecode -> Javascript compiler
  let rD = 0;
  let r = L ? 'let l=0;try{' : '';
  let set = L ? 'setc' : 'set';
  let fin = L
    ? '}catch(er){let s=L.map(p=>p[l]);s.sh=[1,2];let m=[s,er.message];m.loc=1;m.src=e.vid.src;m.sh=[2];er.message=m;throw er;}'
    : '';
  let szM = 1;
  let rV = n => {
    szM = Math.max(szM, n + 1);
    return 'v' + n;
  };
  let rP = val => rV(rD++) + '=' + val + ';';
  let rG = () => rV(--rD);
  let num = () => {
    return B[p++];
  };
  let ge = n => 'e' + '.p'.repeat(n);
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
        let o = B[p - 1];
        let n = num();
        rD -= n;
        let l =
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
        let f = rG(),
          x = rG();
        r += rP('call(' + f + ',' + x + ')');
        break;
      }
      case 17:
      case 19: {
        let w = rG(),
          f = rG(),
          x = rG();
        r += rP('call(' + f + ',' + x + ',' + w + ')');
        break;
      }
      case 20: {
        let g = rG(),
          h = rG();
        r += rP('train2(' + g + ',' + h + ')');
        break;
      }
      case 21:
      case 23: {
        let f = rG(),
          g = rG(),
          h = rG();
        r += rP('train3(' + f + ',' + g + ',' + h + ')');
        break;
      }
      case 26: {
        let f = rG(),
          m = rG();
        r += 'chkM(1,' + m + ');' + rP(m + '(' + f + ')');
        break;
      }
      case 27: {
        let f = rG(),
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
        r += rP('getv(' + ge(num()) + ',' + num() + ')');
        break;
      }
      case 33: {
        r += rP('{e:' + ge(num()) + ',p:' + num() + '}');
        break;
      }
      case 42: {
        let p = rG();
        r +=
          'if(1!==' +
          p +
          '){if(0!==' +
          p +
          ")throw Error('Predicate value must be 0 or 1');break;}";
        break;
      }
      case 43: {
        let m = rG();
        r += rP('{match:1,v:' + m + '}');
        break;
      }
      case 44: {
        r += rP('{match:1}');
        break;
      }
      case 47: {
        let i = rG(),
          v = rG();
        r += 'try{set(1,' + i + ',' + v + ');}catch(e){break;}';
        break;
      }
      case 48: {
        let i = rG(),
          v = rG();
        r += rP(set + '(1,' + i + ',' + v + ')');
        break;
      }
      case 49: {
        let i = rG(),
          v = rG();
        r += rP(set + '(0,' + i + ',' + v + ')');
        break;
      }
      case 50: {
        let i = rG(),
          f = rG(),
          x = rG();
        r += rP(set + '(0,' + i + ',call(' + f + ',' + x + ',get(' + i + ')))');
        break;
      }
      case 51: {
        let i = rG(),
          f = rG();
        r += rP(set + '(0,' + i + ',call(' + f + ',get(' + i + ')))');
        break;
      }
      case 66: {
        let m = rG();
        r += rP('{vid:e.vid,m:' + m + ',a:' + num() + '}');
        break;
      }
      case 64: {
        let v = rG();
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
let run = (B, O, F, S, L, T, src, env) => {
  // Bytecode, Objects, Blocks, Bodies, Locations, Tokenization, source
  let train2 = (g, h) => {
    let t = (x, w) => call(g, call(h, x, w));
    t.repr = () => [2, g, h];
    return t;
  };
  let train3 = (f, g, h) => {
    if (!has(f)) return train2(g, h);
    let t = (x, w) => call(g, call(h, x, w), call(f, x, w));
    t.repr = () => [3, f, g, h];
    return t;
  };
  let repdf = ['', '4,f,mod', '5,f,mod,g'].map(s =>
    s ? 'fn.repr=()=>[' + s + '];' : s,
  );

  let D = F.map(([type, imm, ind], i) => {
    let I = imm ? 0 : 3; // Operand start
    let sp = (type === 0 ? 0 : type + 1) + I;
    let useenv = i === 0 && env;
    let gen = j => {
      let [pos, varam, vid, vex] = S[j];
      let ns = {};
      if (vex)
        vex.forEach((e, j) => {
          if (e) ns[vid[j]] = j + sp;
        });
      vid = new Array(sp).fill(null).concat(vid);
      vid.src = src;
      vid.ns = ns;
      if (T) ns.names = vid.names = T[2][0].map(s => s.join(''));
      return [genjs(B, pos, L), vid];
    };

    let ginpreview = e => (L ? e + '.inpreview=inpreview()' : '');
    let c, vid, def;
    if (isNum(ind)) {
      [c, vid] = gen(ind);
      c = 'do {' + c + "} while (0);\nthrow Error('No matching case');\n";
      if (useenv) {
        c = 'const e=env;' + c;
        env.vid = vid;
      } else if (imm)
        c = 'const e=[...e2];' + ginpreview('e') + ';e.vid=vid;e.p=oe;' + c;
      else
        c =
          'const fn=(x, w)=>{const e=[...e2];' +
          ginpreview('e') +
          ';e.vid=vid;e.p=oe;e[0]=fn;e[1]=x;e[2]=w;' +
          c +
          '};' +
          repdf[type] +
          'return fn;';
      def = useenv ? 'env' : 'new Array(' + vid.length + ').fill(null)';
    } else {
      if (imm !== +(ind.length < 2))
        throw 'Internal error: malformed block info';
      let cache = []; // Avoid generating a shared case twice
      vid = [];
      let g = j => {
        let [c, v] = cache[j] || (cache[j] = gen(j));
        c =
          'const e=[...e1];' +
          ginpreview('e') +
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
      let cases = ind.map((js, i) => {
        let e = js.length
          ? 'No matching case'
          : 'Left argument ' + (i ? 'not allowed' : 'required');
        return js
          .map(g)
          .concat(["throw Error('" + e + "');\n"])
          .join('');
      });
      let fn = b =>
        '(x, w)=>{const e1=[...e2];' +
        ginpreview('e1') +
        ';e1[0]=fn;e1[1]=x;e1[2]=w;\n' +
        b +
        '\n};';
      let combine = ([mon, dy]) =>
        fn('if (w===undefined) {\n' + mon + '} else {\n' + dy + '}');
      def = 'new Array(' + sp + ').fill(null)';
      if (imm) c = 'const e1=[...e2];' + ginpreview('e1') + ';' + cases[0];
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

    let de2 = 'let e2=' + def + ';' + ginpreview('e2') + ';';
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
      "'use strict'; return (chkM,has,call,getv,get,set,setc,llst,merge,train2,train3,readns,O,L,env,vid,inpreview) => D => oe => {" +
        c +
        '};',
    )()(
      chkM,
      has,
      call,
      getv,
      get,
      set,
      setc,
      llst,
      merge,
      train2,
      train3,
      readns,
      O,
      L,
      env,
      vid,
      inpreview,
    );
  });
  D.forEach((d, i) => {
    D[i] = d(D);
  });
  return D[0]([]);
};

// Runtime
let assertFn = pre => (x, w) => {
  if (x !== 1) throw { kind: pre, message: has(w) ? w : x };
  return x;
};
let arr = (r, sh, fill) => {
  r.sh = sh;
  r.fill = fill;
  return r;
};
let list = (l, fill) => arr(l, [l.length], fill);
let llst = l => list(l, l.length > 0 && l.every(isNum) ? 0 : undefined);
let str = s => list(Array.from(s), ' ');
let unstr = s => s.join('');
let setrepr = (r, f) => {
  f.repr = r;
  return f;
};
let m1 = m => {
  let r = f => setrepr(() => [4, f, r], m(f));
  r.m = 1;
  return r;
};
let m2 = m => {
  let r = (f, g) => setrepr(() => [5, f, r, g], m(f, g));
  r.m = 2;
  return r;
};
let ctrans = (c, t) => String.fromCodePoint(c.codePointAt(0) + t);
let plus = (x, w) => {
  if (!has(w)) {
    if (!isNum(x)) throw Error('+: Argument must be a number');
    return x;
  }
  let s = typeof w,
    t = typeof x;
  if (s === 'number' && t === 'number') return w + x;
  if (s === 'number' && t === 'string') return ctrans(x, w);
  if (s === 'string' && t === 'number') return ctrans(w, x);
  if (s === 'string' && t === 'string')
    throw Error('+: Cannot add two characters');
  throw Error('+: Cannot add non-data values');
};
let minus = (x, w) => {
  if (!isNum(x)) {
    if (has(w) && typeof w === 'string')
      return w.codePointAt(0) - x.codePointAt(0);
    throw Error('-: Can only negate numbers');
  }
  if (!has(w)) return -x;
  let s = typeof w;
  if (s === 'number') return w - x;
  if (s === 'string') return ctrans(w, -x);
  throw Error('-: Cannot subtract from non-data value');
};
let times = (x, w) => {
  if (isNum(x) && isNum(w)) return x * w;
  throw Error('×: Arguments must be numbers');
};
let divide = (x, w) => {
  if (isNum(x) && (!has(w) || isNum(w)))
    return (has(w) ? w : 1) / (x === 0 ? 0 : x);
  throw Error('÷: Arguments must be numbers');
};
let power = (x, w) => {
  if (isNum(x)) {
    if (!has(w)) return Math.exp(x);
    if (isNum(w)) return Math.pow(w === 0 ? 0 : w, x);
  }
  throw Error('⋆: Arguments must be numbers');
};
let log = (x, w) => {
  if (isNum(x)) {
    if (!has(w)) return Math.log(x);
    if (isNum(w)) return Math.log(x) / Math.log(w);
  }
  throw Error('⋆⁼: Arguments must be numbers');
};
let fc = (dy, mon, gl) => (x, w) => {
  if (has(w)) return dy(w, x);
  if (isNum(x)) return mon(x);
  throw Error(gl + '𝕩: Argument must be a number');
};
let floor = fc(Math.min, Math.floor, '⌊');
let ceil = fc(Math.max, Math.ceil, '⌈');
let abs = (x, w) => {
  if (isNum(x)) return Math.abs(x);
  throw Error('|𝕩: Argument must be a number');
};
let abs_mod = (x, w) => {
  if (!has(w)) return abs(x, w);
  if (isNum(x) && isNum(w)) {
    let r = x % w;
    return x < 0 != w < 0 && r != 0 ? r + w : r;
  }
  throw Error('𝕨|𝕩: Arguments must be numbers');
};
let lesseq = (x, w) => {
  let s = typeof w,
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
let equals = (x, w) => {
  let a, b;
  if (typeof w !== 'function' || !(a = w.repr)) return x === w;
  if (typeof x !== 'function' || !(b = x.repr)) return false;
  b = b();
  return a().every((e, i) => call(runtime[18], e, b[i])); // ≡
};
let table = m1(
  f => (x, w) =>
    !has(w)
      ? arr(
          x.map(e => call(f, e)),
          x.sh,
        )
      : arr(w.map(d => x.map(e => call(f, e, d))).flat(), w.sh.concat(x.sh)),
);
let scan = m1(f => (x, w) => {
  let s = x.sh;
  if (!s || s.length === 0) throw Error('`: 𝕩 must have rank at least 1');
  if (has(w)) {
    let r = w.sh,
      wr = r ? r.length : 0;
    if (1 + wr !== s.length) throw Error('`: rank of 𝕨 must be cell rank of 𝕩');
    if (!r) w = [w];
    else if (!r.every((l, a) => l === s[1 + a]))
      throw Error('`: shape of 𝕨 must be cell shape of 𝕩');
  }
  let l = x.length,
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
let cases = m2((f, g) => (x, w) => has(w) ? call(g, x, w) : call(f, x, w));
let save_error;
let catches = m2((f, g) => (x, w) => {
  try {
    return call(f, x, w);
  } catch (e) {
    let c = save_error;
    save_error = e;
    try {
      return call(g, x, w);
    } finally {
      save_error = c;
    }
  }
});
let group_len = (x, w) => {
  // ≠¨⊔ for a valid list argument
  let l = x.reduce((a, b) => Math.max(a, b), (w || 0) - 1);
  let r = Array(l + 1).fill(0);
  x.map(e => {
    if (e >= 0) r[e] += 1;
  });
  return list(r, 0);
};
let group_ord = (x, w) => {
  // ∾⊔x assuming w=group_len(x)
  let l = 0,
    s = w.map(n => {
      let l0 = l;
      l += n;
      return l0;
    });
  let r = Array(l);
  x.map((e, i) => {
    if (e >= 0) r[s[e]++] = i;
  });
  return list(r, x.fill);
};
let type = x =>
  isFunc(x) ? 3 + (x.m || 0) : x.sh ? 0 : x.ns ? 6 : 2 - isNum(x);
let tofill = x =>
  isFunc(x)
    ? undefined
    : x.sh
    ? arr(x.map(tofill), x.sh, x.fill)
    : isNum(x)
    ? 0
    : ' ';
let fill = (x, w) => {
  if (has(w)) {
    return arr(x.slice(), x.sh, tofill(w));
  } else {
    let f = x.fill;
    if (!has(f)) throw Error('Fill does not exist');
    return f;
  }
};
let fill_by = (f, g) => (x, w) => {
  let r = f(x, w);
  let a2fill = x => (isFunc(x) ? x : isNum(x) ? 0 : ' ');
  let xf = x.sh ? x.fill : a2fill(x);
  if (r.sh && has(xf)) {
    r = arr(r.slice(), r.sh);
    try {
      let wf = !has(w)
        ? w
        : !w.sh
        ? a2fill(w)
        : has(w.fill)
        ? w.fill
        : runtime[43];
      r.fill = tofill(g(xf, wf));
    } catch (e) {
      r.fill = undefined;
    }
  }
  return r;
};
fill_by.m = 2;

let provide = [
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

let select = (x, w) => {
  let s = x.sh,
    k = s.length,
    f = x.fill,
    t = w.sh,
    c = 1;
  if (k !== 1) {
    for (let i = 1; i < k; i++) c *= s[i];
    t = t.concat(s.slice(1));
  }
  let r = Array(w.length * c);
  let j = 0;
  w.forEach(i => {
    for (let k = 0; k < c; k++) r[j++] = x[i * c + k];
  });
  return arr(r, t, f);
};
let fold = f => (x, w) => {
  let l = x.sh[0];
  let r = has(w) ? w : x[(l = l - 1)];
  for (let i = l; i--; ) r = call(f, r, x[i]);
  return r;
};
let runtime_0 = [
  floor, // ⌊
  ceil, // ⌈
  abs, // |
  (x, w) => (has(w) ? 1 - lesseq(w, x) : arr([x], [], tofill(x))), // <
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

let [runtime, setPrims, setInv] = run(
  [
    0, 100, 33, 0, 0, 48, 6, 1, 1, 33, 0, 1, 48, 6, 0, 30, 0, 42, 32, 0, 1, 27,
    0, 38, 34, 0, 1, 27, 33, 0, 2, 48, 6, 1, 2, 33, 0, 3, 48, 6, 1, 3, 33, 0, 4,
    48, 6, 1, 4, 33, 0, 5, 48, 6, 1, 5, 33, 0, 6, 48, 6, 0, 0, 0, 12, 0, 46, 21,
    33, 0, 7, 48, 6, 0, 0, 0, 13, 0, 47, 21, 33, 0, 8, 48, 6, 0, 46, 0, 12, 0,
    42, 0, 11, 27, 11, 2, 0, 44, 0, 0, 0, 12, 0, 47, 21, 27, 33, 0, 9, 48, 6, 0,
    46, 0, 12, 0, 42, 0, 11, 0, 40, 0, 19, 27, 27, 11, 2, 0, 44, 0, 0, 0, 12, 0,
    47, 21, 27, 33, 0, 10, 48, 6, 32, 0, 8, 0, 45, 0, 20, 27, 33, 0, 11, 48, 6,
    0, 31, 32, 0, 8, 26, 0, 36, 0, 8, 26, 0, 47, 21, 33, 0, 12, 48, 6, 1, 6, 0,
    15, 11, 2, 0, 44, 32, 0, 7, 27, 33, 0, 13, 48, 6, 0, 14, 0, 43, 0, 29, 27,
    33, 0, 14, 48, 6, 0, 35, 0, 12, 26, 0, 36, 0, 8, 26, 0, 47, 21, 33, 0, 15,
    48, 6, 0, 4, 0, 42, 0, 31, 0, 47, 26, 27, 33, 0, 16, 48, 6, 1, 7, 33, 0, 17,
    48, 6, 1, 8, 33, 0, 18, 48, 6, 1, 9, 33, 0, 19, 48, 6, 32, 0, 19, 0, 56, 26,
    33, 0, 20, 48, 6, 32, 0, 19, 0, 57, 26, 33, 0, 21, 48, 6, 0, 46, 0, 16, 0,
    42, 0, 49, 27, 32, 0, 19, 0, 58, 26, 20, 11, 2, 0, 44, 0, 16, 0, 42, 0, 46,
    27, 0, 12, 0, 48, 21, 27, 33, 0, 22, 48, 6, 1, 10, 33, 0, 23, 48, 6, 1, 11,
    33, 0, 24, 48, 6, 0, 60, 0, 46, 0, 61, 0, 46, 0, 62, 0, 47, 0, 63, 0, 47, 0,
    64, 0, 47, 0, 65, 0, 47, 0, 66, 0, 50, 0, 67, 0, 51, 0, 68, 0, 46, 0, 69, 0,
    47, 0, 70, 0, 46, 0, 71, 0, 47, 0, 72, 0, 46, 0, 73, 0, 47, 11, 28, 32, 0,
    24, 0, 59, 27, 33, 0, 25, 48, 6, 1, 12, 33, 0, 26, 48, 6, 1, 13, 33, 0, 27,
    48, 6, 1, 14, 33, 0, 28, 48, 6, 1, 15, 33, 0, 29, 48, 6, 1, 16, 33, 0, 30,
    48, 6, 0, 13, 0, 13, 0, 24, 0, 34, 0, 12, 26, 20, 0, 13, 0, 50, 0, 43, 0,
    13, 27, 21, 21, 33, 0, 31, 48, 6, 32, 0, 31, 0, 7, 0, 34, 32, 0, 31, 26, 21,
    33, 0, 32, 48, 6, 0, 47, 0, 15, 0, 16, 0, 46, 21, 0, 43, 0, 13, 0, 8, 0, 49,
    21, 0, 7, 0, 47, 21, 1, 17, 11, 2, 0, 44, 0, 24, 0, 40, 32, 0, 7, 27, 27,
    27, 11, 2, 0, 44, 0, 24, 0, 40, 0, 14, 27, 0, 36, 0, 8, 26, 0, 47, 21, 0,
    20, 0, 46, 21, 27, 33, 0, 33, 48, 6, 1, 18, 33, 0, 34, 48, 6, 1, 19, 33, 0,
    35, 48, 6, 32, 0, 32, 32, 0, 33, 0, 34, 32, 0, 33, 26, 0, 7, 20, 11, 2, 0,
    44, 0, 25, 0, 40, 32, 0, 7, 27, 27, 1, 20, 11, 3, 0, 44, 32, 0, 7, 0, 41, 0,
    6, 27, 27, 33, 0, 36, 48, 6, 1, 21, 33, 0, 37, 48, 6, 32, 0, 37, 0, 46, 26,
    33, 0, 38, 48, 6, 34, 0, 37, 0, 47, 26, 33, 0, 39, 48, 6, 1, 22, 33, 0, 40,
    48, 6, 1, 23, 33, 0, 41, 48, 6, 32, 0, 11, 0, 41, 1, 24, 27, 33, 0, 42, 48,
    6, 1, 25, 33, 0, 43, 48, 6, 1, 26, 33, 0, 44, 48, 6, 32, 0, 41, 0, 24, 0,
    32, 0, 6, 26, 0, 52, 21, 0, 34, 0, 30, 26, 0, 34, 32, 0, 2, 0, 40, 32, 0,
    38, 0, 40, 32, 0, 16, 27, 27, 26, 21, 26, 33, 0, 45, 48, 6, 32, 0, 41, 0,
    35, 0, 8, 26, 0, 32, 0, 18, 26, 20, 0, 35, 0, 7, 26, 0, 25, 21, 0, 42, 0,
    22, 0, 40, 0, 17, 27, 27, 26, 33, 0, 46, 48, 6, 32, 0, 11, 0, 24, 0, 37, 1,
    27, 27, 11, 2, 0, 44, 0, 12, 0, 20, 0, 47, 21, 27, 33, 0, 47, 48, 6, 1, 28,
    0, 45, 0, 24, 0, 37, 1, 29, 27, 27, 33, 0, 48, 48, 6, 1, 30, 33, 0, 49, 48,
    6, 1, 31, 33, 0, 50, 48, 6, 0, 24, 32, 0, 49, 34, 0, 50, 27, 33, 0, 51, 48,
    6, 32, 0, 16, 34, 0, 49, 1, 32, 27, 33, 0, 52, 48, 6, 1, 33, 33, 0, 53, 48,
    6, 1, 34, 33, 0, 54, 48, 6, 32, 0, 9, 0, 5, 0, 121, 21, 0, 122, 11, 2, 0,
    12, 0, 42, 0, 11, 27, 0, 5, 0, 123, 21, 0, 124, 11, 2, 11, 2, 0, 31, 1, 35,
    26, 16, 33, 0, 55, 33, 0, 56, 12, 2, 48, 6, 1, 36, 33, 0, 57, 48, 6, 32, 0,
    11, 0, 43, 1, 37, 27, 33, 0, 58, 48, 6, 1, 38, 34, 0, 58, 11, 2, 0, 44, 0,
    25, 0, 40, 0, 47, 0, 15, 32, 0, 12, 20, 11, 2, 0, 44, 32, 0, 7, 27, 27, 27,
    33, 0, 59, 48, 6, 34, 0, 57, 32, 0, 59, 11, 2, 0, 44, 0, 25, 0, 40, 32, 0,
    7, 27, 27, 33, 0, 60, 48, 6, 1, 39, 33, 0, 61, 48, 6, 1, 40, 33, 0, 62, 48,
    6, 32, 0, 11, 0, 41, 32, 0, 61, 0, 136, 0, 15, 0, 31, 0, 0, 0, 12, 0, 47,
    21, 26, 20, 0, 36, 0, 8, 26, 0, 47, 21, 0, 47, 0, 46, 0, 24, 0, 30, 1, 41,
    21, 1, 42, 11, 6, 26, 27, 33, 0, 63, 48, 6, 0, 24, 0, 15, 0, 137, 0, 40, 0,
    5, 27, 0, 16, 0, 42, 0, 46, 27, 11, 2, 0, 44, 0, 22, 0, 20, 0, 46, 21, 27,
    20, 11, 2, 0, 44, 32, 0, 7, 27, 33, 0, 64, 48, 6, 1, 43, 33, 0, 65, 48, 6,
    1, 44, 33, 0, 66, 48, 6, 0, 28, 0, 26, 0, 29, 21, 33, 0, 67, 48, 6, 0, 24,
    0, 30, 0, 22, 0, 17, 20, 0, 43, 32, 0, 67, 27, 21, 32, 0, 67, 11, 2, 0, 44,
    0, 24, 0, 40, 0, 12, 27, 0, 12, 0, 47, 21, 27, 33, 0, 68, 48, 6, 0, 24, 0,
    37, 32, 0, 11, 0, 43, 32, 0, 61, 0, 141, 34, 0, 8, 0, 46, 0, 46, 0, 24, 0,
    40, 0, 22, 27, 0, 20, 0, 46, 21, 0, 45, 0, 24, 34, 0, 68, 0, 22, 0, 43, 32,
    0, 66, 27, 21, 27, 0, 24, 0, 17, 20, 34, 0, 67, 34, 0, 66, 21, 11, 6, 26,
    27, 27, 33, 0, 69, 48, 6, 1, 45, 1, 46, 1, 47, 11, 3, 0, 44, 0, 25, 0, 40,
    0, 12, 27, 0, 11, 0, 49, 21, 27, 33, 0, 70, 48, 6, 0, 24, 0, 37, 32, 0, 11,
    0, 41, 34, 0, 61, 0, 145, 0, 15, 0, 40, 0, 31, 0, 0, 0, 12, 0, 47, 21, 26,
    0, 36, 0, 8, 26, 0, 22, 0, 20, 0, 46, 21, 21, 27, 0, 47, 0, 47, 0, 24, 0,
    30, 0, 22, 0, 43, 32, 0, 70, 27, 21, 34, 0, 70, 11, 6, 26, 27, 27, 33, 0,
    71, 48, 6, 1, 48, 33, 0, 72, 48, 6, 0, 47, 0, 47, 0, 16, 0, 42, 0, 53, 27,
    0, 15, 20, 0, 31, 32, 0, 72, 26, 20, 0, 36, 0, 8, 26, 0, 47, 21, 11, 2, 0,
    44, 0, 16, 0, 42, 0, 49, 27, 34, 0, 19, 0, 74, 26, 20, 27, 11, 2, 0, 44, 0,
    16, 0, 42, 0, 46, 27, 0, 12, 0, 55, 21, 27, 33, 0, 73, 48, 6, 0, 24, 1, 49,
    11, 2, 0, 31, 1, 50, 26, 0, 26, 0, 24, 21, 16, 0, 31, 1, 51, 26, 16, 33, 0,
    74, 48, 6, 1, 52, 0, 42, 34, 0, 74, 0, 30, 0, 47, 0, 47, 0, 49, 0, 53, 0,
    46, 11, 5, 17, 32, 0, 18, 0, 146, 27, 27, 33, 0, 75, 48, 6, 1, 53, 33, 0,
    76, 48, 6, 1, 54, 33, 0, 77, 48, 6, 1, 55, 33, 0, 78, 48, 6, 32, 0, 7, 0,
    41, 0, 12, 27, 0, 46, 11, 2, 0, 24, 0, 40, 32, 0, 7, 27, 0, 12, 11, 2, 0,
    12, 0, 41, 0, 12, 27, 0, 46, 11, 2, 0, 14, 0, 41, 32, 0, 15, 27, 0, 46, 11,
    2, 1, 56, 11, 5, 0, 36, 1, 57, 26, 16, 33, 0, 79, 48, 6, 0, 46, 1, 58, 11,
    2, 0, 44, 32, 0, 7, 27, 33, 0, 80, 48, 6, 1, 59, 33, 0, 81, 48, 6, 1, 60,
    33, 0, 82, 48, 6, 32, 0, 79, 0, 38, 32, 0, 80, 27, 33, 0, 83, 48, 6, 32, 0,
    79, 0, 7, 0, 47, 21, 0, 38, 0, 46, 0, 17, 16, 0, 14, 11, 2, 0, 44, 32, 0, 7,
    27, 27, 33, 0, 84, 48, 6, 32, 0, 83, 0, 40, 0, 5, 27, 0, 25, 0, 24, 21, 33,
    0, 85, 48, 6, 0, 15, 0, 40, 0, 1, 0, 37, 0, 24, 27, 0, 36, 32, 0, 85, 0, 37,
    0, 24, 27, 26, 11, 2, 0, 44, 0, 22, 0, 20, 0, 46, 21, 27, 27, 33, 0, 86, 48,
    6, 0, 46, 0, 17, 16, 0, 43, 0, 25, 0, 40, 0, 0, 27, 0, 13, 0, 53, 21, 0, 45,
    0, 59, 27, 0, 37, 0, 24, 27, 27, 0, 1, 20, 0, 12, 0, 46, 21, 33, 0, 87, 48,
    6, 1, 61, 33, 0, 88, 48, 6, 32, 0, 7, 0, 45, 0, 26, 32, 0, 88, 1, 62, 27,
    27, 33, 0, 89, 48, 6, 32, 0, 85, 0, 37, 32, 0, 11, 0, 41, 0, 15, 0, 41, 0,
    26, 27, 1, 63, 11, 2, 0, 44, 0, 12, 0, 41, 0, 18, 27, 0, 20, 0, 47, 21, 27,
    27, 27, 33, 0, 90, 48, 6, 1, 64, 33, 0, 91, 48, 6, 32, 0, 65, 32, 0, 91, 0,
    8, 26, 0, 47, 21, 32, 0, 65, 20, 33, 0, 92, 48, 6, 1, 65, 33, 0, 93, 48, 6,
    32, 0, 7, 0, 5, 0, 175, 21, 0, 25, 1, 66, 34, 0, 88, 32, 0, 89, 32, 0, 93,
    32, 0, 81, 11, 2, 0, 44, 0, 31, 0, 12, 0, 23, 0, 47, 21, 26, 0, 36, 0, 8,
    26, 0, 47, 21, 27, 34, 0, 93, 11, 3, 0, 44, 0, 12, 0, 11, 0, 49, 21, 27, 27,
    21, 33, 0, 94, 48, 6, 1, 67, 33, 0, 95, 48, 6, 32, 0, 95, 0, 46, 26, 33, 0,
    96, 48, 6, 34, 0, 95, 0, 47, 26, 33, 0, 97, 48, 6, 1, 68, 33, 0, 98, 48, 6,
    32, 0, 85, 0, 38, 0, 24, 27, 0, 37, 1, 69, 27, 33, 0, 99, 48, 6, 32, 0, 85,
    0, 38, 0, 24, 27, 0, 37, 1, 70, 27, 33, 0, 100, 48, 6, 32, 0, 10, 0, 5, 0,
    185, 21, 33, 0, 101, 48, 6, 32, 0, 101, 0, 25, 0, 17, 21, 1, 71, 11, 2, 0,
    44, 32, 0, 7, 27, 33, 0, 102, 48, 6, 1, 72, 33, 0, 103, 48, 6, 1, 73, 33, 0,
    104, 48, 6, 0, 24, 0, 20, 20, 32, 0, 104, 0, 24, 0, 20, 0, 37, 0, 31, 0, 20,
    26, 27, 20, 11, 3, 0, 44, 0, 12, 0, 43, 0, 23, 27, 0, 6, 0, 47, 21, 0, 8, 0,
    46, 0, 43, 0, 21, 27, 21, 27, 33, 0, 105, 48, 6, 1, 74, 33, 0, 106, 48, 6,
    1, 75, 33, 0, 107, 48, 6, 0, 55, 0, 17, 16, 32, 0, 18, 0, 194, 27, 33, 0,
    108, 48, 6, 1, 76, 33, 0, 109, 48, 6, 1, 77, 33, 0, 110, 48, 6, 1, 78, 33,
    0, 111, 48, 6, 32, 0, 11, 0, 41, 1, 79, 27, 33, 0, 112, 48, 6, 1, 80, 33, 0,
    113, 48, 6, 1, 81, 33, 0, 114, 48, 6, 1, 82, 33, 0, 115, 48, 6, 1, 83, 33,
    0, 116, 48, 6, 1, 84, 33, 0, 117, 48, 6, 1, 85, 33, 0, 118, 48, 6, 1, 86,
    33, 0, 119, 48, 6, 1, 87, 33, 0, 120, 48, 6, 1, 88, 33, 0, 121, 48, 6, 32,
    0, 30, 0, 9, 26, 33, 0, 122, 48, 6, 32, 0, 30, 0, 10, 26, 33, 0, 123, 48, 6,
    0, 34, 32, 0, 122, 0, 43, 32, 0, 123, 27, 26, 0, 38, 0, 49, 32, 0, 122, 16,
    0, 43, 32, 0, 123, 27, 27, 33, 0, 124, 48, 6, 32, 0, 30, 1, 89, 0, 21, 0,
    42, 0, 46, 27, 0, 20, 0, 42, 0, 46, 27, 11, 2, 0, 44, 0, 46, 0, 43, 0, 20,
    27, 27, 0, 45, 0, 6, 27, 11, 2, 0, 44, 0, 19, 0, 41, 0, 21, 27, 27, 0, 38,
    0, 19, 27, 26, 33, 0, 125, 48, 6, 32, 0, 30, 0, 20, 0, 45, 0, 25, 27, 0, 38,
    0, 11, 27, 26, 33, 0, 126, 48, 6, 32, 0, 30, 0, 21, 0, 45, 0, 25, 27, 0, 38,
    0, 7, 0, 40, 32, 0, 126, 0, 40, 0, 7, 27, 27, 27, 26, 33, 0, 127, 48, 6, 32,
    0, 30, 0, 8, 26, 0, 38, 0, 30, 0, 42, 32, 0, 38, 27, 27, 33, 0, 128, 48, 6,
    32, 0, 30, 0, 8, 0, 7, 0, 6, 21, 26, 0, 38, 0, 30, 0, 42, 32, 0, 39, 27, 27,
    33, 0, 129, 48, 6, 32, 0, 30, 0, 8, 0, 38, 0, 21, 0, 7, 0, 20, 21, 0, 42, 0,
    46, 27, 27, 26, 33, 0, 130, 48, 6, 32, 0, 30, 0, 23, 0, 7, 0, 47, 21, 26, 0,
    38, 0, 20, 27, 33, 0, 131, 48, 6, 32, 0, 30, 0, 13, 0, 7, 0, 47, 21, 26, 0,
    38, 32, 0, 89, 27, 33, 0, 132, 48, 6, 32, 0, 30, 0, 12, 0, 7, 0, 47, 21, 26,
    0, 38, 0, 22, 27, 33, 0, 133, 48, 6, 32, 0, 30, 0, 12, 26, 0, 38, 0, 12, 27,
    33, 0, 134, 48, 6, 32, 0, 30, 0, 23, 26, 0, 38, 0, 213, 0, 40, 0, 5, 27, 27,
    33, 0, 135, 48, 6, 32, 0, 30, 0, 13, 26, 0, 38, 0, 214, 0, 40, 0, 5, 27, 27,
    33, 0, 136, 48, 6, 32, 0, 30, 0, 6, 26, 33, 0, 137, 48, 6, 32, 0, 30, 0, 7,
    26, 33, 0, 138, 48, 6, 32, 0, 138, 32, 0, 137, 0, 47, 21, 33, 0, 139, 48, 6,
    32, 0, 40, 0, 47, 26, 0, 38, 34, 0, 45, 27, 33, 0, 140, 48, 6, 1, 90, 0, 1,
    0, 46, 21, 33, 0, 141, 48, 6, 1, 91, 33, 0, 142, 48, 6, 0, 47, 0, 24, 1, 92,
    0, 40, 32, 0, 22, 27, 20, 11, 2, 0, 44, 0, 0, 32, 0, 136, 0, 53, 21, 27, 33,
    0, 143, 48, 6, 1, 93, 0, 41, 1, 94, 27, 33, 0, 144, 48, 6, 1, 95, 33, 0,
    145, 48, 6, 1, 96, 0, 24, 0, 16, 0, 42, 0, 47, 27, 1, 97, 20, 0, 33, 0, 217,
    0, 40, 0, 5, 27, 26, 0, 16, 0, 42, 0, 49, 27, 32, 0, 144, 0, 16, 0, 42, 0,
    47, 27, 21, 34, 0, 145, 0, 16, 0, 42, 0, 49, 27, 1, 98, 0, 43, 1, 99, 27, 0,
    16, 0, 42, 0, 47, 27, 21, 0, 16, 0, 42, 0, 49, 27, 1, 100, 0, 43, 1, 101,
    27, 0, 30, 0, 42, 0, 47, 0, 53, 11, 2, 27, 21, 11, 6, 0, 44, 0, 25, 27, 0,
    16, 0, 42, 0, 46, 27, 21, 20, 33, 0, 146, 48, 6, 1, 102, 34, 0, 146, 0, 218,
    0, 40, 0, 5, 27, 11, 3, 32, 0, 2, 0, 53, 0, 47, 0, 49, 11, 3, 17, 0, 44, 0,
    0, 27, 33, 0, 147, 48, 6, 0, 5, 0, 42, 0, 219, 27, 33, 0, 148, 48, 6, 0, 5,
    0, 42, 0, 220, 27, 33, 0, 149, 48, 6, 0, 33, 0, 46, 26, 0, 5, 0, 221, 21,
    33, 0, 150, 48, 6, 1, 103, 33, 0, 151, 48, 6, 34, 0, 103, 0, 38, 32, 0, 102,
    27, 33, 0, 152, 48, 6, 0, 24, 0, 37, 34, 0, 63, 0, 38, 34, 0, 62, 27, 27,
    33, 0, 153, 48, 6, 34, 0, 69, 0, 38, 32, 0, 65, 27, 33, 0, 154, 48, 6, 34,
    0, 96, 0, 38, 34, 0, 53, 27, 33, 0, 155, 48, 6, 34, 0, 97, 0, 38, 34, 0, 54,
    27, 33, 0, 156, 48, 6, 0, 60, 0, 34, 32, 0, 138, 26, 0, 38, 32, 0, 137, 27,
    0, 61, 32, 0, 138, 0, 62, 0, 34, 32, 0, 122, 26, 0, 38, 32, 0, 130, 32, 0,
    151, 0, 24, 27, 27, 0, 63, 32, 0, 122, 0, 64, 32, 0, 30, 0, 2, 26, 0, 75, 0,
    34, 32, 0, 123, 26, 0, 38, 0, 34, 32, 0, 130, 26, 27, 0, 69, 0, 34, 32, 0,
    122, 26, 0, 38, 32, 0, 128, 32, 0, 151, 0, 24, 27, 27, 0, 68, 0, 25, 32, 0,
    138, 0, 47, 21, 32, 0, 122, 0, 34, 32, 0, 138, 26, 21, 0, 38, 32, 0, 129,
    32, 0, 151, 0, 24, 27, 27, 0, 65, 32, 0, 139, 0, 70, 32, 0, 30, 1, 104, 26,
    0, 76, 0, 46, 0, 40, 32, 0, 148, 27, 0, 38, 1, 105, 27, 0, 77, 0, 24, 0, 78,
    32, 0, 83, 0, 40, 32, 0, 149, 27, 0, 25, 0, 24, 21, 0, 38, 0, 24, 27, 0, 56,
    1, 106, 0, 38, 0, 46, 0, 40, 32, 0, 148, 27, 27, 0, 79, 1, 107, 0, 38, 1,
    108, 27, 0, 80, 1, 109, 0, 38, 1, 110, 27, 0, 81, 0, 46, 0, 40, 32, 0, 148,
    27, 0, 38, 32, 0, 155, 32, 0, 151, 0, 16, 0, 42, 0, 52, 27, 27, 27, 0, 82,
    0, 46, 0, 40, 32, 0, 148, 27, 0, 38, 32, 0, 156, 32, 0, 151, 0, 16, 0, 42,
    0, 46, 27, 27, 27, 0, 83, 0, 46, 0, 40, 32, 0, 148, 27, 0, 38, 32, 0, 152,
    34, 0, 151, 32, 0, 84, 27, 27, 0, 84, 0, 24, 0, 40, 32, 0, 7, 0, 40, 32, 0,
    149, 27, 27, 0, 25, 32, 0, 154, 0, 42, 32, 0, 138, 27, 21, 0, 38, 32, 0,
    154, 27, 0, 85, 34, 0, 52, 0, 38, 34, 0, 48, 27, 0, 86, 0, 46, 0, 40, 32, 0,
    148, 27, 0, 38, 34, 0, 44, 27, 0, 87, 34, 0, 116, 0, 38, 34, 0, 115, 27, 11,
    46, 32, 0, 24, 32, 0, 150, 27, 33, 0, 157, 48, 6, 0, 60, 0, 34, 32, 0, 138,
    26, 0, 38, 0, 49, 0, 43, 32, 0, 122, 27, 27, 0, 61, 32, 0, 137, 0, 38, 0,
    46, 0, 40, 32, 0, 148, 27, 27, 0, 62, 0, 34, 32, 0, 122, 26, 0, 38, 32, 0,
    124, 27, 0, 63, 32, 0, 130, 0, 38, 0, 46, 0, 40, 32, 0, 148, 27, 27, 0, 64,
    32, 0, 124, 0, 38, 0, 46, 0, 40, 32, 0, 148, 27, 27, 0, 75, 0, 2, 32, 0,
    122, 20, 0, 38, 0, 46, 0, 40, 32, 0, 148, 27, 27, 0, 69, 0, 34, 32, 0, 122,
    26, 0, 38, 32, 0, 124, 27, 0, 68, 0, 25, 32, 0, 138, 0, 47, 21, 32, 0, 122,
    0, 34, 32, 0, 138, 26, 21, 0, 38, 32, 0, 139, 0, 40, 32, 0, 124, 27, 32, 0,
    139, 20, 27, 0, 65, 0, 33, 0, 47, 26, 32, 0, 138, 32, 0, 137, 21, 0, 38, 0,
    46, 0, 40, 32, 0, 148, 27, 27, 11, 18, 32, 0, 24, 32, 0, 150, 27, 33, 0,
    158, 48, 6, 34, 0, 78, 33, 0, 159, 48, 6, 32, 0, 77, 33, 0, 160, 48, 6, 34,
    0, 90, 0, 38, 32, 0, 94, 27, 33, 0, 161, 48, 6, 34, 0, 99, 33, 0, 162, 48,
    6, 34, 0, 100, 33, 0, 163, 48, 6, 0, 88, 0, 24, 0, 89, 1, 111, 0, 90, 1,
    112, 0, 57, 1, 113, 0, 91, 1, 114, 0, 92, 1, 115, 0, 40, 1, 116, 27, 11, 12,
    32, 0, 24, 0, 33, 32, 0, 150, 26, 27, 33, 0, 164, 48, 6, 34, 0, 121, 33, 0,
    165, 48, 6, 34, 0, 82, 33, 0, 166, 48, 6, 0, 93, 34, 0, 144, 0, 94, 1, 117,
    0, 95, 1, 118, 0, 96, 0, 33, 0, 46, 0, 40, 32, 0, 148, 27, 26, 1, 119, 11,
    2, 0, 44, 0, 24, 0, 40, 32, 0, 9, 27, 27, 0, 97, 1, 120, 0, 98, 1, 121, 1,
    122, 0, 24, 11, 2, 0, 44, 0, 25, 27, 0, 25, 0, 40, 32, 0, 143, 27, 21, 0,
    99, 1, 123, 11, 14, 34, 0, 24, 0, 33, 32, 0, 150, 26, 27, 33, 0, 167, 48, 6,
    34, 0, 28, 33, 0, 168, 48, 6, 34, 0, 107, 33, 0, 169, 48, 6, 1, 124, 33, 0,
    170, 48, 6, 34, 0, 106, 33, 0, 171, 48, 6, 34, 0, 60, 0, 38, 34, 0, 64, 27,
    33, 0, 172, 48, 6, 1, 125, 33, 0, 173, 48, 6, 34, 0, 119, 33, 0, 174, 48, 6,
    34, 0, 120, 33, 0, 175, 48, 6, 32, 0, 109, 0, 38, 32, 0, 13, 27, 33, 0, 176,
    48, 6, 32, 0, 85, 0, 38, 0, 24, 27, 0, 37, 0, 27, 0, 40, 32, 0, 132, 27, 27,
    33, 0, 177, 48, 6, 32, 0, 131, 0, 41, 34, 0, 85, 0, 37, 32, 0, 172, 0, 41,
    0, 27, 27, 27, 27, 0, 38, 1, 126, 27, 33, 0, 178, 48, 6, 34, 0, 114, 0, 38,
    34, 0, 111, 27, 33, 0, 179, 48, 6, 34, 0, 51, 0, 38, 34, 0, 47, 27, 33, 0,
    180, 48, 6, 0, 34, 34, 0, 40, 0, 46, 26, 26, 0, 38, 34, 0, 41, 0, 24, 26,
    27, 33, 0, 181, 48, 6, 34, 0, 42, 0, 38, 32, 0, 2, 0, 42, 32, 0, 181, 27,
    27, 33, 0, 182, 48, 6, 34, 0, 141, 0, 38, 32, 0, 46, 27, 33, 0, 183, 48, 6,
    34, 0, 71, 0, 38, 34, 0, 43, 27, 33, 0, 184, 48, 6, 34, 0, 137, 32, 0, 138,
    34, 0, 130, 32, 0, 122, 34, 0, 123, 34, 0, 124, 34, 0, 126, 34, 0, 127, 34,
    0, 125, 32, 0, 139, 32, 0, 128, 32, 0, 129, 32, 0, 131, 34, 0, 132, 32, 0,
    133, 32, 0, 134, 32, 0, 136, 34, 0, 135, 32, 0, 83, 32, 0, 84, 0, 25, 0, 24,
    34, 0, 176, 32, 0, 161, 34, 0, 177, 34, 0, 178, 32, 0, 155, 32, 0, 156, 34,
    0, 152, 34, 0, 163, 32, 0, 162, 34, 0, 154, 34, 0, 180, 34, 0, 184, 32, 0,
    38, 32, 0, 39, 32, 0, 153, 32, 0, 172, 32, 0, 140, 34, 0, 183, 34, 0, 181,
    34, 0, 182, 34, 0, 179, 0, 5, 0, 33, 0, 34, 32, 0, 171, 32, 0, 160, 32, 0,
    159, 34, 0, 170, 34, 0, 168, 34, 0, 169, 0, 32, 0, 40, 0, 41, 0, 42, 0, 43,
    32, 0, 166, 0, 38, 34, 0, 173, 34, 0, 175, 34, 0, 174, 32, 0, 165, 0, 39,
    11, 64, 1, 127, 16, 7, 34, 0, 1, 0, 32, 0, 6, 26, 16, 0, 3, 16, 0, 28, 0,
    42, 0, 33, 0, 47, 26, 0, 7, 0, 22, 21, 0, 18, 0, 46, 21, 27, 16, 0, 32, 0,
    6, 26, 16, 0, 1, 0, 46, 17, 7, 0, 46, 34, 0, 1, 11, 2, 7, 34, 0, 1, 7, 34,
    0, 1, 33, 1, 3, 33, 1, 4, 12, 2, 49, 7, 34, 0, 2, 1, 128, 18, 6, 34, 0, 1,
    33, 1, 147, 51, 7, 32, 0, 1, 11, 1, 0, 1, 34, 0, 1, 17, 7, 0, 20, 0, 31, 0,
    12, 0, 7, 0, 47, 21, 26, 34, 0, 1, 21, 0, 32, 0, 8, 26, 20, 0, 36, 0, 6, 26,
    20, 7, 0, 33, 32, 1, 0, 0, 31, 32, 1, 17, 34, 0, 1, 26, 0, 34, 0, 16, 26,
    34, 0, 2, 21, 26, 16, 26, 0, 16, 1, 129, 21, 7, 1, 130, 0, 12, 34, 0, 1, 32,
    1, 17, 32, 1, 0, 26, 16, 21, 7, 0, 49, 0, 9, 32, 0, 1, 0, 22, 16, 17, 0, 17,
    16, 0, 31, 0, 8, 0, 42, 0, 49, 27, 26, 16, 33, 0, 3, 48, 6, 32, 0, 1, 0, 30,
    32, 0, 3, 17, 34, 0, 1, 0, 30, 34, 0, 3, 0, 31, 0, 6, 0, 42, 0, 47, 27, 26,
    16, 17, 11, 2, 7, 34, 0, 2, 32, 1, 23, 16, 33, 0, 3, 33, 0, 4, 12, 2, 48, 6,
    34, 0, 1, 11, 1, 0, 26, 34, 0, 4, 17, 32, 1, 18, 34, 0, 3, 27, 7, 34, 0, 1,
    32, 1, 3, 16, 0, 59, 0, 16, 0, 42, 0, 47, 27, 32, 1, 25, 20, 11, 2, 0, 44,
    0, 46, 0, 16, 0, 42, 0, 49, 27, 32, 1, 21, 20, 11, 2, 0, 44, 0, 16, 0, 42,
    0, 46, 27, 0, 12, 0, 48, 21, 27, 27, 16, 33, 0, 3, 48, 6, 32, 0, 3, 0, 21,
    0, 59, 17, 0, 5, 0, 101, 17, 6, 34, 0, 3, 0, 20, 16, 7, 32, 0, 1, 32, 1, 25,
    16, 32, 1, 109, 0, 38, 0, 24, 27, 0, 33, 34, 0, 1, 26, 32, 1, 26, 20, 11, 2,
    0, 44, 0, 12, 0, 42, 0, 59, 27, 27, 34, 0, 2, 19, 7, 32, 0, 1, 0, 12, 16, 0,
    12, 0, 47, 17, 0, 5, 0, 102, 17, 6, 34, 0, 1, 0, 33, 32, 0, 4, 26, 32, 1,
    27, 20, 0, 36, 34, 0, 4, 26, 11, 2, 0, 44, 0, 47, 0, 38, 0, 22, 0, 20, 0,
    46, 21, 27, 27, 34, 0, 2, 19, 7, 1, 131, 33, 0, 2, 48, 6, 1, 132, 33, 0, 3,
    48, 6, 32, 0, 3, 32, 0, 1, 26, 0, 34, 34, 0, 3, 0, 34, 32, 0, 1, 26, 26, 26,
    11, 2, 0, 44, 0, 12, 0, 41, 0, 21, 27, 27, 34, 0, 2, 34, 0, 1, 26, 11, 2, 0,
    44, 0, 12, 0, 41, 0, 12, 27, 27, 7, 34, 0, 1, 1, 133, 0, 37, 1, 134, 1, 135,
    11, 2, 0, 44, 32, 1, 7, 0, 41, 0, 21, 27, 27, 0, 38, 1, 136, 27, 27, 1, 137,
    0, 37, 1, 138, 27, 11, 3, 0, 44, 32, 1, 7, 0, 41, 0, 6, 27, 27, 33, 0, 2,
    48, 7, 34, 0, 1, 32, 1, 33, 34, 0, 2, 19, 7, 32, 0, 1, 0, 31, 0, 20, 0, 42,
    0, 46, 27, 26, 0, 36, 0, 8, 26, 0, 47, 21, 0, 41, 0, 7, 27, 32, 0, 2, 19,
    33, 0, 3, 48, 6, 34, 0, 1, 32, 0, 3, 0, 46, 11, 2, 1, 139, 11, 2, 0, 44, 0,
    46, 0, 12, 34, 0, 3, 17, 27, 34, 0, 2, 19, 7, 34, 0, 4, 33, 0, 5, 48, 6, 0,
    46, 0, 25, 32, 0, 2, 19, 33, 0, 6, 48, 6, 34, 0, 1, 33, 0, 7, 48, 6, 1, 140,
    33, 0, 8, 48, 6, 34, 0, 8, 32, 0, 7, 0, 12, 0, 47, 17, 0, 45, 0, 33, 32, 0,
    5, 26, 1, 141, 0, 38, 0, 24, 27, 34, 0, 2, 23, 27, 16, 7, 32, 0, 1, 0, 14,
    0, 41, 32, 1, 34, 27, 32, 0, 2, 17, 33, 0, 3, 48, 6, 34, 0, 3, 0, 36, 32, 1,
    35, 34, 0, 1, 0, 15, 16, 0, 43, 0, 16, 27, 0, 43, 32, 1, 36, 0, 42, 34, 0,
    2, 0, 15, 16, 0, 43, 0, 16, 27, 27, 27, 26, 26, 16, 33, 0, 4, 48, 6, 0, 46,
    0, 34, 34, 0, 4, 26, 16, 7, 32, 0, 1, 33, 0, 2, 48, 6, 32, 1, 36, 32, 1, 32,
    0, 33, 0, 46, 26, 0, 13, 32, 1, 36, 21, 32, 1, 31, 11, 4, 34, 0, 1, 0, 45,
    0, 31, 1, 142, 26, 27, 16, 33, 0, 3, 48, 6, 1, 143, 33, 0, 4, 48, 6, 1, 144,
    0, 38, 1, 145, 27, 0, 1, 0, 46, 21, 7, 32, 0, 1, 33, 0, 2, 48, 6, 0, 36, 0,
    8, 26, 0, 7, 0, 47, 21, 0, 32, 0, 8, 26, 0, 36, 0, 6, 26, 20, 11, 2, 0, 16,
    34, 0, 1, 17, 33, 0, 3, 48, 6, 32, 1, 11, 0, 43, 1, 146, 27, 0, 1, 0, 46,
    21, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 111, 17, 6, 32, 0, 1,
    32, 1, 38, 16, 33, 0, 5, 48, 6, 32, 0, 1, 32, 1, 14, 0, 47, 17, 0, 36, 0, 8,
    26, 0, 47, 17, 33, 0, 6, 48, 6, 32, 0, 6, 32, 1, 35, 32, 0, 1, 0, 15, 16, 0,
    43, 0, 16, 27, 0, 41, 32, 1, 79, 0, 7, 0, 47, 21, 27, 26, 16, 33, 0, 7, 48,
    6, 34, 0, 1, 0, 22, 16, 0, 17, 16, 0, 31, 0, 47, 0, 24, 32, 0, 5, 0, 31, 0,
    8, 0, 42, 34, 0, 6, 27, 26, 16, 0, 43, 0, 16, 27, 0, 41, 34, 0, 7, 27, 0,
    47, 0, 43, 0, 7, 27, 21, 11, 2, 0, 44, 0, 20, 0, 42, 0, 46, 27, 27, 26, 16,
    34, 0, 4, 32, 0, 5, 17, 0, 30, 34, 0, 5, 32, 1, 16, 16, 17, 0, 1, 0, 46, 17,
    7, 32, 0, 2, 0, 12, 16, 33, 0, 3, 48, 6, 34, 0, 3, 0, 7, 32, 0, 1, 0, 12,
    16, 17, 33, 0, 4, 48, 6, 32, 0, 4, 0, 13, 0, 46, 17, 0, 5, 0, 112, 17, 6, 0,
    46, 0, 20, 16, 33, 0, 5, 48, 6, 32, 0, 1, 0, 14, 16, 33, 0, 6, 48, 0, 28,
    32, 0, 4, 17, 0, 24, 0, 36, 0, 8, 26, 0, 47, 21, 0, 17, 20, 0, 43, 0, 15,
    27, 16, 33, 0, 7, 48, 6, 34, 0, 6, 0, 29, 34, 0, 4, 17, 0, 35, 1, 147, 26,
    32, 0, 2, 0, 14, 16, 17, 6, 32, 0, 7, 0, 31, 0, 20, 0, 31, 0, 6, 26, 32, 0,
    5, 21, 0, 34, 0, 30, 26, 34, 0, 1, 0, 15, 16, 21, 32, 1, 79, 34, 0, 2, 21,
    26, 16, 0, 1, 0, 46, 17, 7, 32, 0, 1, 0, 12, 16, 0, 12, 0, 47, 17, 0, 5, 0,
    113, 17, 6, 32, 0, 1, 0, 31, 32, 1, 10, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17,
    0, 5, 0, 114, 17, 6, 34, 0, 1, 32, 1, 2, 16, 7, 32, 0, 1, 0, 12, 16, 0, 12,
    0, 47, 17, 32, 1, 148, 16, 6, 32, 0, 1, 0, 31, 32, 1, 10, 26, 16, 0, 36, 0,
    8, 26, 0, 47, 17, 32, 1, 148, 16, 6, 34, 0, 1, 0, 3, 16, 7, 32, 0, 1, 0, 22,
    16, 33, 0, 3, 48, 6, 32, 0, 1, 32, 1, 14, 0, 47, 17, 33, 0, 4, 48, 0, 36, 0,
    8, 26, 0, 47, 17, 33, 0, 5, 48, 6, 34, 0, 3, 0, 17, 16, 0, 31, 0, 8, 0, 42,
    32, 0, 5, 27, 0, 43, 0, 6, 27, 26, 34, 0, 5, 0, 17, 16, 0, 15, 34, 0, 4, 17,
    17, 0, 34, 0, 30, 26, 34, 0, 1, 0, 15, 16, 17, 7, 32, 0, 1, 32, 1, 7, 16,
    32, 1, 149, 16, 6, 34, 0, 1, 0, 12, 16, 0, 20, 0, 47, 17, 7, 32, 0, 1, 0,
    12, 16, 0, 34, 0, 7, 26, 0, 47, 17, 33, 0, 3, 48, 6, 32, 0, 1, 0, 14, 16,
    33, 0, 4, 48, 6, 32, 0, 4, 0, 16, 32, 0, 3, 17, 33, 0, 5, 48, 6, 34, 0, 4,
    0, 28, 34, 0, 3, 17, 33, 0, 6, 48, 6, 32, 0, 6, 0, 36, 0, 8, 26, 0, 47, 17,
    0, 17, 16, 0, 15, 34, 0, 6, 17, 0, 31, 0, 8, 0, 42, 32, 0, 5, 27, 0, 43, 0,
    6, 27, 26, 34, 0, 5, 0, 17, 16, 17, 0, 34, 0, 30, 26, 34, 0, 1, 0, 15, 16,
    17, 7, 32, 0, 2, 0, 12, 16, 0, 23, 0, 47, 17, 0, 5, 0, 115, 17, 6, 32, 0, 2,
    32, 1, 13, 16, 33, 0, 2, 49, 6, 32, 0, 1, 32, 1, 11, 16, 33, 0, 1, 49, 6,
    32, 0, 1, 0, 12, 16, 33, 0, 6, 48, 0, 13, 32, 0, 2, 0, 22, 16, 17, 0, 5, 0,
    116, 17, 6, 32, 0, 2, 0, 31, 32, 0, 6, 0, 43, 0, 20, 27, 32, 1, 128, 32, 1,
    10, 21, 26, 16, 0, 36, 32, 1, 128, 26, 0, 47, 17, 0, 5, 0, 117, 17, 6, 32,
    0, 2, 0, 3, 16, 33, 0, 7, 48, 34, 0, 4, 33, 0, 6, 50, 6, 34, 0, 7, 0, 31, 0,
    12, 0, 42, 0, 46, 27, 26, 16, 32, 1, 2, 16, 0, 26, 34, 0, 2, 17, 34, 0, 5,
    16, 33, 0, 8, 48, 0, 22, 16, 33, 0, 9, 48, 6, 32, 0, 1, 0, 14, 16, 0, 29, 0,
    27, 0, 28, 21, 34, 0, 9, 17, 33, 0, 10, 33, 0, 11, 12, 2, 48, 6, 32, 0, 10,
    32, 1, 92, 0, 43, 0, 27, 27, 16, 0, 31, 32, 1, 112, 0, 42, 34, 0, 8, 27, 26,
    16, 33, 0, 12, 33, 0, 13, 12, 2, 48, 6, 34, 0, 1, 0, 15, 16, 0, 15, 0, 42,
    32, 0, 11, 0, 43, 0, 26, 27, 27, 0, 24, 0, 15, 34, 0, 11, 0, 26, 34, 0, 10,
    0, 36, 0, 8, 26, 0, 47, 17, 11, 1, 17, 21, 0, 30, 0, 25, 0, 35, 0, 17, 0,
    43, 0, 31, 0, 8, 26, 0, 42, 0, 36, 0, 6, 26, 0, 20, 20, 27, 27, 26, 34, 0,
    13, 21, 0, 36, 0, 31, 0, 6, 26, 26, 0, 46, 0, 20, 16, 21, 21, 11, 2, 0, 44,
    0, 24, 0, 40, 0, 22, 27, 0, 20, 0, 46, 21, 27, 34, 0, 12, 0, 31, 0, 36, 0,
    11, 26, 26, 16, 17, 7, 32, 0, 1, 0, 31, 0, 47, 0, 43, 0, 7, 27, 0, 18, 0,
    46, 21, 26, 16, 0, 36, 0, 6, 26, 0, 46, 17, 0, 7, 34, 0, 2, 19, 33, 0, 3,
    48, 6, 32, 0, 3, 0, 13, 34, 0, 1, 0, 22, 16, 17, 0, 5, 0, 118, 17, 6, 34, 0,
    3, 7, 34, 0, 1, 0, 36, 0, 18, 26, 0, 46, 17, 0, 23, 0, 47, 17, 32, 1, 148,
    16, 6, 34, 0, 2, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 119, 17,
    6, 32, 0, 1, 0, 22, 16, 0, 6, 0, 47, 17, 0, 17, 16, 0, 31, 34, 0, 1, 0, 43,
    0, 30, 0, 42, 0, 17, 27, 27, 26, 16, 0, 1, 0, 42, 0, 16, 0, 42, 0, 46, 27,
    27, 16, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 120, 17, 6, 32,
    0, 1, 0, 22, 16, 33, 0, 3, 48, 6, 32, 0, 3, 0, 6, 0, 47, 17, 0, 17, 16, 0,
    31, 34, 0, 1, 0, 43, 0, 30, 0, 42, 1, 148, 27, 27, 26, 16, 0, 1, 0, 42, 0,
    16, 0, 42, 32, 0, 3, 27, 27, 16, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 12, 2, 48,
    6, 1, 149, 33, 0, 5, 48, 6, 0, 24, 0, 40, 34, 0, 3, 27, 0, 25, 0, 6, 32, 0,
    5, 0, 13, 0, 42, 0, 46, 27, 26, 20, 34, 0, 5, 0, 21, 26, 11, 2, 0, 44, 0,
    13, 0, 42, 0, 46, 27, 27, 21, 7, 32, 0, 1, 0, 12, 16, 0, 12, 0, 47, 17, 0,
    5, 0, 125, 17, 6, 34, 0, 2, 32, 1, 55, 32, 0, 1, 0, 22, 16, 17, 0, 34, 0,
    16, 26, 34, 0, 1, 17, 7, 32, 0, 2, 0, 12, 18, 0, 12, 0, 47, 19, 0, 5, 0,
    126, 19, 6, 32, 0, 1, 0, 14, 16, 33, 0, 3, 48, 0, 22, 0, 41, 0, 12, 27, 32,
    0, 2, 19, 0, 5, 0, 127, 17, 6, 0, 46, 33, 0, 4, 48, 6, 34, 0, 3, 0, 35, 1,
    150, 26, 34, 0, 2, 19, 6, 34, 0, 1, 0, 15, 16, 0, 16, 32, 0, 4, 17, 7, 34,
    0, 2, 0, 31, 34, 0, 1, 0, 43, 32, 1, 59, 27, 26, 16, 7, 34, 0, 1, 33, 0, 2,
    33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 33, 0, 7, 12, 6, 48, 6, 0, 129, 0,
    26, 34, 0, 2, 17, 0, 26, 0, 128, 17, 33, 0, 8, 48, 6, 0, 130, 0, 26, 32, 0,
    8, 17, 33, 0, 9, 48, 6, 0, 131, 0, 26, 32, 0, 8, 17, 33, 0, 10, 48, 6, 0,
    132, 0, 26, 32, 0, 8, 17, 33, 0, 11, 48, 6, 0, 133, 0, 26, 34, 0, 8, 17, 33,
    0, 12, 48, 6, 0, 24, 0, 31, 34, 0, 5, 0, 31, 0, 0, 0, 12, 0, 47, 21, 26, 0,
    15, 20, 0, 36, 0, 8, 26, 0, 47, 21, 11, 2, 0, 44, 32, 1, 7, 27, 26, 0, 15,
    20, 0, 36, 0, 8, 26, 0, 47, 21, 0, 5, 34, 0, 12, 21, 11, 2, 0, 16, 34, 0, 4,
    17, 33, 0, 13, 48, 6, 1, 151, 1, 152, 11, 2, 0, 44, 0, 25, 0, 40, 34, 0, 3,
    27, 27, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 134, 17, 6, 32,
    0, 1, 0, 22, 16, 0, 20, 0, 46, 17, 0, 5, 0, 135, 17, 6, 34, 0, 1, 0, 30, 0,
    46, 0, 20, 16, 17, 7, 34, 0, 2, 0, 31, 32, 1, 56, 0, 42, 34, 0, 1, 0, 22,
    16, 27, 26, 16, 7, 34, 0, 2, 0, 31, 32, 1, 56, 0, 42, 34, 0, 1, 27, 26, 16,
    7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 138, 17, 6, 32, 0, 1, 0,
    22, 16, 33, 0, 3, 48, 6, 34, 0, 1, 0, 30, 32, 0, 3, 0, 17, 16, 0, 31, 0, 7,
    0, 42, 0, 47, 0, 7, 34, 0, 3, 17, 27, 26, 16, 17, 7, 32, 0, 2, 32, 1, 9, 18,
    0, 5, 0, 139, 19, 6, 32, 0, 1, 0, 12, 0, 46, 17, 0, 6, 33, 0, 1, 50, 6, 32,
    0, 1, 0, 9, 32, 0, 2, 19, 0, 11, 16, 0, 8, 32, 0, 1, 17, 0, 7, 34, 0, 2, 19,
    33, 0, 3, 48, 6, 34, 0, 1, 0, 20, 32, 0, 3, 17, 0, 5, 0, 140, 17, 6, 34, 0,
    3, 7, 32, 0, 2, 32, 1, 7, 0, 45, 0, 15, 0, 16, 0, 46, 21, 27, 16, 33, 0, 2,
    49, 6, 32, 0, 2, 32, 1, 10, 16, 0, 5, 0, 142, 17, 6, 34, 0, 2, 33, 0, 3, 48,
    33, 0, 4, 48, 6, 34, 0, 1, 0, 8, 32, 0, 3, 17, 0, 17, 16, 0, 32, 0, 34, 1,
    153, 0, 45, 1, 154, 27, 26, 26, 16, 7, 32, 0, 2, 0, 22, 16, 0, 12, 34, 0, 1,
    17, 0, 5, 0, 143, 17, 6, 32, 0, 2, 0, 31, 0, 12, 0, 42, 0, 11, 0, 40, 0, 19,
    27, 27, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 142, 17, 6, 34, 0, 2,
    32, 1, 2, 16, 7, 0, 33, 0, 46, 26, 0, 5, 0, 144, 21, 7, 34, 0, 1, 32, 1, 3,
    16, 33, 0, 3, 48, 6, 32, 0, 3, 0, 16, 0, 46, 17, 0, 46, 0, 43, 0, 13, 27, 0,
    33, 34, 0, 3, 26, 0, 29, 0, 42, 0, 47, 27, 0, 31, 34, 0, 0, 26, 20, 0, 36,
    0, 8, 26, 32, 1, 73, 21, 20, 11, 2, 0, 44, 0, 13, 0, 42, 0, 49, 27, 27, 16,
    7, 34, 0, 1, 1, 155, 34, 0, 2, 21, 7, 0, 34, 34, 0, 1, 26, 7, 1, 156, 0, 24,
    11, 2, 0, 36, 34, 0, 1, 26, 16, 7, 34, 0, 1, 34, 0, 2, 16, 7, 34, 0, 1, 1,
    157, 0, 25, 32, 1, 72, 20, 0, 45, 1, 158, 27, 11, 2, 0, 44, 0, 25, 0, 40, 0,
    0, 27, 0, 13, 0, 53, 21, 27, 34, 0, 2, 17, 7, 34, 0, 1, 32, 1, 11, 0, 41,
    32, 0, 4, 32, 1, 76, 32, 1, 29, 32, 0, 4, 26, 0, 38, 0, 31, 34, 0, 4, 26,
    27, 27, 27, 34, 0, 2, 19, 7, 34, 0, 1, 32, 1, 11, 0, 41, 32, 0, 4, 32, 1,
    76, 0, 31, 34, 0, 4, 26, 27, 27, 34, 0, 2, 19, 7, 34, 0, 1, 0, 35, 32, 1,
    79, 26, 34, 0, 2, 19, 0, 15, 16, 0, 36, 0, 8, 26, 0, 47, 17, 7, 32, 0, 2, 0,
    16, 0, 47, 17, 34, 0, 1, 11, 2, 0, 44, 34, 0, 2, 0, 16, 0, 46, 17, 27, 7,
    34, 0, 1, 0, 15, 16, 0, 31, 32, 1, 80, 26, 16, 0, 36, 0, 18, 26, 0, 46, 17,
    0, 6, 0, 47, 17, 7, 32, 0, 1, 0, 31, 0, 12, 26, 16, 0, 36, 0, 6, 26, 0, 46,
    17, 0, 20, 0, 46, 17, 0, 5, 0, 147, 17, 6, 0, 52, 33, 0, 3, 48, 33, 0, 4,
    48, 6, 11, 0, 33, 0, 5, 48, 6, 32, 0, 1, 33, 0, 6, 48, 6, 34, 0, 1, 0, 31,
    0, 22, 26, 16, 32, 1, 2, 16, 0, 31, 1, 159, 26, 16, 7, 1, 160, 33, 0, 0, 48,
    6, 0, 46, 0, 12, 0, 42, 0, 33, 32, 0, 0, 26, 27, 11, 2, 0, 44, 0, 0, 0, 12,
    0, 53, 21, 27, 33, 0, 1, 48, 6, 0, 33, 32, 0, 0, 26, 33, 0, 2, 48, 6, 1,
    161, 33, 0, 3, 48, 6, 0, 0, 0, 23, 0, 53, 21, 0, 45, 32, 0, 3, 32, 0, 1, 26,
    27, 33, 0, 4, 48, 6, 0, 24, 0, 16, 0, 49, 21, 32, 1, 7, 20, 0, 43, 0, 21,
    27, 0, 45, 1, 162, 27, 33, 0, 5, 48, 6, 1, 163, 33, 0, 6, 48, 6, 1, 164, 33,
    0, 7, 48, 6, 1, 165, 0, 46, 0, 16, 0, 42, 0, 49, 27, 0, 12, 0, 33, 32, 0, 7,
    26, 21, 11, 2, 0, 44, 0, 16, 0, 42, 0, 46, 27, 0, 12, 0, 48, 21, 27, 33, 0,
    8, 48, 20, 33, 0, 9, 48, 6, 34, 0, 3, 32, 0, 9, 26, 33, 0, 10, 48, 6, 1,
    166, 33, 0, 11, 48, 6, 1, 167, 33, 0, 12, 48, 6, 1, 168, 33, 0, 13, 48, 6,
    1, 169, 33, 0, 14, 48, 6, 1, 170, 33, 0, 15, 48, 6, 1, 171, 33, 0, 16, 48,
    6, 1, 172, 33, 0, 17, 48, 6, 1, 173, 33, 0, 18, 48, 6, 1, 174, 33, 0, 19,
    48, 6, 1, 175, 33, 0, 20, 48, 6, 0, 149, 0, 24, 0, 150, 1, 176, 0, 151, 32,
    0, 19, 0, 47, 0, 46, 11, 2, 26, 0, 152, 32, 0, 19, 0, 46, 0, 49, 11, 2, 26,
    0, 153, 1, 177, 0, 46, 0, 49, 11, 2, 26, 0, 154, 32, 0, 19, 0, 47, 0, 47,
    11, 2, 26, 0, 155, 32, 0, 20, 0, 47, 0, 47, 11, 2, 26, 0, 156, 34, 0, 20, 0,
    47, 0, 49, 11, 2, 26, 0, 157, 32, 0, 18, 0, 47, 0, 47, 11, 2, 26, 0, 158, 1,
    178, 0, 159, 32, 0, 18, 0, 47, 0, 49, 11, 2, 26, 0, 160, 34, 0, 19, 0, 49,
    0, 47, 11, 2, 26, 0, 161, 1, 179, 0, 49, 0, 47, 11, 2, 26, 0, 162, 1, 180,
    0, 163, 1, 181, 0, 164, 0, 33, 32, 0, 16, 26, 0, 165, 0, 33, 34, 0, 17, 26,
    11, 34, 32, 1, 23, 16, 33, 0, 21, 33, 0, 22, 12, 2, 48, 6, 32, 0, 10, 1,
    182, 1, 183, 11, 3, 0, 44, 0, 33, 0, 53, 26, 0, 7, 0, 0, 21, 27, 33, 0, 23,
    48, 6, 34, 0, 23, 11, 1, 0, 26, 34, 0, 22, 32, 1, 2, 0, 42, 0, 31, 0, 22,
    26, 27, 32, 0, 21, 17, 17, 32, 1, 18, 34, 0, 21, 32, 1, 81, 16, 27, 33, 0,
    24, 48, 6, 0, 24, 0, 24, 0, 24, 0, 36, 1, 184, 26, 20, 1, 185, 1, 186, 1,
    187, 11, 6, 0, 44, 0, 25, 27, 33, 0, 25, 48, 6, 34, 0, 25, 0, 33, 32, 0, 2,
    26, 11, 2, 0, 44, 0, 16, 0, 42, 0, 53, 0, 43, 0, 23, 27, 27, 0, 12, 0, 33,
    32, 0, 2, 26, 21, 27, 33, 0, 26, 48, 6, 1, 188, 0, 43, 0, 24, 0, 16, 0, 47,
    21, 1, 189, 20, 32, 0, 4, 20, 0, 33, 32, 0, 2, 26, 1, 190, 34, 0, 26, 0, 16,
    0, 42, 0, 46, 27, 21, 32, 0, 4, 20, 1, 191, 11, 2, 0, 44, 32, 1, 22, 27, 0,
    24, 0, 16, 0, 47, 21, 34, 0, 4, 20, 11, 4, 0, 44, 0, 24, 0, 16, 0, 46, 21,
    0, 40, 0, 53, 0, 24, 0, 49, 11, 2, 0, 44, 0, 13, 0, 42, 0, 49, 27, 27, 11,
    2, 0, 44, 0, 13, 0, 42, 0, 46, 27, 27, 27, 27, 27, 33, 0, 27, 48, 6, 0, 24,
    32, 1, 7, 20, 0, 12, 0, 41, 0, 12, 27, 0, 14, 0, 41, 32, 1, 15, 27, 11, 3,
    0, 36, 1, 192, 26, 16, 33, 0, 28, 48, 6, 0, 24, 0, 40, 32, 0, 1, 27, 0, 7,
    0, 47, 21, 0, 45, 1, 193, 27, 33, 0, 29, 48, 6, 1, 194, 33, 0, 30, 48, 6, 1,
    195, 33, 0, 31, 48, 6, 1, 196, 7, 32, 1, 87, 0, 45, 0, 1, 0, 43, 0, 24, 0,
    37, 0, 33, 11, 0, 26, 0, 15, 32, 1, 84, 0, 41, 34, 0, 2, 27, 21, 27, 27, 27,
    32, 1, 86, 0, 24, 0, 37, 0, 25, 27, 34, 0, 1, 21, 11, 2, 0, 44, 0, 15, 0,
    40, 0, 22, 27, 0, 20, 0, 46, 21, 27, 7, 32, 0, 1, 0, 15, 16, 0, 16, 0, 46,
    17, 32, 1, 84, 16, 33, 0, 3, 48, 6, 32, 0, 1, 0, 15, 16, 0, 31, 32, 1, 84,
    0, 46, 32, 1, 15, 11, 2, 0, 44, 0, 22, 0, 41, 0, 12, 27, 27, 32, 0, 3, 21,
    0, 5, 0, 168, 21, 26, 16, 6, 32, 0, 3, 0, 36, 0, 8, 26, 0, 47, 17, 0, 17,
    16, 0, 15, 34, 0, 3, 17, 0, 31, 0, 34, 0, 16, 26, 26, 34, 0, 1, 0, 31, 32,
    1, 13, 26, 16, 17, 7, 32, 0, 1, 0, 12, 0, 41, 0, 18, 27, 32, 0, 2, 19, 0,
    34, 0, 7, 26, 0, 47, 17, 33, 0, 3, 48, 6, 32, 0, 1, 32, 1, 84, 0, 41, 0, 27,
    27, 32, 0, 2, 19, 33, 0, 4, 48, 6, 32, 0, 4, 0, 31, 0, 22, 0, 13, 32, 0, 3,
    21, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 169, 17, 6, 32, 0, 4, 0,
    31, 0, 29, 0, 42, 0, 33, 32, 0, 3, 26, 0, 7, 0, 22, 21, 27, 26, 16, 33, 0,
    5, 48, 6, 32, 0, 5, 0, 36, 32, 1, 15, 26, 16, 0, 5, 0, 170, 17, 6, 34, 0, 4,
    0, 31, 0, 47, 0, 24, 0, 16, 0, 46, 21, 11, 2, 0, 44, 0, 22, 0, 20, 34, 0, 3,
    21, 27, 26, 16, 0, 36, 0, 6, 26, 0, 46, 17, 33, 0, 6, 48, 6, 34, 0, 1, 0,
    15, 0, 41, 0, 26, 27, 34, 0, 2, 19, 0, 15, 34, 0, 5, 0, 16, 0, 46, 17, 0,
    26, 34, 0, 6, 11, 1, 17, 17, 7, 34, 0, 2, 33, 0, 5, 48, 6, 34, 0, 4, 33, 0,
    6, 48, 6, 34, 0, 1, 0, 31, 1, 197, 26, 16, 7, 32, 0, 1, 0, 15, 16, 33, 0, 3,
    48, 0, 22, 16, 33, 0, 4, 48, 6, 32, 0, 3, 0, 31, 32, 1, 84, 26, 16, 33, 0,
    5, 48, 6, 32, 0, 1, 0, 12, 16, 33, 0, 6, 48, 6, 34, 0, 1, 32, 1, 84, 16, 33,
    0, 7, 48, 6, 0, 47, 33, 0, 8, 48, 6, 0, 46, 0, 20, 16, 33, 0, 9, 48, 33, 0,
    10, 48, 33, 0, 11, 48, 6, 34, 0, 6, 0, 17, 16, 0, 35, 1, 198, 26, 32, 0, 7,
    32, 1, 92, 16, 17, 6, 32, 0, 9, 0, 15, 16, 33, 0, 9, 49, 0, 16, 0, 46, 17,
    0, 7, 32, 0, 3, 0, 16, 0, 46, 17, 0, 12, 16, 17, 33, 0, 12, 48, 6, 32, 0, 3,
    0, 31, 0, 33, 32, 0, 12, 26, 0, 7, 0, 12, 21, 26, 16, 32, 1, 15, 32, 0, 9,
    17, 0, 5, 0, 173, 17, 6, 0, 35, 1, 199, 32, 0, 3, 0, 31, 32, 1, 13, 26, 16,
    26, 26, 33, 0, 13, 48, 6, 32, 0, 10, 32, 0, 13, 1, 200, 11, 2, 0, 44, 32, 0,
    12, 0, 20, 0, 46, 17, 27, 32, 0, 11, 17, 7, 32, 0, 2, 0, 22, 16, 33, 0, 3,
    48, 6, 32, 0, 1, 0, 22, 16, 33, 0, 4, 48, 6, 32, 0, 3, 0, 23, 32, 0, 4, 17,
    0, 5, 0, 174, 17, 6, 34, 0, 1, 0, 35, 0, 8, 0, 42, 34, 0, 2, 0, 43, 0, 16,
    27, 27, 0, 24, 11, 2, 0, 44, 0, 25, 0, 13, 34, 0, 3, 21, 27, 26, 34, 0, 4,
    0, 17, 16, 17, 7, 32, 0, 1, 0, 7, 0, 47, 17, 33, 0, 2, 48, 6, 0, 176, 0,
    177, 11, 2, 0, 16, 32, 0, 1, 17, 33, 0, 3, 48, 6, 0, 19, 0, 43, 0, 12, 27,
    0, 7, 0, 47, 21, 0, 12, 0, 42, 0, 46, 27, 0, 7, 0, 47, 21, 11, 2, 0, 16, 32,
    0, 1, 17, 33, 0, 4, 48, 6, 1, 201, 1, 202, 11, 2, 0, 16, 34, 0, 1, 17, 33,
    0, 5, 48, 6, 0, 178, 0, 26, 34, 0, 3, 17, 0, 26, 0, 128, 17, 33, 0, 6, 48,
    6, 0, 179, 0, 26, 32, 0, 6, 17, 33, 0, 7, 48, 6, 0, 180, 0, 26, 34, 0, 6,
    17, 33, 0, 8, 48, 6, 32, 1, 11, 0, 43, 0, 24, 0, 37, 1, 203, 1, 204, 11, 2,
    0, 44, 0, 25, 0, 40, 32, 1, 7, 27, 27, 27, 27, 7, 32, 0, 1, 0, 12, 16, 0,
    13, 0, 47, 17, 0, 5, 0, 181, 17, 6, 32, 0, 1, 32, 1, 14, 0, 47, 17, 33, 0,
    3, 48, 6, 32, 0, 2, 0, 12, 0, 41, 0, 7, 27, 32, 0, 1, 19, 1, 205, 32, 0, 2,
    19, 6, 32, 0, 3, 0, 36, 0, 8, 26, 34, 0, 1, 1, 206, 0, 38, 0, 47, 27, 34, 0,
    2, 19, 17, 7, 32, 0, 1, 32, 1, 98, 32, 0, 2, 19, 33, 0, 3, 48, 6, 32, 0, 1,
    0, 15, 16, 33, 0, 4, 48, 0, 22, 16, 33, 0, 5, 48, 0, 11, 34, 0, 3, 17, 33,
    0, 6, 48, 6, 34, 0, 4, 0, 28, 32, 0, 6, 0, 7, 32, 0, 5, 17, 17, 0, 26, 34,
    0, 6, 0, 34, 32, 1, 13, 0, 43, 0, 28, 27, 26, 0, 38, 32, 0, 1, 0, 43, 34, 0,
    5, 0, 20, 0, 46, 17, 0, 45, 1, 207, 27, 27, 27, 34, 0, 2, 19, 17, 0, 15, 34,
    0, 1, 32, 1, 84, 16, 17, 7, 32, 0, 1, 32, 1, 98, 32, 0, 2, 19, 33, 0, 3, 48,
    6, 32, 0, 1, 0, 15, 16, 33, 0, 4, 48, 0, 22, 16, 33, 0, 5, 48, 0, 11, 32, 0,
    3, 17, 33, 0, 6, 48, 6, 32, 0, 6, 0, 34, 32, 1, 13, 0, 43, 0, 29, 0, 42, 0,
    7, 0, 42, 34, 0, 3, 27, 27, 27, 26, 0, 38, 32, 0, 1, 0, 43, 34, 0, 5, 0, 20,
    0, 46, 17, 0, 45, 1, 208, 27, 27, 27, 34, 0, 2, 19, 0, 26, 34, 0, 4, 0, 29,
    34, 0, 6, 17, 17, 0, 15, 34, 0, 1, 32, 1, 84, 16, 17, 7, 32, 0, 1, 0, 12,
    16, 0, 12, 0, 47, 17, 0, 5, 0, 186, 17, 6, 32, 0, 1, 0, 31, 32, 1, 101, 26,
    16, 6, 32, 0, 1, 11, 0, 0, 43, 0, 15, 27, 0, 31, 0, 17, 26, 0, 36, 0, 31, 0,
    26, 0, 42, 0, 27, 27, 26, 26, 11, 0, 0, 20, 16, 21, 11, 2, 0, 44, 0, 24, 0,
    36, 0, 8, 26, 0, 47, 21, 0, 20, 0, 46, 21, 27, 16, 0, 31, 0, 1, 0, 42, 0,
    46, 27, 26, 16, 0, 1, 34, 0, 1, 0, 31, 0, 46, 26, 16, 17, 7, 32, 0, 2, 0,
    12, 16, 0, 23, 0, 47, 17, 0, 5, 0, 187, 17, 6, 32, 0, 2, 32, 1, 13, 16, 33,
    0, 2, 49, 0, 22, 16, 33, 0, 3, 48, 6, 32, 0, 1, 32, 1, 11, 16, 33, 0, 1, 49,
    6, 34, 0, 1, 32, 0, 3, 0, 20, 0, 46, 17, 0, 45, 0, 24, 0, 37, 1, 209, 27,
    27, 34, 0, 2, 17, 7, 32, 0, 1, 32, 1, 84, 16, 0, 28, 32, 0, 2, 19, 33, 0, 3,
    48, 6, 32, 0, 1, 32, 1, 14, 34, 0, 2, 19, 33, 0, 4, 48, 0, 36, 0, 8, 26, 0,
    47, 17, 33, 0, 5, 48, 6, 34, 0, 1, 0, 15, 16, 33, 0, 6, 48, 6, 32, 0, 5, 0,
    17, 16, 0, 15, 34, 0, 4, 17, 33, 0, 7, 48, 6, 1, 210, 33, 0, 8, 48, 6, 32,
    0, 3, 0, 36, 0, 8, 26, 0, 47, 17, 0, 17, 16, 0, 31, 1, 211, 26, 16, 0, 22,
    0, 12, 0, 46, 21, 0, 45, 34, 0, 8, 27, 16, 0, 15, 34, 0, 3, 17, 7, 34, 0, 4,
    33, 0, 5, 48, 6, 1, 212, 33, 0, 6, 48, 6, 1, 213, 33, 0, 7, 48, 6, 34, 0, 1,
    32, 0, 5, 0, 20, 20, 1, 214, 1, 215, 34, 0, 7, 11, 4, 0, 44, 0, 12, 0, 20,
    0, 46, 21, 0, 41, 0, 6, 0, 42, 0, 8, 0, 42, 0, 49, 27, 27, 27, 27, 34, 0, 2,
    19, 32, 1, 89, 16, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 0, 192,
    17, 6, 34, 0, 4, 33, 0, 5, 48, 6, 1, 216, 33, 0, 6, 48, 6, 34, 0, 1, 34, 0,
    6, 1, 217, 11, 2, 0, 44, 0, 47, 0, 38, 0, 22, 0, 20, 0, 46, 21, 27, 27, 34,
    0, 2, 19, 7, 32, 0, 2, 0, 12, 16, 0, 23, 0, 47, 17, 0, 5, 0, 195, 17, 6, 34,
    0, 2, 32, 1, 13, 16, 33, 0, 3, 48, 6, 32, 0, 3, 0, 31, 0, 47, 0, 12, 0, 42,
    0, 50, 27, 11, 2, 0, 44, 32, 1, 10, 27, 26, 16, 33, 0, 4, 48, 0, 36, 0, 6,
    26, 0, 46, 17, 33, 0, 5, 48, 6, 32, 0, 5, 0, 23, 0, 47, 17, 0, 5, 0, 196,
    17, 6, 34, 0, 1, 32, 1, 13, 16, 33, 0, 6, 48, 0, 22, 16, 33, 0, 7, 48, 6,
    32, 0, 3, 0, 24, 0, 36, 0, 8, 26, 0, 47, 21, 1, 218, 11, 2, 0, 44, 34, 0, 5,
    27, 16, 33, 0, 8, 48, 6, 32, 0, 6, 32, 0, 7, 0, 12, 32, 0, 8, 17, 0, 7, 0,
    47, 17, 0, 45, 0, 24, 0, 37, 1, 219, 27, 27, 16, 0, 15, 32, 0, 3, 17, 7, 32,
    0, 1, 0, 31, 32, 1, 9, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 201, 17,
    6, 32, 0, 1, 0, 31, 0, 13, 0, 42, 0, 52, 27, 26, 16, 0, 36, 0, 8, 26, 0, 47,
    17, 0, 5, 0, 202, 17, 6, 0, 3, 33, 0, 5, 48, 6, 32, 0, 1, 0, 25, 0, 38, 0,
    46, 27, 0, 45, 0, 24, 1, 220, 0, 22, 0, 43, 0, 34, 0, 7, 26, 27, 21, 27, 34,
    0, 2, 19, 33, 0, 1, 49, 6, 32, 0, 1, 0, 4, 34, 0, 1, 32, 0, 5, 16, 33, 0, 6,
    48, 17, 33, 0, 7, 48, 6, 0, 46, 33, 0, 8, 48, 6, 34, 0, 6, 0, 31, 1, 221, 0,
    34, 0, 30, 26, 34, 0, 7, 21, 34, 0, 4, 20, 26, 16, 7, 32, 0, 1, 0, 12, 16,
    0, 12, 0, 47, 17, 0, 5, 0, 203, 17, 6, 32, 1, 110, 0, 24, 26, 33, 0, 3, 48,
    6, 34, 0, 1, 32, 0, 3, 0, 1, 0, 46, 0, 40, 0, 17, 27, 21, 0, 31, 32, 1, 11,
    0, 40, 1, 222, 27, 26, 0, 36, 0, 31, 0, 31, 0, 26, 26, 26, 26, 11, 0, 0, 20,
    16, 0, 20, 16, 21, 0, 1, 0, 31, 0, 46, 26, 11, 0, 0, 43, 0, 15, 27, 0, 1, 0,
    24, 21, 20, 21, 11, 2, 0, 44, 32, 1, 83, 0, 20, 0, 47, 21, 27, 16, 7, 32, 0,
    2, 0, 12, 16, 33, 0, 3, 48, 6, 32, 0, 1, 0, 12, 16, 0, 13, 32, 0, 3, 17, 0,
    5, 0, 204, 17, 6, 32, 0, 1, 32, 1, 84, 16, 33, 0, 4, 48, 0, 28, 32, 0, 3,
    17, 0, 35, 0, 7, 26, 32, 0, 2, 32, 1, 84, 16, 17, 33, 0, 5, 48, 6, 32, 0, 5,
    0, 46, 0, 16, 0, 42, 0, 46, 27, 0, 12, 0, 47, 21, 11, 2, 0, 44, 32, 0, 3, 0,
    12, 0, 47, 17, 27, 16, 33, 0, 6, 48, 6, 34, 0, 5, 0, 31, 0, 12, 0, 42, 0,
    46, 27, 26, 0, 36, 0, 8, 26, 0, 47, 21, 0, 47, 11, 2, 0, 44, 32, 0, 6, 27,
    16, 0, 5, 0, 205, 17, 6, 32, 0, 1, 0, 43, 0, 24, 0, 37, 0, 25, 0, 40, 32, 0,
    1, 0, 15, 16, 1, 223, 1, 224, 11, 2, 0, 44, 34, 0, 1, 0, 12, 16, 0, 12, 32,
    0, 3, 17, 27, 16, 27, 27, 27, 33, 0, 7, 48, 6, 34, 0, 2, 0, 15, 16, 32, 1,
    110, 32, 0, 7, 26, 34, 0, 6, 17, 0, 1, 11, 0, 34, 0, 7, 16, 17, 7, 32, 0, 2,
    0, 12, 16, 0, 12, 0, 47, 17, 0, 5, 0, 206, 17, 6, 32, 0, 2, 0, 31, 0, 12,
    26, 16, 33, 0, 3, 48, 0, 36, 0, 6, 26, 0, 46, 17, 33, 0, 4, 48, 6, 32, 0, 1,
    0, 12, 16, 0, 13, 32, 0, 4, 17, 0, 5, 0, 207, 17, 6, 32, 0, 1, 32, 1, 84,
    16, 0, 28, 32, 0, 4, 17, 0, 35, 0, 7, 26, 32, 0, 2, 0, 31, 32, 1, 84, 26,
    16, 32, 1, 81, 16, 17, 33, 0, 5, 48, 6, 32, 0, 3, 0, 31, 0, 12, 0, 42, 0,
    47, 27, 26, 16, 32, 1, 2, 32, 0, 3, 17, 0, 35, 0, 13, 0, 8, 0, 25, 0, 13, 0,
    46, 21, 21, 26, 32, 0, 5, 17, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 205, 17,
    6, 0, 46, 11, 1, 0, 26, 34, 0, 5, 17, 0, 30, 32, 0, 3, 32, 1, 91, 0, 6, 26,
    0, 46, 17, 17, 0, 35, 0, 11, 26, 34, 0, 3, 17, 33, 0, 6, 48, 6, 32, 0, 2, 0,
    31, 32, 1, 13, 26, 16, 33, 0, 2, 49, 0, 35, 0, 22, 0, 43, 0, 34, 0, 7, 26,
    27, 26, 32, 0, 6, 17, 33, 0, 7, 48, 6, 0, 33, 32, 0, 1, 26, 32, 1, 109, 34,
    0, 1, 32, 1, 14, 34, 0, 4, 17, 0, 43, 0, 26, 27, 21, 33, 0, 8, 48, 6, 32, 0,
    7, 0, 36, 0, 8, 26, 0, 47, 17, 11, 1, 32, 0, 8, 16, 0, 43, 0, 30, 27, 33, 0,
    9, 48, 6, 32, 0, 2, 0, 16, 0, 42, 0, 46, 27, 0, 41, 32, 1, 110, 32, 0, 9,
    26, 27, 0, 35, 32, 1, 110, 0, 24, 26, 26, 0, 35, 1, 225, 26, 34, 0, 7, 32,
    1, 92, 16, 21, 0, 36, 0, 31, 0, 31, 0, 6, 26, 26, 26, 20, 0, 31, 34, 0, 9,
    26, 20, 11, 2, 0, 44, 0, 24, 0, 40, 0, 22, 27, 0, 22, 0, 47, 21, 27, 34, 0,
    6, 17, 0, 1, 34, 0, 2, 0, 31, 0, 46, 26, 16, 34, 0, 8, 16, 17, 7, 32, 0, 1,
    32, 1, 7, 16, 0, 5, 0, 208, 17, 6, 34, 0, 1, 32, 1, 112, 32, 1, 113, 11, 2,
    0, 44, 32, 0, 2, 32, 1, 83, 16, 0, 13, 0, 49, 17, 27, 34, 0, 2, 17, 7, 32,
    0, 1, 0, 12, 16, 0, 12, 0, 47, 17, 32, 1, 148, 16, 6, 32, 0, 1, 0, 31, 0,
    12, 0, 12, 0, 47, 21, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 32, 1, 149, 16, 6,
    32, 0, 1, 32, 1, 81, 16, 33, 0, 3, 48, 6, 32, 0, 3, 0, 31, 0, 12, 0, 22, 0,
    47, 21, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 32, 1, 148, 16, 6, 32, 0, 3, 0,
    31, 32, 1, 10, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 32, 1, 149, 16, 6, 32, 0,
    1, 0, 31, 0, 22, 0, 20, 0, 46, 21, 0, 45, 0, 36, 1, 226, 26, 27, 26, 16, 6,
    32, 0, 3, 0, 3, 16, 33, 0, 4, 48, 6, 32, 0, 4, 0, 31, 0, 47, 0, 43, 0, 13,
    27, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 32, 1, 149, 16, 6, 34, 0, 4, 0, 31,
    0, 7, 0, 42, 0, 47, 27, 26, 16, 32, 1, 2, 16, 33, 0, 5, 48, 6, 32, 0, 5, 0,
    31, 0, 52, 26, 16, 0, 26, 34, 0, 1, 0, 31, 0, 22, 26, 16, 32, 1, 2, 16, 17,
    0, 30, 34, 0, 5, 0, 26, 34, 0, 3, 17, 32, 1, 16, 16, 17, 7, 32, 0, 2, 0, 12,
    16, 0, 12, 0, 47, 17, 32, 1, 148, 16, 6, 32, 0, 2, 0, 31, 32, 1, 10, 26, 16,
    0, 36, 0, 8, 26, 0, 47, 17, 32, 1, 148, 16, 6, 32, 0, 2, 0, 3, 16, 33, 0, 3,
    48, 6, 32, 0, 1, 0, 22, 0, 41, 0, 12, 27, 32, 0, 3, 17, 32, 1, 149, 16, 6,
    32, 0, 1, 0, 31, 0, 22, 26, 16, 32, 1, 15, 32, 0, 3, 17, 32, 1, 149, 16, 6,
    34, 0, 1, 32, 1, 94, 16, 0, 30, 34, 0, 2, 0, 4, 34, 0, 3, 17, 32, 1, 16, 16,
    17, 7, 32, 0, 1, 0, 12, 16, 0, 23, 0, 47, 17, 0, 5, 0, 209, 17, 6, 32, 0, 1,
    32, 1, 13, 16, 33, 0, 1, 49, 6, 32, 0, 1, 0, 22, 16, 0, 53, 0, 43, 0, 13,
    27, 0, 8, 0, 13, 0, 42, 0, 47, 27, 21, 16, 0, 5, 0, 210, 17, 6, 32, 0, 1, 0,
    31, 32, 1, 9, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 211, 17, 6, 34,
    0, 2, 0, 31, 0, 25, 0, 8, 0, 34, 0, 9, 0, 40, 0, 11, 27, 26, 21, 0, 34, 0,
    7, 26, 0, 47, 21, 0, 6, 0, 7, 21, 0, 42, 32, 0, 1, 0, 22, 16, 27, 26, 16, 0,
    34, 0, 30, 26, 34, 0, 1, 17, 7, 34, 0, 1, 32, 1, 117, 0, 47, 0, 46, 11, 2,
    0, 38, 0, 49, 11, 1, 27, 21, 7, 32, 0, 1, 32, 1, 118, 34, 0, 5, 26, 32, 0,
    2, 19, 33, 0, 6, 48, 0, 31, 0, 21, 0, 42, 0, 46, 27, 26, 16, 33, 0, 7, 48,
    6, 34, 0, 4, 33, 0, 8, 48, 6, 1, 227, 0, 38, 1, 228, 27, 33, 0, 9, 48, 6, 0,
    46, 33, 0, 10, 48, 6, 1, 229, 33, 0, 11, 48, 6, 1, 230, 33, 0, 12, 48, 6, 1,
    231, 33, 0, 13, 48, 6, 1, 232, 33, 0, 14, 48, 6, 34, 0, 1, 32, 0, 14, 34, 0,
    6, 26, 34, 0, 2, 19, 7, 0, 24, 0, 25, 11, 2, 0, 44, 0, 20, 27, 33, 0, 6, 48,
    6, 32, 0, 1, 32, 1, 118, 34, 0, 5, 26, 0, 35, 0, 7, 0, 43, 32, 0, 6, 27, 34,
    0, 6, 0, 7, 0, 25, 21, 11, 2, 0, 44, 0, 24, 0, 13, 0, 46, 21, 27, 26, 0, 12,
    0, 41, 0, 27, 27, 21, 32, 0, 2, 19, 33, 0, 7, 48, 6, 34, 0, 1, 32, 1, 105,
    32, 0, 7, 0, 16, 0, 42, 0, 22, 0, 34, 0, 7, 26, 0, 47, 21, 27, 16, 17, 32,
    1, 77, 34, 0, 4, 26, 34, 0, 2, 32, 1, 105, 34, 0, 7, 0, 16, 0, 46, 17, 19,
    19, 32, 1, 89, 16, 7, 34, 0, 4, 33, 0, 6, 48, 6, 0, 46, 1, 233, 0, 38, 0,
    33, 1, 234, 26, 27, 32, 0, 2, 19, 33, 0, 7, 48, 6, 32, 0, 1, 34, 0, 5, 34,
    0, 2, 19, 33, 0, 8, 48, 6, 1, 235, 33, 0, 9, 48, 6, 34, 0, 1, 34, 0, 9, 1,
    236, 11, 2, 0, 44, 32, 0, 8, 32, 1, 10, 16, 27, 16, 7, 32, 0, 2, 32, 1, 122,
    32, 0, 1, 17, 0, 11, 16, 0, 8, 34, 0, 2, 17, 0, 7, 34, 0, 1, 17, 7, 32, 0,
    2, 32, 1, 134, 16, 0, 34, 32, 1, 138, 26, 0, 47, 17, 33, 0, 3, 48, 6, 32, 0,
    3, 32, 1, 136, 0, 46, 17, 0, 5, 0, 215, 17, 6, 32, 0, 1, 32, 1, 134, 16, 32,
    1, 136, 34, 0, 3, 17, 0, 5, 0, 216, 17, 6, 34, 0, 1, 32, 1, 140, 0, 42, 32,
    0, 2, 27, 0, 15, 0, 40, 32, 1, 46, 27, 0, 15, 32, 1, 84, 21, 0, 43, 0, 35,
    0, 27, 26, 27, 20, 0, 41, 32, 1, 140, 27, 34, 0, 2, 17, 7, 34, 0, 1, 32, 1,
    147, 16, 7, 34, 0, 1, 32, 1, 3, 16, 7, 34, 0, 1, 32, 1, 147, 16, 7, 32, 0,
    2, 0, 43, 32, 0, 1, 27, 0, 38, 34, 0, 2, 34, 0, 1, 20, 27, 7, 34, 0, 1, 33,
    0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48, 6, 32, 1, 143, 32, 1, 139,
    20, 33, 0, 7, 48, 6, 34, 0, 6, 1, 237, 1, 238, 0, 33, 32, 1, 150, 26, 11, 2,
    0, 44, 0, 24, 0, 40, 32, 0, 7, 27, 27, 11, 2, 0, 44, 0, 25, 0, 40, 34, 0, 7,
    27, 27, 34, 0, 4, 17, 7, 34, 0, 1, 32, 1, 3, 16, 7, 34, 0, 1, 32, 1, 157,
    16, 7, 34, 0, 1, 32, 1, 164, 16, 7, 34, 0, 2, 34, 0, 1, 16, 7, 34, 0, 1, 32,
    1, 167, 16, 7, 34, 0, 2, 0, 36, 34, 0, 1, 26, 16, 7, 0, 24, 32, 1, 83, 0,
    40, 32, 1, 149, 27, 34, 0, 1, 21, 0, 25, 0, 24, 21, 7, 32, 0, 1, 34, 0, 4,
    32, 0, 2, 19, 33, 0, 6, 48, 6, 32, 0, 6, 34, 0, 5, 34, 0, 2, 19, 32, 1, 83,
    34, 0, 1, 17, 32, 1, 149, 16, 6, 34, 0, 6, 7, 32, 1, 134, 0, 42, 0, 47, 27,
    32, 1, 129, 32, 1, 134, 0, 42, 0, 46, 27, 21, 33, 0, 3, 48, 6, 32, 0, 1, 32,
    0, 3, 16, 32, 1, 149, 16, 6, 32, 0, 2, 34, 0, 3, 16, 32, 1, 148, 16, 6, 34,
    0, 2, 32, 1, 133, 34, 0, 1, 17, 7, 32, 0, 1, 32, 1, 7, 16, 32, 1, 149, 16,
    6, 32, 0, 1, 32, 1, 134, 16, 32, 1, 134, 0, 46, 17, 32, 1, 149, 16, 6, 34,
    0, 1, 0, 15, 16, 0, 16, 0, 46, 17, 7, 32, 0, 2, 32, 1, 134, 0, 41, 32, 1,
    138, 27, 32, 0, 1, 17, 33, 0, 3, 48, 6, 32, 0, 3, 0, 47, 0, 43, 32, 1, 136,
    27, 32, 1, 128, 32, 1, 136, 0, 42, 0, 46, 27, 21, 16, 32, 1, 149, 16, 6, 32,
    0, 2, 32, 1, 133, 0, 47, 11, 2, 0, 44, 32, 0, 3, 27, 16, 33, 0, 4, 48, 6,
    32, 0, 1, 32, 1, 133, 16, 32, 1, 136, 32, 0, 4, 17, 32, 1, 149, 16, 6, 32,
    0, 1, 32, 1, 155, 0, 42, 32, 0, 4, 27, 32, 1, 153, 11, 2, 0, 44, 34, 0, 3,
    27, 16, 32, 1, 83, 34, 0, 2, 32, 1, 11, 16, 17, 32, 1, 149, 16, 6, 34, 0, 1,
    32, 1, 156, 34, 0, 4, 17, 7, 32, 0, 1, 32, 1, 133, 16, 32, 1, 134, 0, 49,
    17, 32, 1, 149, 16, 6, 32, 0, 1, 32, 1, 153, 16, 32, 1, 83, 34, 0, 2, 19,
    32, 1, 149, 16, 6, 34, 0, 1, 32, 1, 153, 0, 47, 17, 7, 32, 0, 1, 32, 1, 133,
    16, 32, 1, 134, 0, 47, 17, 32, 1, 149, 16, 6, 34, 0, 1, 32, 1, 153, 16, 7,
    32, 0, 1, 32, 1, 84, 16, 32, 1, 83, 0, 49, 11, 1, 17, 32, 1, 149, 16, 6, 32,
    0, 1, 0, 16, 0, 46, 17, 32, 1, 83, 34, 0, 2, 19, 32, 1, 149, 16, 6, 34, 0,
    1, 0, 16, 0, 47, 17, 7, 32, 0, 1, 32, 1, 84, 16, 32, 1, 83, 0, 47, 11, 1,
    17, 32, 1, 149, 16, 6, 34, 0, 1, 0, 16, 0, 46, 17, 7, 34, 0, 1, 32, 1, 158,
    16, 7, 0, 24, 0, 40, 32, 1, 83, 27, 32, 1, 131, 0, 46, 21, 32, 1, 149, 20,
    0, 25, 32, 1, 160, 32, 1, 142, 34, 0, 1, 26, 26, 21, 7, 0, 24, 0, 40, 32, 1,
    83, 27, 32, 1, 131, 0, 46, 21, 32, 1, 149, 20, 0, 25, 0, 46, 0, 40, 32, 1,
    148, 27, 0, 38, 32, 1, 159, 32, 1, 142, 34, 0, 1, 26, 26, 27, 21, 7, 0, 24,
    0, 40, 32, 1, 134, 27, 32, 1, 131, 0, 46, 21, 32, 1, 149, 20, 0, 25, 32, 1,
    171, 32, 1, 142, 34, 0, 1, 26, 0, 24, 0, 42, 32, 1, 7, 0, 40, 32, 1, 149,
    27, 27, 20, 26, 21, 7, 32, 1, 160, 32, 1, 142, 34, 0, 1, 26, 26, 7, 0, 24,
    0, 40, 32, 1, 134, 27, 32, 1, 131, 0, 46, 21, 32, 1, 149, 20, 0, 25, 0, 24,
    32, 0, 1, 32, 1, 162, 21, 0, 38, 32, 1, 133, 32, 1, 131, 0, 47, 21, 0, 45,
    32, 1, 156, 0, 42, 0, 47, 27, 34, 0, 1, 32, 1, 156, 0, 42, 0, 52, 27, 21,
    32, 1, 161, 32, 1, 153, 21, 27, 27, 21, 7, 32, 1, 142, 34, 0, 2, 26, 33, 0,
    3, 48, 6, 32, 0, 3, 0, 42, 32, 0, 1, 27, 0, 38, 34, 0, 3, 27, 32, 1, 142,
    34, 0, 1, 26, 20, 7, 34, 0, 1, 32, 1, 166, 32, 1, 142, 34, 0, 2, 26, 27, 7,
    34, 0, 1, 32, 1, 138, 16, 32, 1, 165, 34, 0, 2, 27, 7, 32, 1, 142, 34, 0, 1,
    26, 0, 38, 32, 1, 142, 34, 0, 2, 26, 27, 7, 32, 1, 142, 34, 0, 1, 26, 0, 42,
    34, 0, 2, 27, 7, 34, 0, 1, 0, 38, 32, 1, 150, 27, 7, 32, 1, 142, 32, 0, 2,
    26, 32, 1, 142, 32, 0, 1, 26, 20, 0, 38, 34, 0, 1, 0, 33, 0, 46, 0, 40, 32,
    1, 148, 27, 26, 1, 239, 11, 2, 0, 44, 0, 24, 0, 40, 32, 1, 143, 27, 27, 34,
    0, 2, 17, 27, 7, 34, 0, 4, 32, 1, 147, 16, 33, 0, 5, 48, 6, 34, 0, 1, 34, 0,
    5, 34, 0, 2, 19, 7, 32, 0, 1, 1, 240, 34, 0, 5, 32, 1, 172, 34, 0, 1, 34, 0,
    4, 32, 0, 2, 19, 17, 26, 34, 0, 2, 19, 7, 32, 0, 1, 11, 1, 0, 1, 34, 0, 1,
    17, 7, 32, 1, 131, 32, 1, 140, 32, 0, 1, 21, 32, 1, 172, 20, 33, 1, 4, 49,
    6, 34, 0, 1, 32, 1, 5, 32, 1, 6, 11, 3, 7, 34, 0, 1, 33, 2, 158, 51, 7, 34,
    0, 1, 32, 2, 4, 16, 7, 34, 0, 1, 32, 2, 4, 16, 7, 32, 0, 1, 0, 14, 0, 41,
    32, 2, 15, 27, 32, 0, 2, 19, 0, 5, 0, 103, 17, 6, 34, 0, 1, 0, 35, 34, 0, 4,
    26, 34, 0, 2, 19, 7, 32, 0, 2, 0, 14, 16, 33, 0, 5, 48, 6, 32, 0, 2, 0, 12,
    16, 33, 0, 6, 48, 6, 32, 0, 1, 0, 14, 16, 33, 0, 7, 48, 6, 32, 0, 7, 0, 28,
    32, 0, 6, 17, 32, 2, 15, 34, 0, 5, 17, 0, 5, 0, 104, 17, 6, 32, 0, 7, 0, 29,
    34, 0, 6, 17, 0, 36, 0, 8, 26, 0, 47, 17, 33, 0, 8, 48, 6, 34, 0, 2, 0, 15,
    16, 33, 0, 9, 48, 0, 22, 16, 33, 0, 10, 48, 6, 34, 0, 1, 0, 15, 16, 33, 0,
    11, 48, 6, 0, 46, 0, 21, 32, 0, 10, 17, 0, 8, 32, 0, 8, 17, 0, 17, 0, 41, 0,
    31, 0, 33, 34, 0, 11, 26, 0, 16, 0, 6, 0, 42, 0, 8, 0, 42, 34, 0, 8, 27, 27,
    21, 34, 0, 4, 34, 0, 9, 0, 43, 0, 16, 27, 21, 26, 27, 34, 0, 10, 17, 0, 15,
    34, 0, 7, 17, 7, 34, 0, 1, 32, 1, 2, 34, 0, 2, 19, 7, 34, 0, 1, 0, 31, 32,
    1, 2, 0, 42, 0, 33, 34, 0, 2, 26, 27, 26, 16, 7, 34, 0, 2, 0, 31, 0, 33, 34,
    0, 1, 26, 0, 43, 32, 1, 2, 27, 26, 16, 7, 34, 0, 1, 0, 31, 32, 1, 2, 26, 16,
    7, 34, 0, 1, 32, 1, 2, 34, 0, 2, 19, 7, 34, 0, 1, 32, 2, 29, 32, 1, 2, 26,
    34, 0, 2, 19, 7, 0, 27, 0, 16, 0, 23, 21, 0, 27, 32, 2, 32, 21, 33, 0, 3,
    48, 6, 32, 0, 1, 0, 22, 0, 41, 32, 0, 3, 27, 32, 0, 2, 19, 33, 0, 4, 33, 0,
    5, 12, 2, 48, 6, 34, 0, 1, 1, 241, 0, 41, 1, 242, 27, 34, 0, 2, 19, 33, 0,
    6, 48, 6, 32, 0, 4, 34, 0, 6, 11, 2, 7, 34, 0, 2, 33, 0, 3, 48, 6, 34, 0, 1,
    33, 0, 4, 48, 6, 1, 243, 32, 1, 6, 11, 2, 0, 44, 0, 12, 0, 42, 32, 1, 7, 27,
    27, 33, 0, 5, 48, 6, 0, 46, 32, 0, 5, 16, 7, 34, 0, 1, 0, 12, 0, 42, 0, 46,
    27, 0, 45, 34, 0, 2, 27, 20, 7, 0, 34, 34, 0, 1, 26, 7, 32, 1, 3, 0, 16, 32,
    0, 1, 17, 34, 0, 4, 16, 0, 47, 0, 13, 34, 0, 1, 17, 0, 45, 1, 244, 34, 0, 5,
    26, 27, 34, 0, 2, 19, 7, 32, 0, 2, 0, 12, 16, 0, 34, 0, 7, 26, 0, 47, 17,
    33, 0, 3, 48, 0, 7, 32, 0, 1, 0, 12, 16, 17, 33, 0, 4, 48, 6, 34, 0, 3, 0,
    13, 0, 46, 17, 0, 5, 0, 106, 17, 6, 32, 0, 4, 0, 13, 0, 46, 17, 0, 5, 0,
    107, 17, 6, 32, 0, 2, 32, 2, 14, 0, 47, 17, 33, 0, 5, 48, 6, 32, 0, 2, 0,
    22, 16, 33, 0, 6, 48, 6, 32, 0, 1, 32, 2, 11, 16, 33, 0, 1, 49, 6, 32, 0, 1,
    32, 2, 14, 32, 0, 4, 17, 33, 0, 7, 48, 6, 32, 0, 1, 0, 14, 16, 0, 28, 34, 0,
    4, 17, 33, 0, 8, 48, 0, 36, 0, 8, 26, 0, 47, 17, 33, 0, 9, 48, 6, 34, 0, 1,
    0, 15, 0, 41, 1, 245, 1, 246, 11, 2, 0, 44, 32, 0, 6, 0, 20, 0, 46, 17, 27,
    27, 34, 0, 2, 17, 0, 15, 34, 0, 8, 17, 7, 32, 0, 1, 0, 12, 16, 0, 13, 0, 47,
    17, 0, 5, 0, 105, 17, 6, 32, 0, 1, 0, 22, 16, 33, 0, 3, 48, 6, 34, 0, 1, 32,
    0, 3, 0, 40, 0, 17, 27, 1, 247, 11, 2, 0, 44, 32, 0, 3, 0, 13, 0, 49, 17,
    27, 16, 7, 32, 0, 2, 0, 12, 16, 0, 34, 0, 7, 26, 0, 47, 17, 33, 0, 3, 48, 6,
    32, 0, 3, 0, 13, 0, 46, 17, 0, 5, 0, 109, 17, 6, 32, 0, 1, 0, 12, 16, 0, 13,
    32, 0, 3, 17, 0, 5, 0, 110, 17, 6, 32, 0, 2, 0, 22, 16, 33, 0, 4, 48, 6, 32,
    0, 2, 32, 2, 14, 0, 47, 17, 33, 0, 5, 48, 0, 36, 0, 8, 26, 0, 47, 17, 33, 0,
    6, 48, 6, 32, 0, 1, 0, 12, 16, 0, 34, 0, 7, 26, 34, 0, 3, 17, 33, 0, 7, 48,
    6, 32, 0, 1, 0, 14, 16, 0, 28, 32, 0, 7, 17, 33, 0, 8, 48, 0, 36, 0, 8, 26,
    0, 47, 17, 33, 0, 9, 48, 6, 34, 0, 1, 1, 248, 1, 249, 11, 2, 0, 44, 0, 46,
    32, 2, 14, 0, 42, 34, 0, 7, 27, 32, 2, 15, 34, 0, 5, 21, 11, 2, 0, 44, 32,
    0, 6, 0, 8, 32, 0, 4, 17, 0, 20, 0, 46, 17, 33, 0, 10, 48, 27, 27, 34, 0, 2,
    17, 0, 15, 34, 0, 8, 17, 7, 0, 17, 0, 43, 0, 31, 0, 6, 26, 0, 42, 0, 31, 32,
    0, 1, 0, 43, 0, 8, 27, 26, 27, 27, 33, 0, 3, 48, 6, 32, 0, 2, 32, 0, 3, 33,
    1, 5, 50, 6, 34, 0, 2, 0, 7, 34, 0, 1, 17, 0, 6, 0, 47, 17, 0, 18, 0, 46,
    17, 34, 0, 3, 33, 1, 7, 50, 7, 32, 0, 1, 0, 7, 32, 1, 3, 17, 0, 17, 16, 0,
    31, 0, 6, 0, 42, 34, 0, 1, 27, 26, 16, 7, 34, 0, 1, 0, 5, 32, 1, 4, 21, 0,
    25, 0, 24, 21, 7, 32, 1, 4, 0, 8, 32, 0, 1, 17, 0, 6, 34, 0, 2, 32, 2, 55,
    34, 0, 1, 19, 19, 33, 1, 4, 49, 7, 32, 0, 2, 0, 12, 16, 0, 23, 0, 47, 17, 0,
    5, 32, 1, 10, 17, 6, 32, 0, 2, 32, 1, 13, 16, 6, 32, 0, 2, 0, 15, 16, 33, 0,
    2, 49, 0, 22, 16, 33, 0, 3, 48, 6, 32, 0, 1, 0, 12, 16, 0, 13, 32, 0, 3, 17,
    0, 5, 32, 1, 11, 17, 6, 32, 0, 1, 0, 14, 16, 33, 0, 4, 48, 0, 28, 32, 0, 3,
    17, 33, 0, 5, 48, 0, 35, 32, 1, 7, 26, 34, 0, 2, 17, 33, 0, 6, 48, 6, 32, 0,
    5, 1, 250, 1, 251, 11, 2, 0, 44, 32, 0, 6, 0, 31, 0, 15, 0, 40, 0, 22, 27,
    26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 20, 0, 46, 17, 27, 34, 0, 6, 17, 33,
    0, 7, 48, 6, 34, 0, 1, 0, 15, 34, 0, 4, 0, 29, 34, 0, 3, 17, 0, 26, 34, 0,
    5, 0, 36, 0, 8, 26, 0, 47, 17, 11, 1, 17, 17, 0, 30, 34, 0, 7, 17, 7, 32, 0,
    1, 0, 12, 16, 0, 13, 0, 47, 17, 0, 5, 32, 1, 9, 17, 6, 34, 0, 1, 32, 1, 6,
    34, 0, 2, 19, 7, 34, 0, 2, 0, 12, 32, 1, 4, 17, 7, 32, 1, 3, 0, 6, 33, 1, 4,
    50, 6, 34, 0, 1, 0, 6, 0, 47, 17, 7, 34, 0, 1, 0, 38, 34, 0, 2, 27, 7, 34,
    0, 1, 0, 1, 0, 46, 21, 7, 34, 0, 1, 0, 1, 34, 0, 2, 23, 7, 32, 0, 2, 0, 37,
    34, 0, 1, 32, 2, 75, 34, 0, 2, 17, 27, 7, 34, 0, 1, 0, 12, 0, 42, 32, 1, 4,
    27, 0, 7, 0, 47, 21, 0, 45, 1, 252, 27, 16, 6, 32, 1, 5, 0, 16, 0, 47, 0, 6,
    32, 1, 3, 17, 33, 1, 3, 49, 17, 7, 34, 0, 1, 7, 0, 33, 32, 1, 0, 26, 34, 0,
    1, 11, 2, 0, 44, 34, 0, 4, 0, 7, 0, 47, 21, 0, 41, 0, 8, 0, 38, 0, 24, 27,
    27, 27, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48, 6,
    34, 0, 4, 0, 15, 16, 0, 16, 32, 0, 5, 17, 33, 0, 7, 48, 6, 34, 0, 3, 11, 0,
    34, 0, 5, 11, 1, 0, 43, 0, 26, 27, 11, 2, 0, 44, 32, 2, 7, 27, 16, 32, 0, 7,
    34, 0, 7, 0, 46, 0, 14, 0, 40, 0, 24, 0, 36, 0, 8, 26, 0, 47, 21, 0, 17, 20,
    0, 43, 0, 15, 27, 27, 0, 1, 0, 59, 21, 11, 2, 0, 44, 32, 2, 7, 27, 16, 34,
    0, 6, 11, 4, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48,
    6, 1, 253, 33, 0, 7, 48, 6, 34, 0, 5, 0, 31, 1, 254, 32, 2, 3, 0, 16, 0, 47,
    21, 11, 2, 0, 44, 32, 1, 9, 27, 32, 1, 5, 0, 47, 21, 34, 0, 7, 20, 26, 16,
    33, 0, 8, 48, 6, 11, 0, 0, 59, 34, 0, 8, 0, 47, 0, 47, 11, 2, 11, 4, 7, 34,
    0, 1, 33, 0, 5, 33, 0, 6, 33, 0, 7, 12, 2, 12, 2, 48, 6, 34, 0, 4, 32, 1, 5,
    32, 0, 6, 0, 20, 0, 46, 17, 17, 34, 0, 6, 0, 12, 0, 49, 17, 0, 45, 32, 1, 6,
    27, 16, 33, 0, 8, 33, 0, 9, 33, 0, 10, 33, 0, 11, 33, 0, 12, 12, 2, 12, 4,
    48, 6, 34, 0, 10, 34, 0, 5, 34, 0, 2, 19, 32, 0, 7, 0, 20, 0, 46, 17, 0, 45,
    32, 1, 9, 0, 7, 0, 47, 21, 0, 45, 1, 255, 27, 27, 16, 7, 34, 0, 1, 32, 2, 3,
    16, 7, 32, 1, 7, 0, 52, 34, 0, 1, 11, 1, 0, 46, 0, 46, 0, 46, 11, 2, 11, 4,
    26, 7, 0, 46, 33, 0, 3, 48, 6, 0, 46, 33, 0, 4, 48, 6, 1, 256, 33, 0, 5, 48,
    6, 34, 0, 1, 32, 2, 30, 0, 25, 32, 1, 8, 20, 0, 45, 1, 257, 1, 258, 11, 2,
    0, 44, 0, 25, 0, 16, 0, 46, 21, 0, 22, 20, 0, 20, 0, 46, 21, 27, 0, 42, 0,
    16, 0, 42, 0, 47, 27, 27, 27, 0, 42, 32, 2, 3, 27, 26, 16, 33, 0, 6, 48, 6,
    32, 1, 7, 11, 0, 0, 59, 34, 0, 6, 32, 0, 3, 32, 0, 4, 11, 2, 11, 4, 26, 7,
    34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48, 6, 34, 0, 5, 0,
    31, 1, 259, 26, 16, 7, 34, 0, 2, 34, 0, 1, 11, 2, 0, 31, 32, 2, 3, 0, 16, 0,
    47, 21, 32, 1, 5, 0, 47, 21, 26, 16, 33, 0, 5, 48, 0, 31, 0, 16, 0, 42, 0,
    46, 27, 26, 16, 33, 0, 6, 33, 0, 7, 12, 2, 48, 0, 36, 0, 18, 0, 27, 0, 11,
    21, 26, 16, 33, 0, 8, 33, 0, 9, 12, 2, 48, 6, 34, 0, 8, 0, 17, 16, 0, 31,
    34, 0, 7, 0, 43, 0, 16, 27, 0, 12, 34, 0, 6, 0, 43, 0, 16, 27, 21, 26, 16,
    0, 32, 0, 8, 26, 16, 0, 36, 0, 6, 26, 0, 46, 17, 33, 0, 10, 48, 6, 34, 0, 5,
    0, 36, 32, 1, 13, 0, 41, 32, 0, 4, 27, 32, 1, 12, 20, 0, 24, 0, 16, 0, 53,
    21, 0, 41, 0, 35, 0, 18, 26, 27, 0, 27, 0, 16, 0, 42, 0, 49, 27, 0, 41, 34,
    0, 4, 27, 21, 0, 26, 0, 24, 0, 28, 0, 49, 21, 21, 1, 260, 20, 11, 2, 0, 44,
    34, 0, 9, 0, 12, 34, 0, 10, 17, 27, 26, 16, 7, 32, 0, 1, 32, 1, 9, 0, 45,
    32, 2, 3, 0, 16, 0, 47, 21, 32, 1, 5, 0, 47, 21, 0, 40, 32, 1, 13, 27, 27,
    0, 41, 34, 0, 1, 27, 32, 1, 12, 20, 11, 2, 0, 44, 32, 1, 9, 0, 41, 0, 6, 27,
    0, 20, 0, 46, 21, 27, 7, 0, 46, 0, 17, 16, 33, 0, 6, 48, 6, 1, 261, 33, 0,
    7, 48, 6, 1, 262, 33, 0, 8, 48, 6, 1, 263, 33, 0, 9, 48, 6, 34, 0, 1, 32, 1,
    9, 34, 0, 7, 20, 0, 45, 32, 2, 3, 0, 16, 0, 47, 21, 32, 1, 5, 0, 47, 21, 27,
    0, 41, 34, 0, 5, 34, 0, 9, 34, 0, 4, 27, 27, 34, 0, 2, 19, 7, 32, 0, 1, 32,
    2, 118, 34, 0, 5, 26, 32, 0, 2, 19, 33, 0, 6, 48, 6, 34, 0, 4, 33, 0, 7, 48,
    6, 1, 264, 0, 38, 1, 265, 27, 33, 0, 8, 48, 6, 32, 0, 6, 0, 31, 0, 21, 0,
    42, 0, 46, 27, 32, 2, 129, 0, 12, 0, 42, 0, 50, 27, 21, 26, 16, 0, 36, 0, 8,
    26, 0, 47, 17, 0, 5, 0, 148, 17, 6, 1, 266, 33, 0, 9, 48, 6, 1, 267, 33, 0,
    10, 48, 6, 1, 268, 1, 269, 34, 0, 10, 11, 3, 33, 0, 11, 48, 6, 1, 270, 33,
    0, 12, 48, 6, 34, 0, 1, 32, 0, 12, 34, 0, 6, 26, 34, 0, 2, 19, 7, 32, 0, 1,
    1, 271, 34, 0, 1, 34, 0, 4, 11, 2, 26, 11, 2, 0, 44, 0, 24, 32, 1, 9, 20,
    27, 7, 32, 0, 1, 32, 1, 10, 16, 0, 38, 34, 0, 1, 32, 1, 18, 34, 0, 4, 26,
    16, 27, 7, 32, 0, 1, 32, 1, 18, 34, 0, 4, 26, 16, 0, 38, 34, 0, 1, 32, 1,
    10, 16, 27, 7, 34, 0, 1, 33, 0, 3, 48, 6, 1, 272, 7, 32, 0, 1, 32, 1, 2, 0,
    38, 1, 273, 32, 0, 1, 34, 0, 4, 11, 2, 26, 27, 34, 0, 1, 32, 1, 12, 20, 11,
    3, 0, 44, 32, 1, 9, 0, 41, 0, 6, 27, 27, 7, 32, 0, 1, 32, 1, 18, 0, 47, 0,
    47, 11, 2, 26, 16, 0, 38, 34, 0, 1, 32, 1, 18, 0, 47, 0, 49, 11, 2, 26, 16,
    27, 7, 32, 0, 1, 32, 1, 2, 0, 38, 1, 274, 32, 0, 1, 34, 0, 4, 11, 2, 26, 27,
    32, 1, 14, 34, 0, 1, 26, 11, 3, 0, 44, 32, 1, 9, 0, 41, 0, 6, 27, 27, 7, 34,
    0, 1, 33, 0, 3, 48, 6, 1, 275, 7, 34, 0, 1, 6, 1, 276, 7, 34, 0, 1, 33, 0,
    3, 48, 6, 1, 277, 7, 34, 0, 1, 33, 0, 3, 48, 6, 1, 278, 7, 34, 0, 1, 34, 0,
    2, 20, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 12, 3, 48, 6, 34, 0, 5,
    34, 0, 4, 34, 0, 3, 21, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 12, 2, 48, 6, 34,
    0, 4, 34, 0, 3, 26, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 12, 3, 48, 6,
    34, 0, 5, 34, 0, 4, 34, 0, 3, 27, 7, 34, 0, 1, 32, 2, 3, 16, 7, 32, 0, 1,
    32, 1, 24, 16, 33, 0, 3, 48, 6, 34, 0, 1, 34, 0, 3, 16, 7, 34, 0, 1, 0, 29,
    0, 47, 17, 0, 31, 32, 1, 27, 26, 16, 7, 0, 33, 34, 0, 1, 0, 16, 0, 47, 17,
    26, 7, 0, 46, 34, 0, 1, 11, 2, 0, 44, 34, 0, 2, 27, 7, 34, 0, 2, 33, 0, 3,
    33, 0, 4, 12, 2, 48, 6, 0, 47, 33, 0, 5, 48, 6, 0, 46, 0, 47, 1, 279, 0, 36,
    0, 18, 26, 0, 46, 21, 0, 6, 0, 47, 21, 11, 2, 0, 44, 34, 0, 4, 27, 11, 2, 0,
    44, 32, 2, 7, 27, 33, 0, 6, 48, 6, 32, 0, 1, 32, 0, 6, 16, 33, 0, 7, 48, 6,
    34, 0, 3, 0, 27, 0, 41, 0, 27, 27, 0, 33, 32, 1, 0, 26, 0, 15, 0, 41, 0, 27,
    27, 11, 2, 0, 44, 32, 1, 28, 27, 1, 280, 11, 3, 0, 44, 34, 0, 7, 0, 11, 0,
    49, 17, 27, 34, 0, 1, 17, 7, 34, 0, 1, 34, 0, 5, 0, 45, 32, 1, 31, 32, 0, 4,
    26, 27, 16, 33, 0, 6, 33, 0, 7, 12, 2, 48, 6, 34, 0, 4, 33, 0, 8, 33, 0, 9,
    12, 2, 48, 6, 1, 281, 33, 0, 10, 48, 6, 1, 282, 33, 0, 11, 48, 6, 1, 283, 0,
    42, 0, 46, 27, 33, 0, 12, 48, 6, 34, 0, 9, 0, 33, 32, 0, 7, 26, 0, 16, 0,
    46, 21, 34, 0, 12, 11, 2, 0, 44, 32, 0, 8, 0, 40, 32, 2, 7, 27, 27, 16, 7,
    34, 0, 4, 33, 0, 5, 33, 0, 6, 12, 2, 48, 6, 34, 0, 1, 33, 0, 7, 48, 6, 32,
    0, 7, 0, 16, 0, 46, 17, 0, 31, 32, 2, 3, 0, 16, 0, 47, 21, 0, 16, 0, 46, 21,
    0, 16, 0, 46, 21, 0, 52, 11, 2, 0, 44, 0, 0, 0, 12, 0, 47, 21, 27, 26, 16,
    33, 0, 8, 48, 0, 3, 16, 33, 0, 9, 48, 6, 32, 0, 7, 0, 31, 0, 30, 0, 42, 32,
    0, 8, 0, 4, 32, 0, 9, 17, 27, 26, 16, 33, 0, 10, 33, 0, 11, 12, 2, 48, 6, 0,
    46, 33, 0, 12, 48, 6, 34, 0, 10, 0, 31, 32, 2, 3, 0, 16, 0, 47, 21, 0, 40,
    0, 24, 0, 16, 0, 49, 21, 0, 24, 0, 29, 0, 47, 21, 0, 26, 0, 24, 0, 16, 0,
    46, 21, 0, 29, 0, 47, 21, 0, 27, 20, 21, 1, 284, 20, 11, 2, 0, 44, 0, 24, 0,
    16, 0, 46, 21, 0, 22, 20, 0, 20, 0, 47, 21, 27, 27, 26, 16, 33, 0, 13, 48,
    6, 0, 46, 33, 0, 14, 48, 6, 1, 285, 33, 0, 15, 48, 6, 32, 0, 9, 0, 31, 0,
    20, 0, 42, 0, 46, 27, 26, 16, 32, 2, 2, 16, 0, 31, 34, 0, 9, 0, 43, 0, 16,
    27, 34, 0, 15, 20, 1, 286, 34, 0, 6, 0, 15, 16, 0, 43, 0, 16, 27, 21, 0, 27,
    0, 24, 21, 26, 16, 33, 0, 16, 48, 6, 34, 0, 7, 0, 31, 0, 30, 0, 42, 34, 0,
    8, 0, 31, 0, 12, 0, 42, 0, 52, 27, 26, 16, 32, 2, 2, 16, 27, 26, 16, 33, 0,
    17, 48, 6, 0, 49, 0, 17, 16, 0, 31, 1, 287, 26, 16, 7, 32, 0, 1, 32, 0, 5,
    0, 41, 34, 0, 4, 27, 34, 0, 2, 19, 33, 0, 6, 48, 6, 32, 0, 1, 32, 1, 11, 16,
    1, 288, 0, 42, 32, 1, 27, 27, 32, 0, 5, 17, 33, 0, 7, 48, 6, 34, 0, 7, 0,
    46, 32, 1, 0, 0, 46, 0, 46, 11, 2, 11, 3, 32, 2, 3, 0, 16, 0, 47, 21, 0, 30,
    0, 46, 0, 49, 0, 53, 11, 3, 21, 11, 2, 0, 44, 32, 1, 9, 27, 16, 33, 0, 8,
    33, 0, 9, 33, 0, 10, 33, 0, 11, 12, 2, 12, 3, 48, 6, 34, 0, 9, 32, 1, 29,
    32, 0, 6, 34, 0, 10, 11, 2, 17, 34, 0, 11, 32, 1, 30, 34, 0, 8, 34, 0, 1,
    11, 2, 27, 0, 33, 34, 0, 5, 26, 32, 2, 147, 20, 1, 289, 20, 11, 2, 0, 44,
    32, 1, 1, 27, 16, 7, 32, 1, 5, 33, 0, 3, 48, 6, 34, 0, 1, 32, 1, 6, 33, 1,
    5, 50, 6, 34, 0, 3, 7, 34, 0, 2, 33, 0, 3, 48, 6, 32, 1, 7, 0, 16, 34, 0, 1,
    17, 33, 0, 4, 48, 6, 32, 0, 4, 0, 17, 16, 0, 31, 0, 8, 0, 42, 32, 0, 3, 27,
    26, 16, 0, 34, 0, 30, 26, 32, 1, 3, 17, 0, 31, 0, 12, 26, 16, 33, 0, 5, 48,
    0, 31, 34, 0, 5, 0, 36, 0, 18, 26, 0, 46, 17, 0, 34, 0, 7, 26, 0, 47, 17, 0,
    43, 0, 7, 27, 26, 16, 33, 0, 6, 48, 6, 32, 0, 6, 0, 31, 0, 13, 0, 42, 0, 46,
    27, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 171, 17, 6, 32, 0, 6, 32,
    2, 2, 16, 0, 31, 0, 8, 0, 42, 32, 0, 3, 27, 26, 16, 33, 0, 7, 48, 0, 22, 16,
    33, 0, 8, 48, 6, 32, 0, 3, 0, 17, 16, 0, 31, 0, 6, 26, 34, 0, 7, 17, 0, 31,
    0, 6, 26, 32, 1, 8, 0, 17, 16, 0, 31, 0, 8, 0, 42, 32, 0, 3, 0, 8, 32, 0, 4,
    17, 27, 26, 16, 17, 0, 15, 16, 0, 34, 0, 30, 26, 32, 1, 5, 17, 33, 0, 9, 48,
    6, 32, 0, 3, 0, 8, 32, 0, 8, 17, 0, 17, 16, 0, 31, 0, 25, 26, 32, 1, 9, 17,
    0, 15, 16, 33, 0, 10, 48, 6, 32, 0, 9, 0, 35, 0, 22, 0, 43, 0, 20, 27, 26,
    32, 0, 10, 17, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 171, 17, 6, 34, 0, 9, 0,
    35, 0, 16, 26, 34, 0, 10, 17, 33, 0, 11, 48, 6, 34, 0, 8, 0, 17, 16, 0, 31,
    0, 8, 0, 42, 32, 0, 3, 27, 26, 16, 0, 34, 0, 30, 26, 32, 0, 11, 17, 33, 0,
    12, 48, 6, 34, 0, 3, 0, 17, 16, 0, 31, 0, 25, 26, 32, 0, 12, 17, 0, 31, 0,
    24, 26, 32, 1, 8, 0, 17, 16, 17, 0, 15, 16, 32, 2, 15, 34, 0, 11, 17, 0, 5,
    0, 172, 17, 6, 1, 290, 33, 0, 13, 48, 32, 2, 2, 16, 33, 0, 14, 48, 6, 32, 0,
    13, 32, 2, 91, 0, 6, 26, 0, 46, 17, 0, 30, 32, 0, 14, 17, 0, 35, 0, 7, 26,
    32, 0, 14, 0, 22, 16, 0, 17, 16, 17, 33, 0, 15, 48, 6, 32, 0, 6, 0, 31, 0,
    6, 26, 32, 1, 9, 17, 33, 1, 9, 49, 6, 34, 0, 15, 0, 31, 0, 24, 26, 32, 1,
    11, 17, 0, 35, 0, 6, 26, 34, 0, 13, 0, 30, 32, 0, 14, 17, 0, 31, 0, 8, 26,
    32, 1, 11, 17, 17, 33, 1, 11, 49, 6, 34, 0, 14, 0, 31, 0, 6, 0, 42, 32, 0,
    4, 0, 43, 0, 8, 27, 27, 26, 32, 1, 10, 17, 33, 1, 10, 49, 6, 34, 0, 4, 0, 8,
    33, 1, 8, 50, 7, 34, 0, 4, 0, 16, 34, 0, 1, 17, 0, 16, 34, 0, 2, 19, 7, 0,
    29, 0, 42, 0, 33, 32, 1, 12, 26, 0, 7, 0, 22, 21, 27, 33, 0, 3, 48, 6, 32,
    1, 5, 0, 16, 0, 46, 17, 32, 0, 3, 16, 33, 0, 4, 48, 6, 32, 1, 5, 0, 31, 34,
    0, 3, 32, 2, 15, 32, 0, 4, 21, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 0,
    173, 17, 6, 32, 0, 4, 0, 36, 0, 8, 26, 16, 33, 0, 5, 48, 0, 17, 16, 0, 15,
    34, 0, 4, 17, 33, 0, 6, 48, 6, 32, 0, 6, 0, 31, 0, 25, 26, 34, 0, 1, 17, 32,
    1, 13, 34, 0, 6, 0, 31, 0, 6, 0, 42, 0, 8, 0, 42, 34, 0, 5, 27, 27, 26, 34,
    0, 2, 19, 17, 7, 32, 0, 1, 0, 19, 16, 33, 0, 5, 48, 0, 20, 0, 42, 32, 0, 2,
    27, 0, 45, 34, 0, 4, 27, 16, 6, 34, 0, 5, 0, 17, 16, 0, 31, 32, 0, 1, 0, 6,
    32, 0, 2, 17, 0, 43, 0, 6, 27, 26, 0, 31, 0, 46, 0, 43, 0, 20, 27, 0, 45, 0,
    51, 27, 26, 20, 0, 31, 0, 13, 0, 42, 34, 0, 2, 27, 0, 45, 0, 51, 27, 26, 11,
    2, 0, 44, 34, 0, 1, 0, 20, 0, 46, 17, 27, 16, 7, 34, 0, 1, 6, 0, 6, 0, 18,
    0, 46, 21, 0, 17, 20, 0, 7, 0, 18, 0, 46, 21, 0, 17, 20, 0, 31, 0, 6, 26, 0,
    24, 0, 40, 0, 20, 27, 21, 11, 2, 0, 44, 0, 20, 0, 42, 0, 46, 27, 27, 7, 32,
    0, 2, 32, 2, 9, 16, 0, 5, 32, 1, 8, 17, 6, 32, 0, 2, 0, 13, 0, 46, 17, 33,
    0, 3, 48, 6, 32, 0, 1, 0, 22, 16, 0, 6, 0, 18, 0, 46, 21, 0, 11, 11, 2, 0,
    44, 32, 0, 3, 27, 32, 0, 2, 17, 33, 0, 4, 48, 6, 1, 291, 32, 0, 1, 26, 33,
    0, 5, 48, 6, 0, 47, 33, 0, 6, 48, 6, 0, 24, 33, 0, 7, 48, 6, 32, 0, 1, 0,
    12, 0, 20, 0, 47, 21, 0, 45, 1, 292, 0, 42, 32, 0, 2, 27, 27, 16, 6, 32, 0,
    1, 0, 15, 16, 0, 29, 0, 28, 11, 2, 0, 44, 32, 0, 3, 0, 12, 32, 1, 2, 17, 27,
    32, 0, 6, 0, 8, 34, 0, 4, 17, 17, 32, 1, 2, 0, 45, 0, 24, 0, 46, 0, 43, 0,
    21, 27, 0, 45, 1, 293, 27, 34, 0, 1, 0, 40, 0, 22, 27, 0, 7, 34, 0, 2, 0,
    40, 0, 19, 27, 21, 21, 27, 16, 32, 0, 7, 16, 7, 32, 0, 2, 0, 12, 16, 0, 23,
    0, 47, 17, 0, 5, 32, 1, 7, 17, 6, 32, 0, 2, 0, 15, 16, 33, 0, 2, 49, 6, 32,
    0, 2, 0, 31, 32, 2, 9, 26, 16, 0, 36, 0, 8, 26, 0, 47, 17, 0, 5, 32, 1, 8,
    17, 6, 32, 0, 2, 0, 22, 16, 33, 0, 3, 48, 6, 32, 0, 1, 32, 2, 84, 16, 0, 22,
    0, 43, 0, 21, 27, 0, 45, 1, 294, 27, 32, 0, 3, 17, 33, 0, 4, 48, 6, 1, 295,
    33, 0, 5, 48, 6, 0, 46, 0, 20, 16, 33, 0, 6, 48, 6, 0, 47, 33, 0, 7, 48, 6,
    1, 296, 33, 0, 8, 48, 6, 0, 46, 33, 0, 9, 48, 6, 34, 0, 2, 0, 35, 1, 297,
    32, 1, 5, 1, 298, 26, 34, 0, 8, 0, 25, 21, 11, 2, 0, 44, 32, 1, 4, 27, 26,
    32, 0, 4, 0, 28, 32, 0, 3, 17, 17, 33, 0, 10, 48, 6, 34, 0, 1, 0, 15, 0, 42,
    32, 0, 4, 27, 1, 299, 11, 2, 0, 44, 32, 0, 6, 0, 12, 16, 0, 20, 0, 46, 17,
    27, 16, 7, 32, 0, 1, 0, 13, 0, 46, 17, 0, 5, 0, 182, 17, 6, 32, 0, 1, 0, 23,
    0, 47, 17, 0, 5, 0, 183, 17, 6, 34, 0, 2, 32, 2, 84, 16, 0, 29, 34, 0, 1, 0,
    7, 0, 47, 17, 17, 32, 2, 15, 32, 1, 3, 17, 0, 5, 0, 184, 17, 7, 34, 0, 2, 0,
    47, 0, 22, 11, 2, 0, 44, 0, 24, 0, 12, 0, 41, 0, 13, 27, 34, 0, 1, 21, 27,
    16, 7, 34, 0, 2, 0, 17, 16, 0, 31, 34, 0, 1, 0, 1, 16, 26, 16, 7, 34, 0, 2,
    0, 17, 16, 0, 31, 34, 0, 1, 0, 1, 16, 26, 16, 7, 32, 0, 1, 0, 12, 16, 0, 13,
    32, 1, 3, 17, 0, 5, 0, 188, 17, 6, 32, 0, 2, 0, 31, 32, 2, 10, 26, 16, 0,
    36, 0, 8, 26, 16, 0, 5, 0, 189, 17, 6, 32, 0, 1, 32, 2, 84, 16, 33, 0, 3,
    48, 6, 32, 0, 2, 0, 35, 0, 7, 0, 6, 0, 47, 21, 26, 32, 0, 3, 0, 28, 32, 1,
    3, 17, 17, 33, 0, 4, 48, 6, 32, 0, 4, 0, 31, 0, 13, 0, 42, 0, 46, 27, 26,
    16, 0, 36, 0, 8, 26, 16, 0, 5, 0, 190, 17, 6, 32, 0, 3, 0, 29, 32, 1, 3, 17,
    33, 0, 5, 48, 0, 36, 0, 8, 26, 0, 47, 17, 33, 0, 6, 48, 6, 1, 300, 33, 0, 7,
    48, 6, 34, 0, 1, 1, 301, 34, 0, 7, 11, 2, 0, 44, 0, 25, 0, 36, 0, 8, 26, 32,
    0, 4, 0, 36, 0, 8, 26, 32, 0, 6, 17, 21, 0, 20, 0, 46, 21, 27, 34, 0, 2, 17,
    7, 0, 46, 0, 17, 16, 0, 25, 0, 0, 0, 13, 0, 53, 21, 0, 45, 0, 46, 27, 20, 0,
    37, 0, 24, 27, 32, 1, 6, 17, 0, 1, 16, 33, 0, 3, 48, 6, 34, 0, 1, 0, 1, 32,
    1, 7, 0, 31, 0, 33, 34, 0, 3, 26, 26, 16, 0, 34, 0, 24, 0, 37, 0, 25, 27,
    26, 32, 1, 6, 17, 17, 7, 32, 1, 7, 0, 31, 0, 6, 0, 42, 34, 0, 1, 0, 8, 32,
    1, 5, 17, 27, 26, 16, 0, 34, 0, 30, 26, 32, 1, 6, 17, 7, 32, 2, 104, 0, 42,
    0, 47, 27, 0, 41, 32, 0, 1, 32, 2, 76, 0, 35, 32, 0, 1, 26, 0, 38, 0, 31,
    34, 0, 1, 26, 27, 27, 27, 7, 32, 0, 2, 0, 22, 0, 41, 0, 12, 27, 32, 0, 1,
    19, 0, 5, 0, 191, 19, 6, 34, 0, 1, 32, 1, 6, 32, 1, 5, 26, 34, 0, 2, 19, 7,
    34, 0, 1, 32, 1, 6, 32, 1, 5, 0, 42, 0, 33, 34, 0, 2, 26, 27, 26, 16, 7, 34,
    0, 2, 32, 1, 6, 0, 33, 34, 0, 1, 26, 0, 43, 32, 1, 5, 27, 26, 16, 7, 32, 0,
    1, 32, 2, 84, 16, 0, 29, 0, 47, 17, 33, 0, 3, 48, 6, 1, 302, 33, 0, 4, 48,
    6, 32, 1, 5, 0, 33, 34, 0, 1, 26, 0, 15, 34, 0, 4, 21, 32, 2, 27, 11, 2, 0,
    44, 0, 24, 0, 40, 32, 2, 20, 27, 0, 7, 0, 47, 21, 27, 34, 0, 3, 17, 7, 34,
    0, 1, 32, 2, 104, 0, 47, 17, 0, 36, 32, 1, 5, 26, 34, 0, 2, 19, 7, 34, 0, 1,
    0, 35, 0, 24, 0, 47, 11, 2, 0, 44, 0, 25, 27, 26, 32, 1, 4, 17, 0, 36, 0, 8,
    26, 0, 47, 17, 33, 0, 3, 48, 6, 32, 0, 3, 0, 20, 0, 46, 17, 0, 5, 0, 197,
    17, 6, 32, 1, 4, 0, 22, 16, 0, 17, 16, 0, 35, 0, 8, 26, 32, 1, 4, 17, 0, 36,
    0, 6, 26, 0, 46, 17, 33, 0, 4, 48, 6, 32, 1, 3, 0, 16, 34, 0, 4, 17, 32, 2,
    108, 16, 33, 0, 5, 48, 6, 0, 48, 0, 20, 32, 0, 5, 17, 0, 5, 0, 198, 17, 6,
    0, 12, 0, 42, 0, 11, 27, 0, 5, 0, 199, 21, 0, 25, 0, 24, 21, 33, 0, 6, 48,
    6, 32, 0, 3, 0, 9, 32, 1, 7, 17, 34, 0, 6, 0, 11, 0, 18, 11, 3, 0, 44, 32,
    0, 5, 0, 11, 0, 49, 17, 27, 16, 33, 0, 7, 48, 6, 32, 1, 3, 0, 35, 0, 24, 32,
    0, 7, 11, 2, 0, 44, 0, 25, 27, 26, 32, 1, 4, 17, 33, 1, 3, 49, 6, 34, 0, 7,
    0, 8, 34, 0, 3, 17, 34, 0, 5, 0, 12, 0, 53, 17, 0, 45, 0, 20, 0, 42, 32, 1,
    7, 27, 0, 45, 1, 303, 27, 27, 16, 7, 32, 1, 7, 0, 20, 0, 46, 17, 0, 5, 0,
    200, 17, 6, 34, 0, 1, 0, 28, 1, 304, 0, 42, 0, 49, 0, 43, 0, 9, 27, 27, 0,
    24, 0, 28, 0, 22, 0, 43, 0, 7, 27, 21, 0, 26, 0, 24, 21, 0, 25, 21, 11, 2,
    0, 44, 0, 22, 0, 43, 0, 21, 27, 27, 32, 1, 8, 17, 7, 0, 24, 32, 1, 5, 32, 0,
    1, 0, 16, 32, 0, 2, 19, 0, 18, 0, 46, 17, 21, 33, 1, 5, 49, 6, 34, 0, 1, 0,
    28, 34, 0, 2, 19, 7, 32, 0, 1, 0, 17, 16, 0, 31, 0, 6, 0, 42, 32, 1, 8, 27,
    26, 16, 0, 24, 34, 0, 1, 0, 6, 33, 1, 8, 50, 17, 7, 32, 0, 1, 0, 15, 16, 32,
    1, 3, 16, 0, 31, 34, 0, 1, 32, 2, 84, 16, 32, 2, 102, 16, 0, 15, 16, 0, 43,
    0, 30, 27, 26, 16, 7, 32, 1, 4, 0, 29, 32, 1, 3, 17, 33, 0, 3, 48, 0, 36, 0,
    8, 26, 0, 47, 17, 33, 0, 4, 48, 6, 32, 0, 4, 0, 17, 16, 0, 15, 34, 0, 3, 17,
    0, 43, 0, 31, 0, 6, 0, 42, 0, 8, 0, 42, 34, 0, 4, 27, 27, 26, 27, 0, 34, 0,
    30, 26, 34, 0, 1, 21, 7, 34, 0, 1, 0, 43, 0, 30, 27, 7, 34, 0, 1, 0, 31, 0,
    31, 0, 8, 0, 42, 34, 0, 2, 27, 26, 26, 16, 7, 34, 0, 1, 0, 20, 32, 0, 2, 17,
    32, 2, 149, 16, 6, 34, 0, 2, 7, 34, 0, 1, 0, 42, 0, 33, 34, 0, 2, 26, 27, 7,
    34, 0, 1, 7, 34, 0, 1, 6, 0, 46, 33, 1, 11, 49, 6, 1, 305, 1, 306, 11, 2, 0,
    16, 32, 1, 8, 0, 47, 32, 2, 72, 11, 2, 0, 44, 0, 0, 0, 13, 0, 53, 21, 27,
    16, 17, 33, 1, 10, 49, 7, 32, 0, 1, 32, 1, 10, 0, 31, 34, 0, 1, 26, 27, 7,
    32, 0, 1, 32, 1, 10, 32, 2, 29, 34, 0, 1, 26, 27, 7, 0, 46, 33, 0, 2, 48, 6,
    1, 307, 32, 0, 1, 26, 33, 0, 3, 48, 6, 34, 0, 1, 0, 35, 1, 308, 26, 32, 1,
    7, 17, 0, 22, 0, 21, 0, 49, 21, 0, 45, 0, 26, 0, 42, 0, 46, 11, 1, 27, 27,
    16, 33, 0, 4, 33, 0, 5, 12, 2, 48, 6, 32, 1, 8, 1, 309, 1, 310, 1, 311, 11,
    4, 0, 44, 34, 0, 5, 0, 43, 0, 6, 0, 42, 34, 0, 4, 0, 8, 0, 49, 21, 27, 27,
    27, 7, 1, 312, 0, 33, 34, 0, 2, 26, 26, 7, 0, 25, 34, 0, 1, 20, 7, 0, 46,
    33, 0, 3, 48, 33, 0, 4, 48, 6, 32, 1, 8, 32, 2, 30, 1, 313, 26, 16, 6, 34,
    0, 1, 11, 1, 33, 0, 5, 48, 6, 1, 314, 0, 42, 32, 1, 7, 27, 33, 0, 6, 48, 6,
    32, 0, 3, 32, 0, 6, 32, 1, 6, 17, 33, 0, 7, 48, 6, 32, 0, 4, 0, 7, 16, 32,
    0, 5, 34, 0, 6, 0, 42, 32, 2, 147, 27, 11, 2, 0, 44, 0, 20, 0, 42, 0, 46,
    27, 27, 32, 1, 6, 17, 33, 0, 8, 48, 6, 32, 1, 8, 32, 2, 30, 0, 33, 34, 0, 7,
    34, 0, 8, 11, 2, 26, 0, 16, 0, 46, 0, 43, 0, 20, 27, 21, 0, 16, 0, 19, 21,
    26, 16, 7, 32, 1, 8, 0, 17, 16, 0, 36, 0, 24, 0, 40, 32, 1, 6, 32, 1, 7, 16,
    27, 26, 34, 0, 1, 17, 7, 0, 24, 32, 2, 142, 32, 1, 5, 26, 34, 0, 2, 23, 1,
    315, 32, 2, 142, 34, 0, 1, 26, 27, 7, 0, 24, 1, 316, 32, 1, 5, 26, 34, 0, 1,
    21, 32, 2, 142, 34, 0, 2, 26, 20, 7, 0, 24, 1, 317, 34, 0, 2, 26, 34, 0, 1,
    21, 7, 34, 0, 1, 7, 32, 1, 5, 0, 17, 16, 0, 31, 0, 7, 0, 42, 32, 0, 1, 0,
    22, 16, 0, 6, 0, 52, 17, 27, 26, 16, 0, 34, 0, 30, 26, 34, 0, 1, 17, 7, 32,
    0, 1, 0, 35, 0, 12, 26, 32, 0, 2, 17, 0, 32, 0, 8, 26, 16, 0, 36, 0, 6, 26,
    0, 46, 17, 33, 0, 3, 48, 6, 32, 0, 2, 0, 30, 0, 42, 0, 17, 27, 32, 0, 3, 17,
    0, 36, 0, 8, 26, 0, 47, 17, 33, 0, 4, 48, 6, 34, 0, 3, 0, 21, 0, 42, 32, 1,
    5, 27, 0, 45, 0, 33, 34, 0, 2, 34, 0, 1, 11, 2, 26, 0, 31, 0, 16, 26, 0, 20,
    21, 0, 40, 1, 318, 27, 27, 16, 6, 32, 0, 4, 7, 32, 1, 4, 0, 6, 0, 42, 32, 0,
    1, 27, 0, 41, 32, 2, 5, 27, 32, 1, 3, 17, 0, 12, 0, 42, 0, 46, 27, 0, 45,
    34, 0, 1, 0, 6, 0, 47, 17, 0, 40, 32, 1, 5, 27, 27, 16, 7, 0, 33, 0, 46, 26,
    0, 13, 34, 0, 4, 32, 3, 35, 34, 0, 1, 26, 34, 0, 2, 19, 21, 7, 34, 0, 1, 6,
    32, 1, 9, 0, 17, 16, 0, 31, 0, 46, 26, 16, 7, 32, 0, 2, 32, 3, 12, 16, 33,
    0, 3, 48, 6, 34, 0, 2, 0, 43, 0, 16, 27, 33, 0, 4, 48, 6, 32, 1, 5, 0, 36,
    0, 8, 26, 0, 47, 17, 33, 0, 5, 48, 6, 32, 0, 5, 0, 12, 0, 47, 17, 0, 8, 0,
    49, 17, 0, 6, 32, 0, 3, 17, 32, 0, 5, 32, 2, 4, 1, 319, 27, 16, 33, 0, 6,
    48, 6, 0, 47, 0, 7, 32, 1, 6, 17, 0, 17, 16, 0, 31, 0, 8, 0, 42, 32, 0, 5,
    27, 0, 40, 0, 6, 0, 42, 32, 0, 5, 27, 0, 43, 34, 0, 6, 27, 27, 26, 16, 0,
    36, 0, 8, 26, 0, 47, 17, 0, 5, 0, 108, 17, 6, 34, 0, 3, 0, 24, 0, 45, 0, 8,
    0, 42, 32, 0, 1, 0, 40, 32, 3, 12, 27, 27, 27, 16, 33, 0, 7, 48, 6, 34, 0,
    1, 0, 43, 0, 16, 27, 33, 0, 8, 48, 6, 32, 1, 7, 32, 3, 34, 32, 1, 5, 17, 33,
    0, 9, 33, 0, 10, 12, 2, 48, 6, 32, 0, 10, 0, 12, 0, 47, 17, 0, 8, 0, 49, 17,
    0, 6, 34, 0, 7, 17, 34, 0, 10, 32, 2, 4, 1, 320, 27, 34, 0, 9, 17, 33, 0,
    11, 48, 6, 34, 0, 11, 0, 42, 0, 8, 0, 42, 34, 0, 5, 27, 27, 33, 0, 12, 48,
    6, 1, 321, 33, 0, 13, 48, 6, 32, 1, 9, 0, 17, 16, 0, 31, 0, 8, 0, 42, 32, 1,
    7, 0, 36, 0, 8, 26, 0, 47, 17, 27, 34, 0, 13, 20, 26, 16, 7, 32, 0, 1, 32,
    3, 14, 0, 47, 17, 0, 36, 0, 8, 26, 0, 47, 17, 33, 0, 3, 48, 0, 12, 0, 47,
    17, 33, 0, 4, 48, 6, 32, 0, 1, 0, 15, 16, 33, 0, 1, 49, 6, 0, 47, 33, 0, 5,
    48, 6, 0, 46, 33, 0, 6, 48, 6, 32, 0, 1, 0, 31, 0, 0, 0, 40, 1, 322, 27, 26,
    16, 6, 32, 0, 4, 0, 8, 0, 49, 17, 0, 6, 32, 0, 5, 17, 33, 0, 7, 48, 6, 1,
    323, 33, 0, 8, 48, 6, 0, 46, 33, 0, 9, 48, 33, 0, 10, 48, 6, 1, 324, 33, 0,
    11, 48, 6, 32, 0, 1, 0, 46, 0, 46, 1, 325, 11, 2, 0, 44, 0, 31, 0, 12, 0,
    42, 0, 11, 27, 26, 0, 36, 0, 8, 26, 0, 47, 21, 27, 11, 2, 0, 44, 32, 1, 3,
    0, 12, 32, 0, 6, 17, 0, 8, 32, 0, 7, 0, 12, 0, 53, 17, 17, 27, 16, 33, 0,
    12, 48, 6, 34, 0, 1, 34, 0, 8, 34, 0, 11, 11, 2, 0, 44, 34, 0, 12, 27, 16,
    7, 34, 0, 1, 6, 32, 1, 9, 0, 17, 16, 0, 31, 32, 1, 10, 0, 8, 32, 1, 4, 17,
    0, 21, 0, 42, 32, 1, 4, 27, 0, 24, 11, 2, 0, 44, 32, 2, 2, 27, 16, 26, 16,
    7, 32, 1, 6, 32, 3, 35, 32, 0, 1, 0, 15, 16, 0, 43, 0, 16, 27, 0, 43, 32, 3,
    79, 0, 7, 0, 47, 21, 0, 42, 32, 0, 2, 0, 15, 16, 0, 43, 0, 16, 27, 27, 27,
    26, 16, 33, 0, 3, 48, 6, 34, 0, 1, 1, 326, 1, 327, 11, 2, 0, 44, 0, 15, 0,
    40, 0, 22, 27, 0, 20, 0, 54, 21, 0, 41, 0, 8, 27, 27, 34, 0, 2, 17, 7, 34,
    0, 2, 0, 31, 0, 14, 26, 16, 32, 3, 81, 16, 0, 34, 0, 15, 26, 11, 0, 17, 7,
    0, 46, 0, 20, 16, 33, 0, 3, 48, 6, 34, 0, 1, 0, 35, 1, 328, 26, 34, 0, 2,
    19, 6, 32, 0, 3, 7, 34, 0, 1, 33, 2, 4, 49, 0, 34, 0, 16, 26, 32, 2, 6, 17,
    32, 3, 13, 16, 33, 2, 5, 49, 6, 0, 52, 33, 2, 3, 49, 7, 34, 0, 1, 33, 0, 3,
    33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48, 6, 34, 0, 5, 32, 0, 3, 0, 22, 16,
    0, 20, 0, 46, 17, 0, 45, 0, 31, 32, 2, 9, 0, 7, 0, 47, 21, 0, 45, 1, 329,
    27, 26, 27, 16, 7, 32, 1, 3, 32, 1, 4, 34, 0, 1, 32, 1, 6, 11, 4, 7, 32, 2,
    7, 32, 1, 8, 32, 1, 9, 34, 0, 1, 32, 1, 7, 0, 20, 0, 47, 17, 0, 18, 32, 1,
    11, 17, 32, 1, 12, 11, 2, 11, 4, 26, 7, 32, 0, 1, 32, 3, 7, 16, 0, 18, 33,
    1, 3, 50, 6, 34, 0, 1, 7, 32, 0, 2, 0, 16, 0, 53, 17, 0, 16, 0, 47, 17, 0,
    18, 33, 1, 4, 50, 6, 34, 0, 2, 0, 16, 0, 49, 17, 32, 1, 5, 16, 7, 0, 47, 33,
    1, 4, 49, 6, 34, 0, 1, 7, 32, 2, 7, 32, 1, 3, 32, 1, 4, 34, 0, 1, 32, 1, 6,
    11, 4, 26, 7, 32, 2, 7, 34, 0, 1, 26, 7, 32, 0, 1, 11, 1, 0, 26, 33, 1, 6,
    50, 6, 34, 0, 1, 7, 34, 0, 1, 33, 0, 2, 48, 6, 1, 330, 7, 0, 24, 0, 25, 11,
    2, 0, 44, 0, 20, 27, 33, 0, 6, 48, 6, 0, 0, 0, 13, 0, 53, 21, 0, 45, 1, 331,
    27, 33, 0, 5, 51, 6, 32, 0, 1, 32, 3, 118, 34, 0, 5, 26, 0, 35, 0, 7, 0, 43,
    32, 0, 6, 27, 34, 0, 6, 0, 7, 0, 25, 21, 11, 2, 0, 44, 0, 24, 0, 13, 0, 46,
    21, 27, 26, 32, 1, 8, 0, 46, 26, 0, 45, 0, 16, 0, 42, 0, 49, 27, 27, 0, 12,
    20, 0, 41, 0, 27, 27, 21, 32, 0, 2, 19, 33, 0, 7, 48, 6, 32, 1, 6, 0, 36, 0,
    6, 26, 16, 0, 20, 0, 46, 17, 33, 0, 8, 48, 6, 32, 3, 105, 1, 332, 11, 2, 0,
    44, 32, 1, 8, 0, 46, 26, 27, 33, 0, 9, 48, 6, 34, 0, 1, 32, 0, 9, 32, 0, 7,
    0, 16, 0, 42, 0, 22, 0, 34, 0, 7, 26, 0, 47, 21, 27, 16, 17, 32, 3, 77, 34,
    0, 4, 26, 34, 0, 2, 34, 0, 9, 34, 0, 7, 0, 16, 0, 46, 17, 19, 19, 32, 3, 89,
    32, 2, 12, 0, 40, 1, 333, 27, 11, 2, 0, 44, 34, 0, 8, 27, 16, 7, 34, 0, 1,
    0, 42, 0, 33, 34, 0, 2, 26, 27, 7, 34, 0, 1, 7, 32, 2, 15, 0, 31, 34, 0, 1,
    26, 26, 7, 32, 2, 15, 32, 3, 29, 34, 0, 1, 26, 26, 7, 34, 0, 1, 32, 1, 9,
    34, 0, 4, 32, 1, 8, 34, 0, 2, 19, 26, 16, 7, 34, 0, 2, 32, 1, 9, 0, 33, 34,
    0, 1, 26, 0, 43, 34, 0, 4, 27, 26, 16, 7, 32, 0, 1, 0, 31, 0, 21, 0, 42, 0,
    46, 27, 26, 16, 0, 36, 0, 6, 0, 42, 0, 8, 0, 42, 0, 49, 27, 27, 26, 16, 33,
    0, 2, 48, 6, 32, 1, 7, 32, 0, 2, 0, 20, 0, 46, 17, 0, 45, 1, 334, 34, 0, 1,
    26, 27, 16, 7, 34, 0, 4, 34, 0, 1, 34, 0, 2, 19, 7, 32, 2, 2, 32, 1, 3, 34,
    0, 1, 26, 11, 2, 0, 44, 0, 24, 0, 40, 32, 3, 7, 27, 27, 7, 34, 0, 4, 34, 0,
    1, 16, 7, 34, 0, 4, 34, 0, 1, 16, 7, 32, 2, 15, 32, 1, 3, 34, 0, 1, 26, 26,
    7, 0, 52, 32, 2, 16, 34, 0, 1, 27, 7, 0, 46, 0, 33, 32, 1, 3, 34, 0, 1, 26,
    26, 16, 32, 2, 10, 16, 7, 0, 46, 0, 33, 34, 0, 2, 32, 1, 3, 34, 0, 1, 27,
    26, 16, 32, 2, 10, 16, 7, 34, 0, 1, 0, 15, 16, 33, 0, 3, 48, 0, 22, 16, 0,
    6, 0, 52, 17, 0, 6, 33, 1, 5, 50, 6, 34, 0, 3, 0, 31, 32, 1, 6, 26, 16, 7,
    1, 335, 33, 0, 3, 48, 6, 0, 27, 32, 0, 3, 1, 336, 11, 2, 0, 44, 0, 24, 0,
    40, 0, 36, 32, 2, 28, 26, 27, 27, 11, 2, 0, 44, 0, 24, 0, 16, 0, 46, 21, 32,
    3, 7, 20, 27, 33, 0, 4, 48, 6, 34, 0, 2, 34, 0, 1, 11, 2, 32, 0, 4, 0, 46,
    17, 33, 0, 5, 48, 6, 32, 1, 5, 0, 17, 16, 0, 31, 1, 337, 26, 16, 33, 0, 6,
    48, 6, 34, 0, 6, 0, 31, 0, 16, 0, 42, 0, 47, 27, 26, 0, 27, 0, 31, 0, 16, 0,
    42, 0, 46, 27, 26, 21, 0, 33, 32, 2, 0, 26, 11, 2, 0, 44, 34, 0, 3, 0, 12,
    32, 0, 5, 17, 27, 16, 7, 32, 0, 1, 32, 3, 11, 16, 33, 0, 1, 49, 6, 32, 0, 1,
    0, 14, 16, 33, 0, 3, 48, 6, 34, 0, 1, 0, 15, 16, 33, 0, 4, 48, 0, 22, 16,
    33, 0, 5, 48, 6, 32, 1, 6, 0, 31, 0, 21, 0, 42, 0, 59, 27, 26, 16, 0, 36,
    32, 3, 128, 26, 0, 47, 17, 0, 5, 0, 166, 17, 6, 32, 1, 6, 0, 3, 32, 0, 5,
    17, 33, 0, 6, 48, 6, 32, 1, 6, 0, 4, 32, 0, 6, 17, 0, 34, 0, 30, 26, 33, 1,
    7, 50, 6, 0, 46, 33, 0, 7, 48, 6, 0, 33, 32, 1, 7, 26, 0, 16, 1, 338, 21,
    33, 0, 8, 48, 6, 32, 3, 79, 0, 5, 0, 167, 21, 33, 0, 9, 48, 6, 34, 0, 6, 0,
    35, 34, 0, 4, 0, 43, 0, 16, 27, 32, 0, 8, 0, 24, 1, 339, 34, 0, 8, 21, 11,
    3, 0, 44, 0, 11, 0, 42, 0, 49, 27, 27, 26, 34, 0, 5, 0, 17, 16, 17, 0, 15,
    34, 0, 3, 17, 7, 32, 0, 1, 0, 35, 0, 25, 0, 12, 32, 0, 1, 34, 0, 5, 16, 21,
    0, 45, 34, 0, 4, 27, 26, 34, 0, 1, 0, 22, 16, 0, 17, 16, 17, 7, 34, 0, 1, 0,
    24, 0, 37, 0, 15, 0, 40, 0, 33, 32, 1, 8, 26, 0, 16, 32, 0, 2, 21, 32, 1,
    11, 34, 0, 0, 0, 42, 32, 0, 2, 0, 6, 0, 47, 17, 27, 27, 27, 0, 15, 0, 14,
    21, 32, 1, 10, 11, 2, 0, 44, 32, 1, 8, 0, 22, 16, 0, 23, 34, 0, 2, 17, 27,
    27, 16, 7, 0, 47, 33, 1, 12, 49, 6, 32, 2, 7, 34, 0, 1, 26, 7, 32, 1, 13, 0,
    30, 0, 42, 32, 0, 1, 0, 17, 16, 0, 31, 0, 6, 0, 42, 32, 1, 14, 27, 26, 16,
    27, 0, 41, 32, 2, 29, 0, 42, 0, 47, 0, 43, 0, 27, 27, 27, 27, 32, 1, 11, 17,
    0, 24, 34, 0, 1, 0, 6, 33, 1, 14, 50, 17, 7, 34, 0, 1, 32, 2, 1, 0, 7, 0,
    47, 21, 0, 45, 32, 1, 12, 32, 2, 30, 11, 0, 34, 0, 2, 11, 2, 27, 27, 16, 7,
    32, 1, 17, 0, 16, 32, 0, 1, 17, 0, 26, 32, 1, 16, 0, 31, 0, 16, 0, 42, 34,
    0, 1, 27, 26, 16, 17, 7, 34, 0, 1, 34, 0, 2, 16, 7, 32, 1, 6, 34, 0, 1, 16,
    7, 0, 52, 33, 0, 0, 48, 6, 32, 1, 6, 0, 31, 0, 47, 1, 340, 11, 2, 0, 44, 0,
    24, 27, 26, 16, 7, 34, 0, 1, 0, 17, 16, 0, 31, 0, 33, 34, 0, 4, 0, 1, 16,
    26, 26, 16, 7, 32, 0, 1, 32, 3, 14, 0, 47, 17, 33, 0, 3, 48, 0, 36, 0, 8,
    26, 33, 1, 6, 50, 6, 0, 15, 0, 42, 34, 0, 3, 0, 26, 34, 0, 2, 0, 19, 16, 32,
    2, 2, 0, 7, 0, 47, 17, 0, 45, 0, 24, 0, 7, 34, 0, 1, 0, 22, 16, 21, 0, 18,
    0, 46, 21, 27, 16, 11, 1, 17, 27, 33, 1, 7, 49, 7, 32, 1, 6, 0, 8, 34, 0, 2,
    19, 32, 1, 5, 16, 0, 34, 0, 26, 26, 0, 26, 11, 2, 0, 44, 32, 1, 3, 27, 34,
    0, 1, 17, 7, 32, 0, 1, 0, 26, 34, 0, 1, 0, 22, 16, 0, 7, 34, 0, 2, 19, 0,
    17, 0, 40, 0, 31, 0, 47, 26, 27, 16, 17, 7, 34, 0, 1, 0, 31, 0, 6, 26, 34,
    0, 2, 0, 31, 34, 0, 4, 0, 43, 0, 8, 27, 26, 18, 19, 7, 32, 0, 1, 0, 47, 0,
    43, 0, 12, 27, 0, 7, 0, 47, 21, 0, 45, 32, 1, 5, 32, 0, 2, 26, 0, 42, 0, 17,
    27, 27, 32, 1, 7, 17, 32, 1, 5, 34, 0, 2, 0, 8, 32, 1, 7, 17, 26, 33, 1, 6,
    50, 6, 0, 47, 33, 1, 7, 49, 6, 34, 0, 1, 0, 22, 16, 7, 32, 0, 2, 0, 8, 33,
    1, 7, 50, 6, 34, 0, 2, 7, 34, 0, 1, 6, 0, 47, 33, 1, 9, 49, 7, 32, 1, 4, 0,
    29, 32, 1, 3, 17, 33, 0, 3, 48, 0, 26, 33, 1, 10, 50, 6, 34, 0, 3, 0, 36, 0,
    8, 26, 32, 1, 7, 17, 0, 12, 0, 42, 0, 47, 27, 0, 7, 0, 47, 21, 0, 45, 1,
    341, 27, 16, 6, 32, 0, 1, 0, 15, 16, 0, 43, 0, 16, 27, 33, 0, 4, 48, 6, 32,
    1, 9, 0, 24, 0, 45, 1, 342, 27, 34, 0, 1, 17, 6, 32, 1, 6, 0, 15, 32, 1, 10,
    17, 0, 31, 32, 0, 4, 26, 16, 7, 0, 47, 0, 7, 32, 2, 3, 17, 1, 343, 16, 0,
    34, 0, 30, 26, 32, 1, 3, 17, 0, 26, 32, 1, 6, 11, 1, 17, 0, 32, 0, 8, 26,
    16, 32, 3, 65, 16, 33, 0, 3, 48, 6, 34, 0, 2, 0, 24, 0, 35, 1, 344, 26, 34,
    0, 3, 21, 0, 36, 0, 31, 0, 6, 26, 26, 20, 0, 41, 0, 31, 0, 6, 26, 27, 32, 1,
    4, 17, 0, 47, 0, 43, 0, 12, 27, 0, 7, 0, 47, 21, 0, 45, 0, 34, 0, 17, 0, 15,
    32, 1, 5, 21, 0, 43, 0, 31, 0, 6, 26, 27, 26, 27, 32, 1, 6, 17, 0, 34, 0,
    30, 26, 34, 0, 1, 0, 15, 16, 17, 7, 32, 1, 5, 0, 26, 34, 0, 2, 19, 0, 26,
    32, 1, 4, 17, 0, 34, 0, 15, 26, 11, 0, 17, 7, 32, 0, 2, 0, 22, 16, 0, 20, 0,
    46, 17, 0, 5, 0, 193, 17, 6, 32, 0, 2, 0, 22, 16, 0, 17, 16, 0, 35, 0, 20,
    0, 42, 0, 46, 27, 0, 43, 0, 8, 27, 26, 34, 0, 2, 17, 7, 32, 2, 7, 0, 7, 34,
    0, 1, 17, 0, 17, 16, 0, 31, 32, 2, 6, 0, 1, 16, 26, 16, 0, 26, 33, 2, 6, 50,
    6, 32, 2, 7, 7, 34, 0, 1, 0, 22, 0, 43, 0, 21, 27, 0, 45, 0, 34, 0, 26, 26,
    0, 43, 34, 0, 0, 27, 27, 34, 0, 2, 19, 7, 34, 0, 2, 6, 34, 0, 1, 7, 34, 0,
    2, 0, 37, 34, 0, 1, 27, 7, 34, 0, 1, 32, 2, 11, 16, 6, 0, 46, 33, 1, 3, 49,
    6, 32, 2, 14, 32, 2, 7, 0, 35, 0, 6, 26, 34, 0, 4, 17, 26, 33, 1, 2, 49, 7,
    32, 3, 83, 0, 20, 32, 0, 1, 0, 18, 0, 46, 17, 21, 0, 46, 11, 2, 0, 16, 34,
    0, 1, 0, 13, 0, 46, 17, 0, 8, 34, 0, 2, 19, 17, 7, 0, 46, 32, 1, 3, 16, 6,
    34, 0, 1, 32, 2, 12, 32, 1, 2, 32, 2, 9, 34, 0, 2, 19, 26, 16, 7, 0, 46, 32,
    1, 3, 16, 6, 34, 0, 2, 32, 2, 12, 0, 33, 34, 0, 1, 26, 0, 43, 32, 1, 2, 27,
    26, 16, 7, 0, 46, 32, 1, 3, 16, 6, 34, 0, 1, 32, 2, 13, 32, 1, 2, 26, 34, 0,
    2, 19, 7, 0, 25, 34, 0, 1, 34, 0, 4, 21, 7, 32, 0, 1, 32, 3, 9, 16, 0, 5, 0,
    212, 17, 6, 32, 0, 1, 0, 11, 33, 1, 4, 50, 6, 34, 0, 1, 0, 18, 33, 1, 3, 50,
    7, 34, 0, 1, 0, 17, 16, 0, 26, 32, 1, 5, 17, 0, 32, 34, 0, 2, 26, 16, 7, 34,
    0, 1, 34, 0, 5, 16, 34, 0, 4, 34, 0, 2, 19, 7, 34, 0, 1, 32, 3, 158, 16, 7,
    34, 0, 1, 32, 3, 158, 16, 7, 34, 0, 1, 0, 36, 32, 2, 3, 26, 16, 33, 0, 3,
    33, 0, 4, 12, 2, 48, 6, 34, 0, 3, 33, 2, 4, 49, 6, 34, 0, 4, 0, 8, 33, 1, 4,
    50, 7, 32, 1, 4, 0, 41, 34, 0, 1, 27, 7, 32, 1, 8, 0, 43, 34, 0, 1, 0, 42,
    32, 1, 4, 27, 27, 7, 34, 0, 1, 0, 43, 32, 1, 12, 27, 33, 0, 3, 48, 6, 0, 47,
    0, 43, 0, 21, 27, 0, 45, 1, 345, 27, 33, 0, 4, 48, 6, 0, 52, 32, 0, 4, 0,
    47, 0, 6, 32, 2, 6, 17, 17, 0, 6, 0, 47, 17, 7, 32, 0, 1, 0, 13, 0, 47, 17,
    0, 8, 33, 1, 5, 50, 6, 34, 0, 1, 0, 6, 33, 1, 6, 50, 7, 32, 1, 7, 32, 1, 3,
    32, 3, 4, 1, 346, 34, 0, 1, 26, 27, 16, 33, 0, 3, 48, 6, 0, 24, 32, 2, 3,
    11, 2, 0, 44, 0, 13, 0, 42, 32, 2, 3, 27, 27, 33, 0, 4, 48, 6, 0, 46, 0, 12,
    32, 2, 3, 17, 0, 6, 32, 2, 3, 17, 0, 2, 0, 49, 17, 0, 18, 16, 33, 0, 5, 48,
    0, 17, 16, 0, 31, 0, 24, 0, 6, 0, 47, 21, 0, 7, 34, 0, 5, 21, 0, 10, 0, 49,
    21, 26, 16, 0, 36, 1, 347, 26, 32, 2, 3, 0, 17, 16, 17, 7, 34, 0, 1, 0, 31,
    32, 1, 10, 0, 43, 0, 7, 27, 0, 7, 0, 42, 32, 1, 9, 27, 11, 2, 0, 16, 32, 3,
    2, 17, 26, 16, 0, 4, 0, 42, 0, 3, 27, 16, 7, 32, 2, 3, 0, 8, 0, 49, 17, 0,
    13, 32, 0, 1, 0, 36, 0, 11, 26, 16, 33, 1, 10, 49, 0, 7, 34, 0, 1, 0, 36, 0,
    18, 26, 16, 33, 1, 9, 49, 17, 17, 7, 34, 0, 1, 6, 32, 2, 4, 32, 2, 9, 11, 2,
    0, 31, 0, 17, 0, 31, 0, 8, 0, 42, 32, 2, 6, 27, 26, 20, 26, 16, 33, 0, 3,
    33, 0, 4, 12, 2, 48, 6, 34, 0, 4, 0, 31, 1, 348, 26, 16, 7, 32, 0, 2, 32, 4,
    39, 16, 32, 4, 65, 16, 33, 0, 3, 48, 6, 34, 0, 1, 32, 4, 38, 34, 0, 2, 0,
    30, 32, 0, 3, 17, 17, 0, 15, 16, 0, 31, 0, 47, 0, 43, 0, 7, 27, 0, 18, 0,
    46, 21, 26, 16, 0, 34, 0, 30, 26, 34, 0, 3, 17, 33, 0, 4, 48, 6, 0, 7, 0,
    42, 0, 47, 27, 0, 8, 0, 42, 32, 2, 4, 0, 43, 0, 7, 27, 27, 0, 7, 0, 25, 21,
    11, 2, 0, 16, 32, 3, 2, 17, 33, 0, 5, 48, 6, 32, 2, 9, 0, 17, 16, 0, 35, 0,
    8, 0, 42, 32, 2, 6, 27, 0, 41, 32, 1, 3, 27, 34, 0, 5, 0, 25, 21, 26, 34, 0,
    4, 17, 7, 34, 0, 2, 0, 31, 0, 6, 26, 34, 0, 1, 0, 20, 16, 0, 31, 0, 8, 26,
    32, 1, 3, 17, 17, 33, 1, 3, 49, 7, 32, 3, 7, 32, 1, 3, 32, 1, 4, 34, 0, 1,
    32, 1, 6, 11, 4, 26, 7, 34, 0, 1, 6, 32, 2, 6, 0, 16, 32, 1, 2, 17, 0, 24,
    0, 47, 0, 6, 33, 1, 2, 50, 17, 7, 32, 2, 8, 0, 46, 26, 0, 45, 1, 349, 27, 0,
    41, 34, 0, 1, 27, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12,
    4, 48, 6, 34, 0, 5, 32, 4, 105, 34, 0, 2, 19, 0, 31, 1, 350, 26, 16, 7, 32,
    4, 89, 0, 49, 0, 47, 11, 2, 11, 2, 34, 0, 1, 16, 7, 34, 0, 1, 6, 32, 2, 11,
    0, 16, 0, 47, 0, 7, 32, 1, 2, 17, 17, 33, 0, 5, 48, 6, 34, 0, 5, 32, 2, 12,
    34, 0, 4, 0, 31, 0, 47, 0, 43, 0, 6, 27, 26, 16, 26, 26, 7, 34, 0, 0, 0, 46,
    11, 2, 7, 34, 0, 2, 33, 0, 3, 48, 6, 34, 0, 1, 0, 31, 0, 15, 26, 16, 33, 0,
    4, 48, 0, 16, 0, 46, 17, 0, 22, 16, 33, 0, 5, 48, 6, 0, 52, 33, 0, 6, 48, 6,
    1, 351, 0, 43, 32, 1, 4, 27, 33, 0, 7, 48, 6, 1, 352, 7, 34, 0, 1, 32, 1, 5,
    16, 33, 0, 3, 33, 0, 4, 12, 2, 48, 6, 34, 0, 3, 33, 1, 5, 49, 6, 34, 0, 4,
    7, 0, 47, 0, 7, 34, 0, 1, 0, 6, 33, 1, 7, 50, 17, 7, 0, 47, 0, 7, 32, 0, 1,
    17, 0, 17, 16, 0, 31, 0, 33, 32, 2, 7, 26, 0, 16, 0, 6, 0, 42, 34, 0, 1, 0,
    7, 32, 1, 7, 17, 27, 21, 32, 1, 9, 32, 0, 2, 21, 26, 16, 6, 34, 0, 2, 7, 32,
    2, 12, 0, 16, 34, 0, 1, 0, 6, 33, 1, 0, 50, 17, 7, 32, 0, 1, 0, 17, 16, 32,
    2, 5, 34, 0, 1, 26, 33, 2, 6, 50, 7, 0, 33, 34, 0, 2, 0, 1, 16, 26, 32, 1,
    4, 11, 2, 0, 44, 0, 13, 0, 42, 0, 46, 27, 27, 33, 1, 4, 49, 7, 32, 0, 1, 0,
    17, 16, 0, 31, 0, 7, 0, 42, 34, 0, 1, 27, 26, 16, 7, 34, 0, 1, 0, 17, 16, 0,
    31, 0, 8, 0, 42, 34, 0, 2, 27, 26, 16, 7, 0, 49, 0, 9, 32, 0, 2, 19, 0, 11,
    16, 33, 0, 3, 48, 0, 6, 32, 0, 1, 17, 33, 0, 4, 48, 32, 1, 3, 16, 33, 0, 5,
    48, 6, 34, 0, 1, 34, 0, 4, 11, 2, 0, 16, 32, 0, 5, 17, 32, 1, 4, 32, 0, 3,
    0, 8, 0, 49, 17, 0, 7, 34, 0, 2, 19, 0, 8, 34, 0, 5, 17, 0, 6, 34, 0, 3, 17,
    17, 7, 34, 0, 4, 0, 43, 0, 16, 27, 0, 41, 34, 0, 1, 27, 7, 34, 0, 2, 33, 0,
    3, 48, 0, 7, 16, 33, 0, 4, 48, 6, 0, 46, 33, 0, 5, 48, 33, 0, 6, 48, 33, 0,
    7, 48, 6, 0, 53, 33, 0, 8, 48, 6, 32, 0, 1, 32, 2, 4, 0, 7, 0, 47, 17, 0,
    45, 0, 31, 0, 8, 0, 42, 32, 2, 3, 27, 26, 27, 16, 0, 43, 0, 16, 27, 0, 41,
    32, 1, 3, 27, 33, 0, 9, 48, 6, 32, 0, 9, 0, 7, 0, 47, 21, 0, 46, 0, 47, 0,
    49, 11, 4, 33, 0, 10, 48, 6, 0, 6, 1, 353, 11, 2, 0, 16, 32, 0, 3, 0, 13, 0,
    54, 17, 17, 33, 0, 11, 48, 6, 1, 354, 33, 0, 12, 48, 6, 1, 355, 1, 356, 34,
    0, 12, 11, 3, 0, 44, 1, 357, 27, 33, 0, 13, 48, 6, 32, 0, 1, 0, 31, 34, 0,
    1, 0, 43, 1, 358, 27, 26, 16, 7, 32, 1, 3, 0, 31, 34, 0, 1, 0, 43, 32, 2, 3,
    27, 26, 16, 32, 4, 3, 16, 7, 32, 4, 7, 34, 0, 1, 26, 7, 32, 4, 7, 32, 1, 3,
    32, 1, 4, 34, 0, 1, 32, 1, 6, 11, 4, 26, 7, 32, 1, 4, 0, 31, 0, 16, 0, 42,
    34, 0, 1, 27, 26, 16, 7, 0, 47, 0, 6, 33, 1, 6, 50, 6, 32, 1, 6, 32, 1, 7,
    0, 42, 0, 33, 34, 0, 0, 26, 27, 0, 33, 32, 1, 3, 26, 11, 2, 0, 44, 0, 13, 0,
    42, 32, 1, 5, 27, 27, 16, 33, 0, 3, 48, 6, 0, 46, 34, 0, 3, 16, 7, 32, 0, 1,
    32, 1, 8, 0, 7, 0, 47, 17, 0, 45, 32, 1, 9, 0, 45, 1, 359, 27, 27, 0, 47, 0,
    7, 34, 0, 1, 17, 17, 7, 34, 0, 2, 0, 6, 32, 1, 3, 17, 33, 1, 4, 49, 6, 34,
    0, 1, 0, 6, 32, 1, 3, 17, 33, 1, 7, 49, 32, 2, 4, 16, 33, 1, 6, 49, 0, 6,
    32, 1, 3, 17, 32, 2, 4, 16, 33, 1, 5, 49, 6, 32, 1, 7, 0, 13, 32, 4, 3, 17,
    33, 1, 8, 49, 6, 32, 1, 6, 32, 1, 11, 16, 6, 32, 1, 7, 32, 1, 13, 32, 1, 4,
    17, 7, 32, 0, 2, 0, 6, 0, 47, 17, 33, 1, 4, 49, 0, 12, 32, 1, 6, 17, 0, 8,
    0, 49, 17, 0, 6, 33, 1, 8, 50, 6, 34, 0, 2, 7, 32, 0, 1, 0, 6, 0, 47, 17,
    33, 1, 7, 49, 0, 12, 32, 1, 5, 17, 0, 6, 33, 1, 8, 50, 6, 34, 0, 1, 7, 34,
    0, 1, 32, 1, 10, 0, 44, 32, 1, 8, 27, 34, 0, 2, 19, 7, 34, 0, 1, 0, 16, 32,
    1, 7, 32, 1, 13, 32, 1, 4, 17, 17, 7, 0, 49, 33, 2, 8, 49, 6, 32, 2, 4, 33,
    2, 7, 49, 6, 34, 0, 1, 33, 2, 4, 49, 7,
  ],
  [
    provide[0],
    provide[1],
    provide[2],
    provide[3],
    provide[4],
    provide[5],
    provide[6],
    provide[7],
    provide[8],
    provide[9],
    provide[10],
    runtime_0[0],
    provide[12],
    provide[13],
    provide[14],
    provide[15],
    provide[16],
    provide[17],
    runtime_0[1],
    runtime_0[2],
    runtime_0[3],
    runtime_0[4],
    runtime_0[5],
    runtime_0[6],
    runtime_0[7],
    runtime_0[8],
    runtime_0[9],
    runtime_0[10],
    runtime_0[11],
    runtime_0[12],
    runtime_0[13],
    provide[18],
    provide[19],
    runtime_0[14],
    runtime_0[15],
    runtime_0[16],
    runtime_0[17],
    provide[20],
    provide[21],
    provide[22],
    runtime_0[18],
    runtime_0[19],
    runtime_0[20],
    runtime_0[21],
    runtime_0[22],
    runtime_0[23],
    0,
    1,
    4,
    2,
    Infinity,
    -Infinity,
    -1,
    3,
    8,
    5,
    '∾',
    '⌜',
    '˙',
    '\0',
    '+',
    '-',
    '×',
    '÷',
    '⋆',
    '¬',
    '⌊',
    '⌈',
    '∨',
    '∧',
    '≠',
    '=',
    '>',
    '≥',
    '◶',
    '√',
    '<',
    '⊢',
    '⊣',
    '≍',
    '⋈',
    '↑',
    '↓',
    '↕',
    '⌽',
    '⍉',
    '/',
    '⊔',
    '⁼',
    '˜',
    '¨',
    '˘',
    '`',
    '∘',
    '○',
    '⌾',
    '⍟',
    '⊘',
    '⊸',
    '⟜',
    str('+-×÷⋆√⌊⌈|¬∧∨<>≠=≤≥≡≢⊣⊢⥊∾≍⋈↑↓↕«»⌽⍉/⍋⍒⊏⊑⊐⊒∊⍷⊔!˙˜˘¨⌜⁼´˝`∘○⊸⟜⌾⊘◶⎉⚇⍟⎊%'),
    str('´: Identity not found'),
    str('´: 𝕩 must be a list'),
    str("Mapping: Equal-rank argument shapes don't agree"),
    str("Mapping: Argument shape prefixes don't agree"),
    str('⍋𝕩: 𝕩 must have rank at least 1'),
    str('⍋ or ⍒: Rank of 𝕨 must be at least 1'),
    str('⍋ or ⍒: Rank of 𝕩 must be at least cell rank of 𝕨'),
    str('⍋ or ⍒: 𝕨 must be sorted'),
    str('p⊐𝕩 or 𝕨∊p: p must have rank at least 1'),
    str('p⊐n or n∊p: Rank of n must be at least cell rank of p'),
    str('∊𝕩 or ⊐𝕩: 𝕩 must have rank at least 1'),
    str('𝕨⍷𝕩: Rank of 𝕨 cannot exceed rank of 𝕩'),
    str('/𝕩: 𝕩 must have rank 1'),
    str('/𝕩: 𝕩 must consist of natural numbers'),
    str('𝕨⍉𝕩: 𝕨 must have rank at most 1'),
    str('𝕨⍉𝕩: Length of 𝕨 must not exceed rank of 𝕩'),
    str('𝕨⍉𝕩: 𝕨 must consist of valid axis indices'),
    str('𝕨⍉𝕩: Skipped result axis'),
    str('↑𝕩: 𝕩 must have rank at least 1'),
    str('↓𝕩: 𝕩 must have rank at least 1'),
    str('𝕨⊑𝕩: Indices in 𝕨 must consist of integers'),
    str('𝕨⊑𝕩: Index out of range'),
    str('𝕨⊏𝕩: Indices in 𝕨 must be integers'),
    str('𝕨⊏𝕩: Indices out of range'),
    str('𝕨⊑𝕩: 𝕩 must be a list when 𝕨 is a number'),
    str('𝕨⊑𝕩: Indices in compound 𝕨 must be lists'),
    str('𝕨⊑𝕩: Index length in 𝕨 must match rank of 𝕩'),
    str('𝕨'),
    str('𝕩: '),
    str('𝕩 must have rank at least 1 for simple 𝕨'),
    str('Compound 𝕨 must have rank at most 1'),
    str('Length of compound 𝕨 must be at most rank of 𝕩'),
    str('𝕨 must be an array of numbers or list of such arrays'),
    str('⊏𝕩: 𝕩 must have rank at least 1'),
    str('⊏𝕩: 𝕩 cannot have length 0'),
    str('⊏'),
    str("⊑𝕩: 𝕩 can't be empty"),
    str('⌽𝕩: 𝕩 must have rank at least 1'),
    str('𝕨⌽𝕩: 𝕨 must consist of integers'),
    str('𝕨⌽𝕩: 𝕨 too large'),
    str('⌽'),
    str('𝕨/𝕩: 𝕨 must consist of natural numbers'),
    str('𝕨/𝕩: Lengths of components of 𝕨 must match 𝕩'),
    str('𝕨/𝕩: Components of 𝕨 must have rank 0 or 1'),
    str('/'),
    str('=≠≡≢'),
    str('∾𝕩: 𝕩 must have an element with rank at least =𝕩'),
    str('Under ⚇: depths must be less than 0, or ∞'),
    str('⊢⊣˜∘○⊸⟜⊘◶'),
    str('´˝'),
    str('=≠≢'),
    str('<'),
    str('⋈'),
    str('≍'),
    str('↕/»«'),
    str('⊔'),
    str('⥊⌽⍉⊏'),
    str('↑↓'),
    str('⊑'),
    str('>'),
    str('∾'),
    str('¨⌜'),
    str('˘'),
    str('⎉'),
    str('⚇'),
    str('Cannot modify fill with Structural Under'),
    str('⌾: Incompatible result elements in structural Under'),
    str('>𝕩: Elements of 𝕩 must have matching shapes'),
    str('𝕨∾𝕩: Rank of 𝕨 and 𝕩 must differ by at most 1'),
    str('𝕨∾𝕩: Cell shapes of 𝕨 and 𝕩 must match'),
    str('∾𝕩: Incompatible element ranks'),
    str('∾𝕩: 𝕩 element shapes must be compatible'),
    str('∾𝕩: 𝕩 element trailing shapes must match'),
    str('∾𝕩: empty 𝕩 fill rank must be at least argument rank'),
    str('∾𝕩: 𝕩 must be an array'),
    str('↑'),
    str('↓'),
    str('𝕩: 𝕨 must '),
    str('have rank at most 1'),
    str('consist of integers'),
    str('« or »: 𝕩 must have rank at least 1'),
    str('« or »: 𝕨 must not have higher rank than 𝕩'),
    str('« or »: Rank of 𝕨 must be at least rank of 𝕩 minus 1'),
    str("« or »: 𝕨 must share 𝕩's major cell shape"),
    str('↕𝕩: 𝕩 must consist of natural numbers'),
    str('↕𝕩: 𝕩 must be a number or list'),
    str('𝕨↕𝕩: 𝕨 must have rank at most 1'),
    str('𝕨↕𝕩: Length of 𝕨 must be at most rank of 𝕩'),
    str('𝕨↕𝕩: 𝕨 must consist of natural numbers'),
    str('𝕨↕𝕩: Window length 𝕨 must be at most axis length plus one'),
    str("˘: Argument lengths don't agree"),
    str('˝: 𝕩 must have rank at least 1'),
    str('˝: Identity does not exist'),
    str('∘⌊⌽↑'),
    str('𝕨⥊𝕩: 𝕨 must have rank at most 1'),
    str('𝕨⥊𝕩: 𝕨 must consist of natural numbers'),
    str("𝕨⥊𝕩: Can't compute axis length when rest of shape is empty"),
    str('𝕨⥊𝕩: 𝕨 must consist of natural numbers or ∘ ⌊ ⌽ ↑'),
    str('𝕨⥊𝕩: Shape must be exact when reshaping with ∘'),
    str("𝕨⥊𝕩: Can't produce non-empty array from empty 𝕩"),
    str('⊔: Grouping argument must consist of integers'),
    str('⊔: Grouping argument values cannot be less than ¯1'),
    str('⊔𝕩: 𝕩 must be a list'),
    str('𝕨⊔𝕩: Rank of simple 𝕨 must be at most rank of 𝕩'),
    str(
      '𝕨⊔𝕩: Lengths of 𝕨 must equal to 𝕩, or one more only in a rank-1 component',
    ),
    str('𝕨⊔𝕩: Compound 𝕨 must be a list'),
    str('𝕨⊔𝕩: Total rank of 𝕨 must be at most rank of 𝕩'),
    str('𝕨⊔𝕩: 𝕩 must be an array'),
    str('⎉ or ⚇: 𝔾 result must have rank at most 1'),
    str('⎉ or ⚇: 𝔾 result must have 1 to 3 elements'),
    str('⎉ or ⚇: 𝔾 result must consist of integers'),
    str('⍟: 𝕨𝔾𝕩 must consist of integers'),
    str('≥: Needs two arguments'),
    str('≤: Needs two arguments'),
    str('⊒: Rank of 𝕨 must be at least 1'),
    str('⊒: Rank of 𝕩 must be at least cell rank of 𝕨'),
    str("Can't invert blocks (add an undo header?)"),
    str('Cannot invert modifier'),
    str('⁼: Inverse failed'),
    str('⁼: Inverse does not exist'),
    str('⁼: Inverse not found'),
  ],
  [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 2],
    [0, 0, 3],
    [0, 0, 4],
    [0, 0, 5],
    [0, 0, 6],
    [1, 1, 7],
    [2, 1, 8],
    [1, 1, 9],
    [0, 0, 10],
    [2, 1, 11],
    [0, 0, 12],
    [0, 0, 13],
    [1, 0, 14],
    [1, 1, 15],
    [1, 1, 16],
    [0, 0, 17],
    [0, 0, 18],
    [1, 0, 19],
    [0, 0, [[], [20]]],
    [1, 1, 21],
    [1, 1, 22],
    [1, 0, 23],
    [0, 0, [[], [24]]],
    [0, 0, 25],
    [0, 0, 26],
    [0, 0, 27],
    [0, 0, 28],
    [0, 0, 29],
    [2, 0, [[], [30]]],
    [0, 0, 31],
    [0, 0, [[], [32]]],
    [0, 0, 33],
    [0, 0, 34],
    [0, 0, 35],
    [0, 0, [[], [36]]],
    [0, 0, 37],
    [0, 0, [[], [38]]],
    [1, 1, 39],
    [0, 0, 40],
    [0, 0, [[], [41]]],
    [0, 0, [[], [42]]],
    [0, 0, 43],
    [0, 0, 44],
    [0, 0, [[], [45]]],
    [0, 0, [[], [46]]],
    [0, 1, 47],
    [0, 0, 48],
    [0, 0, [[], [49]]],
    [0, 0, 50],
    [0, 0, 51],
    [0, 0, [[], [52]]],
    [2, 1, 53],
    [1, 0, 54],
    [1, 0, 55],
    [0, 0, 56],
    [0, 0, [[], [57]]],
    [0, 0, 58],
    [0, 0, 59],
    [0, 1, 60],
    [2, 1, 61],
    [0, 0, 62],
    [0, 0, 63],
    [1, 0, [[], [64]]],
    [0, 0, 65],
    [0, 0, [[], [66]]],
    [1, 1, 67],
    [0, 0, 68],
    [0, 0, 69],
    [0, 0, 70],
    [0, 0, 71],
    [0, 0, [[], [72]]],
    [0, 0, 73],
    [1, 0, 74],
    [1, 0, 75],
    [0, 0, [[], [76]]],
    [1, 0, 77],
    [0, 0, 78],
    [0, 0, [[], [79]]],
    [0, 0, [[], [80]]],
    [0, 0, [[], [81]]],
    [0, 0, 82],
    [0, 0, [[], [83]]],
    [0, 0, [[], [84]]],
    [1, 1, 85],
    [2, 0, 86],
    [2, 0, 87],
    [2, 0, 88],
    [0, 0, [[], [89]]],
    [0, 0, [[], [90]]],
    [1, 1, 91],
    [0, 0, 92],
    [0, 0, 93],
    [0, 0, [[], [94]]],
    [0, 0, 95],
    [0, 0, 96],
    [0, 0, 97],
    [0, 0, 98],
    [0, 0, [[], [99]]],
    [0, 0, 100],
    [0, 0, [[], [101]]],
    [0, 0, 102],
    [2, 0, 103],
    [0, 0, [[], [104]]],
    [0, 0, 105],
    [0, 0, [[], [106]]],
    [0, 0, 107],
    [0, 0, 108],
    [0, 0, 109],
    [0, 0, 110],
    [0, 0, 111],
    [0, 0, 112],
    [0, 0, 113],
    [0, 0, 114],
    [0, 0, 115],
    [0, 0, 116],
    [0, 0, [[], [117]]],
    [0, 0, [[], [118]]],
    [0, 0, [[], [119]]],
    [0, 0, [[], [120]]],
    [0, 0, [[], [121]]],
    [0, 0, 122],
    [0, 0, [[], [123]]],
    [1, 0, 124],
    [2, 0, 125],
    [0, 0, 126],
    [0, 0, 127],
    [0, 0, 128],
    [0, 0, 129],
    [0, 0, 130],
    [1, 0, 131],
    [1, 0, [[], [132]]],
    [0, 0, 133],
    [0, 0, [[], [134]]],
    [0, 0, [[], [135]]],
    [0, 0, 136],
    [0, 0, 137],
    [0, 0, 138],
    [0, 0, 139],
    [0, 0, [[], [140]]],
    [0, 0, [[], [141]]],
    [0, 0, 142],
    [2, 0, 143],
    [0, 0, [[], [144]]],
    [0, 0, 145],
    [0, 0, [[], [146]]],
    [0, 0, [[], [147]]],
    [0, 0, 148],
    [1, 1, 149],
    [0, 0, 150],
    [0, 0, [[], [151]]],
    [0, 0, 152],
    [0, 0, [[], [153]]],
    [0, 0, 154],
    [0, 0, [[], [155]]],
    [0, 0, 156],
    [0, 0, 157],
    [0, 0, [[], [158]]],
    [0, 0, 159],
    [0, 0, 160],
    [1, 0, 161],
    [0, 0, 162],
    [0, 0, 163],
    [1, 0, 164],
    [0, 0, 165],
    [0, 0, 166],
    [0, 0, 167],
    [0, 0, 168],
    [1, 0, [[], [169]]],
    [1, 1, 170],
    [2, 0, 171],
    [2, 0, 172],
    [1, 0, 173],
    [1, 0, 174],
    [1, 0, 175],
    [0, 0, 176],
    [1, 0, 177],
    [0, 0, 178],
    [1, 0, 179],
    [0, 0, 180],
    [0, 0, 181],
    [0, 0, 182],
    [0, 0, 183],
    [0, 0, [[], [184]]],
    [0, 0, 185],
    [0, 0, 186],
    [0, 0, 187],
    [0, 0, 188],
    [0, 0, 189],
    [0, 0, 190],
    [0, 0, 191],
    [0, 0, [[], [192]]],
    [0, 0, [[], [193]]],
    [2, 0, 194],
    [1, 0, 195],
    [2, 0, 196],
    [0, 0, 197],
    [0, 0, [[], [198]]],
    [1, 0, 199],
    [0, 0, 200],
    [1, 0, [[], [201]]],
    [1, 1, 202],
    [0, 0, [[], [203]]],
    [0, 0, [[], [204]]],
    [0, 0, [[], [205]]],
    [0, 0, [[], [206]]],
    [0, 0, [[], [207]]],
    [0, 0, [[], [208]]],
    [0, 0, [[], [209]]],
    [0, 0, 210],
    [0, 0, 211],
    [1, 1, 212],
    [0, 0, 213],
    [0, 0, [[], [214]]],
    [0, 0, [[], [215]]],
    [0, 0, 216],
    [0, 0, 217],
    [0, 0, 218],
    [0, 0, 219],
    [0, 0, 220],
    [0, 0, 221],
    [0, 0, 222],
    [0, 0, 223],
    [0, 0, 224],
    [0, 0, [[], [225]]],
    [0, 0, [[], [226]]],
    [0, 0, [[], [227]]],
    [0, 0, 228],
    [0, 0, 229],
    [1, 1, 230],
    [1, 1, 231],
    [1, 1, 232],
    [0, 0, [[], [233]]],
    [0, 0, 234],
    [0, 0, 235],
    [0, 0, 236],
    [0, 0, 237],
    [0, 0, [[], [238]]],
    [0, 0, [[], [239]]],
    [1, 1, 240],
    [0, 0, 241],
    [0, 0, [[], [242]]],
    [0, 0, 243],
    [1, 0, 244],
    [0, 0, 245],
    [0, 0, [[], [246]]],
    [0, 0, 247],
    [0, 0, 248],
    [0, 0, [[], [249]]],
    [0, 0, [[], [250]]],
    [0, 0, 251],
    [0, 0, 252],
    [0, 0, 253],
    [0, 0, 254],
    [0, 0, 255],
    [0, 0, 256],
    [0, 0, [[], [257]]],
    [0, 0, 258],
    [0, 0, 259],
    [0, 0, 260],
    [0, 0, 261],
    [1, 1, 262],
    [2, 0, 263],
    [0, 0, [[], [264]]],
    [0, 0, 265],
    [1, 1, 266],
    [1, 1, 267],
    [1, 0, 268],
    [1, 0, [[], [269]]],
    [1, 1, 270],
    [1, 0, 271],
    [1, 1, 272],
    [1, 0, 273],
    [1, 0, 274],
    [1, 1, 275],
    [1, 1, 276],
    [1, 1, 277],
    [2, 1, 278],
    [0, 0, 279],
    [0, 0, [[], [280]]],
    [0, 0, 281],
    [2, 0, 282],
    [0, 0, [[], [283]]],
    [0, 0, 284],
    [0, 0, 285],
    [0, 0, [[], [286]]],
    [0, 0, 287],
    [0, 0, [[], [288]]],
    [0, 0, 289],
    [0, 1, 290],
    [1, 0, 291],
    [0, 0, [[], [292]]],
    [0, 0, 293],
    [0, 0, 294],
    [1, 0, 295],
    [0, 0, [[], [296]]],
    [0, 0, [[], [297]]],
    [0, 0, 298],
    [0, 0, 299],
    [0, 0, [[], [300]]],
    [0, 0, 301],
    [0, 0, [[], [302]]],
    [0, 0, 303],
    [0, 0, 304],
    [2, 1, 305],
    [2, 1, 306],
    [1, 0, 307],
    [0, 0, 308],
    [0, 0, 309],
    [0, 0, [[], [310]]],
    [0, 0, 311],
    [1, 0, 312],
    [0, 0, 313],
    [0, 0, [[], [314]]],
    [2, 0, 315],
    [1, 1, 316],
    [1, 1, 317],
    [0, 0, 318],
    [0, 0, 319],
    [0, 0, 320],
    [0, 0, 321],
    [0, 0, 322],
    [0, 0, 323],
    [0, 0, 324],
    [0, 0, 325],
    [0, 0, 326],
    [0, 0, [[], [327]]],
    [0, 0, [[], [328]]],
    [0, 0, 329],
    [0, 0, 330],
    [0, 0, 331],
    [0, 0, 332],
    [0, 0, 333],
    [1, 0, 334],
    [0, 0, 335],
    [0, 0, [[], [336]]],
    [0, 0, 337],
    [0, 0, 338],
    [0, 0, [[], [339]]],
    [0, 0, 340],
    [0, 0, 341],
    [0, 0, [[], [342]]],
    [0, 0, 343],
    [0, 0, [[], [344]]],
    [0, 0, 345],
    [1, 0, 346],
    [0, 0, [[], [347]]],
    [0, 0, 348],
    [0, 0, 349],
    [0, 0, 350],
    [0, 0, 351],
    [0, 0, 352],
    [0, 0, 353],
    [0, 0, [[], [354]]],
    [0, 0, [[], [355]]],
    [0, 0, 356],
    [0, 0, 357],
    [0, 0, 358],
    [0, 0, 359],
  ],
  [
    [0, 185],
    [4146, 3],
    [4191, 3],
    [4199, 3],
    [4203, 3],
    [4216, 3],
    [4231, 3],
    [4243, 2],
    [4272, 3],
    [4304, 2],
    [4321, 4],
    [4383, 5],
    [4419, 4],
    [4501, 3],
    [4543, 5],
    [4601, 4],
    [4667, 3],
    [4722, 3],
    [4733, 4],
    [4798, 9],
    [4867, 5],
    [4944, 5],
    [5011, 4],
    [5067, 8],
    [5239, 8],
    [5396, 3],
    [5445, 3],
    [5491, 6],
    [5576, 3],
    [5600, 7],
    [5714, 14],
    [6058, 4],
    [6118, 3],
    [6143, 3],
    [6205, 4],
    [6276, 6],
    [6340, 3],
    [6380, 5],
    [6457, 3],
    [6474, 14],
    [6654, 3],
    [6700, 3],
    [6720, 3],
    [6737, 4],
    [6795, 4],
    [6871, 5],
    [6945, 3],
    [7004, 0],
    [7015, 4],
    [7086, 3],
    [7096, 3],
    [7103, 3],
    [7117, 3],
    [7125, 3],
    [7163, 5],
    [7200, 5],
    [7227, 3],
    [7252, 3],
    [7277, 3],
    [7304, 7],
    [7378, 32],
    [8120, 3],
    [8185, 4],
    [8285, 7],
    [8481, 7],
    [8507, 14],
    [8720, 5],
    [8799, 9],
    [8956, 4],
    [9032, 7],
    [9144, 7],
    [9261, 3],
    [9368, 4],
    [9442, 9],
    [9563, 8],
    [9637, 7],
    [9699, 9],
    [9866, 9],
    [10014, 4],
    [10125, 8],
    [10339, 10],
    [10723, 3],
    [10767, 6],
    [10998, 4],
    [11112, 3],
    [11249, 2],
    [11270, 15],
    [11374, 8],
    [11502, 10],
    [11575, 3],
    [11601, 4],
    [11703, 2],
    [11711, 3],
    [11719, 3],
    [11727, 3],
    [11747, 8],
    [11822, 3],
    [11830, 3],
    [11838, 3],
    [11846, 3],
    [11854, 3],
    [11862, 3],
    [11873, 3],
    [11894, 7],
    [11935, 4],
    [11995, 3],
    [12037, 5],
    [12179, 3],
    [12226, 3],
    [12252, 3],
    [12301, 3],
    [12330, 3],
    [12338, 3],
    [12371, 3],
    [12415, 3],
    [12463, 3],
    [12475, 3],
    [12548, 4],
    [12584, 3],
    [12599, 3],
    [12614, 3],
    [12632, 3],
    [12646, 3],
    [12656, 3],
    [12708, 6],
    [12731, 6],
    [12759, 3],
    [12771, 3],
    [12802, 3],
    [12810, 3],
    [12818, 3],
    [12826, 5],
    [12861, 12],
    [13034, 3],
    [13045, 3],
    [13065, 3],
    [13085, 3],
    [13096, 3],
    [13107, 3],
    [13122, 7],
    [13193, 6],
    [13239, 3],
    [13257, 3],
    [13264, 6],
    [13299, 10],
    [13476, 4],
    [13532, 11],
    [13733, 4],
    [13800, 3],
    [13825, 2],
    [13840, 3],
    [13867, 8],
    [14051, 3],
    [14080, 3],
    [14090, 3],
    [14109, 3],
    [14119, 3],
    [14128, 3],
    [14138, 3],
    [14155, 3],
    [14197, 3],
    [14201, 5],
    [14234, 8],
    [14345, 9],
    [14427, 13],
    [14532, 3],
    [14540, 3],
    [14562, 7],
    [14667, 7],
    [14696, 11],
    [14894, 2],
    [14952, 10],
    [15028, 13],
    [15156, 5],
    [15182, 5],
    [15204, 5],
    [15226, 4],
    [15237, 5],
    [15278, 3],
    [15310, 5],
    [15351, 4],
    [15362, 3],
    [15369, 4],
    [15380, 4],
    [15391, 3],
    [15399, 6],
    [15426, 5],
    [15447, 6],
    [15474, 3],
    [15482, 4],
    [15502, 3],
    [15518, 3],
    [15530, 3],
    [15544, 8],
    [15667, 13],
    [15766, 18],
    [16078, 12],
    [16238, 4],
    [16261, 16],
    [16775, 5],
    [16791, 7],
    [16927, 6],
    [17023, 2],
    [17073, 8],
    [17260, 11],
    [17465, 3],
    [17524, 3],
    [17551, 3],
    [17568, 3],
    [17585, 8],
    [17767, 4],
    [17838, 3],
    [17869, 2],
    [17903, 3],
    [17938, 3],
    [17959, 3],
    [17980, 5],
    [18045, 3],
    [18065, 8],
    [18295, 3],
    [18363, 3],
    [18398, 3],
    [18429, 3],
    [18463, 5],
    [18530, 3],
    [18539, 3],
    [18558, 3],
    [18576, 3],
    [18589, 3],
    [18593, 3],
    [18639, 2],
    [18653, 2],
    [18668, 6],
    [18762, 3],
    [18772, 3],
    [18779, 9],
    [18913, 3],
    [18939, 3],
    [18963, 3],
    [18984, 3],
    [18997, 2],
    [19001, 3],
    [19037, 5],
    [19139, 3],
    [19186, 5],
    [19209, 3],
    [19226, 14],
    [19510, 13],
    [19707, 3],
    [19750, 4],
    [19833, 3],
    [19855, 4],
    [19882, 3],
    [19914, 7],
    [19968, 3],
    [19983, 3],
    [20018, 3],
    [20036, 3],
    [20069, 3],
    [20080, 3],
    [20099, 3],
    [20107, 3],
    [20123, 3],
    [20134, 10],
    [20352, 3],
    [20365, 3],
    [20369, 2],
    [20380, 2],
    [20392, 5],
    [20411, 5],
    [20432, 3],
    [20489, 5],
    [20500, 2],
    [20524, 5],
    [20532, 5],
    [20540, 2],
    [20552, 2],
    [20562, 2],
    [20580, 3],
    [20601, 4],
    [20637, 7],
    [20772, 10],
    [20962, 6],
    [20997, 3],
    [21067, 3],
    [21082, 3],
    [21141, 3],
    [21171, 3],
    [21199, 3],
    [21207, 3],
    [21215, 1],
    [21241, 5],
    [21261, 4],
    [21336, 3],
    [21369, 3],
    [21399, 5],
    [21424, 3],
    [21490, 3],
    [21504, 3],
    [21515, 5],
    [21614, 4],
    [21743, 3],
    [21767, 3],
    [21813, 3],
    [21846, 3],
    [21875, 3],
    [21883, 3],
    [21893, 5],
    [21929, 3],
    [21965, 3],
    [21991, 3],
    [22019, 3],
    [22041, 5],
    [22051, 3],
    [22084, 3],
    [22104, 6],
    [22119, 2],
    [22127, 2],
    [22135, 5],
    [22173, 3],
    [22183, 3],
    [22199, 5],
    [22250, 3],
    [22275, 6],
    [22384, 3],
    [22424, 3],
    [22465, 5],
    [22515, 6],
    [22652, 3],
    [22681, 3],
    [22700, 3],
    [22725, 3],
    [22743, 7],
    [22779, 3],
    [22795, 6],
    [22841, 3],
    [22849, 8],
    [22906, 5],
    [22935, 3],
    [22950, 3],
    [23000, 3],
    [23016, 3],
    [23034, 3],
    [23063, 3],
    [23082, 3],
    [23101, 6],
    [23180, 5],
    [23195, 14],
    [23359, 3],
    [23380, 3],
    [23388, 3],
    [23407, 3],
    [23423, 4],
    [23479, 3],
    [23511, 3],
    [23594, 3],
    [23628, 3],
    [23657, 3],
    [23674, 3],
    [23691, 3],
  ],
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
let compgen_raw = run(
  [
    1, 1, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 12, 3, 48, 6, 0, 63, 0, 27,
    16, 0, 0, 0, 62, 17, 0, 22, 0, 61, 0, 27, 16, 17, 0, 47, 0, 0, 26, 0, 100,
    17, 0, 45, 0, 22, 26, 0, 60, 0, 27, 16, 0, 47, 0, 0, 26, 0, 99, 17, 17, 33,
    0, 6, 48, 0, 18, 16, 0, 36, 0, 59, 17, 33, 0, 7, 48, 6, 0, 64, 0, 65, 11, 2,
    0, 0, 0, 93, 17, 33, 0, 8, 48, 6, 34, 0, 3, 32, 0, 4, 34, 0, 5, 32, 0, 8, 0,
    22, 0, 101, 17, 0, 102, 0, 103, 0, 104, 0, 105, 0, 106, 0, 107, 0, 21, 0,
    66, 0, 51, 11, 2, 17, 0, 45, 0, 35, 26, 0, 59, 17, 0, 108, 0, 64, 0, 27, 16,
    0, 0, 0, 94, 17, 34, 0, 6, 0, 21, 16, 0, 44, 0, 22, 26, 0, 109, 17, 0, 67,
    0, 0, 0, 93, 17, 0, 22, 0, 112, 17, 0, 22, 0, 111, 0, 26, 0, 59, 17, 17, 0,
    22, 0, 110, 17, 0, 113, 11, 15, 0, 46, 0, 13, 26, 0, 24, 0, 22, 21, 16, 33,
    0, 9, 33, 0, 10, 12, 2, 48, 6, 32, 0, 10, 0, 50, 0, 0, 26, 0, 29, 0, 68, 21,
    0, 54, 0, 44, 0, 46, 0, 24, 26, 26, 27, 16, 33, 0, 11, 33, 0, 12, 33, 0, 13,
    33, 0, 14, 33, 0, 15, 33, 0, 16, 33, 0, 17, 33, 0, 18, 33, 0, 19, 33, 0, 20,
    33, 0, 21, 33, 0, 22, 33, 0, 23, 33, 0, 24, 33, 0, 25, 12, 15, 48, 6, 0, 36,
    0, 54, 0, 1, 27, 0, 12, 0, 9, 0, 15, 0, 53, 0, 68, 27, 21, 0, 36, 0, 53, 0,
    69, 27, 21, 33, 0, 26, 48, 6, 32, 0, 14, 0, 36, 16, 33, 0, 27, 48, 6, 32, 0,
    15, 0, 36, 16, 0, 0, 0, 70, 17, 33, 0, 28, 48, 6, 0, 71, 0, 1, 0, 54, 0, 24,
    27, 16, 0, 0, 32, 0, 20, 17, 33, 0, 29, 48, 6, 32, 0, 20, 0, 36, 16, 0, 0,
    0, 72, 17, 33, 0, 30, 48, 6, 0, 13, 0, 11, 0, 69, 21, 0, 44, 0, 32, 26, 0,
    114, 21, 0, 54, 0, 22, 27, 33, 0, 31, 48, 6, 1, 2, 33, 0, 32, 48, 6, 1, 3,
    32, 0, 9, 26, 33, 0, 33, 48, 6, 0, 118, 0, 32, 0, 53, 34, 0, 4, 0, 54, 0,
    39, 27, 27, 16, 32, 0, 33, 16, 33, 0, 34, 48, 6, 32, 0, 21, 0, 36, 16, 33,
    0, 35, 48, 0, 0, 0, 69, 17, 33, 0, 36, 48, 6, 0, 69, 0, 70, 0, 74, 0, 59, 0,
    59, 0, 75, 0, 59, 0, 68, 11, 2, 0, 76, 0, 68, 0, 71, 0, 77, 11, 2, 0, 32,
    16, 0, 8, 16, 11, 10, 0, 43, 34, 0, 10, 26, 0, 25, 0, 13, 21, 0, 54, 0, 44,
    0, 46, 0, 21, 26, 26, 27, 16, 0, 22, 16, 0, 44, 0, 22, 26, 0, 73, 17, 33, 0,
    37, 48, 6, 0, 2, 0, 50, 0, 6, 26, 20, 33, 0, 38, 48, 6, 32, 0, 38, 0, 53, 0,
    13, 0, 51, 0, 27, 27, 27, 33, 0, 39, 48, 6, 32, 0, 38, 0, 53, 0, 13, 0, 51,
    0, 27, 27, 0, 0, 0, 69, 21, 27, 33, 0, 40, 48, 6, 0, 19, 0, 32, 0, 10, 21,
    0, 44, 0, 22, 26, 0, 32, 0, 22, 21, 0, 69, 21, 33, 0, 41, 48, 6, 1, 4, 33,
    0, 42, 48, 6, 1, 5, 33, 0, 43, 48, 6, 1, 6, 33, 0, 44, 48, 6, 1, 7, 33, 0,
    45, 48, 7, 34, 0, 1, 0, 11, 16, 0, 46, 1, 8, 26, 34, 0, 4, 17, 0, 22, 16, 7,
    32, 1, 32, 32, 1, 31, 0, 53, 0, 115, 27, 0, 116, 0, 20, 11, 3, 26, 0, 42,
    20, 33, 0, 2, 48, 6, 32, 0, 1, 0, 54, 0, 35, 27, 0, 54, 0, 18, 0, 58, 0, 19,
    0, 32, 0, 13, 21, 0, 51, 34, 0, 2, 27, 27, 27, 0, 19, 0, 20, 21, 33, 0, 3,
    48, 6, 32, 0, 1, 0, 35, 34, 0, 1, 0, 33, 16, 33, 0, 4, 48, 17, 33, 0, 5, 48,
    0, 26, 0, 53, 0, 1, 27, 0, 14, 0, 26, 21, 0, 69, 17, 0, 49, 0, 10, 26, 0,
    58, 0, 22, 0, 53, 0, 68, 27, 0, 44, 0, 32, 26, 32, 0, 5, 21, 0, 22, 0, 117,
    21, 0, 42, 20, 27, 16, 6, 0, 20, 0, 33, 34, 0, 5, 21, 0, 6, 0, 69, 21, 0,
    44, 0, 1, 26, 0, 69, 21, 0, 44, 0, 35, 26, 34, 0, 4, 21, 34, 0, 3, 0, 20,
    21, 7, 34, 0, 2, 33, 0, 3, 33, 0, 4, 12, 2, 48, 6, 0, 95, 0, 14, 32, 0, 1,
    17, 33, 0, 5, 48, 6, 0, 96, 0, 14, 32, 0, 1, 17, 33, 0, 6, 48, 0, 9, 0, 53,
    0, 28, 0, 53, 0, 68, 0, 68, 11, 2, 27, 27, 16, 0, 32, 16, 33, 0, 7, 48, 6,
    0, 97, 0, 14, 32, 0, 1, 17, 33, 0, 8, 48, 0, 32, 16, 33, 0, 9, 48, 6, 32, 0,
    7, 32, 0, 9, 0, 26, 0, 59, 17, 32, 0, 5, 0, 32, 16, 11, 3, 0, 22, 16, 33, 0,
    10, 48, 0, 33, 16, 33, 0, 11, 48, 6, 32, 0, 10, 0, 35, 32, 0, 11, 17, 33, 0,
    10, 49, 6, 34, 0, 7, 0, 0, 0, 70, 17, 34, 0, 9, 0, 26, 0, 69, 17, 0, 69, 0,
    22, 32, 1, 8, 0, 39, 32, 0, 1, 17, 17, 0, 32, 16, 0, 32, 0, 53, 32, 0, 5, 0,
    50, 0, 0, 26, 16, 0, 22, 0, 68, 17, 0, 54, 0, 35, 0, 51, 0, 29, 0, 54, 0, 1,
    27, 27, 27, 27, 16, 11, 3, 0, 22, 16, 0, 35, 34, 0, 11, 17, 33, 0, 12, 48,
    6, 0, 43, 0, 68, 11, 1, 26, 1, 9, 0, 13, 0, 54, 0, 22, 27, 21, 0, 20, 0, 32,
    0, 12, 21, 0, 13, 21, 33, 0, 13, 48, 6, 0, 35, 0, 53, 32, 0, 12, 0, 33, 32,
    0, 10, 17, 34, 0, 13, 16, 27, 0, 48, 0, 32, 26, 20, 0, 25, 32, 0, 1, 0, 13,
    16, 21, 33, 0, 14, 48, 6, 34, 0, 10, 32, 0, 14, 16, 33, 0, 15, 48, 6, 34, 0,
    12, 34, 0, 14, 16, 33, 0, 16, 48, 6, 32, 0, 16, 0, 10, 32, 0, 15, 17, 33, 0,
    17, 48, 0, 50, 0, 13, 26, 0, 69, 17, 33, 0, 18, 48, 6, 32, 0, 18, 0, 11, 34,
    0, 16, 17, 0, 9, 32, 0, 8, 0, 10, 32, 0, 6, 17, 17, 0, 49, 0, 10, 26, 0, 58,
    1, 10, 27, 16, 6, 0, 98, 0, 14, 32, 0, 1, 17, 0, 9, 32, 0, 18, 17, 33, 0,
    19, 48, 6, 34, 0, 6, 0, 9, 32, 0, 15, 17, 0, 29, 16, 0, 10, 32, 0, 19, 17,
    0, 32, 16, 33, 0, 20, 48, 6, 32, 0, 20, 34, 0, 19, 0, 54, 0, 35, 27, 0, 2,
    0, 93, 0, 1, 0, 98, 17, 21, 0, 1, 32, 0, 1, 0, 54, 0, 35, 27, 21, 16, 33, 0,
    21, 48, 6, 32, 0, 8, 0, 9, 33, 0, 15, 50, 0, 28, 16, 0, 9, 32, 0, 8, 17, 33,
    0, 22, 48, 0, 12, 33, 0, 18, 50, 6, 34, 0, 17, 0, 9, 34, 0, 8, 17, 0, 50, 0,
    13, 26, 16, 0, 11, 0, 69, 0, 54, 0, 22, 27, 0, 52, 0, 2, 0, 53, 0, 50, 0, 0,
    26, 27, 27, 0, 19, 21, 34, 0, 22, 0, 29, 16, 0, 12, 34, 0, 15, 17, 33, 0,
    23, 48, 17, 0, 44, 0, 1, 26, 0, 69, 17, 0, 44, 0, 41, 26, 32, 0, 1, 17, 33,
    0, 24, 48, 6, 32, 0, 18, 0, 32, 16, 33, 0, 25, 48, 6, 32, 0, 18, 0, 29, 0,
    69, 17, 0, 32, 16, 0, 25, 0, 53, 0, 13, 27, 32, 0, 25, 17, 33, 0, 26, 48, 6,
    32, 0, 25, 34, 0, 5, 0, 54, 0, 35, 27, 0, 2, 0, 1, 21, 32, 0, 26, 17, 0, 1,
    33, 0, 26, 50, 6, 34, 0, 1, 0, 35, 32, 0, 25, 17, 32, 1, 33, 16, 33, 0, 27,
    48, 6, 32, 1, 22, 32, 1, 26, 32, 0, 27, 17, 0, 28, 16, 0, 12, 32, 1, 21, 0,
    36, 16, 0, 14, 32, 0, 27, 17, 17, 33, 0, 28, 48, 6, 32, 1, 30, 0, 14, 32, 0,
    27, 17, 33, 0, 29, 48, 6, 32, 1, 24, 0, 36, 0, 52, 0, 44, 0, 1, 26, 0, 24,
    0, 19, 21, 27, 32, 1, 21, 17, 32, 1, 26, 32, 0, 27, 17, 0, 11, 34, 0, 28,
    17, 0, 10, 32, 0, 29, 17, 33, 0, 30, 48, 0, 11, 0, 53, 0, 29, 27, 16, 33, 0,
    31, 48, 6, 32, 1, 23, 0, 49, 0, 0, 26, 16, 0, 0, 0, 59, 17, 0, 14, 32, 0,
    27, 17, 33, 0, 32, 48, 6, 32, 1, 24, 0, 36, 16, 0, 14, 32, 0, 27, 17, 33, 0,
    33, 48, 6, 32, 0, 32, 0, 12, 32, 0, 30, 17, 0, 19, 0, 32, 0, 10, 21, 0, 28,
    0, 32, 0, 20, 21, 0, 69, 21, 0, 11, 0, 32, 21, 32, 0, 31, 17, 0, 49, 0, 10,
    26, 0, 58, 1, 11, 27, 16, 6, 32, 0, 27, 0, 32, 32, 0, 31, 17, 0, 44, 0, 1,
    26, 32, 1, 23, 0, 36, 16, 17, 0, 44, 0, 3, 0, 51, 0, 5, 27, 26, 32, 1, 7,
    17, 0, 2, 32, 0, 29, 0, 32, 32, 0, 31, 17, 0, 8, 16, 17, 33, 0, 34, 48, 6,
    32, 1, 23, 0, 36, 16, 0, 0, 32, 1, 7, 17, 0, 16, 32, 0, 27, 17, 0, 9, 32, 0,
    30, 17, 0, 2, 32, 1, 7, 17, 0, 1, 33, 0, 27, 50, 6, 32, 0, 30, 0, 28, 16, 0,
    12, 32, 0, 33, 17, 0, 49, 0, 10, 26, 0, 58, 1, 12, 27, 16, 6, 32, 0, 33, 0,
    10, 0, 53, 0, 29, 27, 16, 0, 13, 33, 0, 31, 50, 6, 34, 0, 33, 0, 32, 32, 0,
    31, 17, 0, 20, 0, 0, 0, 8, 0, 54, 0, 2, 27, 21, 0, 68, 0, 16, 32, 0, 34, 17,
    0, 2, 0, 70, 17, 17, 33, 0, 35, 48, 0, 11, 0, 68, 17, 33, 0, 36, 48, 6, 32,
    0, 36, 0, 8, 16, 0, 22, 0, 68, 17, 0, 35, 32, 0, 31, 0, 50, 0, 0, 26, 16,
    17, 0, 9, 32, 0, 30, 17, 33, 0, 37, 48, 0, 12, 32, 0, 30, 17, 33, 0, 38, 48,
    6, 32, 0, 30, 0, 2, 32, 0, 27, 17, 0, 22, 0, 53, 0, 68, 27, 0, 32, 32, 0,
    37, 0, 22, 0, 68, 17, 0, 28, 0, 54, 0, 10, 27, 16, 0, 11, 32, 0, 32, 0, 22,
    0, 68, 17, 17, 21, 0, 52, 32, 1, 43, 27, 32, 0, 26, 17, 33, 0, 39, 48, 6,
    34, 0, 34, 0, 32, 32, 0, 36, 17, 0, 14, 0, 53, 0, 70, 27, 0, 54, 0, 9, 27,
    0, 0, 0, 20, 21, 32, 0, 38, 0, 11, 0, 53, 0, 28, 27, 16, 0, 44, 0, 32, 26,
    32, 0, 32, 17, 17, 33, 0, 40, 48, 6, 32, 0, 37, 0, 12, 32, 0, 31, 17, 0, 50,
    0, 0, 26, 16, 0, 2, 32, 0, 32, 0, 12, 32, 0, 38, 17, 17, 33, 0, 41, 48, 0,
    11, 0, 53, 0, 50, 0, 6, 26, 0, 29, 20, 27, 16, 33, 0, 42, 48, 6, 32, 0, 29,
    0, 32, 32, 0, 42, 17, 0, 11, 32, 0, 35, 0, 32, 34, 0, 36, 17, 0, 14, 0, 69,
    17, 17, 33, 0, 43, 48, 6, 32, 0, 31, 33, 0, 44, 48, 0, 9, 34, 0, 37, 17, 0,
    10, 32, 0, 42, 17, 33, 0, 31, 49, 6, 32, 0, 29, 0, 32, 32, 0, 31, 17, 0, 8,
    16, 0, 44, 0, 32, 26, 33, 0, 35, 50, 0, 32, 0, 53, 0, 11, 0, 53, 0, 68, 27,
    27, 16, 0, 14, 0, 69, 17, 33, 0, 45, 48, 6, 32, 0, 43, 0, 22, 0, 68, 17, 0,
    35, 32, 0, 41, 17, 0, 11, 0, 53, 32, 0, 42, 27, 0, 10, 0, 13, 0, 53, 32, 0,
    29, 27, 21, 16, 0, 9, 32, 0, 32, 0, 12, 34, 0, 38, 17, 17, 0, 49, 0, 10, 26,
    0, 58, 1, 13, 27, 16, 6, 34, 0, 42, 0, 11, 32, 0, 29, 17, 0, 32, 16, 32, 0,
    27, 0, 54, 0, 35, 27, 0, 12, 32, 1, 23, 0, 36, 16, 21, 0, 11, 32, 0, 45, 21,
    0, 54, 0, 20, 0, 49, 0, 10, 26, 20, 0, 58, 1, 14, 27, 27, 16, 6, 34, 0, 43,
    0, 8, 16, 0, 2, 0, 53, 0, 50, 0, 0, 26, 27, 16, 0, 22, 0, 68, 17, 0, 44, 0,
    1, 26, 0, 69, 17, 0, 35, 33, 0, 41, 50, 6, 32, 1, 9, 0, 35, 32, 0, 27, 17,
    0, 41, 34, 0, 41, 17, 0, 41, 0, 70, 0, 22, 34, 0, 45, 17, 17, 0, 36, 0, 55,
    0, 22, 0, 53, 32, 0, 4, 27, 27, 16, 33, 0, 46, 48, 6, 34, 0, 18, 0, 29, 16,
    0, 50, 0, 0, 26, 16, 0, 35, 34, 0, 23, 0, 32, 16, 0, 22, 34, 0, 20, 17, 17,
    0, 22, 34, 0, 29, 0, 12, 32, 0, 31, 17, 0, 32, 16, 0, 35, 0, 53, 0, 34, 27,
    34, 0, 35, 17, 17, 33, 0, 47, 48, 6, 34, 0, 39, 34, 0, 21, 34, 0, 24, 11, 3,
    0, 22, 34, 0, 46, 17, 33, 0, 48, 48, 6, 32, 0, 48, 0, 46, 0, 37, 26, 16, 33,
    0, 49, 48, 0, 44, 0, 46, 0, 32, 0, 53, 0, 50, 0, 6, 26, 0, 29, 0, 59, 21, 0,
    12, 0, 20, 21, 27, 26, 26, 33, 0, 48, 50, 6, 32, 0, 48, 0, 36, 0, 53, 0, 69,
    27, 0, 55, 34, 0, 3, 27, 16, 33, 0, 48, 49, 6, 32, 1, 24, 32, 1, 26, 32, 0,
    27, 17, 0, 10, 32, 0, 30, 17, 0, 8, 16, 33, 0, 50, 48, 6, 34, 0, 44, 0, 10,
    32, 0, 50, 17, 0, 44, 0, 32, 26, 33, 0, 26, 50, 6, 34, 0, 30, 0, 28, 0, 54,
    0, 12, 27, 16, 0, 10, 32, 0, 50, 17, 0, 44, 0, 32, 26, 33, 0, 25, 50, 6, 32,
    0, 27, 0, 35, 0, 53, 34, 0, 47, 27, 0, 55, 32, 0, 48, 0, 46, 0, 13, 26, 16,
    33, 0, 51, 48, 0, 29, 32, 1, 36, 17, 0, 50, 0, 0, 26, 16, 0, 0, 34, 0, 49,
    17, 0, 22, 16, 0, 26, 0, 53, 0, 13, 27, 34, 0, 4, 17, 27, 16, 0, 32, 34, 0,
    50, 0, 10, 32, 0, 31, 17, 17, 33, 0, 27, 49, 6, 32, 1, 14, 0, 36, 0, 54, 0,
    1, 27, 0, 2, 32, 1, 26, 21, 32, 0, 27, 17, 0, 1, 33, 0, 27, 50, 6, 32, 1,
    27, 0, 14, 32, 0, 27, 17, 0, 44, 0, 22, 26, 0, 13, 0, 22, 21, 0, 69, 17, 0,
    32, 16, 0, 26, 0, 69, 17, 0, 26, 0, 59, 17, 33, 0, 52, 48, 0, 46, 0, 69, 26,
    16, 0, 50, 0, 13, 26, 16, 33, 0, 53, 48, 6, 32, 1, 17, 0, 36, 16, 0, 0, 0,
    74, 0, 71, 0, 63, 11, 3, 17, 33, 0, 54, 48, 6, 32, 0, 27, 0, 35, 32, 0, 53,
    0, 1, 32, 0, 52, 17, 17, 0, 0, 0, 53, 32, 0, 53, 27, 0, 44, 0, 39, 26, 34,
    0, 54, 21, 0, 10, 32, 1, 15, 0, 54, 32, 1, 26, 27, 21, 16, 0, 28, 0, 54, 0,
    10, 27, 16, 0, 12, 34, 0, 53, 17, 0, 44, 0, 32, 26, 34, 0, 52, 17, 33, 0,
    55, 48, 6, 32, 1, 27, 0, 13, 32, 0, 27, 17, 0, 35, 0, 53, 34, 0, 55, 27, 0,
    55, 0, 46, 0, 69, 26, 27, 16, 0, 44, 1, 15, 26, 33, 0, 27, 50, 6, 34, 0, 51,
    0, 25, 0, 70, 17, 0, 49, 0, 0, 26, 16, 0, 24, 32, 1, 36, 17, 32, 1, 26, 32,
    0, 27, 17, 0, 10, 32, 1, 30, 0, 14, 32, 0, 27, 17, 17, 33, 0, 56, 48, 6, 0,
    68, 0, 22, 32, 1, 37, 17, 0, 35, 32, 0, 27, 0, 5, 32, 1, 36, 17, 17, 0, 32,
    0, 53, 34, 0, 56, 27, 0, 55, 34, 0, 40, 27, 16, 33, 0, 57, 48, 6, 32, 0, 27,
    0, 15, 0, 53, 0, 0, 0, 53, 0, 74, 27, 27, 0, 0, 0, 71, 21, 0, 2, 0, 71, 0,
    54, 0, 24, 27, 32, 1, 26, 0, 20, 21, 21, 32, 1, 20, 0, 36, 16, 17, 0, 0, 33,
    0, 27, 50, 6, 32, 0, 27, 0, 14, 0, 2, 0, 64, 21, 0, 0, 0, 11, 21, 32, 1, 35,
    17, 0, 1, 33, 0, 27, 50, 6, 34, 0, 27, 34, 0, 57, 34, 0, 48, 32, 0, 26, 32,
    0, 25, 11, 5, 7, 1, 16, 33, 0, 3, 48, 6, 32, 1, 32, 32, 1, 31, 0, 53, 0,
    124, 27, 0, 125, 32, 1, 9, 0, 54, 0, 35, 27, 0, 126, 11, 4, 26, 33, 0, 4,
    48, 6, 32, 1, 21, 0, 49, 0, 27, 0, 54, 0, 0, 27, 26, 16, 0, 22, 0, 127, 0,
    49, 0, 1, 26, 16, 0, 0, 32, 1, 23, 0, 36, 16, 17, 17, 0, 46, 32, 0, 1, 0,
    54, 0, 14, 27, 26, 16, 33, 0, 5, 33, 0, 6, 33, 0, 7, 33, 0, 8, 33, 0, 9, 12,
    5, 48, 6, 32, 1, 23, 0, 36, 16, 0, 11, 32, 0, 1, 17, 0, 10, 32, 0, 5, 17, 0,
    8, 16, 0, 10, 32, 1, 30, 0, 14, 32, 0, 1, 17, 17, 32, 0, 2, 32, 0, 3, 32, 0,
    1, 0, 54, 0, 32, 27, 0, 51, 34, 0, 4, 27, 27, 16, 6, 32, 0, 1, 0, 14, 0, 68,
    17, 33, 0, 10, 48, 0, 10, 32, 0, 5, 17, 33, 0, 11, 48, 0, 10, 32, 0, 6, 17,
    33, 0, 12, 48, 6, 32, 0, 11, 0, 10, 32, 0, 7, 17, 0, 8, 16, 33, 0, 13, 48,
    6, 32, 0, 11, 0, 29, 16, 0, 12, 32, 0, 7, 17, 32, 0, 2, 32, 0, 3, 0, 128,
    27, 16, 6, 32, 0, 12, 0, 10, 32, 0, 7, 17, 0, 9, 32, 0, 12, 0, 28, 0, 69,
    17, 17, 32, 0, 2, 32, 0, 3, 0, 129, 27, 16, 6, 32, 0, 1, 0, 32, 32, 0, 12,
    17, 0, 11, 0, 53, 0, 29, 27, 0, 10, 0, 14, 0, 53, 0, 68, 27, 21, 16, 0, 8,
    16, 32, 0, 2, 0, 32, 34, 0, 12, 21, 32, 0, 3, 0, 130, 27, 16, 6, 32, 0, 5,
    0, 29, 16, 0, 12, 32, 0, 7, 17, 0, 10, 32, 0, 10, 17, 0, 28, 0, 10, 34, 0,
    5, 0, 28, 16, 0, 9, 32, 0, 8, 17, 21, 0, 9, 0, 29, 21, 0, 69, 17, 0, 12, 32,
    0, 9, 0, 10, 34, 0, 8, 17, 17, 34, 0, 2, 34, 0, 3, 0, 131, 27, 16, 6, 32, 0,
    13, 0, 9, 0, 53, 0, 8, 32, 1, 40, 0, 52, 0, 12, 27, 32, 1, 22, 0, 36, 16, 0,
    13, 32, 0, 1, 17, 0, 11, 32, 0, 6, 17, 21, 0, 15, 0, 28, 21, 27, 16, 33, 0,
    14, 48, 0, 9, 0, 53, 0, 50, 0, 0, 26, 32, 1, 38, 0, 1, 0, 20, 21, 0, 8, 21,
    0, 16, 0, 78, 21, 27, 16, 33, 0, 15, 48, 6, 32, 1, 21, 0, 36, 16, 0, 0, 0,
    69, 17, 0, 1, 34, 0, 1, 17, 0, 2, 32, 0, 15, 17, 0, 32, 32, 0, 6, 0, 8, 16,
    17, 0, 44, 0, 35, 26, 0, 64, 0, 27, 16, 0, 22, 0, 79, 0, 69, 11, 2, 17, 0,
    22, 0, 59, 17, 17, 33, 0, 16, 48, 6, 32, 0, 16, 0, 50, 0, 0, 0, 53, 0, 64,
    0, 54, 0, 2, 27, 27, 0, 2, 0, 15, 0, 53, 0, 68, 27, 21, 26, 0, 68, 17, 0,
    32, 34, 0, 16, 0, 15, 0, 68, 17, 0, 28, 0, 54, 0, 12, 27, 16, 17, 33, 0, 17,
    48, 6, 34, 0, 7, 0, 29, 16, 0, 32, 34, 0, 13, 0, 29, 0, 54, 0, 12, 27, 16,
    33, 0, 18, 48, 17, 0, 44, 0, 35, 26, 0, 69, 0, 59, 11, 2, 17, 0, 2, 33, 0,
    17, 50, 6, 34, 0, 10, 0, 32, 34, 0, 11, 17, 33, 0, 19, 48, 6, 34, 0, 14, 0,
    28, 0, 54, 0, 12, 27, 0, 32, 20, 0, 52, 0, 1, 0, 53, 34, 0, 6, 0, 28, 16,
    32, 1, 40, 16, 0, 54, 0, 35, 27, 27, 0, 20, 0, 2, 0, 11, 21, 0, 1, 0, 53, 0,
    29, 27, 21, 0, 1, 0, 1, 21, 27, 34, 0, 15, 17, 0, 32, 32, 0, 19, 17, 33, 0,
    20, 48, 6, 32, 0, 19, 0, 8, 16, 0, 2, 32, 0, 17, 17, 0, 28, 16, 0, 32, 32,
    0, 19, 17, 0, 44, 0, 1, 26, 34, 0, 20, 17, 33, 0, 21, 48, 0, 7, 16, 0, 4, 0,
    64, 17, 33, 0, 22, 48, 6, 0, 69, 0, 80, 11, 2, 0, 35, 34, 0, 9, 0, 32, 34,
    0, 18, 17, 17, 0, 2, 34, 0, 17, 17, 0, 32, 34, 0, 19, 17, 0, 32, 0, 53, 32,
    0, 21, 0, 11, 0, 68, 17, 27, 0, 55, 0, 2, 27, 32, 0, 22, 17, 0, 32, 0, 53,
    34, 0, 21, 0, 12, 0, 68, 17, 27, 0, 55, 0, 44, 0, 3, 26, 27, 34, 0, 22, 17,
    7, 34, 0, 2, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 33, 0, 7, 12, 5, 48, 6,
    34, 0, 4, 0, 13, 16, 33, 0, 8, 48, 6, 1, 17, 33, 0, 9, 48, 6, 1, 18, 33, 0,
    10, 48, 6, 32, 0, 1, 0, 13, 16, 0, 11, 0, 68, 17, 0, 42, 0, 133, 17, 6, 32,
    1, 17, 32, 1, 26, 32, 0, 1, 17, 0, 2, 32, 0, 3, 0, 2, 0, 70, 17, 0, 1, 0,
    59, 17, 17, 33, 0, 11, 48, 0, 50, 0, 0, 26, 16, 33, 0, 12, 48, 0, 33, 16,
    33, 0, 13, 48, 6, 0, 59, 0, 14, 32, 0, 3, 17, 0, 35, 32, 0, 13, 17, 33, 0,
    14, 48, 6, 32, 0, 1, 0, 35, 32, 0, 13, 17, 33, 0, 15, 48, 0, 32, 0, 53, 0,
    68, 0, 54, 0, 11, 27, 27, 0, 44, 0, 1, 26, 0, 69, 21, 0, 17, 0, 32, 0, 53,
    0, 68, 0, 54, 0, 12, 27, 27, 21, 32, 0, 11, 0, 35, 32, 0, 13, 17, 33, 0, 16,
    48, 17, 0, 8, 0, 58, 32, 0, 1, 0, 51, 34, 0, 9, 27, 27, 16, 6, 34, 0, 12, 0,
    36, 32, 0, 13, 0, 36, 16, 17, 0, 12, 0, 68, 17, 32, 0, 13, 0, 25, 0, 69, 21,
    32, 0, 10, 0, 134, 27, 16, 6, 32, 0, 15, 0, 32, 32, 0, 14, 17, 0, 14, 0, 53,
    32, 1, 27, 27, 0, 9, 0, 53, 0, 29, 27, 0, 14, 0, 53, 32, 1, 17, 0, 36, 16,
    27, 21, 16, 32, 0, 13, 0, 32, 32, 0, 14, 21, 32, 0, 10, 0, 135, 27, 16, 6,
    32, 0, 15, 0, 32, 0, 14, 32, 1, 17, 0, 36, 16, 0, 0, 0, 70, 17, 21, 0, 22,
    0, 70, 21, 0, 35, 0, 19, 0, 51, 0, 50, 0, 0, 26, 27, 21, 34, 0, 16, 0, 14,
    0, 69, 17, 17, 33, 0, 17, 48, 6, 32, 1, 15, 32, 1, 26, 32, 0, 15, 17, 0, 11,
    32, 0, 17, 0, 14, 0, 69, 17, 17, 32, 0, 13, 32, 0, 10, 0, 136, 27, 16, 6,
    34, 0, 14, 0, 22, 0, 69, 17, 0, 9, 0, 53, 0, 28, 0, 53, 0, 69, 27, 27, 16,
    1, 19, 16, 6, 0, 73, 0, 14, 32, 0, 3, 17, 33, 0, 18, 48, 0, 10, 0, 53, 0,
    28, 27, 16, 33, 0, 19, 48, 6, 32, 0, 11, 0, 0, 32, 0, 3, 17, 0, 15, 0, 68,
    17, 0, 11, 32, 0, 18, 17, 0, 28, 16, 33, 0, 20, 48, 0, 12, 32, 1, 16, 0, 36,
    16, 0, 14, 32, 0, 1, 17, 17, 0, 1, 33, 0, 3, 50, 6, 32, 0, 3, 0, 15, 0, 68,
    17, 0, 11, 32, 0, 18, 17, 0, 29, 16, 0, 9, 32, 1, 16, 0, 36, 16, 0, 0, 0,
    70, 17, 0, 14, 32, 0, 1, 17, 0, 10, 34, 0, 20, 17, 17, 0, 12, 32, 0, 3, 0,
    76, 0, 54, 0, 15, 27, 0, 9, 0, 11, 0, 53, 0, 82, 27, 21, 16, 17, 0, 13, 0,
    27, 20, 32, 0, 10, 0, 138, 27, 16, 6, 32, 0, 3, 0, 14, 0, 82, 17, 0, 35, 32,
    0, 13, 17, 0, 11, 34, 0, 17, 0, 11, 0, 68, 17, 17, 32, 0, 13, 32, 0, 10, 0,
    139, 27, 16, 6, 32, 1, 28, 0, 14, 32, 0, 1, 17, 0, 9, 32, 0, 3, 0, 14, 0,
    82, 17, 0, 29, 16, 17, 0, 13, 0, 27, 20, 32, 0, 10, 0, 140, 27, 16, 6, 32,
    1, 35, 32, 0, 8, 11, 2, 32, 1, 26, 32, 0, 1, 17, 0, 28, 16, 0, 12, 32, 0,
    18, 17, 0, 13, 0, 27, 20, 32, 0, 10, 0, 141, 27, 16, 6, 0, 76, 0, 14, 32, 0,
    3, 17, 0, 10, 0, 53, 0, 28, 27, 16, 33, 0, 21, 48, 0, 35, 0, 53, 32, 0, 13,
    0, 35, 0, 53, 32, 0, 19, 0, 54, 0, 35, 27, 0, 33, 20, 27, 16, 27, 0, 55, 0,
    29, 27, 16, 33, 0, 22, 48, 6, 32, 0, 22, 0, 10, 32, 0, 21, 17, 0, 8, 16, 33,
    0, 23, 48, 6, 32, 1, 17, 0, 36, 16, 0, 0, 0, 69, 17, 0, 14, 32, 0, 1, 17,
    33, 0, 24, 48, 6, 32, 1, 19, 0, 36, 16, 0, 14, 32, 0, 1, 17, 0, 2, 0, 70,
    17, 0, 0, 32, 1, 29, 0, 36, 16, 0, 0, 0, 70, 17, 0, 14, 32, 0, 1, 17, 17, 0,
    35, 32, 0, 24, 0, 8, 16, 32, 1, 39, 16, 17, 33, 0, 25, 48, 6, 0, 68, 33, 0,
    26, 48, 6, 32, 0, 25, 0, 13, 16, 0, 27, 16, 33, 0, 27, 48, 6, 1, 20, 33, 0,
    28, 48, 6, 32, 0, 19, 0, 10, 32, 0, 21, 17, 33, 0, 29, 48, 0, 35, 32, 0, 13,
    17, 0, 33, 16, 0, 44, 0, 35, 26, 33, 0, 13, 50, 6, 32, 0, 3, 0, 13, 16, 0,
    27, 16, 0, 35, 0, 53, 32, 0, 13, 27, 0, 55, 0, 29, 0, 53, 0, 13, 27, 27, 16,
    33, 0, 30, 48, 6, 0, 59, 0, 14, 32, 0, 3, 17, 0, 10, 34, 0, 29, 17, 0, 35,
    32, 0, 13, 17, 0, 22, 0, 69, 17, 0, 0, 0, 53, 0, 50, 0, 0, 26, 27, 16, 0,
    33, 16, 0, 44, 0, 35, 26, 0, 8, 0, 33, 0, 54, 0, 44, 0, 35, 26, 27, 21, 0,
    35, 0, 53, 0, 33, 27, 0, 19, 21, 32, 0, 13, 0, 22, 0, 59, 17, 17, 0, 26, 0,
    59, 17, 0, 50, 0, 0, 26, 16, 0, 33, 16, 33, 0, 31, 48, 6, 32, 1, 17, 0, 36,
    16, 0, 0, 0, 70, 17, 0, 70, 11, 2, 32, 1, 26, 32, 0, 1, 17, 0, 2, 32, 0, 11,
    17, 0, 35, 32, 0, 31, 17, 33, 0, 32, 48, 0, 50, 0, 0, 26, 16, 33, 0, 33, 48,
    0, 33, 16, 33, 0, 34, 48, 6, 32, 0, 34, 0, 44, 0, 35, 26, 33, 0, 31, 50, 6,
    32, 0, 34, 0, 44, 0, 35, 26, 33, 0, 33, 50, 6, 32, 0, 34, 0, 44, 0, 35, 26,
    33, 0, 32, 50, 6, 32, 0, 31, 0, 44, 0, 35, 26, 33, 0, 1, 50, 6, 32, 0, 31,
    0, 44, 0, 35, 26, 33, 0, 18, 50, 6, 32, 0, 31, 0, 44, 0, 35, 26, 33, 0, 5,
    50, 6, 32, 0, 31, 0, 44, 0, 35, 26, 33, 0, 6, 50, 6, 0, 14, 0, 53, 0, 70, 0,
    54, 0, 0, 27, 27, 0, 10, 0, 14, 21, 33, 0, 35, 48, 6, 32, 0, 11, 0, 35, 32,
    0, 31, 17, 0, 44, 0, 1, 26, 32, 0, 32, 17, 33, 0, 11, 49, 0, 50, 0, 0, 26,
    16, 0, 33, 16, 33, 0, 13, 49, 6, 34, 0, 11, 0, 35, 32, 0, 13, 17, 0, 12, 32,
    0, 13, 0, 54, 0, 32, 27, 0, 52, 0, 24, 27, 0, 11, 21, 0, 68, 17, 33, 0, 36,
    48, 6, 32, 0, 18, 0, 10, 0, 53, 0, 28, 27, 16, 0, 35, 32, 0, 13, 17, 0, 33,
    16, 0, 44, 0, 35, 26, 33, 0, 13, 50, 6, 32, 0, 31, 0, 35, 32, 0, 13, 17, 33,
    0, 37, 48, 6, 32, 0, 21, 0, 1, 32, 0, 22, 17, 0, 35, 32, 0, 37, 17, 0, 12,
    0, 32, 0, 52, 0, 1, 27, 0, 11, 21, 0, 68, 17, 0, 44, 0, 3, 26, 0, 70, 17, 0,
    0, 0, 69, 17, 33, 0, 38, 48, 6, 32, 1, 17, 0, 36, 16, 0, 0, 0, 71, 17, 0,
    44, 32, 0, 35, 26, 32, 0, 1, 17, 0, 35, 32, 0, 13, 17, 0, 32, 16, 33, 0, 39,
    48, 6, 0, 68, 0, 12, 32, 0, 32, 17, 33, 0, 40, 48, 6, 0, 68, 0, 11, 34, 0,
    32, 17, 0, 32, 16, 33, 0, 41, 48, 6, 32, 0, 40, 0, 32, 16, 32, 0, 41, 11, 2,
    0, 46, 0, 22, 26, 33, 0, 36, 50, 6, 32, 0, 21, 0, 35, 32, 0, 37, 17, 0, 33,
    16, 33, 0, 42, 48, 0, 44, 0, 35, 26, 33, 0, 13, 50, 6, 32, 0, 31, 0, 35, 32,
    0, 13, 17, 33, 0, 37, 49, 6, 32, 0, 13, 0, 33, 16, 33, 0, 43, 48, 6, 32, 1,
    15, 0, 36, 16, 0, 14, 32, 0, 1, 17, 33, 0, 44, 48, 6, 32, 1, 15, 0, 36, 16,
    0, 0, 0, 69, 17, 0, 14, 32, 0, 1, 17, 33, 0, 45, 48, 6, 32, 0, 45, 0, 10,
    32, 0, 40, 17, 33, 0, 46, 48, 0, 50, 0, 0, 26, 16, 33, 0, 47, 48, 6, 0, 20,
    32, 1, 41, 0, 51, 0, 8, 27, 32, 0, 46, 21, 33, 0, 48, 48, 6, 32, 0, 44, 32,
    0, 48, 16, 33, 0, 49, 48, 0, 10, 32, 1, 28, 0, 14, 32, 0, 1, 17, 32, 0, 48,
    16, 17, 33, 0, 50, 48, 6, 32, 0, 45, 0, 32, 32, 0, 46, 17, 33, 0, 51, 48, 0,
    8, 16, 0, 22, 0, 69, 17, 33, 0, 52, 48, 6, 32, 0, 51, 0, 28, 0, 54, 0, 10,
    27, 16, 0, 22, 0, 68, 17, 33, 0, 53, 48, 6, 32, 0, 50, 0, 26, 0, 9, 32, 0,
    51, 21, 0, 11, 0, 26, 0, 53, 0, 1, 27, 21, 0, 69, 17, 32, 0, 46, 0, 32, 20,
    32, 0, 10, 0, 142, 27, 16, 6, 32, 0, 50, 0, 26, 0, 59, 17, 0, 12, 32, 0, 51,
    17, 0, 9, 0, 53, 0, 29, 27, 16, 32, 0, 46, 0, 32, 20, 32, 0, 10, 0, 143, 27,
    16, 6, 34, 0, 45, 0, 32, 16, 0, 22, 32, 0, 41, 17, 0, 35, 34, 0, 51, 0, 28,
    16, 0, 33, 16, 0, 33, 16, 17, 33, 0, 54, 48, 6, 32, 0, 44, 0, 10, 32, 0, 46,
    17, 0, 35, 0, 53, 32, 0, 13, 0, 30, 16, 27, 0, 55, 32, 1, 39, 0, 54, 0, 44,
    0, 35, 26, 27, 27, 34, 0, 44, 17, 33, 0, 55, 48, 0, 32, 16, 33, 0, 56, 48,
    6, 32, 0, 1, 0, 35, 32, 0, 56, 17, 0, 37, 0, 1, 0, 19, 0, 51, 0, 13, 27, 21,
    32, 1, 34, 17, 33, 0, 57, 48, 0, 14, 0, 68, 17, 33, 0, 58, 48, 6, 32, 0, 57,
    0, 14, 0, 53, 0, 70, 27, 0, 9, 32, 0, 58, 0, 29, 0, 69, 17, 21, 0, 10, 0,
    16, 0, 53, 0, 29, 27, 21, 16, 0, 11, 32, 0, 58, 17, 32, 0, 56, 32, 0, 10, 0,
    144, 27, 16, 6, 32, 0, 57, 0, 29, 16, 0, 32, 34, 0, 58, 17, 33, 0, 59, 48,
    6, 34, 0, 57, 0, 14, 0, 68, 17, 0, 44, 0, 32, 26, 33, 0, 56, 50, 6, 32, 0,
    56, 0, 44, 0, 35, 26, 32, 0, 31, 17, 32, 0, 3, 0, 54, 0, 35, 27, 0, 2, 32,
    0, 23, 0, 54, 0, 35, 27, 21, 16, 33, 0, 60, 48, 6, 32, 0, 60, 0, 14, 0, 59,
    17, 33, 0, 61, 48, 0, 28, 0, 0, 0, 29, 0, 53, 0, 69, 27, 21, 16, 33, 0, 62,
    48, 0, 14, 0, 70, 17, 33, 0, 63, 48, 6, 32, 0, 55, 0, 35, 32, 0, 56, 0, 32,
    32, 0, 61, 17, 0, 44, 0, 35, 26, 32, 0, 43, 17, 0, 0, 0, 69, 17, 0, 44, 0,
    35, 26, 32, 0, 13, 17, 17, 32, 0, 56, 0, 32, 32, 0, 61, 21, 32, 0, 10, 0,
    145, 27, 16, 6, 32, 0, 60, 0, 15, 0, 70, 17, 33, 0, 64, 48, 0, 11, 32, 0,
    63, 17, 0, 20, 0, 9, 0, 74, 0, 14, 32, 0, 60, 17, 21, 0, 28, 20, 0, 10, 0,
    29, 21, 16, 33, 0, 65, 48, 6, 34, 0, 64, 0, 10, 32, 0, 61, 17, 0, 9, 32, 0,
    65, 17, 0, 10, 0, 74, 0, 14, 32, 0, 60, 17, 0, 9, 32, 0, 59, 17, 17, 32, 0,
    56, 32, 0, 10, 0, 146, 27, 16, 6, 34, 0, 62, 0, 14, 0, 69, 17, 0, 9, 32, 0,
    60, 0, 14, 0, 68, 17, 17, 0, 11, 32, 0, 65, 17, 33, 0, 66, 48, 0, 10, 32, 0,
    65, 17, 0, 8, 16, 33, 0, 67, 48, 6, 32, 0, 61, 0, 32, 32, 0, 67, 17, 0, 14,
    0, 53, 0, 29, 0, 53, 0, 69, 27, 27, 16, 32, 0, 56, 0, 32, 32, 0, 67, 21, 32,
    0, 10, 0, 147, 27, 16, 6, 32, 0, 22, 0, 35, 32, 0, 31, 17, 0, 8, 16, 0, 2,
    32, 0, 1, 17, 0, 35, 32, 0, 56, 17, 33, 0, 68, 48, 0, 33, 32, 0, 8, 0, 22,
    32, 1, 29, 17, 0, 50, 0, 0, 26, 16, 17, 0, 44, 0, 1, 26, 0, 69, 17, 0, 7, 0,
    74, 17, 33, 0, 69, 48, 6, 32, 0, 69, 0, 13, 0, 69, 17, 0, 9, 32, 0, 60, 0,
    14, 0, 68, 17, 17, 0, 9, 32, 0, 63, 17, 33, 0, 70, 48, 0, 12, 32, 0, 67, 17,
    33, 0, 71, 48, 6, 32, 0, 70, 0, 0, 33, 0, 60, 50, 6, 32, 0, 70, 0, 12, 33,
    0, 63, 50, 6, 32, 0, 60, 0, 5, 0, 70, 17, 0, 44, 0, 1, 26, 0, 69, 17, 0, 2,
    0, 74, 17, 0, 2, 32, 0, 71, 17, 0, 0, 32, 0, 60, 0, 14, 0, 74, 17, 0, 28,
    16, 0, 0, 0, 73, 17, 0, 2, 32, 0, 65, 17, 17, 0, 0, 32, 0, 61, 0, 28, 16, 0,
    0, 0, 69, 17, 0, 2, 32, 0, 66, 17, 0, 0, 34, 0, 70, 17, 17, 33, 0, 72, 48,
    6, 32, 1, 29, 0, 36, 16, 0, 0, 32, 0, 72, 17, 0, 13, 34, 0, 68, 17, 0, 9,
    32, 0, 69, 0, 14, 0, 68, 17, 17, 32, 0, 56, 32, 0, 10, 0, 148, 27, 16, 6,
    32, 0, 60, 0, 14, 0, 68, 17, 0, 9, 32, 0, 63, 17, 0, 10, 32, 0, 61, 17, 0,
    8, 16, 0, 2, 33, 0, 69, 50, 6, 32, 0, 61, 0, 12, 33, 0, 67, 50, 6, 32, 0,
    67, 0, 44, 0, 32, 26, 33, 0, 60, 50, 6, 32, 0, 66, 0, 32, 32, 0, 61, 0, 29,
    0, 69, 17, 17, 33, 0, 73, 48, 6, 34, 0, 65, 0, 2, 32, 0, 59, 17, 0, 29, 0,
    54, 0, 1, 27, 16, 0, 1, 33, 0, 59, 50, 6, 32, 0, 59, 0, 11, 0, 68, 17, 0,
    11, 32, 0, 67, 17, 32, 0, 56, 32, 0, 10, 0, 144, 27, 16, 6, 0, 68, 0, 22,
    32, 0, 73, 17, 0, 35, 0, 53, 0, 50, 0, 0, 26, 27, 32, 0, 61, 17, 0, 12, 32,
    0, 66, 17, 32, 0, 56, 32, 0, 10, 0, 149, 27, 16, 6, 0, 70, 0, 13, 32, 0, 69,
    17, 0, 12, 34, 0, 71, 17, 32, 0, 56, 32, 0, 10, 0, 150, 27, 16, 6, 32, 0,
    67, 0, 44, 0, 32, 26, 33, 0, 59, 50, 6, 32, 0, 60, 0, 14, 0, 69, 17, 0, 10,
    33, 0, 73, 50, 6, 32, 0, 59, 0, 11, 0, 68, 17, 0, 11, 32, 0, 73, 17, 32, 0,
    56, 0, 32, 32, 0, 67, 21, 32, 0, 10, 0, 151, 27, 16, 6, 32, 0, 69, 0, 13, 0,
    68, 17, 33, 0, 74, 48, 0, 0, 0, 69, 17, 0, 2, 34, 0, 66, 17, 0, 6, 32, 0,
    63, 17, 0, 29, 16, 0, 32, 32, 0, 61, 17, 33, 0, 75, 48, 6, 32, 0, 59, 0, 14,
    0, 70, 17, 33, 0, 76, 48, 0, 9, 32, 0, 75, 0, 14, 0, 68, 17, 17, 32, 0, 56,
    0, 32, 32, 0, 67, 21, 32, 0, 10, 0, 152, 27, 16, 6, 32, 0, 52, 0, 28, 0, 11,
    0, 20, 21, 0, 69, 17, 0, 11, 32, 0, 50, 0, 29, 16, 17, 0, 28, 0, 54, 0, 1,
    27, 16, 0, 0, 0, 69, 17, 0, 32, 0, 53, 32, 0, 49, 27, 0, 55, 34, 0, 76, 0,
    2, 0, 70, 17, 0, 6, 34, 0, 75, 17, 27, 16, 33, 0, 77, 48, 6, 34, 0, 67, 0,
    44, 0, 32, 26, 33, 0, 63, 50, 6, 32, 0, 55, 0, 35, 0, 53, 32, 0, 56, 27, 0,
    55, 32, 0, 74, 0, 8, 16, 27, 16, 33, 0, 78, 48, 6, 32, 0, 56, 0, 32, 32, 0,
    74, 17, 0, 44, 0, 35, 26, 32, 0, 43, 17, 33, 0, 79, 48, 6, 32, 0, 69, 0, 32,
    32, 0, 74, 17, 0, 14, 0, 70, 17, 33, 0, 80, 48, 6, 32, 1, 29, 0, 36, 16, 0,
    1, 32, 0, 1, 17, 0, 35, 0, 53, 34, 0, 56, 27, 0, 55, 0, 1, 0, 53, 32, 0, 72,
    27, 0, 2, 34, 0, 69, 0, 11, 0, 68, 17, 21, 0, 0, 0, 20, 21, 27, 16, 0, 33,
    0, 68, 0, 74, 0, 71, 0, 77, 11, 4, 17, 33, 0, 81, 48, 6, 32, 1, 29, 0, 36,
    16, 0, 0, 0, 74, 17, 0, 14, 32, 0, 1, 17, 0, 9, 0, 74, 0, 14, 32, 0, 3, 17,
    0, 35, 32, 0, 31, 17, 17, 0, 0, 33, 0, 81, 50, 6, 34, 0, 81, 0, 54, 0, 14,
    27, 32, 1, 41, 0, 51, 0, 8, 27, 34, 0, 40, 21, 0, 35, 32, 0, 52, 0, 50, 0,
    0, 26, 0, 59, 17, 21, 33, 0, 82, 48, 6, 32, 1, 29, 32, 1, 26, 32, 0, 1, 17,
    0, 11, 32, 0, 78, 17, 0, 32, 16, 33, 0, 83, 48, 6, 0, 69, 32, 0, 82, 16, 33,
    0, 84, 48, 6, 0, 74, 34, 0, 82, 0, 52, 0, 20, 0, 2, 0, 70, 21, 0, 6, 0, 19,
    21, 27, 0, 70, 17, 33, 0, 85, 48, 0, 0, 0, 53, 0, 11, 0, 53, 0, 68, 27, 0,
    10, 32, 0, 84, 21, 27, 16, 33, 0, 86, 48, 6, 32, 0, 84, 0, 32, 32, 0, 49,
    17, 0, 11, 32, 0, 73, 17, 0, 11, 32, 0, 63, 17, 0, 10, 32, 0, 86, 0, 32, 32,
    0, 49, 17, 0, 11, 32, 0, 60, 17, 17, 32, 0, 46, 0, 51, 0, 32, 27, 0, 22, 0,
    68, 21, 0, 32, 32, 0, 49, 21, 32, 0, 10, 0, 153, 27, 16, 6, 32, 0, 86, 0,
    32, 0, 53, 32, 0, 49, 27, 0, 55, 34, 0, 60, 27, 16, 33, 0, 86, 49, 0, 44, 0,
    1, 26, 0, 69, 17, 0, 6, 33, 0, 85, 50, 6, 32, 0, 84, 0, 32, 0, 53, 32, 0,
    49, 27, 0, 55, 0, 6, 0, 53, 34, 0, 73, 27, 27, 16, 33, 0, 84, 49, 6, 32, 0,
    86, 0, 36, 16, 0, 11, 0, 68, 17, 32, 0, 1, 0, 51, 1, 21, 27, 0, 32, 20, 32,
    0, 10, 0, 154, 27, 16, 6, 32, 0, 84, 0, 12, 32, 0, 53, 17, 0, 11, 34, 0, 50,
    0, 32, 0, 53, 32, 0, 49, 27, 0, 55, 34, 0, 63, 0, 8, 16, 27, 16, 0, 10, 0,
    53, 0, 29, 27, 16, 17, 0, 26, 0, 69, 17, 32, 0, 46, 0, 32, 20, 32, 0, 10, 0,
    155, 27, 16, 6, 32, 0, 84, 0, 2, 0, 74, 17, 0, 0, 0, 68, 0, 70, 0, 74, 11,
    3, 0, 35, 32, 0, 85, 17, 17, 33, 0, 87, 48, 6, 32, 0, 84, 0, 32, 32, 0, 49,
    17, 0, 8, 16, 0, 2, 0, 74, 17, 0, 35, 34, 0, 61, 0, 50, 0, 0, 26, 16, 0, 29,
    16, 17, 0, 1, 33, 0, 72, 50, 6, 32, 0, 3, 0, 35, 0, 53, 32, 0, 31, 0, 35,
    32, 0, 41, 17, 27, 0, 55, 34, 0, 86, 0, 32, 32, 0, 52, 17, 0, 26, 0, 69, 17,
    27, 16, 0, 2, 32, 0, 23, 17, 0, 44, 0, 1, 26, 32, 0, 21, 17, 33, 0, 3, 49,
    6, 32, 0, 23, 0, 9, 34, 0, 24, 17, 33, 0, 88, 48, 6, 0, 68, 0, 11, 32, 0, 3,
    17, 0, 44, 0, 22, 26, 0, 69, 17, 0, 35, 32, 0, 30, 17, 33, 0, 89, 48, 0, 29,
    16, 0, 9, 32, 0, 88, 17, 33, 0, 90, 48, 6, 32, 0, 3, 0, 35, 32, 0, 90, 0, 8,
    16, 32, 1, 39, 16, 17, 0, 2, 32, 0, 90, 17, 0, 0, 32, 0, 3, 17, 0, 20, 0,
    15, 0, 70, 21, 0, 11, 32, 0, 89, 21, 0, 1, 0, 20, 21, 0, 6, 0, 20, 0, 14, 0,
    74, 21, 0, 2, 34, 0, 89, 0, 0, 0, 69, 17, 21, 0, 44, 0, 22, 26, 0, 68, 21,
    0, 35, 34, 0, 30, 21, 21, 16, 33, 0, 91, 48, 6, 32, 0, 91, 0, 35, 0, 0, 0,
    6, 0, 69, 21, 0, 5, 0, 20, 21, 34, 0, 90, 0, 8, 16, 0, 50, 0, 0, 26, 16, 0,
    54, 0, 20, 0, 1, 0, 35, 21, 27, 21, 0, 68, 0, 14, 32, 0, 91, 17, 0, 9, 32,
    0, 88, 17, 0, 8, 16, 32, 1, 39, 16, 17, 0, 6, 33, 0, 91, 50, 6, 32, 0, 91,
    0, 29, 16, 0, 2, 34, 0, 88, 17, 0, 0, 33, 0, 3, 50, 6, 32, 0, 25, 0, 14, 0,
    69, 17, 0, 9, 32, 0, 91, 0, 13, 0, 68, 17, 17, 0, 10, 33, 0, 26, 50, 0, 8,
    16, 0, 2, 33, 0, 25, 50, 6, 32, 0, 25, 0, 1, 32, 0, 25, 0, 14, 0, 68, 17, 0,
    2, 32, 0, 91, 17, 17, 33, 0, 91, 49, 6, 0, 59, 0, 14, 32, 0, 3, 17, 0, 29,
    0, 69, 17, 0, 9, 0, 82, 0, 14, 32, 0, 3, 17, 17, 0, 1, 33, 0, 3, 50, 6, 0,
    68, 0, 14, 32, 0, 3, 17, 0, 29, 16, 0, 12, 0, 73, 0, 14, 32, 0, 3, 17, 17,
    32, 0, 31, 0, 51, 0, 33, 27, 32, 0, 10, 0, 156, 27, 16, 6, 34, 0, 19, 0, 20,
    0, 1, 0, 8, 0, 54, 0, 2, 27, 21, 33, 0, 3, 50, 6, 32, 1, 35, 0, 1, 32, 0, 1,
    17, 33, 0, 92, 48, 6, 34, 0, 36, 0, 49, 1, 22, 26, 16, 6, 32, 0, 13, 0, 44,
    0, 35, 26, 33, 0, 1, 50, 6, 34, 0, 55, 0, 35, 32, 0, 13, 17, 33, 0, 93, 48,
    6, 32, 0, 37, 0, 44, 0, 35, 26, 33, 0, 3, 50, 6, 32, 0, 37, 0, 44, 0, 35,
    26, 33, 0, 23, 50, 6, 32, 0, 37, 0, 44, 0, 35, 26, 33, 0, 91, 50, 6, 34, 0,
    21, 0, 12, 34, 0, 22, 17, 0, 35, 32, 0, 37, 17, 0, 32, 16, 0, 22, 34, 0, 42,
    0, 33, 16, 0, 35, 32, 0, 39, 17, 33, 0, 94, 48, 17, 33, 0, 39, 49, 6, 32, 0,
    1, 0, 35, 34, 0, 94, 17, 0, 44, 0, 1, 26, 32, 1, 17, 0, 36, 16, 0, 0, 0, 71,
    17, 17, 0, 44, 0, 22, 26, 32, 0, 38, 0, 46, 0, 68, 26, 16, 17, 33, 0, 95,
    48, 6, 32, 0, 3, 0, 75, 0, 54, 0, 15, 27, 0, 9, 0, 11, 0, 53, 0, 83, 27, 21,
    16, 33, 0, 96, 48, 6, 0, 68, 0, 11, 32, 0, 3, 17, 0, 11, 32, 0, 96, 17, 33,
    0, 97, 48, 6, 32, 0, 97, 0, 29, 16, 32, 1, 39, 16, 0, 44, 0, 35, 26, 32, 0,
    91, 17, 33, 0, 98, 48, 0, 15, 0, 69, 17, 33, 0, 99, 48, 6, 32, 0, 91, 0, 1,
    16, 0, 6, 0, 68, 17, 33, 0, 100, 48, 6, 32, 0, 98, 0, 1, 16, 0, 6, 0, 68,
    17, 33, 0, 101, 48, 6, 32, 0, 13, 33, 0, 27, 49, 6, 34, 0, 37, 0, 44, 0, 35,
    26, 33, 0, 26, 50, 6, 32, 0, 96, 0, 2, 32, 0, 101, 17, 32, 0, 28, 0, 157,
    26, 16, 6, 32, 1, 28, 0, 14, 32, 0, 1, 17, 0, 2, 32, 0, 101, 17, 32, 0, 28,
    0, 158, 26, 16, 6, 0, 70, 0, 16, 32, 0, 3, 17, 0, 9, 0, 70, 0, 11, 32, 0,
    98, 17, 17, 33, 0, 102, 48, 0, 11, 32, 0, 93, 17, 0, 32, 16, 0, 30, 16, 33,
    0, 103, 48, 6, 0, 74, 0, 14, 32, 0, 3, 17, 33, 0, 104, 48, 0, 9, 32, 0, 102,
    17, 0, 28, 16, 0, 10, 32, 0, 102, 17, 33, 0, 105, 48, 6, 0, 70, 0, 27, 16,
    0, 39, 32, 0, 3, 17, 0, 10, 32, 0, 105, 17, 0, 16, 32, 0, 104, 17, 0, 2, 0,
    70, 17, 0, 6, 32, 0, 100, 17, 0, 29, 0, 2, 34, 0, 104, 21, 0, 6, 0, 28, 21,
    0, 70, 17, 0, 2, 32, 0, 102, 17, 32, 0, 28, 0, 159, 26, 16, 6, 32, 1, 27, 0,
    14, 32, 0, 1, 17, 33, 0, 106, 48, 6, 32, 1, 17, 0, 36, 16, 0, 0, 0, 70, 17,
    32, 1, 15, 0, 36, 16, 0, 0, 0, 69, 17, 11, 2, 0, 39, 32, 0, 1, 17, 33, 0,
    107, 48, 6, 32, 1, 17, 0, 36, 16, 0, 0, 0, 73, 17, 0, 44, 34, 0, 35, 26, 32,
    0, 1, 17, 33, 0, 108, 48, 32, 1, 39, 0, 52, 0, 11, 27, 32, 0, 107, 17, 0, 9,
    32, 0, 106, 17, 33, 0, 109, 48, 6, 0, 68, 0, 14, 32, 0, 3, 17, 0, 11, 0, 53,
    0, 10, 0, 53, 0, 29, 27, 27, 32, 0, 105, 17, 0, 28, 0, 54, 0, 9, 27, 16, 32,
    0, 13, 32, 0, 10, 0, 160, 27, 16, 6, 32, 1, 16, 0, 36, 16, 0, 0, 0, 70, 17,
    0, 14, 32, 0, 1, 17, 33, 0, 110, 48, 6, 0, 69, 0, 16, 34, 0, 91, 17, 0, 28,
    16, 0, 9, 32, 0, 110, 17, 0, 11, 32, 0, 99, 17, 33, 0, 111, 48, 6, 32, 0,
    97, 0, 29, 0, 69, 17, 0, 9, 33, 0, 110, 50, 6, 32, 0, 110, 0, 11, 32, 0,
    111, 17, 32, 0, 13, 32, 0, 10, 0, 161, 27, 16, 6, 32, 0, 111, 0, 10, 32, 0,
    105, 17, 0, 8, 16, 0, 30, 0, 55, 32, 1, 38, 0, 1, 0, 19, 21, 0, 53, 0, 13,
    0, 51, 0, 27, 27, 27, 27, 16, 33, 0, 112, 48, 6, 32, 0, 96, 0, 32, 16, 33,
    0, 113, 48, 0, 0, 0, 53, 32, 0, 112, 0, 54, 0, 35, 27, 27, 16, 0, 0, 0, 69,
    17, 33, 0, 114, 48, 6, 0, 69, 0, 22, 32, 0, 97, 17, 0, 35, 32, 0, 114, 17,
    32, 0, 13, 0, 35, 0, 53, 0, 69, 0, 54, 0, 1, 27, 27, 32, 0, 114, 21, 32, 0,
    10, 0, 162, 27, 16, 6, 32, 0, 3, 0, 35, 32, 0, 113, 17, 0, 13, 0, 82, 17,
    33, 0, 115, 48, 6, 32, 0, 3, 0, 35, 32, 0, 114, 17, 33, 0, 116, 48, 6, 32,
    0, 98, 0, 35, 32, 0, 114, 17, 0, 6, 0, 68, 17, 0, 13, 32, 0, 116, 17, 0, 9,
    32, 0, 115, 17, 32, 0, 13, 0, 35, 32, 0, 114, 21, 32, 0, 10, 0, 163, 27, 16,
    6, 32, 0, 1, 0, 35, 32, 0, 113, 17, 0, 44, 0, 1, 26, 32, 1, 16, 0, 36, 16,
    17, 0, 0, 32, 0, 111, 0, 35, 32, 0, 113, 17, 17, 0, 0, 34, 0, 116, 0, 15, 0,
    68, 17, 17, 0, 0, 32, 0, 115, 17, 33, 0, 117, 48, 6, 32, 0, 79, 0, 22, 33,
    0, 114, 50, 6, 32, 0, 1, 0, 46, 0, 68, 26, 16, 0, 35, 0, 53, 32, 0, 114, 27,
    0, 55, 32, 0, 79, 0, 46, 0, 77, 26, 16, 0, 22, 32, 0, 117, 17, 27, 16, 0, 1,
    0, 53, 0, 28, 27, 16, 33, 0, 118, 48, 6, 32, 0, 118, 0, 35, 32, 0, 43, 17,
    0, 2, 0, 53, 0, 50, 0, 0, 26, 0, 14, 0, 68, 21, 0, 10, 0, 53, 0, 29, 0, 53,
    0, 69, 27, 27, 20, 27, 16, 0, 50, 0, 0, 26, 16, 0, 29, 16, 33, 0, 118, 49,
    0, 35, 32, 0, 13, 17, 33, 0, 119, 48, 0, 11, 0, 68, 17, 33, 0, 120, 48, 6,
    32, 0, 119, 0, 14, 0, 71, 17, 33, 0, 121, 48, 6, 32, 0, 100, 0, 14, 0, 70,
    17, 0, 9, 32, 0, 120, 17, 33, 0, 122, 48, 0, 9, 32, 1, 19, 0, 36, 16, 0, 14,
    32, 0, 1, 17, 17, 0, 32, 16, 33, 0, 123, 48, 6, 32, 0, 109, 0, 10, 32, 0,
    108, 17, 0, 29, 16, 0, 15, 32, 0, 23, 17, 0, 11, 32, 0, 122, 17, 0, 2, 32,
    0, 100, 17, 34, 0, 28, 0, 164, 26, 16, 6, 32, 0, 122, 0, 9, 32, 0, 121, 17,
    32, 0, 13, 32, 0, 10, 0, 165, 27, 16, 6, 32, 0, 97, 0, 28, 0, 69, 17, 0, 9,
    32, 1, 17, 0, 36, 16, 0, 0, 0, 77, 17, 0, 14, 32, 0, 1, 17, 17, 0, 11, 32,
    0, 120, 0, 11, 32, 0, 121, 17, 17, 32, 0, 13, 32, 0, 10, 0, 166, 27, 16, 6,
    32, 0, 118, 0, 14, 0, 77, 17, 0, 2, 0, 74, 17, 0, 1, 33, 0, 118, 50, 6, 34,
    0, 119, 0, 14, 0, 77, 17, 33, 0, 124, 48, 6, 32, 0, 100, 0, 14, 0, 69, 17,
    0, 2, 32, 0, 120, 17, 0, 6, 33, 0, 26, 50, 6, 32, 1, 16, 0, 36, 16, 0, 44,
    0, 1, 26, 32, 1, 35, 17, 0, 14, 32, 0, 92, 17, 0, 11, 32, 0, 118, 17, 32, 0,
    48, 16, 33, 0, 125, 48, 6, 32, 0, 26, 0, 35, 32, 0, 43, 17, 34, 0, 48, 16,
    33, 0, 126, 48, 6, 32, 0, 31, 0, 35, 32, 0, 54, 17, 0, 22, 0, 68, 17, 0, 44,
    0, 1, 26, 0, 69, 17, 1, 23, 16, 6, 32, 0, 126, 33, 0, 127, 48, 6, 32, 0, 52,
    32, 1, 40, 0, 52, 0, 16, 27, 33, 0, 126, 50, 6, 0, 68, 0, 14, 32, 0, 77, 17,
    0, 9, 32, 0, 126, 17, 0, 26, 0, 69, 17, 32, 0, 46, 0, 32, 20, 32, 0, 10, 0,
    168, 0, 155, 11, 2, 0, 56, 0, 11, 0, 53, 34, 0, 127, 0, 26, 0, 69, 17, 27,
    0, 49, 0, 10, 26, 20, 27, 27, 16, 6, 32, 0, 126, 0, 2, 0, 70, 17, 0, 6, 33,
    0, 77, 50, 6, 32, 0, 84, 0, 2, 33, 0, 77, 50, 6, 32, 0, 77, 0, 14, 0, 70,
    17, 0, 35, 32, 0, 47, 17, 0, 35, 32, 0, 13, 17, 33, 0, 128, 48, 6, 32, 0,
    128, 0, 14, 0, 1, 0, 19, 21, 33, 0, 100, 50, 6, 34, 0, 128, 0, 14, 0, 1, 0,
    19, 21, 33, 0, 101, 50, 6, 32, 1, 35, 0, 1, 32, 0, 1, 17, 32, 0, 8, 0, 54,
    0, 11, 27, 0, 9, 0, 15, 0, 53, 0, 84, 27, 21, 16, 33, 0, 129, 48, 6, 32, 1,
    35, 0, 0, 32, 0, 8, 17, 0, 16, 32, 0, 1, 17, 0, 9, 32, 0, 124, 17, 33, 0,
    130, 48, 0, 32, 16, 33, 0, 131, 48, 6, 32, 1, 17, 32, 1, 26, 0, 11, 0, 36,
    0, 0, 0, 74, 21, 0, 54, 0, 14, 27, 21, 32, 0, 1, 17, 0, 10, 32, 1, 18, 0,
    36, 16, 0, 14, 32, 0, 1, 17, 0, 28, 16, 0, 12, 32, 0, 97, 17, 17, 0, 10, 34,
    0, 130, 17, 0, 10, 32, 0, 129, 17, 0, 11, 0, 68, 0, 16, 32, 0, 3, 17, 0, 9,
    32, 0, 120, 17, 0, 28, 16, 0, 11, 32, 0, 97, 17, 0, 11, 32, 0, 93, 17, 17,
    33, 0, 132, 48, 6, 34, 0, 122, 0, 10, 34, 0, 132, 17, 0, 10, 32, 0, 96, 17,
    0, 11, 32, 0, 102, 0, 10, 34, 0, 124, 17, 0, 12, 32, 0, 105, 17, 0, 10, 32,
    0, 18, 0, 35, 32, 0, 13, 17, 17, 17, 0, 12, 32, 0, 120, 17, 32, 0, 13, 32,
    0, 10, 0, 169, 27, 16, 6, 32, 0, 120, 0, 35, 32, 0, 113, 17, 0, 11, 0, 70,
    0, 14, 34, 0, 117, 17, 0, 11, 34, 0, 121, 0, 35, 32, 0, 113, 17, 17, 17, 32,
    0, 13, 0, 35, 32, 0, 113, 21, 32, 0, 10, 0, 170, 27, 16, 6, 32, 0, 120, 0,
    12, 0, 53, 0, 29, 27, 16, 0, 9, 32, 0, 3, 0, 15, 0, 68, 17, 17, 0, 9, 32, 0,
    98, 0, 11, 0, 68, 17, 17, 0, 11, 32, 0, 93, 17, 32, 0, 13, 32, 0, 10, 0,
    171, 27, 16, 6, 32, 0, 120, 0, 35, 32, 0, 113, 17, 33, 0, 133, 48, 0, 12,
    33, 0, 115, 50, 6, 32, 0, 113, 0, 32, 34, 0, 133, 17, 33, 0, 134, 48, 6, 32,
    1, 17, 0, 36, 16, 0, 0, 0, 73, 17, 0, 14, 32, 0, 1, 17, 0, 10, 32, 0, 109,
    17, 0, 29, 16, 0, 9, 34, 0, 23, 17, 0, 9, 34, 0, 129, 17, 0, 35, 0, 69, 0,
    1, 32, 0, 134, 17, 17, 0, 8, 16, 32, 0, 13, 0, 35, 32, 0, 134, 21, 32, 0,
    10, 0, 172, 27, 16, 6, 32, 0, 115, 0, 44, 0, 32, 26, 33, 0, 113, 50, 6, 32,
    0, 79, 0, 46, 0, 69, 26, 16, 0, 22, 34, 0, 115, 17, 0, 44, 0, 32, 26, 33, 0,
    114, 50, 6, 34, 0, 18, 0, 29, 16, 33, 0, 135, 48, 0, 32, 16, 33, 0, 136, 48,
    6, 32, 0, 92, 32, 0, 8, 0, 54, 0, 11, 27, 0, 9, 0, 15, 0, 53, 0, 68, 27, 21,
    16, 0, 11, 34, 0, 96, 0, 9, 32, 0, 120, 17, 0, 28, 16, 0, 35, 32, 0, 43, 17,
    0, 10, 34, 0, 135, 17, 0, 10, 34, 0, 78, 17, 17, 0, 32, 16, 33, 0, 137, 48,
    6, 32, 0, 118, 0, 35, 32, 0, 83, 17, 33, 0, 138, 48, 0, 11, 0, 68, 17, 33,
    0, 139, 48, 6, 0, 70, 0, 70, 11, 2, 32, 1, 26, 34, 0, 118, 0, 35, 32, 0,
    137, 17, 33, 0, 140, 48, 17, 33, 0, 141, 48, 6, 0, 73, 0, 11, 34, 0, 138,
    17, 0, 9, 32, 0, 139, 17, 32, 0, 83, 32, 0, 10, 0, 173, 27, 16, 6, 32, 0,
    47, 0, 35, 32, 0, 137, 17, 33, 0, 142, 48, 6, 32, 0, 92, 0, 35, 32, 0, 137,
    17, 33, 0, 143, 48, 6, 32, 0, 7, 0, 13, 16, 0, 11, 32, 0, 143, 17, 0, 9, 32,
    0, 142, 0, 14, 0, 68, 17, 17, 0, 9, 32, 0, 141, 17, 33, 0, 144, 48, 6, 32,
    0, 7, 0, 35, 32, 0, 143, 0, 32, 32, 0, 144, 17, 17, 33, 0, 145, 48, 0, 14,
    0, 68, 17, 32, 0, 137, 0, 32, 32, 0, 144, 21, 32, 0, 10, 0, 174, 27, 16, 6,
    32, 0, 141, 0, 32, 0, 53, 34, 0, 144, 27, 0, 55, 34, 0, 145, 0, 15, 0, 68,
    17, 27, 16, 33, 0, 141, 49, 6, 0, 68, 0, 15, 32, 0, 7, 17, 0, 32, 16, 33, 0,
    146, 48, 0, 46, 0, 68, 26, 16, 33, 0, 147, 48, 6, 32, 0, 143, 0, 32, 32, 0,
    141, 17, 33, 0, 148, 48, 0, 22, 32, 0, 146, 17, 0, 41, 32, 0, 87, 0, 13, 16,
    0, 22, 32, 0, 142, 0, 32, 32, 0, 141, 17, 33, 0, 149, 48, 17, 0, 22, 32, 0,
    147, 17, 33, 0, 150, 48, 17, 33, 0, 151, 48, 6, 32, 0, 34, 0, 35, 34, 0, 54,
    17, 0, 44, 0, 1, 26, 0, 69, 17, 0, 22, 32, 0, 1, 0, 13, 16, 17, 0, 35, 32,
    0, 149, 17, 0, 22, 34, 0, 34, 0, 32, 34, 0, 46, 17, 0, 22, 0, 59, 17, 0, 35,
    34, 0, 142, 17, 0, 0, 32, 0, 140, 0, 14, 0, 69, 17, 17, 17, 33, 0, 152, 48,
    6, 32, 0, 152, 0, 33, 16, 0, 35, 0, 53, 32, 0, 148, 0, 22, 32, 0, 143, 17,
    33, 0, 153, 48, 0, 54, 0, 35, 27, 0, 33, 20, 27, 16, 33, 0, 154, 48, 6, 32,
    0, 154, 0, 32, 0, 53, 0, 15, 0, 53, 32, 0, 141, 0, 13, 16, 27, 27, 16, 1,
    24, 16, 6, 32, 0, 154, 0, 35, 34, 0, 148, 0, 46, 0, 59, 26, 16, 0, 22, 32,
    0, 141, 17, 0, 35, 32, 0, 154, 17, 0, 50, 0, 0, 26, 16, 33, 0, 155, 48, 0,
    33, 16, 17, 0, 32, 0, 53, 32, 0, 141, 0, 13, 16, 0, 54, 0, 11, 27, 27, 16,
    33, 0, 154, 49, 6, 32, 0, 154, 0, 44, 0, 35, 26, 33, 0, 141, 50, 6, 32, 0,
    154, 0, 44, 0, 35, 26, 33, 0, 137, 50, 6, 32, 0, 154, 0, 44, 0, 35, 26, 33,
    0, 140, 50, 6, 34, 0, 155, 0, 11, 0, 68, 17, 0, 10, 0, 53, 0, 29, 27, 16, 0,
    8, 16, 0, 49, 0, 0, 26, 16, 33, 0, 156, 48, 6, 34, 0, 143, 0, 35, 32, 0,
    154, 0, 25, 32, 0, 156, 17, 17, 33, 0, 157, 48, 6, 32, 0, 7, 0, 13, 16, 0,
    16, 32, 0, 157, 17, 32, 0, 137, 0, 25, 32, 0, 156, 21, 32, 0, 10, 32, 0,
    157, 0, 54, 0, 32, 27, 0, 40, 20, 32, 1, 31, 0, 175, 21, 27, 16, 6, 32, 0,
    140, 0, 11, 0, 68, 17, 33, 0, 158, 48, 0, 9, 0, 74, 0, 11, 34, 0, 140, 17,
    17, 33, 0, 159, 48, 6, 34, 0, 33, 0, 35, 32, 0, 137, 17, 0, 35, 0, 53, 32,
    0, 141, 32, 1, 39, 16, 0, 26, 32, 0, 156, 17, 27, 0, 22, 34, 0, 7, 0, 6, 0,
    68, 17, 0, 1, 16, 33, 0, 160, 48, 0, 35, 32, 0, 157, 17, 21, 0, 1, 0, 20,
    21, 16, 33, 0, 161, 48, 6, 32, 0, 161, 0, 11, 0, 68, 17, 0, 9, 32, 0, 159,
    17, 32, 0, 137, 32, 0, 10, 0, 176, 27, 16, 6, 34, 0, 159, 32, 1, 41, 0, 26,
    0, 69, 21, 0, 16, 0, 32, 21, 32, 0, 141, 17, 33, 0, 162, 48, 0, 35, 34, 0,
    154, 0, 32, 32, 0, 141, 17, 0, 33, 16, 33, 0, 163, 48, 17, 0, 22, 34, 0,
    147, 17, 0, 41, 34, 0, 150, 17, 33, 0, 164, 48, 6, 34, 0, 149, 0, 22, 34, 0,
    160, 17, 0, 38, 0, 0, 32, 0, 87, 0, 54, 0, 35, 27, 21, 16, 0, 20, 0, 26, 0,
    53, 0, 13, 27, 34, 0, 146, 21, 0, 35, 0, 53, 0, 33, 27, 34, 0, 163, 21, 0,
    35, 32, 0, 141, 0, 26, 34, 0, 156, 17, 0, 50, 0, 0, 26, 0, 59, 17, 21, 0,
    22, 0, 35, 0, 53, 34, 0, 157, 27, 21, 16, 33, 0, 165, 48, 6, 32, 0, 161, 0,
    11, 0, 68, 17, 32, 1, 41, 0, 11, 34, 0, 162, 0, 22, 0, 69, 17, 21, 0, 35, 0,
    53, 0, 50, 0, 0, 26, 27, 0, 19, 21, 32, 0, 141, 17, 0, 9, 32, 0, 141, 0, 28,
    0, 69, 17, 0, 11, 32, 0, 158, 17, 17, 33, 0, 166, 48, 6, 32, 0, 92, 0, 35,
    32, 0, 83, 17, 0, 0, 0, 74, 17, 0, 0, 32, 0, 84, 0, 2, 0, 74, 17, 0, 35, 32,
    0, 47, 0, 35, 32, 0, 83, 17, 33, 0, 167, 48, 17, 17, 33, 0, 168, 48, 6, 34,
    0, 167, 0, 2, 0, 77, 17, 0, 0, 32, 0, 168, 17, 0, 30, 0, 55, 0, 39, 27, 16,
    0, 22, 33, 0, 166, 50, 6, 0, 69, 0, 1, 32, 0, 79, 17, 0, 44, 0, 35, 26, 32,
    0, 13, 17, 0, 0, 0, 69, 17, 32, 0, 136, 32, 0, 83, 0, 22, 32, 0, 137, 17,
    11, 3, 0, 32, 0, 74, 0, 70, 0, 74, 11, 3, 17, 0, 22, 16, 33, 0, 169, 48, 6,
    34, 0, 139, 0, 22, 34, 0, 158, 17, 0, 12, 0, 2, 0, 70, 21, 0, 0, 0, 20, 21,
    34, 0, 166, 17, 0, 0, 0, 85, 17, 33, 0, 170, 48, 6, 32, 0, 79, 0, 46, 0, 85,
    26, 16, 32, 0, 79, 0, 46, 0, 68, 26, 16, 34, 0, 72, 0, 32, 34, 0, 74, 17,
    32, 0, 136, 0, 46, 0, 81, 26, 16, 34, 0, 92, 0, 35, 34, 0, 136, 17, 34, 0,
    170, 34, 0, 83, 0, 46, 0, 68, 26, 16, 0, 22, 34, 0, 161, 17, 34, 0, 168, 0,
    22, 34, 0, 165, 17, 11, 8, 33, 0, 171, 48, 6, 32, 0, 105, 0, 8, 16, 0, 50,
    0, 0, 26, 16, 32, 1, 38, 0, 1, 0, 20, 21, 32, 0, 97, 17, 0, 7, 0, 10, 0, 12,
    21, 0, 70, 17, 0, 9, 32, 0, 99, 17, 33, 0, 172, 48, 6, 34, 0, 102, 0, 29,
    16, 0, 10, 0, 69, 0, 14, 32, 0, 3, 17, 17, 33, 0, 173, 48, 0, 11, 32, 0,
    120, 0, 11, 32, 0, 97, 17, 0, 10, 0, 53, 0, 28, 27, 16, 0, 10, 32, 0, 105,
    17, 0, 10, 34, 0, 172, 17, 0, 10, 32, 0, 93, 17, 33, 0, 174, 48, 17, 0, 32,
    16, 33, 0, 175, 48, 6, 34, 0, 173, 0, 10, 34, 0, 174, 17, 0, 12, 32, 0, 99,
    17, 32, 0, 13, 32, 0, 10, 0, 177, 27, 16, 6, 0, 68, 0, 14, 32, 0, 3, 17, 0,
    11, 32, 0, 105, 17, 0, 10, 0, 68, 0, 16, 32, 0, 3, 17, 0, 9, 34, 0, 99, 17,
    17, 0, 8, 16, 0, 2, 0, 70, 17, 0, 6, 34, 0, 100, 17, 0, 28, 0, 70, 17, 0,
    35, 32, 0, 175, 17, 33, 0, 176, 48, 0, 13, 0, 70, 17, 33, 0, 177, 48, 6, 32,
    1, 27, 0, 11, 32, 0, 1, 17, 0, 11, 34, 0, 93, 17, 0, 32, 16, 33, 0, 178, 48,
    0, 44, 0, 35, 26, 32, 0, 1, 17, 33, 0, 179, 48, 0, 40, 16, 0, 9, 16, 33, 0,
    180, 48, 0, 44, 0, 37, 26, 34, 0, 179, 17, 33, 0, 181, 48, 6, 34, 0, 8, 0,
    0, 32, 1, 35, 17, 33, 0, 182, 48, 0, 16, 32, 0, 1, 17, 0, 32, 16, 33, 0,
    183, 48, 0, 22, 34, 0, 178, 17, 33, 0, 184, 48, 6, 32, 0, 1, 0, 35, 34, 0,
    183, 17, 0, 0, 32, 0, 180, 0, 13, 16, 0, 44, 0, 1, 26, 34, 0, 182, 17, 17,
    0, 22, 33, 0, 181, 50, 6, 34, 0, 43, 0, 35, 34, 0, 41, 17, 33, 0, 185, 48,
    6, 0, 68, 0, 22, 32, 0, 109, 17, 0, 50, 0, 0, 26, 16, 0, 32, 0, 69, 0, 22,
    32, 0, 108, 17, 17, 0, 26, 0, 69, 17, 0, 29, 0, 54, 0, 1, 27, 16, 0, 0, 34,
    0, 97, 0, 28, 0, 69, 17, 0, 32, 34, 0, 108, 17, 0, 8, 16, 17, 0, 44, 0, 22,
    26, 34, 0, 38, 17, 33, 0, 186, 48, 6, 0, 83, 0, 14, 32, 0, 3, 17, 0, 29, 16,
    0, 10, 34, 0, 109, 17, 0, 10, 32, 0, 101, 0, 14, 0, 70, 17, 17, 0, 12, 34,
    0, 106, 17, 0, 32, 16, 0, 22, 32, 0, 79, 0, 32, 0, 53, 0, 8, 27, 32, 0, 80,
    17, 17, 33, 0, 187, 48, 6, 34, 0, 107, 0, 32, 16, 33, 0, 188, 48, 6, 32, 1,
    28, 0, 14, 32, 0, 1, 17, 0, 32, 16, 33, 0, 189, 48, 6, 32, 0, 177, 0, 0, 32,
    0, 175, 17, 0, 0, 0, 53, 32, 0, 112, 0, 54, 0, 35, 27, 0, 2, 32, 0, 177, 21,
    27, 16, 33, 0, 190, 48, 6, 32, 0, 190, 0, 32, 34, 0, 101, 0, 35, 32, 0, 175,
    17, 33, 0, 191, 48, 0, 14, 0, 70, 17, 33, 0, 192, 48, 0, 2, 32, 0, 177, 0,
    0, 0, 69, 17, 17, 17, 0, 22, 33, 0, 187, 50, 6, 32, 0, 192, 0, 8, 16, 33, 0,
    192, 49, 6, 32, 0, 192, 0, 44, 0, 32, 26, 33, 0, 175, 50, 6, 32, 0, 192, 0,
    44, 0, 32, 26, 33, 0, 190, 50, 6, 34, 0, 80, 0, 1, 16, 0, 22, 34, 0, 110, 0,
    0, 32, 0, 111, 17, 0, 0, 32, 0, 1, 17, 0, 35, 32, 0, 113, 17, 0, 44, 0, 1,
    26, 32, 1, 16, 0, 36, 16, 0, 0, 0, 69, 17, 17, 0, 6, 0, 68, 17, 17, 0, 0, 0,
    86, 17, 33, 0, 193, 48, 6, 32, 0, 184, 32, 0, 184, 32, 0, 185, 32, 0, 185,
    32, 0, 131, 32, 0, 123, 32, 0, 39, 0, 32, 0, 70, 17, 32, 0, 114, 32, 0, 187,
    32, 0, 189, 0, 69, 0, 0, 32, 0, 134, 17, 0, 69, 0, 0, 32, 0, 134, 17, 34, 0,
    112, 0, 35, 32, 0, 103, 17, 0, 6, 0, 69, 17, 0, 0, 32, 0, 103, 17, 34, 0,
    190, 32, 0, 188, 11, 15, 33, 0, 194, 48, 0, 22, 16, 0, 44, 0, 35, 26, 32, 0,
    13, 17, 0, 22, 32, 0, 169, 17, 33, 0, 195, 48, 0, 33, 16, 33, 0, 196, 48, 6,
    34, 0, 184, 0, 46, 0, 68, 26, 16, 34, 0, 181, 32, 0, 185, 0, 46, 0, 69, 26,
    16, 34, 0, 185, 0, 13, 16, 0, 27, 16, 0, 0, 0, 69, 17, 34, 0, 131, 0, 46, 0,
    87, 26, 16, 34, 0, 123, 0, 46, 0, 88, 26, 16, 34, 0, 186, 0, 23, 34, 0, 120,
    0, 35, 34, 0, 39, 17, 0, 0, 34, 0, 95, 17, 0, 0, 0, 66, 17, 17, 0, 31, 16,
    0, 21, 16, 34, 0, 193, 34, 0, 187, 0, 46, 0, 77, 26, 16, 34, 0, 189, 0, 46,
    0, 89, 26, 16, 32, 0, 134, 0, 46, 0, 90, 26, 16, 34, 0, 1, 0, 35, 0, 69, 0,
    1, 34, 0, 134, 17, 17, 0, 44, 0, 1, 26, 32, 1, 35, 17, 34, 0, 3, 0, 35, 32,
    0, 103, 17, 0, 0, 0, 62, 17, 34, 0, 98, 0, 35, 32, 0, 175, 17, 0, 11, 0, 68,
    17, 0, 2, 0, 73, 17, 0, 0, 34, 0, 176, 0, 14, 0, 69, 17, 0, 6, 34, 0, 191,
    17, 0, 2, 0, 70, 17, 0, 0, 34, 0, 177, 17, 0, 32, 34, 0, 192, 17, 17, 0, 0,
    0, 91, 17, 32, 0, 125, 0, 0, 0, 63, 17, 33, 0, 197, 48, 0, 26, 0, 59, 17,
    11, 15, 0, 22, 34, 0, 171, 17, 0, 22, 16, 0, 35, 32, 0, 196, 17, 33, 0, 198,
    48, 6, 34, 0, 194, 0, 46, 0, 13, 26, 16, 0, 22, 34, 0, 169, 0, 13, 16, 17,
    0, 35, 0, 46, 0, 27, 0, 54, 0, 0, 27, 26, 0, 50, 0, 0, 26, 0, 29, 20, 0, 54,
    0, 35, 27, 21, 0, 72, 0, 65, 0, 92, 11, 3, 17, 33, 0, 199, 48, 6, 34, 0,
    195, 0, 35, 0, 53, 32, 0, 199, 0, 22, 16, 27, 0, 55, 34, 0, 113, 34, 0, 79,
    11, 2, 0, 46, 0, 13, 26, 16, 0, 44, 0, 32, 26, 0, 69, 0, 68, 11, 2, 17, 0,
    1, 34, 0, 114, 17, 34, 0, 103, 32, 0, 175, 11, 3, 0, 22, 16, 0, 44, 0, 35,
    26, 32, 0, 13, 17, 27, 16, 33, 0, 200, 48, 6, 32, 0, 5, 32, 0, 6, 11, 2, 0,
    46, 0, 35, 0, 53, 0, 35, 0, 53, 32, 0, 196, 27, 0, 44, 0, 22, 26, 0, 59, 21,
    27, 26, 32, 0, 200, 34, 0, 200, 0, 35, 0, 53, 34, 0, 199, 0, 36, 0, 59, 17,
    27, 0, 55, 34, 0, 111, 0, 10, 34, 0, 105, 17, 0, 8, 16, 0, 29, 16, 32, 1,
    39, 16, 0, 35, 34, 0, 175, 17, 0, 44, 0, 35, 26, 32, 0, 13, 17, 27, 16, 11,
    2, 17, 33, 0, 201, 48, 6, 32, 0, 49, 0, 32, 0, 53, 34, 0, 49, 27, 0, 55, 32,
    0, 59, 27, 16, 33, 0, 59, 49, 0, 11, 0, 68, 17, 0, 10, 32, 0, 77, 0, 13, 0,
    69, 17, 0, 9, 32, 0, 84, 17, 17, 0, 10, 33, 0, 53, 50, 6, 32, 0, 53, 0, 32,
    16, 33, 0, 202, 48, 0, 44, 0, 35, 26, 34, 0, 77, 17, 33, 0, 203, 48, 0, 14,
    0, 69, 17, 0, 0, 0, 69, 17, 33, 0, 204, 48, 0, 32, 16, 33, 0, 205, 48, 6,
    34, 0, 203, 0, 11, 0, 69, 17, 0, 0, 34, 0, 59, 0, 35, 32, 0, 202, 17, 0, 2,
    0, 70, 17, 17, 0, 5, 0, 73, 17, 33, 0, 206, 48, 6, 32, 0, 52, 0, 35, 32, 0,
    202, 17, 33, 0, 207, 48, 0, 50, 0, 0, 26, 0, 59, 17, 33, 0, 208, 48, 6, 32,
    0, 206, 0, 0, 34, 0, 204, 17, 0, 35, 0, 53, 0, 34, 0, 51, 0, 35, 0, 53, 32,
    0, 208, 0, 54, 0, 35, 27, 0, 33, 20, 0, 32, 34, 0, 207, 21, 27, 27, 27, 16,
    0, 6, 32, 0, 84, 0, 32, 32, 0, 53, 0, 9, 32, 0, 52, 17, 17, 0, 8, 16, 0, 1,
    0, 70, 17, 17, 33, 0, 209, 48, 6, 32, 0, 202, 0, 35, 32, 0, 205, 17, 0, 41,
    32, 0, 209, 0, 50, 0, 0, 26, 16, 0, 22, 0, 68, 17, 0, 26, 0, 35, 34, 0, 208,
    21, 0, 0, 34, 0, 206, 21, 0, 35, 0, 0, 0, 19, 0, 51, 0, 38, 27, 21, 34, 0,
    205, 21, 0, 44, 0, 22, 26, 0, 25, 21, 0, 59, 17, 17, 0, 41, 0, 53, 0, 32,
    27, 34, 0, 209, 17, 33, 0, 202, 49, 6, 34, 0, 85, 0, 32, 32, 0, 52, 17, 34,
    0, 84, 0, 8, 16, 0, 32, 32, 0, 52, 17, 32, 0, 52, 0, 32, 16, 0, 32, 0, 53,
    34, 0, 53, 0, 32, 34, 0, 52, 17, 27, 0, 55, 34, 0, 202, 27, 16, 11, 3, 33,
    0, 210, 48, 6, 34, 0, 188, 0, 13, 0, 52, 0, 1, 27, 32, 0, 198, 17, 0, 16,
    34, 0, 196, 17, 0, 22, 0, 69, 17, 0, 32, 16, 32, 0, 151, 0, 46, 0, 13, 26,
    16, 0, 0, 34, 0, 87, 17, 34, 0, 151, 34, 0, 164, 11, 4, 33, 0, 211, 48, 6,
    34, 0, 197, 0, 36, 0, 59, 17, 0, 22, 34, 0, 198, 17, 34, 0, 180, 34, 0, 210,
    34, 0, 211, 34, 0, 201, 11, 5, 7, 11, 0, 0, 46, 0, 178, 0, 51, 0, 42, 27,
    26, 11, 0, 0, 68, 0, 27, 16, 11, 4, 33, 0, 3, 48, 6, 34, 0, 2, 0, 13, 0, 11,
    0, 73, 21, 0, 58, 0, 24, 27, 16, 0, 43, 34, 0, 3, 26, 0, 26, 0, 13, 21, 0,
    54, 0, 22, 27, 16, 33, 0, 4, 33, 0, 5, 33, 0, 6, 33, 0, 7, 12, 4, 48, 6, 34,
    0, 1, 32, 1, 42, 34, 0, 5, 32, 0, 6, 11, 2, 17, 33, 0, 8, 48, 33, 0, 9, 33,
    0, 10, 33, 0, 11, 33, 0, 12, 33, 0, 13, 12, 5, 48, 6, 34, 0, 9, 32, 1, 44,
    34, 0, 10, 32, 0, 11, 0, 36, 16, 34, 0, 12, 34, 0, 13, 34, 0, 6, 0, 46, 0,
    68, 26, 16, 0, 29, 34, 0, 7, 17, 11, 5, 17, 33, 0, 14, 33, 0, 15, 33, 0, 16,
    33, 0, 17, 33, 0, 18, 12, 5, 48, 6, 34, 0, 14, 34, 0, 11, 0, 26, 0, 69, 17,
    0, 22, 34, 0, 4, 0, 35, 34, 0, 15, 17, 11, 1, 17, 0, 22, 16, 34, 0, 16, 0,
    12, 16, 0, 31, 16, 0, 45, 0, 11, 26, 16, 34, 0, 17, 0, 12, 16, 0, 31, 16, 0,
    45, 0, 11, 26, 16, 34, 0, 18, 34, 0, 8, 11, 6, 7, 34, 0, 1, 34, 0, 2, 16, 7,
    32, 0, 2, 0, 35, 32, 0, 1, 17, 0, 22, 34, 0, 1, 17, 0, 36, 0, 53, 0, 59, 27,
    0, 52, 0, 13, 27, 0, 58, 34, 0, 0, 27, 34, 0, 2, 0, 44, 0, 35, 26, 16, 17,
    7, 34, 0, 1, 0, 32, 16, 0, 36, 16, 0, 119, 11, 2, 0, 42, 16, 7, 34, 0, 1, 0,
    22, 0, 68, 17, 0, 35, 0, 53, 0, 50, 0, 0, 26, 27, 32, 1, 31, 17, 0, 9, 32,
    1, 32, 17, 0, 44, 0, 32, 26, 32, 1, 26, 17, 0, 120, 11, 2, 0, 42, 16, 7, 32,
    1, 26, 0, 32, 34, 0, 1, 17, 0, 121, 11, 2, 0, 42, 16, 7, 32, 1, 26, 0, 32,
    34, 0, 1, 17, 0, 122, 11, 2, 0, 42, 16, 7, 34, 0, 2, 0, 32, 34, 0, 1, 17, 0,
    44, 0, 35, 26, 32, 1, 26, 17, 0, 123, 11, 2, 0, 42, 16, 7, 32, 0, 2, 0, 44,
    0, 32, 26, 33, 1, 26, 50, 6, 32, 0, 2, 0, 44, 0, 32, 26, 33, 1, 25, 50, 6,
    34, 0, 1, 0, 32, 34, 0, 2, 17, 7, 0, 49, 0, 10, 26, 0, 58, 34, 0, 1, 0, 24,
    34, 0, 2, 0, 54, 0, 32, 27, 21, 0, 42, 20, 27, 7, 32, 0, 1, 0, 54, 0, 36,
    27, 33, 0, 3, 48, 6, 0, 26, 0, 25, 11, 2, 0, 46, 1, 25, 26, 16, 33, 0, 4,
    33, 0, 5, 12, 2, 48, 6, 0, 36, 0, 55, 0, 26, 0, 53, 0, 59, 27, 27, 0, 24,
    20, 33, 0, 6, 48, 6, 0, 46, 0, 25, 26, 0, 30, 20, 0, 46, 0, 22, 26, 0, 46,
    0, 26, 26, 21, 0, 53, 0, 59, 0, 68, 11, 2, 27, 33, 0, 7, 48, 6, 1, 26, 33,
    0, 8, 48, 6, 32, 2, 17, 32, 2, 26, 34, 0, 1, 17, 0, 32, 16, 0, 30, 16, 0,
    49, 0, 46, 34, 0, 8, 26, 0, 22, 20, 0, 32, 0, 53, 0, 46, 0, 36, 26, 0, 39,
    20, 27, 20, 0, 25, 0, 53, 0, 13, 0, 5, 0, 81, 21, 27, 20, 26, 0, 68, 0, 27,
    16, 0, 44, 0, 24, 26, 16, 0, 24, 16, 17, 0, 46, 0, 22, 26, 16, 0, 36, 0, 53,
    0, 46, 0, 13, 26, 0, 49, 0, 5, 26, 0, 37, 0, 20, 21, 0, 36, 20, 20, 27, 16,
    33, 0, 9, 48, 6, 0, 69, 32, 0, 9, 32, 1, 10, 34, 0, 9, 32, 2, 31, 0, 132,
    17, 27, 16, 7, 0, 14, 0, 58, 0, 49, 0, 10, 26, 27, 0, 58, 34, 0, 1, 0, 24,
    34, 0, 2, 0, 54, 0, 32, 27, 0, 44, 0, 69, 0, 57, 0, 35, 27, 26, 0, 43, 32,
    1, 6, 26, 0, 23, 32, 1, 5, 21, 21, 0, 31, 0, 51, 0, 9, 27, 20, 21, 0, 42,
    20, 27, 7, 32, 1, 15, 0, 22, 0, 68, 17, 0, 32, 32, 0, 1, 17, 0, 12, 32, 2,
    17, 0, 36, 16, 0, 0, 0, 73, 17, 17, 32, 1, 13, 0, 22, 0, 68, 21, 0, 32, 34,
    0, 1, 21, 32, 1, 10, 0, 137, 27, 16, 7, 34, 0, 1, 0, 6, 33, 1, 26, 50, 0,
    14, 0, 70, 17, 32, 1, 27, 32, 1, 10, 34, 0, 4, 27, 16, 7, 32, 2, 29, 32, 2,
    26, 34, 0, 1, 17, 0, 9, 32, 1, 47, 0, 14, 0, 68, 17, 17, 7, 32, 1, 5, 0, 35,
    0, 53, 32, 0, 1, 27, 0, 55, 32, 1, 5, 0, 35, 32, 0, 2, 17, 27, 16, 33, 1, 5,
    49, 6, 32, 1, 6, 0, 35, 0, 53, 34, 0, 2, 27, 0, 55, 32, 1, 6, 0, 35, 34, 0,
    1, 17, 27, 16, 33, 1, 6, 49, 7, 32, 1, 25, 0, 35, 32, 0, 1, 17, 0, 2, 0, 53,
    0, 8, 27, 32, 1, 125, 17, 0, 6, 33, 1, 126, 50, 0, 14, 0, 70, 17, 32, 1, 31,
    0, 51, 0, 33, 27, 0, 35, 34, 0, 1, 21, 32, 1, 10, 0, 167, 27, 16, 7, 32, 1,
    152, 0, 35, 0, 53, 32, 0, 1, 27, 0, 13, 0, 53, 0, 29, 27, 20, 0, 52, 0, 10,
    27, 32, 1, 153, 17, 0, 8, 16, 32, 1, 137, 0, 32, 0, 53, 32, 1, 141, 27, 0,
    54, 0, 22, 27, 20, 0, 35, 34, 0, 1, 21, 32, 1, 10, 0, 174, 27, 16, 7, 0, 44,
    0, 24, 34, 0, 1, 20, 0, 54, 0, 46, 0, 22, 26, 27, 26, 0, 24, 20, 7, 34, 0,
    1, 32, 1, 4, 32, 1, 5, 0, 20, 32, 1, 6, 20, 32, 1, 7, 0, 54, 34, 0, 0, 27,
    0, 22, 32, 1, 5, 21, 11, 2, 0, 56, 0, 36, 0, 36, 0, 59, 21, 0, 54, 32, 1, 3,
    0, 52, 0, 1, 27, 27, 0, 13, 0, 69, 21, 27, 11, 2, 0, 56, 0, 20, 0, 51, 0,
    36, 0, 51, 0, 13, 27, 27, 0, 11, 0, 68, 21, 27, 11, 2, 0, 56, 32, 1, 3, 0,
    7, 0, 70, 21, 27, 34, 0, 2, 19, 7,
  ],
  [
    runtime[0],
    runtime[1],
    runtime[2],
    runtime[3],
    runtime[4],
    runtime[6],
    runtime[7],
    runtime[8],
    runtime[9],
    runtime[10],
    runtime[11],
    runtime[12],
    runtime[13],
    runtime[14],
    runtime[15],
    runtime[16],
    runtime[17],
    runtime[18],
    runtime[19],
    runtime[20],
    runtime[21],
    runtime[22],
    runtime[23],
    runtime[24],
    runtime[25],
    runtime[26],
    runtime[27],
    runtime[28],
    runtime[29],
    runtime[30],
    runtime[31],
    runtime[32],
    runtime[33],
    runtime[34],
    runtime[35],
    runtime[36],
    runtime[37],
    runtime[38],
    runtime[39],
    runtime[40],
    runtime[41],
    runtime[42],
    runtime[43],
    runtime[44],
    runtime[45],
    runtime[46],
    runtime[47],
    runtime[48],
    runtime[49],
    runtime[50],
    runtime[52],
    runtime[53],
    runtime[54],
    runtime[55],
    runtime[56],
    runtime[57],
    runtime[59],
    runtime[60],
    runtime[62],
    -1,
    26,
    23,
    24,
    7,
    10,
    13,
    11,
    9,
    0,
    1,
    2,
    5,
    8,
    4,
    3,
    -3,
    -2,
    6,
    17,
    Math.PI,
    Infinity,
    64,
    -4,
    -5,
    -6,
    32,
    48,
    43,
    44,
    42,
    66,
    16,
    14,
    '\0',
    '0',
    '#',
    "'",
    '"',
    '@',
    str('aA'),
    str('àÀ'),
    str('⋄,'),
    str(':;?'),
    str('⇐←↩'),
    str('(){}⟨⟩[]'),
    str('‿'),
    str('·'),
    str('𝕊𝕏𝕎𝔽𝔾𝕤𝕩𝕨𝕣𝕗𝕘'),
    str('.¯π∞'),
    str('_'),
    str('•'),
    str('𝕨'),
    str(' '),
    str('#\'"@'),
    str('s'),
    str('Unknown character'),
    str(': '),
    str('Character set conflict: '),
    str('˜⁼'),
    str('Unclosed quote'),
    str("Words can't only have underscores"),
    str('System dot with no name'),
    str("𝕣 can't be used with other word characters"),
    str("Numbers can't start with underscores"),
    str('Letter'),
    str(' "'),
    str('" not allowed in numbers'),
    str('ea'),
    str('Negative sign in the middle of a number'),
    str('Portion of a number is empty'),
    str('Ill-formed decimal or exponent use'),
    str('π and ∞ must occur alone'),
    str('Unmatched bracket'),
    str('Empty program'),
    str('Swapped open and closed brackets'),
    str("Parentheses can't contain separators"),
    str('Punctuation : ; ? outside block top level'),
    str('Empty statement or expression'),
    str('Invalid assignment or stranding use'),
    str("Can't use export statement as expression"),
    str("Can't use export statement as predicate"),
    str('Dot must be followed by a name'),
    str('Header-less bodies must come last'),
    str('At most two header-less bodies allowed'),
    str('Invalid Undo header syntax'),
    str('Only one header per body allowed'),
    str('Missing operand in header'),
    str('Invalid header structure'),
    str('Incorrect special name'),
    str('Header left argument without right'),
    str('Header operation must be a plain name'),
    str('Header with ⁼ must take arguments'),
    str('Header with ˜⁼ must have left argument'),
    str('Block header type conflict'),
    str('Special name outside of any block'),
    str('Unreachable body'),
    str('Dot must be preceded by a subject'),
    str('Nothing (·) cannot be assigned'),
    str("Can't use Nothing (·) as predicate"),
    str('Missing operand'),
    str('Double subjects (missing ‿?)'),
    str('No right-hand side in non-modified assignment'),
    str('Assignment role mismatch or missing modified assignment target'),
    str('Role of the two sides in assignment must match'),
    str("Can't use Nothing (·) in lists"),
    str("Can't modify Nothing (·)"),
    str("Square brackets can't be empty"),
    str("Can't return Nothing (·)"),
    str('Invalid use of 𝕨 in monadic case'),
    str('Assignment target must be a name or list of targets'),
    str("Can't nest assignments (write aliases with ⇐)"),
    str("Can't use result of function/modifier assignment without parentheses"),
    str('Alias must have a name on the right and appear within ⟨⟩'),
    str("Can't define special name"),
    str('Redefinition'),
    str('Undefined identifier'),
    str("Can't export from surrounding scope"),
    str('Second-level parts of a train must be functions'),
    str('System values not supported'),
  ],
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
let compgen = sys => {
  let gl = sys.glyphs,
    rt = sys.runtime;
  let comp = compgen_raw(list(gl));
  return (sys.comps = sysargs => {
    let system = (x, w) => {
      let r = table(s => sysvals[unstr(s)])(x);
      if (r.some(v => !has(v))) {
        let m = x
          .filter((_, i) => !has(r[i]))
          .map(s => '•' + unstr(s))
          .join(' ');
        throw Error('Unknown system values (see •listSys for available): ' + m);
      }
      return table(v => (v.dynamic ? v(sysargs) : v))(r);
    };
    let rts = list([rt, system].concat(sysargs.addrt || []));
    return src => {
      let s = str(src),
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
let sysargs = { runtime, glyphs: glyphs.map(str) };
let compile = compgen(sysargs)(sysargs);
let bqn = src => run(...compile(src));
runtime[43] = rtAssert;

// Formatter
let fmtnum = x =>
  str(
    x == Infinity
      ? '∞'
      : x == -Infinity
      ? '¯∞'
      : ('' + x).replace(/-/g, '¯').replace(/\+/g, ''),
  );
let placeholder = ['array', 'function', '1-modifier', '2-modifier'].map(s =>
  str('*' + s + '*'),
);
let repop = x =>
  x.ns
    ? str('{' + listkeys(x).join('‿') + '⇐}')
    : gl[x.prim] || placeholder[type(x) - 2];
let [fmt1, repr] = run(
  [
    1, 1, 7, 34, 0, 1, 33, 0, 3, 33, 0, 4, 33, 0, 5, 33, 0, 6, 12, 4, 48, 6, 0,
    71, 0, 16, 0, 19, 0, 19, 21, 0, 42, 0, 72, 27, 11, 2, 0, 46, 0, 10, 0, 42,
    0, 61, 27, 27, 32, 0, 6, 11, 2, 0, 46, 0, 61, 0, 43, 0, 8, 27, 27, 33, 0, 7,
    48, 6, 1, 2, 33, 0, 8, 48, 6, 0, 11, 0, 8, 0, 53, 21, 0, 48, 1, 3, 27, 33,
    0, 9, 48, 6, 1, 4, 33, 0, 10, 48, 6, 1, 5, 33, 0, 11, 48, 6, 1, 6, 1, 7, 11,
    2, 0, 46, 1, 8, 0, 52, 11, 2, 0, 46, 0, 10, 0, 43, 0, 10, 0, 42, 0, 52, 27,
    0, 41, 0, 7, 27, 27, 27, 27, 33, 0, 12, 48, 6, 0, 81, 0, 20, 0, 80, 17, 1,
    9, 1, 10, 11, 2, 0, 46, 0, 10, 0, 11, 0, 49, 21, 0, 7, 0, 11, 0, 10, 0, 53,
    21, 21, 27, 11, 2, 0, 46, 0, 15, 0, 15, 0, 49, 0, 49, 11, 2, 21, 27, 33, 0,
    13, 48, 6, 1, 11, 33, 0, 14, 48, 6, 1, 12, 33, 0, 15, 48, 6, 32, 0, 15, 0,
    52, 26, 33, 0, 16, 48, 6, 1, 13, 1, 14, 1, 15, 11, 3, 0, 46, 0, 17, 0, 40,
    0, 32, 0, 61, 26, 0, 8, 0, 18, 21, 0, 40, 0, 37, 0, 0, 26, 0, 12, 0, 0, 0,
    8, 0, 42, 0, 49, 27, 21, 0, 10, 21, 27, 27, 27, 33, 0, 17, 48, 6, 0, 17, 0,
    40, 32, 0, 7, 27, 0, 20, 20, 34, 0, 17, 32, 0, 16, 11, 2, 0, 46, 0, 17, 0,
    40, 0, 36, 32, 0, 3, 26, 27, 0, 12, 0, 58, 21, 0, 18, 0, 40, 0, 37, 0, 7,
    26, 27, 20, 27, 32, 0, 16, 11, 3, 0, 46, 0, 17, 0, 40, 0, 14, 27, 0, 3, 0,
    53, 21, 27, 33, 0, 18, 48, 6, 1, 16, 33, 0, 19, 48, 6, 0, 88, 33, 0, 20, 48,
    6, 0, 17, 0, 40, 0, 30, 27, 32, 0, 5, 20, 32, 0, 20, 11, 2, 0, 46, 0, 53, 0,
    43, 0, 11, 27, 27, 32, 0, 19, 32, 0, 18, 0, 42, 0, 51, 0, 51, 11, 2, 27, 0,
    40, 34, 0, 20, 0, 29, 11, 2, 0, 46, 0, 10, 0, 11, 0, 52, 21, 27, 27, 27, 0,
    30, 0, 52, 21, 0, 20, 20, 33, 0, 21, 48, 6, 1, 17, 33, 0, 22, 48, 6, 1, 18,
    33, 0, 23, 48, 6, 1, 19, 33, 0, 24, 48, 6, 1, 20, 33, 0, 25, 48, 6, 0, 73,
    0, 17, 0, 16, 0, 19, 0, 17, 0, 28, 0, 11, 0, 0, 0, 52, 21, 21, 21, 0, 19, 0,
    16, 21, 0, 70, 21, 0, 35, 32, 0, 7, 0, 19, 0, 82, 21, 26, 0, 19, 0, 25, 0,
    75, 21, 0, 19, 0, 74, 21, 0, 19, 0, 23, 0, 52, 21, 11, 2, 0, 46, 0, 10, 0,
    8, 0, 52, 21, 27, 20, 0, 35, 32, 0, 25, 0, 19, 0, 90, 21, 26, 0, 19, 20, 0,
    25, 0, 75, 21, 0, 19, 0, 74, 21, 11, 3, 0, 46, 0, 36, 32, 0, 3, 26, 0, 33,
    0, 29, 26, 0, 53, 0, 18, 0, 59, 17, 0, 26, 0, 53, 0, 52, 0, 49, 11, 3, 17,
    21, 0, 37, 0, 4, 26, 20, 27, 11, 2, 0, 46, 0, 10, 0, 8, 0, 49, 21, 27, 33,
    0, 26, 48, 6, 0, 30, 0, 40, 32, 0, 25, 27, 0, 19, 0, 91, 21, 32, 0, 26, 0,
    18, 34, 0, 26, 0, 41, 0, 19, 0, 42, 0, 92, 0, 43, 0, 19, 27, 27, 27, 0, 15,
    21, 11, 3, 0, 46, 0, 11, 0, 3, 0, 53, 21, 27, 33, 0, 27, 48, 6, 34, 0, 7,
    34, 0, 27, 11, 2, 0, 46, 32, 0, 3, 0, 11, 0, 49, 21, 27, 33, 0, 28, 48, 6,
    0, 32, 0, 49, 26, 0, 31, 0, 93, 21, 34, 0, 19, 34, 0, 25, 27, 0, 30, 0, 52,
    21, 33, 0, 29, 48, 6, 0, 17, 0, 17, 34, 0, 28, 20, 34, 0, 29, 11, 2, 0, 46,
    0, 16, 0, 12, 0, 58, 21, 27, 32, 0, 3, 21, 33, 0, 30, 48, 6, 34, 0, 24, 0,
    40, 0, 34, 0, 60, 0, 0, 0, 61, 17, 0, 43, 0, 19, 27, 26, 27, 0, 18, 20, 0,
    23, 0, 50, 21, 32, 0, 30, 11, 2, 7, 0, 52, 0, 35, 0, 22, 26, 34, 0, 1, 0, 1,
    16, 17, 0, 27, 0, 44, 0, 39, 0, 33, 0, 36, 0, 2, 26, 26, 26, 27, 16, 0, 37,
    0, 50, 0, 51, 11, 2, 0, 47, 0, 0, 27, 26, 34, 0, 2, 19, 0, 18, 16, 0, 30, 0,
    42, 0, 50, 27, 0, 44, 0, 49, 27, 16, 7, 32, 0, 1, 0, 15, 16, 0, 23, 0, 50,
    17, 33, 0, 3, 48, 0, 4, 0, 52, 17, 32, 1, 8, 16, 33, 0, 4, 48, 6, 1, 21, 33,
    0, 5, 48, 6, 32, 0, 1, 0, 18, 34, 0, 1, 0, 15, 16, 0, 22, 0, 50, 17, 0, 19,
    34, 0, 3, 0, 37, 0, 2, 26, 16, 17, 17, 0, 22, 0, 42, 0, 37, 0, 0, 26, 27,
    34, 0, 5, 11, 2, 0, 46, 0, 17, 0, 40, 0, 10, 27, 0, 8, 0, 49, 21, 27, 34, 0,
    4, 17, 7, 32, 0, 1, 0, 18, 16, 0, 35, 0, 32, 0, 62, 26, 0, 18, 0, 15, 0, 30,
    0, 50, 21, 0, 43, 0, 20, 27, 21, 0, 19, 0, 17, 21, 26, 34, 0, 1, 0, 15, 16,
    32, 1, 8, 0, 52, 17, 17, 0, 19, 16, 7, 0, 62, 0, 18, 32, 0, 1, 0, 10, 16,
    34, 0, 2, 11, 2, 17, 33, 0, 3, 48, 6, 32, 0, 3, 34, 0, 1, 34, 0, 3, 11, 3,
    0, 20, 16, 0, 19, 16, 7, 0, 75, 0, 19, 34, 0, 1, 0, 29, 16, 0, 23, 0, 52,
    17, 0, 23, 0, 50, 17, 17, 0, 19, 0, 74, 17, 0, 20, 16, 7, 32, 0, 1, 0, 15,
    16, 0, 30, 0, 50, 17, 33, 0, 3, 48, 6, 0, 76, 32, 0, 2, 0, 17, 0, 3, 0, 52,
    21, 0, 33, 0, 29, 26, 0, 77, 21, 0, 18, 20, 32, 1, 6, 11, 2, 0, 46, 0, 8, 0,
    42, 0, 54, 27, 27, 16, 11, 2, 0, 19, 16, 0, 22, 32, 0, 3, 17, 0, 20, 16, 34,
    0, 1, 0, 30, 0, 44, 0, 78, 0, 30, 0, 52, 0, 1, 34, 0, 2, 17, 0, 3, 0, 55,
    17, 0, 4, 0, 49, 17, 17, 27, 16, 0, 79, 0, 22, 0, 42, 0, 1, 27, 34, 0, 3,
    17, 0, 20, 16, 11, 3, 0, 19, 16, 7, 34, 0, 1, 0, 29, 16, 0, 36, 0, 11, 26,
    0, 73, 17, 0, 38, 0, 1, 26, 16, 0, 39, 0, 0, 26, 16, 0, 11, 0, 53, 17, 0,
    37, 0, 7, 26, 16, 7, 34, 0, 1, 0, 35, 0, 62, 26, 16, 32, 1, 11, 0, 52, 17,
    32, 1, 12, 0, 53, 17, 0, 30, 0, 42, 0, 49, 0, 50, 11, 2, 27, 0, 44, 0, 63,
    27, 16, 7, 34, 0, 1, 0, 15, 16, 0, 73, 0, 35, 32, 1, 6, 26, 0, 35, 0, 19, 0,
    42, 0, 82, 27, 26, 20, 0, 19, 20, 0, 30, 0, 44, 0, 64, 27, 20, 11, 2, 0, 46,
    0, 10, 0, 8, 0, 52, 21, 27, 16, 0, 20, 16, 7, 32, 0, 1, 0, 35, 0, 15, 26,
    16, 33, 0, 5, 48, 6, 32, 0, 5, 0, 35, 0, 30, 26, 0, 52, 17, 0, 18, 0, 32, 0,
    52, 26, 0, 1, 0, 11, 21, 0, 48, 0, 38, 0, 4, 26, 27, 11, 2, 0, 46, 0, 11, 0,
    8, 0, 49, 21, 27, 16, 33, 0, 6, 48, 6, 34, 0, 5, 0, 35, 0, 30, 26, 16, 0,
    11, 0, 8, 0, 49, 21, 0, 48, 0, 52, 0, 47, 0, 38, 0, 4, 26, 27, 27, 16, 33,
    0, 7, 48, 6, 34, 0, 1, 0, 35, 0, 22, 26, 0, 52, 0, 22, 32, 0, 6, 0, 10, 16,
    0, 2, 32, 0, 4, 17, 0, 1, 16, 17, 0, 6, 34, 0, 6, 17, 0, 2, 34, 0, 4, 17, 0,
    36, 0, 21, 26, 32, 0, 7, 17, 17, 0, 11, 0, 1, 0, 53, 21, 0, 4, 0, 49, 21, 0,
    48, 0, 20, 27, 16, 0, 53, 0, 47, 0, 19, 0, 40, 0, 8, 27, 27, 16, 33, 0, 8,
    48, 6, 34, 0, 8, 32, 1, 10, 0, 9, 0, 40, 32, 1, 9, 27, 11, 2, 0, 46, 34, 0,
    7, 0, 18, 16, 0, 14, 0, 42, 0, 27, 0, 42, 0, 52, 27, 27, 16, 27, 16, 32, 1,
    11, 0, 53, 17, 7, 32, 0, 1, 0, 11, 16, 33, 0, 5, 48, 6, 32, 1, 14, 34, 0, 4,
    26, 32, 1, 12, 32, 0, 5, 21, 33, 0, 6, 48, 6, 34, 0, 1, 0, 35, 32, 1, 22,
    26, 0, 42, 0, 8, 27, 32, 0, 6, 20, 1, 22, 11, 2, 0, 46, 0, 51, 0, 43, 0, 8,
    27, 0, 37, 0, 7, 26, 20, 27, 34, 0, 2, 19, 7, 32, 0, 1, 0, 11, 16, 33, 0, 3,
    48, 6, 32, 0, 1, 0, 23, 0, 49, 17, 0, 35, 0, 8, 26, 16, 0, 9, 16, 33, 0, 1,
    49, 6, 32, 0, 1, 0, 15, 16, 0, 23, 0, 50, 17, 33, 0, 4, 48, 0, 10, 16, 0, 1,
    16, 0, 11, 0, 42, 0, 49, 27, 0, 48, 0, 51, 27, 16, 33, 0, 5, 48, 6, 32, 0,
    3, 0, 8, 0, 49, 17, 0, 33, 0, 30, 26, 0, 83, 17, 33, 0, 6, 48, 6, 1, 23, 33,
    0, 7, 48, 6, 32, 0, 1, 0, 28, 0, 42, 0, 17, 0, 11, 32, 0, 6, 21, 0, 0, 0,
    52, 21, 27, 34, 0, 7, 11, 2, 0, 46, 32, 0, 3, 0, 10, 0, 52, 17, 27, 16, 33,
    0, 1, 49, 6, 32, 0, 6, 0, 22, 0, 42, 0, 1, 27, 32, 0, 4, 17, 32, 0, 5, 0,
    47, 0, 19, 27, 34, 0, 1, 17, 34, 0, 5, 0, 47, 0, 19, 27, 0, 68, 0, 22, 32,
    0, 4, 0, 19, 0, 52, 17, 0, 30, 0, 50, 17, 17, 0, 18, 34, 0, 4, 17, 0, 30, 0,
    44, 34, 0, 6, 27, 16, 17, 0, 20, 16, 32, 0, 3, 0, 10, 0, 52, 17, 0, 48, 32,
    1, 9, 32, 1, 11, 0, 52, 21, 32, 1, 12, 34, 0, 3, 21, 27, 16, 7, 34, 0, 1,
    32, 1, 16, 0, 42, 34, 0, 2, 27, 32, 1, 13, 11, 2, 0, 46, 0, 15, 0, 11, 0,
    49, 21, 0, 37, 0, 7, 26, 20, 27, 16, 7, 34, 0, 1, 32, 1, 15, 0, 50, 26, 34,
    0, 2, 19, 7, 0, 17, 0, 17, 34, 0, 4, 20, 0, 21, 0, 49, 21, 34, 0, 0, 11, 2,
    0, 46, 0, 16, 0, 12, 0, 58, 21, 27, 32, 1, 3, 21, 33, 0, 6, 48, 6, 32, 0, 1,
    32, 1, 4, 16, 33, 0, 7, 48, 0, 30, 16, 33, 0, 8, 48, 6, 0, 69, 0, 1, 0, 84,
    17, 0, 30, 32, 0, 8, 17, 33, 0, 9, 48, 6, 0, 86, 0, 43, 0, 19, 27, 0, 19, 0,
    85, 21, 33, 0, 10, 48, 6, 0, 17, 0, 35, 34, 0, 6, 0, 43, 0, 30, 0, 42, 0,
    52, 27, 0, 16, 0, 12, 32, 0, 9, 0, 3, 0, 53, 17, 21, 0, 48, 0, 17, 0, 40,
    34, 0, 10, 27, 27, 0, 30, 0, 43, 0, 0, 27, 21, 27, 26, 0, 10, 0, 40, 0, 24,
    27, 0, 11, 0, 49, 21, 0, 1, 20, 0, 52, 0, 9, 32, 0, 9, 17, 0, 48, 0, 27, 27,
    20, 21, 0, 19, 20, 33, 0, 11, 48, 6, 32, 0, 7, 0, 23, 0, 52, 17, 0, 32, 34,
    0, 1, 26, 32, 1, 5, 0, 40, 0, 18, 27, 20, 0, 17, 34, 0, 5, 34, 0, 2, 23, 34,
    0, 11, 11, 3, 0, 46, 34, 0, 8, 0, 5, 16, 0, 3, 0, 53, 17, 27, 16, 33, 0, 12,
    48, 6, 32, 0, 12, 32, 0, 9, 0, 12, 0, 53, 17, 0, 48, 0, 32, 34, 0, 7, 26, 0,
    30, 0, 50, 21, 32, 1, 3, 20, 0, 9, 0, 58, 21, 0, 48, 0, 87, 0, 43, 0, 19,
    27, 27, 27, 16, 33, 0, 12, 49, 6, 34, 0, 9, 34, 0, 12, 11, 2, 7, 32, 0, 1,
    32, 1, 3, 16, 33, 0, 3, 48, 6, 34, 0, 1, 32, 1, 18, 32, 1, 21, 0, 42, 32, 0,
    3, 27, 11, 2, 0, 46, 34, 0, 3, 0, 12, 0, 58, 17, 27, 34, 0, 2, 19, 7, 34, 0,
    1, 33, 0, 3, 48, 0, 15, 16, 33, 0, 4, 48, 0, 8, 32, 0, 2, 19, 33, 0, 5, 48,
    6, 32, 0, 3, 32, 0, 5, 0, 37, 0, 7, 26, 16, 0, 48, 1, 24, 27, 34, 0, 2, 19,
    7, 0, 89, 33, 0, 3, 48, 6, 32, 0, 2, 0, 49, 0, 10, 0, 13, 0, 53, 21, 11, 2,
    0, 46, 0, 11, 0, 13, 0, 52, 21, 27, 18, 0, 31, 34, 0, 3, 19, 6, 34, 0, 1,
    32, 1, 22, 32, 1, 23, 0, 16, 21, 0, 51, 0, 51, 11, 2, 0, 26, 0, 45, 0, 17,
    27, 34, 0, 2, 19, 0, 27, 16, 17, 7, 34, 0, 1, 32, 1, 30, 16, 7, 34, 0, 1, 0,
    19, 0, 42, 0, 29, 0, 40, 0, 35, 0, 62, 26, 27, 27, 16, 0, 29, 34, 0, 2, 0,
    0, 0, 52, 19, 0, 19, 0, 49, 19, 0, 28, 18, 0, 2, 0, 42, 0, 8, 0, 42, 0, 26,
    27, 27, 18, 19, 7, 0, 52, 0, 9, 32, 1, 5, 17, 0, 53, 11, 2, 33, 0, 3, 48, 6,
    32, 0, 1, 0, 15, 16, 0, 30, 0, 40, 0, 24, 27, 0, 2, 0, 53, 21, 0, 36, 0, 21,
    26, 0, 23, 0, 40, 0, 35, 0, 24, 26, 0, 2, 0, 27, 0, 44, 0, 17, 0, 39, 0, 2,
    0, 0, 0, 52, 21, 26, 0, 52, 21, 27, 21, 0, 37, 0, 36, 0, 0, 26, 26, 0, 49,
    21, 27, 21, 0, 50, 17, 33, 0, 4, 48, 6, 0, 32, 0, 65, 0, 18, 0, 52, 0, 52,
    11, 2, 17, 26, 33, 0, 5, 48, 6, 34, 0, 1, 0, 35, 32, 2, 22, 32, 0, 5, 11, 2,
    0, 46, 0, 49, 0, 43, 0, 12, 27, 0, 37, 0, 7, 26, 20, 27, 0, 15, 0, 43, 0, 8,
    27, 0, 37, 0, 7, 26, 20, 0, 48, 0, 17, 0, 40, 34, 0, 5, 27, 27, 0, 16, 21,
    0, 42, 0, 1, 0, 42, 34, 0, 3, 0, 1, 34, 0, 2, 19, 27, 27, 26, 34, 0, 4, 17,
    33, 0, 6, 48, 6, 34, 0, 6, 32, 1, 6, 16, 7, 0, 57, 0, 0, 0, 61, 17, 0, 8,
    32, 0, 1, 17, 0, 2, 0, 61, 0, 1, 0, 67, 17, 17, 0, 0, 0, 56, 0, 0, 0, 61,
    17, 0, 17, 0, 1, 0, 66, 21, 0, 2, 0, 11, 21, 32, 0, 1, 17, 17, 0, 0, 34, 0,
    1, 17, 7, 32, 1, 4, 0, 3, 34, 0, 2, 19, 0, 33, 0, 1, 26, 32, 1, 5, 17, 33,
    0, 3, 48, 6, 32, 1, 5, 0, 35, 0, 52, 0, 43, 0, 18, 27, 0, 43, 0, 19, 27, 26,
    32, 0, 3, 17, 0, 37, 0, 36, 0, 21, 26, 26, 16, 33, 0, 4, 48, 6, 32, 0, 4, 0,
    35, 0, 65, 26, 16, 0, 30, 0, 44, 32, 1, 3, 0, 22, 34, 0, 3, 17, 27, 16, 0,
    35, 0, 18, 26, 34, 0, 4, 17, 0, 19, 16, 7,
  ],
  [
    runtime[0],
    runtime[1],
    runtime[2],
    runtime[6],
    runtime[7],
    runtime[8],
    runtime[9],
    runtime[11],
    runtime[12],
    runtime[13],
    runtime[14],
    runtime[15],
    runtime[16],
    runtime[17],
    runtime[18],
    runtime[19],
    runtime[20],
    runtime[21],
    runtime[22],
    runtime[23],
    runtime[24],
    runtime[25],
    runtime[26],
    runtime[27],
    runtime[28],
    runtime[29],
    runtime[30],
    runtime[31],
    runtime[33],
    runtime[36],
    runtime[37],
    runtime[43],
    runtime[44],
    runtime[45],
    runtime[46],
    runtime[47],
    runtime[48],
    runtime[50],
    runtime[51],
    runtime[52],
    runtime[53],
    runtime[54],
    runtime[55],
    runtime[56],
    runtime[57],
    runtime[58],
    runtime[59],
    runtime[60],
    runtime[62],
    0,
    -1,
    Infinity,
    1,
    2,
    5,
    4,
    127,
    32,
    3,
    7,
    10,
    '\0',
    ' ',
    '┐',
    '↕',
    '…',
    '␡',
    '␀',
    '·',
    '0',
    '"',
    str('@'),
    str("'"),
    str('⟨⟩'),
    str('⟨'),
    str('⟩'),
    str('┌'),
    str('·─'),
    str('·╵╎┆┊'),
    str('┘'),
    str('┌┐'),
    str('└┘'),
    str('‿'),
    str('\'"'),
    str('00321111'),
    str('('),
    str(')'),
    str('{𝔽}'),
    str('*array*'),
    str('•Fmt: 𝕨 must be a list of up to two numbers (width, height)'),
    str(','),
    str('<'),
    str('⥊'),
    str("Can't represent block"),
  ],
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
)(list([type, decompose, repop, fmtnum]));
let fmt = x => unstr(fmt1(x));

let errHasSrc = (w, a) => (w && w.loc) || (!a && w.sh && w.sh[0] === 2);
let fmtErr = e => {
  let a = e.kind === '!',
    w = e.message,
    loc = [];
  while (errHasSrc(w, a)) {
    let s = w.src,
      is;
    [is, w] = w;
    let n = is.sh ? is.sh[0] : 0,
      i = n ? is[0] : is;
    let pair = n && is.sh.length > 1;
    if (pair) n *= 2;
    let to = i =>
      s
        .slice(0, i)
        .join('')
        .split('\n')
        .map(l => Array.from(l));
    let ll = to(i),
      l = ll.length - 1,
      j = ll[l].length,
      m = to()[l];
    let k = 1,
      o = i - j,
      cl = j;
    while (k < n && (cl = is[k] - o) < m.length) k++;
    let ol = k < n;
    if (pair) {
      if (k % 2) cl = m.length;
      else {
        cl = is[--k] - o + 1;
      }
    }
    let c = Array(cl).fill(0);
    c[j] = 1;
    for (let h = 1; h < k; h++)
      c[(j = Math.max(j, is[h] - o + (pair ? h % 2 : 0)))] ^= 1;
    if (pair) for (let h = 1; h < cl; h++) c[h] ^= c[h - 1];
    let add = ['', m.join(''), c.map(t => (t ? '^' : ' ')).join('')];
    loc = add.concat(ol ? ['(and other lines)'] : [], loc);
  }
  if (a) w = w ? fmt(w).replace(/^/gm, '! ') : '! Error';
  else w = w.sh ? w.join('') : w;
  return [w].concat(loc).join('\n');
};
let currenterror = (x, w) => {
  let e = save_error;
  if (!has(e)) throw Error('No error is currently caught by ⎊');
  let a = e.kind === '!';
  w = e.message;
  while (errHasSrc(w, a)) w = w[1];
  return a || w.sh ? w : str(w);
};

let dynsys = f => {
  f.dynamic = 1;
  return f;
};
let isstr = x =>
  x.sh && x.sh.length == 1 && x.every(c => typeof c === 'string');
let unixtime = (x, w) => Date.now() / 1000;
let req1str = (e, x, w) => {
  if (!isstr(x)) throw Error(e + ': 𝕩 must be a string');
  if (has(w)) throw Error(e + ': 𝕨 not allowed');
  return unstr(x);
};
let dojs = (x, w) => {
  let s = req1str('•JS', x, w);
  let r = Function("'use strict'; return (" + s + ')')();
  let toBQN = x => {
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
        has(x.fill) ? tofill(toBQN(x.fill)) : x.fill,
      );
    if (isFunc(x)) {
      let f = (a, b) => toBQN(x(a, b));
      f.m = x.m;
      return f;
    }
    throw Error('•JS: Unrecognized JS result');
  };
  return toBQN(r);
};

let update_state = (st, w) => w; // Modified by Node version to handle •state
let push_state = st => st;
let copy_state = st_old => {
  let st = { ...st_old };
  st.addrt = [];
  push_state(st);
  return st;
};
let makebqn = (proc, fn) => st => (x, w) => {
  let src = proc(x, w, update_state, st);
  return fn(st.comps(st)(src));
};
let makebqnfn = (e, fn) => makebqn((x, w, u, s) => req1str(e, x, u(s, w)), fn);
let dynsys_copy = fn => dynsys(st => (x, w) => fn(copy_state(st))(x, w));

let rebqn = dynsys_copy(state => (x, w) => {
  let req = (r, s) => {
    if (!r) throw Error('•ReBQN: ' + s);
  };
  req(!has(w), '𝕨 not allowed');
  req(x.ns, '𝕩 must be a namespace');
  let [repl, primitives] = ['repl', 'primitives'].map(nsget(x));

  if (has(primitives)) {
    addprimitives(state, primitives);
  }
  let cmp = makebqnfn('•ReBQN evaluation', r => r)(state);

  repl = has(repl) ? ['none', 'loose', 'strict'].indexOf(unstr(repl)) : 0;
  req(repl >= 0, 'invalid value for 𝕩.repl');
  return repl ? rerepl(repl, cmp, state) : (x, w) => run(...cmp(x, w));
});
let addprimitives = (state, p) => {
  let req = (r, s) => {
    if (!r) throw Error('•ReBQN 𝕩.primitives: ' + s);
  };
  req(p.sh && p.sh.length === 1, 'Must be a list');
  req(
    p.every(e => e.sh && e.sh.length === 1 && e.sh[0] === 2),
    'Must consist of glyph-primitive pairs',
  );
  let pr = glyphs.map(_ => []),
    rt = pr.map(_ => []);
  p.forEach(([gl, val]) => {
    req(typeof gl === 'string', 'Glyphs must be characters');
    req(isFunc(val), 'Primitives must be operations');
    let k = val.m || 0;
    pr[k].push(gl);
    rt[k].push(val);
  });
  state.glyphs = pr.map(str);
  state.runtime = list(rt.flat());
  compgen(state);
};
let rerepl = (repl, cmp, state) => {
  let rd = repl > 1 ? 0 : -1;
  let vars0, names0, redef0;
  let vars = [],
    names = [],
    redef = [];
  vars.inpreview = true;
  state.addrt = [names, redef];
  let copyarr = (to, src) => {
    to.length = src.length;
    for (let i = 0; i < to.length; i++) to[i] = src[i];
  };
  let f = (x, w) => {
    if (preview) {
      vars0 = vars.slice(0);
      names0 = names.slice(0);
      redef0 = redef.slice(0);
    }
    names.sh = redef.sh = [names.length];
    let c = cmp(x, w);
    let pnames = c[5][2][0];
    let newv = c[3][0][2].slice(vars.length);
    names.push(...newv.map(i => pnames[i]));
    redef.push(...newv.map(i => rd));
    vars.push(...newv.map(i => null));
    try {
      return run(...c, vars);
    } finally {
      if (preview) {
        copyarr(vars, vars0);
        copyarr(names, names0);
        copyarr(redef, redef0);
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
let primitives = dynsys(state => {
  let gl = state.glyphs.flat(),
    rt = state.runtime;
  return list(gl.map((g, i) => list([g, rt[i]])));
});

let parsefloat = (x, w) => {
  let n = req1str('•ParseFloat', x, w);
  if (!/^-?(\.[0-9]+|[0-9]+\.?[0-9]*)([eE][-+]?[0-9]+)?$/.test(n))
    throw Error('•ParseFloat: invalid float format');
  return parseFloat(n);
};

let isint = n => isNum(n) && n === (n | 0);
let isnat = n => isint(n) && n >= 0;
let fact = (x, w) => {
  if (has(w)) throw Error('•math.Fact: Left argument not allowed');
  if (!isnat(x))
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
let comb = (x, w) => {
  if (!has(w)) throw Error('•math.Comb: Left argument required');
  if (!(isint(w) && isint(x)))
    throw Error('•math.Comb: Non-integer arguments not yet supported');
  let n = w,
    k = Math.min(x, n - x);
  let sgn = 1;
  if (n >= 0) {
    if (k < 0) return 0;
  } else {
    let j = n - k;
    if (j < 0) return 0;
    if (j & 1) sgn = -1;
    let t = Math.min(j, -1 - n);
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
let gcd = (x, w) => {
  if (!has(w)) throw Error('•math.GCD: Left argument required');
  if (!(isnat(w) && isnat(x)))
    throw Error(
      '•math.GCD: Arguments other than natural numbers not yet supported',
    );
  while (w) {
    let t = w;
    w = x % w;
    x = t;
  }
  return x;
};
let lcm = (x, w) => (w === 0 ? 0 : (w / gcd(x, w)) * x);
let pervfn = f => {
  f.prim = null;
  return runtime[61](f, 0);
}; // ⚇
let mathfn = f => {
  let p = pervfn(f);
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
let trig = 'cos cosh sin sinh tan tanh'.split(' ');
let mathkeys = trig.concat(
  trig.map(n => 'a' + n),
  'cbrt expm1 hypot log10 log1p log2 round trunc atan2'.split(' '),
);
let mathns = makens(
  mathkeys.concat(['fact', 'comb', 'gcd', 'lcm']),
  mathkeys.map(k => mathfn(Math[k])).concat([fact, comb, gcd, lcm].map(pervfn)),
);
trig.map((_, i) => {
  let f = mathns[i],
    g = mathns[i + trig.length];
  f.inverse = g;
  g.inverse = f;
});

let nsns = (() => {
  let keys = (x, w) => {
    if (has(w) || !x.ns) throw Error('•ns.Keys: Takes one namespace argument');
    return list(listkeys(x).map(str));
  };
  let req1name = (e, x, w) =>
    req1str(e, x, w).replaceAll('_', '').toLowerCase();
  let getq = (e, x, w) => {
    if (!has(w) || !w.ns) throw Error(e + ': 𝕨 must be a namespace');
    return nsget(w)(req1name('•ns.' + e, x));
  };
  let hasq = (x, w) => +has(getq('Has', x, w));
  let get = (x, w) => {
    let v = getq('Get', x, w);
    if (!has(v)) throw Error('•ns.Get: key not found');
    return v;
  };
  let map = (x, w) => {
    if (has(w) || !x.ns) throw Error('•ns.Map: Takes one namespace argument');
    let g = nsget(x),
      getq = (e, x, w) => g(req1name('Namespace map.' + e, x, w));
    let hasq = (x, w) => +has(getq('Has', x, w));
    let get = (x, w) => {
      let v = getq('Get', x);
      if (has(v)) return v;
      if (has(w)) return w;
      throw Error('Namespace map.Has: key not found');
    };
    return makens(['has', 'get'], [hasq, get]);
  };
  return makens(['keys', 'has', 'get', 'map'], [keys, hasq, get, map]);
})();

let rand = (() => {
  let reqnat = (e, x) => {
    if (!isNum(x) || x < 0 || x != Math.floor(x))
      throw Error('•rand.' + e + ' must be a natural number');
  };
  let randnat = n => Math.floor(n * Math.random());
  let range = (x, w) => {
    reqnat('Range: 𝕩', x);
    let r = x ? () => randnat(x) : Math.random;
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
  let iota = x =>
    Array(x)
      .fill()
      .map((_, i) => i);
  let deal_err = e => (x, w) => {
    reqnat(e + ': 𝕩', x);
    if (!has(w)) w = x;
    else {
      reqnat(e + ': 𝕨', w);
      if (w > x)
        throw Error('•rand.' + e + ': 𝕨 must be less than or equal to 𝕩');
    }
    let r = iota(x);
    for (let i = 0; i < w; i++) {
      let j = i + randnat(x - i);
      let t = r[i];
      r[i] = r[j];
      r[j] = t;
    }
    r.length = w;
    return list(r, 0);
  };
  let deal = deal_err('Deal');
  let subset = (x, w) => {
    reqnat('Subset: 𝕩', x);
    if (!has(w))
      return list(
        iota(x).filter(_ => Math.random() < 0.5),
        0,
      );
    return deal_err('Subset')(x, w).sort((a, b) => a - b);
  };
  return makens(['range', 'deal', 'subset'], [range, deal, subset]);
})();

let sysvals = {
  bqn: dynsys_copy(makebqnfn('•BQN', r => run(...r))),
  rebqn,
  primitives,
  type,
  glyph,
  decompose,
  fmt: fmt1,
  repr,
  currenterror,
  unixtime,
  js: dojs,
  parsefloat,
  math: mathns,
  ns: nsns,
  rand,
  listsys: dynsys(_ => list(Object.keys(sysvals).sort().map(str))),
};

let make_timed = tfn => {
  let timed = f => (x, w) => {
    let n = has(w) ? w : 1;
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
  let sec = t => t[0] + t[1] / 1e9;
  sysvals.monotime = (x, w) => sec(process.hrtime());
  sysvals.timed = make_timed(f => {
    let t0 = process.hrtime();
    f();
    return sec(process.hrtime(t0));
  });
} else if (typeof performance !== 'undefined') {
  sysvals.monotime = (x, w) => performance.now() / 1000;
  sysvals.timed = make_timed(f => {
    let t0 = performance.now();
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
  bqn.sysargs = sysargs;
  bqn.sysvals = sysvals;
  bqn.makebqn = fn => makebqn(fn, r => run(...r));
  bqn.makerepl = (st, repl) =>
    rerepl(
      repl,
      makebqn(
        x => x,
        r => r,
      )(st),
      st,
    );
  bqn.util = { has, list, str, unstr, dynsys, req1str, makens };
  bqn.setexec = (u, p) => {
    update_state = u;
    push_state = p;
  };
  module.exports = bqn;
}
