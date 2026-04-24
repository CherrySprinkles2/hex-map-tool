import {
  r as g,
  a as Q,
  h as Ue,
  H as X,
  e as fr,
  N as dt,
  t as D,
  D as gr,
  b as mr,
  g as ut,
  c as Br,
  d as A,
  p as yr,
  u as Z,
  f as ht,
  i as O,
  s as Ar,
  j as Ir,
  k as Or,
  l as mt,
  m as ae,
  n as ce,
  o as Ve,
  q as me,
  v as br,
  w as yt,
  x as bt,
  y as tt,
  z as wt,
  A as Pe,
  B as wr,
  C as pt,
  E as r,
  M as vt,
  F as kt,
  G as vr,
  I as m,
  J as oe,
  S as se,
  K as ve,
  L as Wr,
  O as Fr,
  P as Nr,
  Q as zr,
  R as Dr,
  T as Kr,
  U as qr,
  V as Ur,
  W as kr,
  X as Hr,
  Y as _r,
  Z as Yr,
  _ as Vr,
  $ as Xr,
  a0 as Gr,
  a1 as Xe,
  a2 as Zr,
  a3 as Jr,
  a4 as jt,
  a5 as Qr,
  a6 as en,
  a7 as tn,
  a8 as rn,
  a9 as nn,
  aa as on,
  ab as sn,
  ac as an,
  ad as jr,
  ae as cn,
  af as ln,
  ag as dn,
  ah as un,
  ai as fe,
  aj as ge,
  ak as hn,
  al as pn,
  am as xn,
  an as rt,
  ao as nt,
  ap as fn,
  aq as gn,
  ar as mn,
  as as ot,
  at as Ct,
  au as yn,
  av as Cr,
  aw as bn,
  ax as Ge,
  ay as wn,
  az as vn,
  aA as st,
  aB as $t,
  aC as it,
  aD as kn,
  aE as Mt,
  aF as jn,
  aG as Cn,
  aH as $n,
  aI as Mn,
  aJ as St,
  aK as Sn,
  aL as Tt,
  aM as Et,
  aN as Lt,
  aO as Tn,
  aP as En,
  aQ as Pt,
  aR as Ln,
  aS as Pn,
  aT as Rn,
} from './index-DhBpL3tR.js';
function Bn(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != 'function') throw new TypeError(t);
}
function An(e, t = `expected an object, instead received ${typeof e}`) {
  if (typeof e != 'object') throw new TypeError(t);
}
function In(e, t = 'expected all items to be functions, instead received the following types: ') {
  if (!e.every((n) => typeof n == 'function')) {
    const n = e
      .map((o) => (typeof o == 'function' ? `function ${o.name || 'unnamed'}()` : typeof o))
      .join(', ');
    throw new TypeError(`${t}[${n}]`);
  }
}
var Rt = (e) => (Array.isArray(e) ? e : [e]);
function On(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return (
    In(
      t,
      'createSelector expects all input-selectors to be functions, but received the following types: '
    ),
    t
  );
}
function Wn(e, t) {
  const n = [],
    { length: o } = e;
  for (let a = 0; a < o; a++) n.push(e[a].apply(null, t));
  return n;
}
var Fn = class {
    constructor(e) {
      this.value = e;
    }
    deref() {
      return this.value;
    }
  },
  Nn = typeof WeakRef < 'u' ? WeakRef : Fn,
  zn = 0,
  Bt = 1;
function Re() {
  return { s: zn, v: void 0, o: null, p: null };
}
function $r(e, t = {}) {
  let n = Re();
  const { resultEqualityCheck: o } = t;
  let a,
    s = 0;
  function c() {
    var h;
    let i = n;
    const { length: d } = arguments;
    for (let x = 0, w = d; x < w; x++) {
      const b = arguments[x];
      if (typeof b == 'function' || (typeof b == 'object' && b !== null)) {
        let v = i.o;
        v === null && (i.o = v = new WeakMap());
        const C = v.get(b);
        C === void 0 ? ((i = Re()), v.set(b, i)) : (i = C);
      } else {
        let v = i.p;
        v === null && (i.p = v = new Map());
        const C = v.get(b);
        C === void 0 ? ((i = Re()), v.set(b, i)) : (i = C);
      }
    }
    const l = i;
    let u;
    if (i.s === Bt) u = i.v;
    else if (((u = e.apply(null, arguments)), s++, o)) {
      const x = ((h = a == null ? void 0 : a.deref) == null ? void 0 : h.call(a)) ?? a;
      (x != null && o(x, u) && ((u = x), s !== 0 && s--),
        (a = (typeof u == 'object' && u !== null) || typeof u == 'function' ? new Nn(u) : u));
    }
    return ((l.s = Bt), (l.v = u), u);
  }
  return (
    (c.clearCache = () => {
      ((n = Re()), c.resetResultsCount());
    }),
    (c.resultsCount = () => s),
    (c.resetResultsCount = () => {
      s = 0;
    }),
    c
  );
}
function Dn(e, ...t) {
  const n = typeof e == 'function' ? { memoize: e, memoizeOptions: t } : e,
    o = (...a) => {
      let s = 0,
        c = 0,
        i,
        d = {},
        l = a.pop();
      (typeof l == 'object' && ((d = l), (l = a.pop())),
        Bn(
          l,
          `createSelector expects an output function after the inputs, but received: [${typeof l}]`
        ));
      const u = { ...n, ...d },
        { memoize: h, memoizeOptions: x = [], argsMemoize: w = $r, argsMemoizeOptions: b = [] } = u,
        v = Rt(x),
        C = Rt(b),
        M = On(a),
        y = h(
          function () {
            return (s++, l.apply(null, arguments));
          },
          ...v
        ),
        $ = w(
          function () {
            c++;
            const I = Wn(M, arguments);
            return ((i = y.apply(null, I)), i);
          },
          ...C
        );
      return Object.assign($, {
        resultFunc: l,
        memoizedResultFunc: y,
        dependencies: M,
        dependencyRecomputations: () => c,
        resetDependencyRecomputations: () => {
          c = 0;
        },
        lastResult: () => i,
        recomputations: () => s,
        resetRecomputations: () => {
          s = 0;
        },
        memoize: h,
        argsMemoize: w,
      });
    };
  return (Object.assign(o, { withTypes: () => o }), o);
}
var xt = Dn($r),
  Kn = Object.assign(
    (e, t = xt) => {
      An(
        e,
        `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof e}`
      );
      const n = Object.keys(e),
        o = n.map((s) => e[s]);
      return t(o, (...s) => s.reduce((c, i, d) => ((c[n[d]] = i), c), {}));
    },
    { withTypes: () => Kn }
  );
const Mr = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M4 4 L14 14 M3 5 L5 3 M14 14 L11 14 L14 17 M16 20 L20 16',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M20 4 L10 14 M21 5 L19 3 M10 14 L13 14 L10 17 M8 20 L4 16',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    ),
  Sr = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M4 7 H20',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }),
      g.createElement('path', {
        d: 'M9 7 V5 A1 1 0 0 1 10 4 H14 A1 1 0 0 1 15 5 V7',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M6 7 L7 20 A1 1 0 0 0 8 21 H16 A1 1 0 0 0 17 20 L18 7',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M10 11 V17 M14 11 V17',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
      })
    ),
  At = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M17 3 L21 7 L13 15 L9 11 Z',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M13 15 L9 11 L6 14 A3 3 0 0 0 6 18 L7 19 L7.5 20 A3 3 0 0 0 11 20 L14 17',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    ),
  qn = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M5 7 H13 A5 5 0 0 1 18 12 V18',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M14 15 L18 19 L22 15',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    ),
  It = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('rect', {
        x: 2.5,
        y: 6,
        width: 19,
        height: 12,
        rx: 2,
        stroke: 'currentColor',
        strokeWidth: 1.8,
      }),
      g.createElement('path', {
        d: 'M6 10 H6.01 M10 10 H10.01 M14 10 H14.01 M18 10 H18.01 M6 14 H6.01 M18 14 H18.01 M8.5 14.5 H15.5',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      })
    ),
  Se = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M6 3 V21',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }),
      g.createElement('path', {
        d: 'M6 4 L18 4 L15 8 L18 12 L6 12 Z',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinejoin: 'round',
        fill: 'currentColor',
        fillOpacity: 0.15,
      })
    ),
  Un = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M3 12 L8 7 L13 12 V20 H3 Z',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M11 14 L16 9 L21 14 V20 H13',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M7 20 V16 H9 V20 M15 20 V16 H17 V20',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinejoin: 'round',
      })
    ),
  Tr = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinejoin: 'round',
      }),
      g.createElement('path', { d: 'M9 4 V18 M15 6 V20', stroke: 'currentColor', strokeWidth: 1.6 })
    ),
  Hn = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M12 4 V16 M7 11 L12 16 L17 11',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M4 18 V20 H20 V18',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    ),
  _n = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M14 4 L20 10 L8 22 H2 V16 Z',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinejoin: 'round',
      }),
      g.createElement('path', {
        d: 'M14 4 L17 1 L23 7 L20 10',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinejoin: 'round',
      })
    ),
  Ot = (e) =>
    g.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', ...e },
      g.createElement('path', {
        d: 'M9 9C9 6.8 10.3 5 12 5C13.7 5 15 6.8 15 9C15 11.2 12 13 12 15',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      g.createElement('circle', { cx: 12, cy: 19, r: 1.2, fill: 'currentColor' })
    ),
  Er = (e, t = 0.25) => {
    const n = e.trim().replace('#', ''),
      o = parseInt(n.slice(0, 2), 16),
      a = parseInt(n.slice(2, 4), 16),
      s = parseInt(n.slice(4, 6), 16);
    return `rgba(${(0.299 * o + 0.587 * a + 0.114 * s) / 255 > 0.5 ? '0,0,0' : '255,255,255'},${t})`;
  },
  Ke = new Map(),
  Wt = new Map(),
  Be = new Set(),
  at = new Set(),
  Yn = () => {
    at.forEach((e) => {
      e();
    });
  },
  Vn = (e) => (
    at.add(e),
    function () {
      at.delete(e);
    }
  ),
  Lr = (e) => {
    const t = Wt.get(e);
    if (t && t.complete && t.naturalWidth > 0) return t;
    if (Be.has(e)) return null;
    Be.add(e);
    const n = new Image();
    return (
      (n.onload = () => {
        (Wt.set(e, n), Be.delete(e), Yn());
      }),
      (n.onerror = () => {
        Be.delete(e);
      }),
      (n.src = e),
      null
    );
  },
  Xn = (e, t, n) => {
    const o = document.createElement('canvas');
    ((o.width = Math.max(1, Math.round(t))), (o.height = Math.max(1, Math.round(n))));
    const a = o.getContext('2d');
    return a ? (a.drawImage(e, 0, 0, o.width, o.height), o) : null;
  },
  He = (e, t, n) => {
    const o = `${e}@${Math.round(t)}x${Math.round(n)}`,
      a = Ke.get(o);
    if (a) return a;
    const s = Lr(e);
    if (!s) return null;
    const c = Xn(s, t, n);
    return c ? (Ke.set(o, c), c) : null;
  },
  Gn = (e, t, n, o) => {
    const a = `${e}@${Math.round(t)}x${Math.round(n)}#${o}`,
      s = Ke.get(a);
    if (s) return s;
    const c = He(e, t, n);
    if (!c) return null;
    const i = document.createElement('canvas');
    ((i.width = c.width), (i.height = c.height));
    const d = i.getContext('2d');
    return d
      ? (d.drawImage(c, 0, 0),
        (d.globalCompositeOperation = 'source-in'),
        (d.fillStyle = o),
        d.fillRect(0, 0, i.width, i.height),
        Ke.set(a, i),
        i)
      : null;
  },
  Zn = (e) => {
    e.forEach((t) => {
      Lr(t);
    });
  },
  Jn =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='14'%20height='14'%20viewBox='0%200%2014%2014'%3e%3cline%20x1='2'%20y1='11'%20x2='4'%20y2='6'%20stroke='rgba(0,80,0,0.28)'%20stroke-width='1.2'%20stroke-linecap='round'/%3e%3cline%20x1='4'%20y1='11'%20x2='6'%20y2='7'%20stroke='rgba(0,80,0,0.18)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='9'%20y1='11'%20x2='11'%20y2='6'%20stroke='rgba(0,80,0,0.28)'%20stroke-width='1.2'%20stroke-linecap='round'/%3e%3cline%20x1='11'%20y1='11'%20x2='13'%20y2='7'%20stroke='rgba(0,80,0,0.18)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='5'%20y1='5'%20x2='7'%20y2='1'%20stroke='rgba(0,80,0,0.15)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3c/svg%3e",
  Qn =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='7'%20viewBox='0%200%2020%207'%3e%3cline%20x1='0'%20y1='3.5'%20x2='20'%20y2='3.5'%20stroke='rgba(90,50,0,0.22)'%20stroke-width='1.2'/%3e%3c/svg%3e",
  eo =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='15'%20height='15'%20viewBox='0%200%2015%2015'%3e%3ccircle%20cx='4'%20cy='4'%20r='2.8'%20fill='rgba(0,30,0,0.32)'/%3e%3ccircle%20cx='11.5'%20cy='4'%20r='2.0'%20fill='rgba(0,30,0,0.22)'/%3e%3ccircle%20cx='7.5'%20cy='10.5'%20r='2.8'%20fill='rgba(0,30,0,0.32)'/%3e%3ccircle%20cx='1'%20cy='11'%20r='1.6'%20fill='rgba(0,30,0,0.18)'/%3e%3ccircle%20cx='14'%20cy='11'%20r='1.6'%20fill='rgba(0,30,0,0.18)'/%3e%3c/svg%3e",
  to =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='22'%20height='13'%20viewBox='0%200%2022%2013'%3e%3cpolyline%20points='0,11%205.5,5%2011,11%2016.5,5%2022,11'%20fill='none'%20stroke='rgba(0,0,0,0.22)'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpolyline%20points='0,7%205.5,1%2011,7%2016.5,1%2022,7'%20fill='none'%20stroke='rgba(0,0,0,0.12)'%20stroke-width='1'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",
  ro =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='30'%20height='10'%20viewBox='0%200%2030%2010'%3e%3cpath%20d='M%200%203%20C%204%201.5,%208%204.5,%2012%203%20S%2020%204.5,%2024%203%20C%2026%202.3,%2028%201.8,%2030%203'%20fill='none'%20stroke='rgba(255,255,255,0.22)'%20stroke-width='1.4'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M%200%207.5%20C%204%206,%208%209,%2012%207.5%20S%2020%209,%2024%207.5%20C%2026%206.8,%2028%206.3,%2030%207.5'%20fill='none'%20stroke='rgba(255,255,255,0.14)'%20stroke-width='1'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",
  no =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='50'%20height='18'%20viewBox='0%200%2050%2018'%3e%3cpath%20d='M%200%205%20C%207%202,%2014%208,%2021%205%20S%2035%208,%2042%205%20C%2045%203.5,%2047.5%202.5,%2050%205'%20fill='none'%20stroke='rgba(255,255,255,0.18)'%20stroke-width='1.8'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M%200%2012%20C%207%209,%2014%2015,%2021%2012%20S%2035%2015,%2042%2012%20C%2045%2010.5,%2047.5%209.5,%2050%2012'%20fill='none'%20stroke='rgba(255,255,255,0.10)'%20stroke-width='1.2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",
  oo =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%3e%3ccircle%20cx='3'%20cy='4'%20r='1.0'%20fill='rgba(80,50,0,0.22)'/%3e%3ccircle%20cx='10'%20cy='2'%20r='0.8'%20fill='rgba(80,50,0,0.18)'/%3e%3ccircle%20cx='7'%20cy='9'%20r='1.1'%20fill='rgba(80,50,0,0.25)'/%3e%3ccircle%20cx='14'%20cy='7'%20r='0.8'%20fill='rgba(80,50,0,0.18)'/%3e%3ccircle%20cx='2'%20cy='13'%20r='0.9'%20fill='rgba(80,50,0,0.20)'/%3e%3ccircle%20cx='11'%20cy='13'%20r='1.0'%20fill='rgba(80,50,0,0.22)'/%3e%3ccircle%20cx='5'%20cy='7'%20r='0.7'%20fill='rgba(80,50,0,0.15)'/%3e%3c/svg%3e",
  so =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='18'%20height='16'%20viewBox='0%200%2018%2016'%3e%3cline%20x1='3'%20y1='14'%20x2='3'%20y2='6'%20stroke='rgba(0,40,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='3'%20y1='8'%20x2='1'%20y2='5'%20stroke='rgba(0,40,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='3'%20y1='8'%20x2='5'%20y2='5'%20stroke='rgba(0,40,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='12'%20y1='14'%20x2='12'%20y2='7'%20stroke='rgba(0,40,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='12'%20y1='9'%20x2='10'%20y2='6'%20stroke='rgba(0,40,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='12'%20y1='9'%20x2='14'%20y2='6'%20stroke='rgba(0,40,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cpath%20d='M%200%2014.5%20C%203%2013.5,%206%2015.5,%209%2014.5%20S%2015%2015.5,%2018%2014.5'%20fill='none'%20stroke='rgba(0,40,60,0.28)'%20stroke-width='0.8'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",
  io =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'%20viewBox='0%200%2012%2012'%3e%3ccircle%20cx='3'%20cy='3'%20r='2.5'%20fill='rgba(0,40,0,0.35)'/%3e%3ccircle%20cx='9'%20cy='2.5'%20r='2.0'%20fill='rgba(0,40,0,0.28)'/%3e%3ccircle%20cx='6'%20cy='8'%20r='2.5'%20fill='rgba(0,40,0,0.35)'/%3e%3ccircle%20cx='1'%20cy='9'%20r='1.5'%20fill='rgba(0,40,0,0.22)'/%3e%3ccircle%20cx='11'%20cy='8.5'%20r='1.5'%20fill='rgba(0,40,0,0.22)'/%3e%3ccircle%20cx='5'%20cy='5.5'%20r='1.2'%20fill='rgba(0,40,0,0.20)'/%3e%3c/svg%3e",
  ao =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='14'%20viewBox='0%200%2024%2014'%3e%3cpath%20d='M%200%2012%20Q%206%205,%2012%2012%20T%2024%2012'%20fill='none'%20stroke='rgba(60,30,0,0.22)'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M%200%208%20Q%206%201,%2012%208%20T%2024%208'%20fill='none'%20stroke='rgba(60,30,0,0.12)'%20stroke-width='0.9'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",
  co =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%3e%3cline%20x1='2'%20y1='5'%20x2='7'%20y2='9'%20stroke='rgba(40,0,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='7'%20y1='9'%20x2='5'%20y2='14'%20stroke='rgba(40,0,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='5'%20y1='14'%20x2='10'%20y2='17'%20stroke='rgba(40,0,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='12'%20y1='2'%20x2='16'%20y2='7'%20stroke='rgba(40,0,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='16'%20y1='7'%20x2='13'%20y2='12'%20stroke='rgba(40,0,0,0.28)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='13'%20y1='12'%20x2='18'%20y2='16'%20stroke='rgba(40,0,0,0.22)'%20stroke-width='1'%20stroke-linecap='round'/%3e%3cline%20x1='7'%20y1='9'%20x2='13'%20y2='12'%20stroke='rgba(40,0,0,0.18)'%20stroke-width='0.8'%20stroke-linecap='round'/%3e%3c/svg%3e",
  ct = {
    grass: { url: Jn, w: 14, h: 14 },
    farm: { url: Qn, w: 20, h: 7 },
    forest: { url: eo, w: 15, h: 15 },
    mountain: { url: to, w: 22, h: 13 },
    lake: { url: ro, w: 30, h: 10 },
    ocean: { url: no, w: 50, h: 18 },
    desert: { url: oo, w: 16, h: 16 },
    swamp: { url: so, w: 18, h: 16 },
    jungle: { url: io, w: 12, h: 12 },
    hills: { url: ao, w: 24, h: 14 },
    badlands: { url: co, w: 20, h: 20 },
  };
Zn(Object.values(ct).map((e) => e.url));
const lo = {
    grass: 'grass',
    farm: 'farm',
    forest: 'forest',
    mountain: 'mountain',
    lake: 'lake',
    ocean: 'ocean',
  },
  uo = (e) => {
    const t = new Map(),
      n = new Map(),
      o = (c, i) => {
        const d = He(i.url, i.w, i.h);
        if (!d) return null;
        const l = e.createPattern(d, 'repeat');
        return (l && t.set(c, l), l);
      },
      a = (c, i, d) => {
        const l = Gn(i.url, i.w, i.h, d);
        if (!l) return null;
        const u = e.createPattern(l, 'repeat');
        return (u && t.set(c, u), u);
      };
    return {
      get: (c) => {
        if (t.has(c)) return t.get(c) ?? null;
        const i = lo[c];
        return i ? o(c, ct[i]) : null;
      },
      syncCustom: (c) => {
        const i = new Set();
        c.forEach((d) => {
          const l = `${d.patternKey}::${d.color}`;
          if ((i.add(d.id), n.get(d.id) === l && t.has(d.id))) return;
          if ((n.set(d.id, l), d.patternKey === 'none')) {
            t.set(d.id, null);
            return;
          }
          const u = Er(d.color);
          a(d.id, ct[d.patternKey], u);
        });
        for (const d of [...n.keys()]) i.has(d) || (n.delete(d), t.delete(d));
      },
      refresh: () => {
        (t.clear(), n.clear());
      },
    };
  },
  De = (e, t, n, o) => {
    const a = Ue(t, n, o);
    (e.beginPath(),
      a.forEach((s, c) => {
        c === 0 ? e.moveTo(s.x, s.y) : e.lineTo(s.x, s.y);
      }),
      e.closePath());
  },
  ho = (e, t, n) => {
    const o = n.terrain[e];
    if (o) return o.color.trim();
    const a = t.find((s) => s.id === e);
    return a ? a.color.trim() : n.terrain.grass.color.trim();
  },
  po = ({
    ctx: e,
    tiles: t,
    visibleKeys: n,
    customTerrains: o,
    factions: a,
    theme: s,
    patternCache: c,
    mapMode: i,
    hoveredKey: d,
  }) => {
    const l = {};
    (a.forEach((u) => {
      l[u.id] = u.color;
    }),
      (e.lineCap = 'butt'),
      (e.lineJoin = 'miter'),
      n.forEach((u) => {
        const h = t[u];
        if (!h) return;
        const { x, y: w } = Q(h.q, h.r);
        (De(e, x, w, X), (e.fillStyle = ho(h.terrain, o, s)), e.fill());
        const b = c.get(h.terrain);
        if (
          (b && ((e.fillStyle = b), e.fill()),
          (e.strokeStyle = s.tileStroke),
          (e.lineWidth = 1.5),
          e.stroke(),
          i === 'faction' && h.factionId)
        ) {
          const v = l[h.factionId];
          v && (De(e, x, w, X - 5), (e.strokeStyle = v), (e.lineWidth = 5), e.stroke());
        }
        d === u && (De(e, x, w, X), (e.fillStyle = 'rgba(255,255,255,0.12)'), e.fill());
      }),
      (e.fillStyle = '#000'));
  },
  xo = ({ ctx: e, ghostKeys: t, theme: n, hoveredKey: o }) => {
    (e.save(),
      e.setLineDash([6, 4]),
      t.forEach((a) => {
        const [s, c] = a.split(','),
          i = Number(s),
          d = Number(c),
          l = X * Math.sqrt(3) * (i + d / 2),
          u = X * 1.5 * d,
          h = o === a;
        (De(e, l, u, X),
          (e.fillStyle = h ? 'rgba(255,255,255,0.15)' : n.ghostFill),
          e.fill(),
          (e.strokeStyle = h ? 'rgba(255,255,255,0.6)' : n.ghostStroke),
          (e.lineWidth = h ? 2 : 1.5),
          e.stroke());
      }),
      e.setLineDash([]),
      e.restore());
  },
  fo = 1,
  go = (e, t) => {
    const n = 1 - t;
    return {
      x: n * n * n * e.p0.x + 3 * n * n * t * e.p1.x + 3 * n * t * t * e.p2.x + t * t * t * e.p3.x,
      y: n * n * n * e.p0.y + 3 * n * n * t * e.p1.y + 3 * n * t * t * e.p2.y + t * t * t * e.p3.y,
    };
  },
  Ft = (e, t) => {
    const n = 1 - t;
    return {
      x:
        3 * n * n * (e.p1.x - e.p0.x) +
        6 * n * t * (e.p2.x - e.p1.x) +
        3 * t * t * (e.p3.x - e.p2.x),
      y:
        3 * n * n * (e.p1.y - e.p0.y) +
        6 * n * t * (e.p2.y - e.p1.y) +
        3 * t * t * (e.p3.y - e.p2.y),
    };
  },
  Nt = (e) => {
    const t = (e.p0.x + e.p1.x) / 2,
      n = (e.p0.y + e.p1.y) / 2,
      o = (e.p1.x + e.p2.x) / 2,
      a = (e.p1.y + e.p2.y) / 2,
      s = (e.p2.x + e.p3.x) / 2,
      c = (e.p2.y + e.p3.y) / 2,
      i = (t + o) / 2,
      d = (n + a) / 2,
      l = (o + s) / 2,
      u = (a + c) / 2,
      h = (i + l) / 2,
      x = (d + u) / 2,
      w = { p0: e.p0, p1: { x: t, y: n }, p2: { x: i, y: d }, p3: { x: h, y: x } },
      b = { p0: { x: h, y: x }, p1: { x: l, y: u }, p2: { x: s, y: c }, p3: e.p3 };
    return [w, b];
  },
  zt = (e) => {
    const t = [e.p0.x, e.p1.x, e.p2.x, e.p3.x],
      n = [e.p0.y, e.p1.y, e.p2.y, e.p3.y];
    return {
      minX: Math.min(...t),
      minY: Math.min(...n),
      maxX: Math.max(...t),
      maxY: Math.max(...n),
    };
  },
  Ae = (e) => Math.max(e.maxX - e.minX, e.maxY - e.minY),
  mo = (e, t) => e.minX <= t.maxX && e.maxX >= t.minX && e.minY <= t.maxY && e.maxY >= t.minY,
  yo = 50,
  Me = (e, t, n, o, a) => {
    if (o > yo) return;
    const s = zt(e.curve),
      c = zt(t.curve);
    if (!mo(s, c)) return;
    const i = Ae(s) < a,
      d = Ae(c) < a;
    if (i && d) {
      const l = (e.t0 + e.t1) / 2,
        u = (t.t0 + t.t1) / 2;
      for (const x of n) if (Math.abs(x.t1 - l) < 0.01 && Math.abs(x.t2 - u) < 0.01) return;
      const h = go(e.curve, 0.5);
      n.push({ t1: l, t2: u, point: h });
      return;
    }
    if (!i && (d || Ae(s) >= Ae(c))) {
      const [l, u] = Nt(e.curve),
        h = (e.t0 + e.t1) / 2;
      (Me({ curve: l, t0: e.t0, t1: h }, t, n, o + 1, a),
        Me({ curve: u, t0: h, t1: e.t1 }, t, n, o + 1, a));
    } else {
      const [l, u] = Nt(t.curve),
        h = (t.t0 + t.t1) / 2;
      (Me(e, { curve: l, t0: t.t0, t1: h }, n, o + 1, a),
        Me(e, { curve: u, t0: h, t1: t.t1 }, n, o + 1, a));
    }
  },
  bo = (e, t, n = fo) => {
    const o = [];
    return (
      Me({ curve: e, t0: 0, t1: 1 }, { curve: t, t0: 0, t1: 1 }, o, 0, n),
      o.sort((a, s) => a.t1 - s.t1),
      o
    );
  },
  Dt = 0.25,
  ft = 0.4,
  wo = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked' },
  vo = (e) => {
    let t = e & 63,
      n = 0;
    for (; t; ) ((n += t & 1), (t >>= 1));
    return n;
  },
  ko = (e) => {
    if (vo(e) <= 4) return e;
    let t = 0,
      n = 0;
    for (let o = 0; o < 6 && n < 4; o++) e & (1 << o) && ((t |= 1 << o), n++);
    return t;
  },
  jo = (e, t, n, o) => {
    const a = D(t, n),
      s = e[a];
    if (!(s != null && s[o])) return 0;
    const c = wo[o],
      i = s[c] ?? [];
    let d = 0;
    return (
      dt.forEach((l, u) => {
        const h = D(t + l.q, n + l.r),
          x = e[h];
        x != null && x[o] && (i.includes(h) || (x[c] ?? []).includes(a) || (d |= 1 << u));
      }),
      ko(d)
    );
  },
  gt = (e, t, n, o) => {
    const a = jo(e, t, n, o),
      s = [];
    for (let c = 0; c < 6; c++) a & (1 << c) && s.push(c);
    return s;
  },
  Te = (e, t, n, o, a = X) => {
    const s = fr(e, t, n, a),
      c = Ue(e, t, a),
      i = gr[n],
      d = c[i],
      l = c[(i + 1) % 6],
      u = d.y < l.y || (d.y === l.y && d.x < l.x),
      w = o === 'river' ? (u ? d : l) : u ? l : d;
    return { x: s.x + Dt * (w.x - s.x), y: s.y + Dt * (w.y - s.y) };
  },
  Ee = (e, t, n, o = X) => {
    const a = fr(e, t, n, o),
      s = e - a.x,
      c = t - a.y,
      i = Math.sqrt(s * s + c * c) || 1;
    return { x: s / i, y: c / i };
  },
  z = (e) => e.toFixed(2),
  qe = (e, t, n, o) =>
    `M ${z(e.x)},${z(e.y)} C ${z(t.x)},${z(t.y)} ${z(n.x)},${z(n.y)} ${z(o.x)},${z(o.y)}`,
  Co = (e, t, n, o, a = X) => {
    const s = ft * a,
      c = e,
      i = { x: e.x + t.x * s, y: e.y + t.y * s },
      d = { x: n.x + o.x * s, y: n.y + o.y * s },
      l = n;
    return { svgPath: qe(c, i, d, l), curve: { p0: c, p1: i, p2: d, p3: l } };
  },
  Pr = (e) => {
    if (e.length === 3) return e.map((o) => [o, null]);
    const t = [],
      n = [...e];
    for (; n.length >= 2; ) {
      let o = 0,
        a = 1,
        s = -1;
      for (let c = 0; c < n.length; c++)
        for (let i = c + 1; i < n.length; i++) {
          const d = Math.abs(n[c] - n[i]),
            l = Math.min(d, 6 - d);
          l > s && ((s = l), (o = c), (a = i));
        }
      (t.push([n[o], n[a]]), n.splice(a, 1), n.splice(o, 1));
    }
    return (n.length === 1 && t.push([n[0], null]), t);
  },
  $o = (e, t, n, o, a = X) =>
    n.length === 0
      ? []
      : Pr(n).map(([c, i]) => {
          const d = Te(e, t, c, o, a),
            l = Ee(e, t, c, a);
          if (i === null) {
            const x = ft * a * 0.5,
              w = d,
              b = { x: d.x + l.x * x, y: d.y + l.y * x },
              v = { x: e, y: t };
            return { svgPath: qe(w, b, v, v), curve: null };
          }
          const u = Te(e, t, i, o, a),
            h = Ee(e, t, i, a);
          return Co(d, l, u, h, a);
        }),
  Ie = (e, t, n, o, a, s = null, c = X) => {
    const i = s ?? n,
      d = ft * c,
      l = s !== null || o === null ? i : { x: i.x + o.x * d, y: i.y + o.y * d },
      u = { x: e.x + t.x * d, y: e.y + t.y * d },
      h = { p0: e, p1: u, p2: l, p3: i };
    if (a.length === 0) return qe(h.p0, h.p1, h.p2, h.p3);
    const x = [];
    for (const P of a) {
      const j = bo(h, P);
      for (const f of j) {
        const k = Ft(h, f.t1),
          T = Ft(P, f.t2),
          R = Math.sqrt(k.x * k.x + k.y * k.y) || 1,
          W = Math.sqrt(T.x * T.x + T.y * T.y) || 1,
          F = { x: k.x / R, y: k.y / R },
          N = { x: T.x / W, y: T.y / W },
          U = Math.abs(F.x * N.x + F.y * N.y);
        x.push({ t_road: f.t1, point: f.point, riverTangentUnit: N, score: U });
      }
    }
    if (x.length === 0) return qe(h.p0, h.p1, h.p2, h.p3);
    x.sort((P, j) => (P.score !== j.score ? P.score - j.score : P.t_road - j.t_road));
    const w = x[0],
      b = w.point,
      v = w.riverTangentUnit;
    let C = { x: -v.y, y: v.x };
    const M = { x: i.x - e.x, y: i.y - e.y };
    C.x * M.x + C.y * M.y < 0 && (C = { x: -C.x, y: -C.y });
    const y = u,
      $ = { x: b.x - C.x * d, y: b.y - C.y * d },
      E = { x: b.x + C.x * d, y: b.y + C.y * d },
      I = l;
    return `M ${z(e.x)},${z(e.y)} C ${z(y.x)},${z(y.y)} ${z($.x)},${z($.y)} ${z(b.x)},${z(b.y)} C ${z(E.x)},${z(E.y)} ${z(I.x)},${z(I.y)} ${z(i.x)},${z(i.y)}`;
  },
  Rr = (e, t, n, o, a, s = X) => {
    if (n.length === 0) return [];
    const c = Pr(n),
      i = { x: e, y: t };
    return c.map(([d, l]) => {
      const u = Te(e, t, d, 'road', s),
        h = Ee(e, t, d, s);
      if (l === null) return Ie(u, h, null, null, o, i, s);
      const x = Te(e, t, l, 'road', s),
        w = Ee(e, t, l, s);
      if (a) {
        const b = Ie(u, h, null, null, o, i, s),
          v = Ie(x, w, null, null, o, i, s);
        return `${b} ${v}`;
      }
      return Ie(u, h, x, w, o, null, s);
    });
  },
  Mo = ({ ctx: e, tiles: t, iterateKeys: n, deepWaterSet: o, theme: a }) => {
    const s = a.river;
    (e.save(),
      (e.globalAlpha = 0.9),
      (e.strokeStyle = s.color),
      (e.lineWidth = s.width),
      (e.lineCap = s.linecap),
      (e.lineJoin = 'round'),
      (e.fillStyle = s.color));
    const c = new Map();
    return (
      n.forEach((i) => {
        const d = t[i];
        if (!d || !d.hasRiver || o.has(d.terrain)) return;
        const { q: l, r: u } = d,
          { x: h, y: x } = Q(l, u),
          w = gt(t, l, u, 'hasRiver');
        if (w.length === 0) {
          ((e.globalAlpha = 0.85),
            e.beginPath(),
            e.arc(h, x, s.poolRadius, 0, Math.PI * 2),
            e.fill(),
            (e.globalAlpha = 0.9));
          return;
        }
        const b = $o(h, x, w, 'river'),
          v = [];
        (b.forEach(({ svgPath: C, curve: M }) => {
          const y = new Path2D(C);
          (e.stroke(y), M && v.push(M));
        }),
          v.length > 0 && c.set(D(l, u), v));
      }),
      e.restore(),
      c
    );
  },
  So = ({ ctx: e, tiles: t, iterateKeys: n, deepWaterSet: o, riverCurvesByTile: a, theme: s }) => {
    const c = s.road;
    (e.save(),
      (e.globalAlpha = 0.9),
      (e.strokeStyle = c.color),
      (e.lineWidth = c.width),
      (e.lineCap = c.linecap),
      (e.lineJoin = 'miter'),
      (e.fillStyle = c.color),
      n.forEach((i) => {
        const d = t[i];
        if (!d || !d.hasRoad || o.has(d.terrain)) return;
        const { q: l, r: u, hasTown: h } = d,
          { x, y: w } = Q(l, u),
          b = gt(t, l, u, 'hasRoad');
        if (b.length === 0) {
          ((e.globalAlpha = 0.85),
            e.beginPath(),
            e.arc(x, w, c.poolRadius, 0, Math.PI * 2),
            e.fill(),
            (e.globalAlpha = 0.9));
          return;
        }
        const v = a.get(D(l, u)) ?? [];
        Rr(x, w, b, v, h).forEach((M) => {
          e.stroke(new Path2D(M));
        });
      }),
      e.restore());
  },
  Oe = 6,
  To = ({ ctx: e, tiles: t, iterateKeys: n, deepWaterSet: o, theme: a }) => {
    const s = a.causeway,
      c = a.road;
    n.forEach((i) => {
      const d = t[i];
      if (!d || !d.hasRoad || !o.has(d.terrain)) return;
      const { q: l, r: u } = d,
        { x: h, y: x } = Q(l, u),
        w = gt(t, l, u, 'hasRoad');
      if (w.length === 0) {
        (e.save(),
          (e.globalAlpha = 0.85),
          (e.fillStyle = s.color),
          e.beginPath(),
          e.arc(h, x, c.poolRadius, 0, Math.PI * 2),
          e.fill(),
          e.restore());
        return;
      }
      (e.save(),
        (e.globalAlpha = 0.9),
        (e.strokeStyle = s.color),
        (e.lineWidth = s.width),
        (e.lineCap = s.linecap),
        Rr(h, x, w, [], !1).forEach((v) => {
          e.stroke(new Path2D(v));
        }),
        e.restore(),
        e.save(),
        (e.globalAlpha = 0.8),
        (e.strokeStyle = s.notchColor),
        (e.lineWidth = s.notchWidth),
        (e.lineCap = 'round'),
        w.forEach((v) => {
          const C = Te(h, x, v, 'road'),
            M = Ee(h, x, v),
            y = -M.y,
            $ = M.x;
          (e.beginPath(),
            e.moveTo(C.x + y * Oe, C.y + $ * Oe),
            e.lineTo(C.x - y * Oe, C.y - $ * Oe),
            e.stroke());
        }),
        e.restore());
    });
  },
  Eo = ({ ctx: e, tiles: t, iterateKeys: n, deepWaterSet: o, theme: a }) => {
    const { color: s, plankWidth: c, pilingWidth: i, plankHalf: d, pilingLen: l } = a.port,
      u = [-d * 0.65, 0, d * 0.65];
    (e.save(),
      (e.strokeStyle = s),
      (e.lineCap = 'round'),
      n.forEach((h) => {
        const x = t[h];
        if (!x || !o.has(x.terrain)) return;
        const { q: w, r: b } = x,
          v = D(w, b),
          { x: C, y: M } = Q(w, b),
          y = Ue(C, M);
        dt.forEach(($, E) => {
          const I = t[D(w + $.q, b + $.r)];
          if (!(I != null && I.hasTown) || (I.portBlocked || []).includes(v)) return;
          const P = gr[E],
            j = y[P],
            f = y[(P + 1) % 6],
            k = { x: (j.x + f.x) / 2, y: (j.y + f.y) / 2 },
            T = C - k.x,
            R = M - k.y,
            W = Math.sqrt(T * T + R * R) || 1,
            F = T / W,
            N = R / W,
            U = -N,
            G = F;
          ((e.lineWidth = i),
            u.forEach((ie) => {
              (e.beginPath(),
                e.moveTo(k.x + U * ie, k.y + G * ie),
                e.lineTo(k.x + U * ie + F * l, k.y + G * ie + N * l),
                e.stroke());
            }),
            (e.lineWidth = c),
            e.beginPath(),
            e.moveTo(k.x + U * d, k.y + G * d),
            e.lineTo(k.x - U * d, k.y - G * d),
            e.stroke());
        });
      }),
      e.restore());
  },
  Lo =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='60'%20viewBox='0%200%2060%2060'%3e%3cg%20fill='%23a08060'%3e%3crect%20x='0'%20y='27'%20width='60'%20height='5'/%3e%3c/g%3e%3cg%20fill='%23012731'%3e%3crect%20x='10'%20y='11'%20width='16'%20height='12'/%3e%3crect%20x='34'%20y='35'%20width='12'%20height='10'/%3e%3c/g%3e%3c/svg%3e",
  Po =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='60'%20viewBox='0%200%2060%2060'%3e%3cg%20fill='%23a08060'%3e%3crect%20x='0'%20y='27'%20width='60'%20height='5'/%3e%3crect%20x='27'%20y='0'%20width='5'%20height='29'/%3e%3c/g%3e%3cg%20fill='%23012731'%3e%3crect%20x='4'%20y='4'%20width='20'%20height='19'/%3e%3crect%20x='34'%20y='6'%20width='9'%20height='8'/%3e%3crect%20x='46'%20y='6'%20width='9'%20height='8'/%3e%3crect%20x='36'%20y='17'%20width='9'%20height='7'/%3e%3crect%20x='5'%20y='34'%20width='9'%20height='8'/%3e%3crect%20x='17'%20y='34'%20width='9'%20height='8'/%3e%3crect%20x='34'%20y='34'%20width='9'%20height='8'/%3e%3crect%20x='46'%20y='34'%20width='9'%20height='8'/%3e%3crect%20x='10'%20y='45'%20width='9'%20height='8'/%3e%3crect%20x='38'%20y='45'%20width='9'%20height='8'/%3e%3c/g%3e%3c/svg%3e",
  Ro =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='60'%20viewBox='0%200%2060%2060'%3e%3cg%20fill='%23a08060'%3e%3crect%20x='0'%20y='19'%20width='60'%20height='2'/%3e%3crect%20x='0'%20y='39'%20width='60'%20height='2'/%3e%3crect%20x='19'%20y='0'%20width='2'%20height='60'/%3e%3crect%20x='39'%20y='0'%20width='2'%20height='60'/%3e%3c/g%3e%3cg%20fill='%23012731'%3e%3crect%20x='21'%20y='21'%20width='18'%20height='18'/%3e%3c/g%3e%3cg%20fill='%235aaa44'%3e%3crect%20x='25'%20y='25'%20width='10'%20height='10'/%3e%3c/g%3e%3cg%20fill='%23012731'%3e%3crect%20x='21'%20y='4'%20width='18'%20height='14'/%3e%3crect%20x='4'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='9'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='14'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='4'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='9'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='14'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='4'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='9'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='14'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='41'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='46'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='21'%20width='4'%20height='4'/%3e%3crect%20x='41'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='46'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='27'%20width='4'%20height='4'/%3e%3crect%20x='41'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='46'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='33'%20width='4'%20height='4'/%3e%3crect%20x='21'%20y='41'%20width='4'%20height='4'/%3e%3crect%20x='27'%20y='41'%20width='4'%20height='4'/%3e%3crect%20x='33'%20y='41'%20width='4'%20height='4'/%3e%3crect%20x='21'%20y='47'%20width='4'%20height='4'/%3e%3crect%20x='27'%20y='47'%20width='4'%20height='4'/%3e%3crect%20x='33'%20y='47'%20width='4'%20height='4'/%3e%3crect%20x='5'%20y='5'%20width='4'%20height='4'/%3e%3crect%20x='10'%20y='5'%20width='4'%20height='4'/%3e%3crect%20x='5'%20y='10'%20width='4'%20height='4'/%3e%3crect%20x='46'%20y='5'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='5'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='10'%20width='4'%20height='4'/%3e%3crect%20x='5'%20y='46'%20width='4'%20height='4'/%3e%3crect%20x='5'%20y='51'%20width='4'%20height='4'/%3e%3crect%20x='10'%20y='51'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='46'%20width='4'%20height='4'/%3e%3crect%20x='46'%20y='51'%20width='4'%20height='4'/%3e%3crect%20x='51'%20y='51'%20width='4'%20height='4'/%3e%3c/g%3e%3c/svg%3e",
  Kt = 60,
  Bo = { village: Lo, town: Po, city: Ro },
  Ao = (e, t, n, o, a) => {
    const s = o * 1.5,
      c = s * (20 / 28),
      i = a ?? '#3a3a6a',
      d = Math.max(1, o * 0.055),
      l = t - c / 2,
      u = t + c / 2,
      h = n - s / 2,
      x = n + s / 2,
      w = h + s * 0.625,
      b = h + s * 0.45,
      v = c * 0.12,
      C = h + s * 0.4,
      M = new Path2D();
    (M.moveTo(l, h),
      M.lineTo(u, h),
      M.lineTo(u, w),
      M.quadraticCurveTo(u, x, t, x),
      M.quadraticCurveTo(l, x, l, w),
      M.closePath(),
      e.save(),
      e.translate(0.8, 1.2),
      (e.fillStyle = 'rgba(0,0,0,0.3)'),
      e.fill(M),
      e.translate(-0.8, -1.2),
      (e.fillStyle = i),
      e.fill(M),
      (e.strokeStyle = 'rgba(0,0,0,0.7)'),
      (e.lineWidth = d),
      e.stroke(M));
    const y = new Path2D();
    (y.moveTo(l + d, h + d),
      y.lineTo(t - 1, h + d),
      y.lineTo(t - 1, h + s * 0.38),
      y.lineTo(l + d, h + s * 0.52),
      y.closePath(),
      (e.fillStyle = 'rgba(255,255,255,0.15)'),
      e.fill(y),
      (e.strokeStyle = 'rgba(0,0,0,0.28)'),
      (e.lineWidth = d * 0.5),
      e.beginPath(),
      e.moveTo(t, h + d),
      e.lineTo(t, x - d * 2),
      e.stroke(),
      e.beginPath(),
      e.moveTo(l + d, C),
      e.lineTo(u - d, C),
      e.stroke(),
      (e.fillStyle = 'rgba(255,255,255,0.22)'),
      e.beginPath(),
      e.arc(t, b, v, 0, Math.PI * 2),
      e.fill(),
      (e.strokeStyle = 'rgba(0,0,0,0.3)'),
      (e.lineWidth = d * 0.4),
      e.stroke(),
      e.restore());
  },
  Io = ({
    ctx: e,
    tiles: t,
    iterateKeys: n,
    deepWaterSet: o,
    armiesByTile: a,
    factionColorMap: s,
    theme: c,
  }) => {
    n.forEach((i) => {
      var I;
      const d = t[i];
      if (!d || !d.hasTown || o.has(d.terrain)) return;
      const { q: l, r: u } = d,
        h = D(l, u),
        { x, y: w } = Q(l, u),
        b = a[h] ?? [],
        v = b.length > 0,
        C = d.fortification ?? 'none',
        M = C === 'none' ? null : c.town.fortification[C],
        y = d.townSize ?? 'town',
        $ = c.town.size[y].radius;
      (e.save(),
        e.beginPath(),
        e.arc(x, w, $, 0, Math.PI * 2),
        e.closePath(),
        (e.fillStyle = c.town.groundColor),
        e.fill(),
        e.clip());
      const E = He(Bo[y], Kt, Kt);
      if ((E && e.drawImage(E, x - $, w - $, $ * 2, $ * 2), e.restore(), M)) {
        (e.save(),
          (e.strokeStyle = M.wallColor),
          (e.lineWidth = M.wallWidth),
          e.beginPath(),
          e.arc(x, w, $, 0, Math.PI * 2),
          e.stroke(),
          (e.strokeStyle = M.markColor),
          (e.lineWidth = 1.5));
        for (let P = 0; P < M.markCount; P++) {
          const j = (P / M.markCount) * 2 * Math.PI,
            f = $ - 1.5,
            k = $ + 1.5;
          (e.beginPath(),
            e.moveTo(x + f * Math.cos(j), w + f * Math.sin(j)),
            e.lineTo(x + k * Math.cos(j), w + k * Math.sin(j)),
            e.stroke());
        }
        e.restore();
      }
      if (v) {
        const P = ((I = b[0]) == null ? void 0 : I.factionId) ?? null,
          j = P ? (s[P] ?? null) : null;
        Ao(e, x, w, $, j);
      }
    });
  },
  qt = (e, t, n, o, a, s, c) => {
    ((e.font = `bold ${a}px sans-serif`),
      (e.textAlign = 'center'),
      (e.textBaseline = 'middle'),
      (e.lineWidth = 3),
      (e.lineJoin = 'round'),
      (e.strokeStyle = c),
      e.strokeText(t, n, o),
      (e.fillStyle = s),
      e.fillText(t, n, o));
  },
  Oo = ({ ctx: e, tiles: t, iterateKeys: n, deepWaterSet: o, armiesByTile: a, theme: s }) => {
    n.forEach((c) => {
      const i = t[c];
      if (!i || !i.hasTown || o.has(i.terrain)) return;
      const { q: d, r: l, townName: u } = i,
        h = D(d, l),
        { x, y: w } = Q(d, l),
        b = a[h] ?? [],
        v = i.fortification ?? 'none',
        C = v === 'none' ? 0 : s.town.fortification[v].wallWidth,
        y = s.town.size[i.townSize ?? 'town'].radius + C / 2;
      (b.length === 1 &&
        b[0].name &&
        qt(e, b[0].name, x, w - y - 8, 9, s.garrison.nameColor, s.garrison.nameShadow),
        u && qt(e, u, x, w + y + 9, 10, s.town.labelColor, s.town.labelShadow));
    });
  },
  Wo =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%3e%3cg%20stroke='%23ffffff'%20stroke-linecap='round'%3e%3cline%20x1='5'%20y1='5'%20x2='19'%20y2='19'%20stroke-width='2.2'/%3e%3cline%20x1='19'%20y1='5'%20x2='5'%20y2='19'%20stroke-width='2.2'/%3e%3cline%20x1='4'%20y1='11'%20x2='10'%20y2='5'%20stroke-width='1.4'/%3e%3cline%20x1='20'%20y1='11'%20x2='14'%20y2='5'%20stroke-width='1.4'/%3e%3c/g%3e%3c/svg%3e",
  Fo =
    "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%3e%3cg%20stroke='%23ffffff'%20stroke-linecap='round'%20stroke-linejoin='round'%3e%3cline%20x1='12'%20y1='2'%20x2='12'%20y2='16'%20stroke-width='1.4'/%3e%3cpolygon%20points='12,3%2020,13%2012,15'%20stroke-width='1.2'/%3e%3cpolygon%20points='12,5%206,12%2012,13'%20stroke-width='1'/%3e%3cpath%20d='M%204%2017%20Q%2012%2022,%2020%2017'%20fill='none'%20stroke-width='2'/%3e%3cline%20x1='4'%20y1='17'%20x2='20'%20y2='17'%20stroke-width='1.4'/%3e%3c/g%3e%3c/svg%3e",
  Ut = 24,
  No = ({
    ctx: e,
    tiles: t,
    iterateKeys: n,
    armiesByTile: o,
    factionColorMap: a,
    theme: s,
    selectedArmyId: c,
    movingArmyId: i,
  }) => {
    const d = s.army,
      l = d.tokenRadius * 1.1;
    n.forEach((u) => {
      const h = o[u];
      if (!h || h.length === 0) return;
      const x = t[u];
      if (x != null && x.hasTown) return;
      const w = (x == null ? void 0 : x.terrain) ?? 'grass',
        b = mr.has(w),
        v = He(b ? Fo : Wo, Ut, Ut),
        [C, M] = u.split(',').map(Number),
        { x: y, y: $ } = Q(C, M);
      h.forEach((E, I) => {
        const P = (I - (h.length - 1) / 2) * d.stackSpacing,
          j = y + P,
          f = $ - 8,
          k = E.id === c,
          T = E.id === i,
          R = T ? d.movingColor : d.selectedColor,
          W = k || T ? R : d.tokenStroke;
        (e.beginPath(),
          e.arc(j, f, d.tokenRadius, 0, Math.PI * 2),
          (e.fillStyle = d.tokenFill),
          e.fill(),
          (e.strokeStyle = W),
          (e.lineWidth = 1.5),
          e.stroke(),
          v &&
            (e.save(),
            (e.globalAlpha = 0.85),
            e.drawImage(v, j - l / 2, f - l / 2, l, l),
            e.restore()));
        const F = E.factionId ?? null;
        if (F) {
          const N = a[F];
          if (N) {
            const U = j + d.tokenRadius * 0.65,
              G = f + d.tokenRadius * 0.65;
            (e.beginPath(),
              e.arc(U, G, 4, 0, Math.PI * 2),
              (e.fillStyle = N),
              e.fill(),
              (e.strokeStyle = d.tokenFill),
              (e.lineWidth = 1),
              e.stroke());
          }
        }
        if (E.name) {
          const N = f + d.tokenRadius + 14;
          ((e.font = '9px sans-serif'),
            (e.textAlign = 'center'),
            (e.textBaseline = 'middle'),
            (e.lineWidth = d.labelStrokeWidth),
            (e.lineJoin = 'round'),
            (e.strokeStyle = d.labelStroke),
            e.strokeText(E.name, j, N),
            (e.fillStyle = d.labelFill),
            e.fillText(E.name, j, N));
        }
      });
    });
  },
  zo = (e, t, n, o) => {
    const a = Ue(t, n, o);
    (e.beginPath(),
      a.forEach((s, c) => {
        c === 0 ? e.moveTo(s.x, s.y) : e.lineTo(s.x, s.y);
      }),
      e.closePath());
  },
  Do = (e, t) => {
    for (const n of Object.keys(e)) {
      const o = e[n],
        a = o.findIndex((s) => s.id === t);
      if (a >= 0) return { army: o[a], tileKey: n, tileIndex: a, total: o.length };
    }
    return null;
  },
  Ko = ({
    ctx: e,
    tiles: t,
    armiesByTile: n,
    selectedTile: o,
    selectedArmyId: a,
    movingArmyId: s,
    nowMs: c,
    theme: i,
  }) => {
    const d = ((c % 1e3) / 1e3) * 9;
    if (o) {
      const [u, h] = o.split(','),
        x = Number(u),
        w = Number(h),
        { x: b, y: v } = Q(x, w);
      (e.save(),
        e.setLineDash([6, 3]),
        (e.lineDashOffset = -d),
        (e.lineCap = 'round'),
        (e.strokeStyle = i.selectedStroke),
        (e.lineWidth = 2.5),
        zo(e, b, v, X - 5),
        e.stroke(),
        e.restore());
    }
    const l = (u, h) => {
      const x = Do(n, u);
      if (!x) return;
      const { army: w, tileKey: b, tileIndex: v, total: C } = x,
        M = t[b];
      if (M != null && M.hasTown) return;
      const { x: y, y: $ } = Q(w.q, w.r),
        E = (v - (C - 1) / 2) * i.army.stackSpacing,
        I = y + E,
        P = $ - 8;
      (e.save(),
        e.setLineDash([5, 3]),
        (e.lineDashOffset = -d),
        (e.lineCap = 'round'),
        (e.strokeStyle = h),
        (e.lineWidth = 2),
        e.beginPath(),
        e.arc(I, P, i.army.ringRadius, 0, Math.PI * 2),
        e.stroke(),
        e.restore());
    };
    s
      ? (l(s, i.army.movingColor), a && a !== s && l(a, i.army.selectedColor))
      : a && l(a, i.army.selectedColor);
  };
class qo {
  constructor(t) {
    ((this.mainCanvas = null),
      (this.overlayCanvas = null),
      (this.mainCtx = null),
      (this.overlayCtx = null),
      (this.patternCache = null),
      (this.visibleKeys = new Set()),
      (this.ghostKeys = new Set()),
      (this.hoveredKey = null),
      (this.cssWidth = 0),
      (this.cssHeight = 0),
      (this.dpr = 1),
      (this.rafMain = null),
      (this.rafOverlay = null),
      (this.unsubStore = null),
      (this.unsubSvgCache = null),
      (this.resizeObs = null),
      (this.lastTilesRef = null),
      (this.lastArmiesRef = null),
      (this.lastCustomRef = null),
      (this.lastFactionsRef = null),
      (this.lastUiMode = null),
      (this.lastSelectedTile = null),
      (this.lastSelectedArmyId = null),
      (this.lastMovingArmyId = null),
      (this.store = t.store),
      (this.viewportRef = t.viewportRef));
  }
  attach(t, n) {
    ((this.mainCanvas = t), (this.overlayCanvas = n));
    const o = t.getContext('2d'),
      a = n.getContext('2d');
    if (!o || !a) return;
    ((this.mainCtx = o), (this.overlayCtx = a), (this.patternCache = uo(o)));
    const s = this.store.getState();
    (this.patternCache.syncCustom(s.terrainConfig.custom),
      (this.lastCustomRef = s.terrainConfig.custom),
      (this.lastTilesRef = s.tiles),
      (this.lastArmiesRef = s.armies),
      (this.lastFactionsRef = s.factions),
      (this.lastUiMode = s.ui.mapMode),
      (this.lastSelectedTile = s.ui.selectedTile),
      (this.lastSelectedArmyId = s.ui.selectedArmyId),
      (this.lastMovingArmyId = s.ui.movingArmyId),
      this.measure(),
      (this.resizeObs = new ResizeObserver(() => {
        (this.measure(), this.scheduleRepaint(), this.scheduleOverlay());
      })),
      this.resizeObs.observe(t),
      (this.unsubStore = this.store.subscribe(() => {
        var l;
        const c = this.store.getState();
        let i = !1,
          d = !1;
        (c.tiles !== this.lastTilesRef && ((this.lastTilesRef = c.tiles), (i = !0), (d = !0)),
          c.armies !== this.lastArmiesRef && ((this.lastArmiesRef = c.armies), (i = !0), (d = !0)),
          c.terrainConfig.custom !== this.lastCustomRef &&
            ((this.lastCustomRef = c.terrainConfig.custom),
            (l = this.patternCache) == null || l.syncCustom(c.terrainConfig.custom),
            (i = !0)),
          c.factions !== this.lastFactionsRef && ((this.lastFactionsRef = c.factions), (i = !0)),
          c.ui.mapMode !== this.lastUiMode && ((this.lastUiMode = c.ui.mapMode), (i = !0)),
          c.ui.selectedTile !== this.lastSelectedTile &&
            ((this.lastSelectedTile = c.ui.selectedTile), (d = !0)),
          c.ui.selectedArmyId !== this.lastSelectedArmyId &&
            ((this.lastSelectedArmyId = c.ui.selectedArmyId), (d = !0), (i = !0)),
          c.ui.movingArmyId !== this.lastMovingArmyId &&
            ((this.lastMovingArmyId = c.ui.movingArmyId), (d = !0), (i = !0)),
          i && this.scheduleRepaint(),
          d && this.scheduleOverlay());
      })),
      (this.unsubSvgCache = Vn(() => {
        var i, d;
        (i = this.patternCache) == null || i.refresh();
        const c = this.store.getState();
        ((d = this.patternCache) == null || d.syncCustom(c.terrainConfig.custom),
          this.scheduleRepaint());
      })),
      this.scheduleRepaint(),
      this.scheduleOverlay());
  }
  detach() {
    var t, n, o;
    (this.rafMain !== null && (cancelAnimationFrame(this.rafMain), (this.rafMain = null)),
      this.rafOverlay !== null && (cancelAnimationFrame(this.rafOverlay), (this.rafOverlay = null)),
      (t = this.unsubStore) == null || t.call(this),
      (this.unsubStore = null),
      (n = this.unsubSvgCache) == null || n.call(this),
      (this.unsubSvgCache = null),
      (o = this.resizeObs) == null || o.disconnect(),
      (this.resizeObs = null),
      (this.mainCanvas = null),
      (this.overlayCanvas = null),
      (this.mainCtx = null),
      (this.overlayCtx = null),
      (this.patternCache = null));
  }
  setVisibleKeys(t) {
    t !== this.visibleKeys && ((this.visibleKeys = t), this.scheduleRepaint());
  }
  setGhostKeys(t) {
    t !== this.ghostKeys && ((this.ghostKeys = t), this.scheduleRepaint());
  }
  setHoveredKey(t) {
    this.hoveredKey !== t && ((this.hoveredKey = t), this.scheduleRepaint());
  }
  onViewportChanged() {
    (this.scheduleRepaint(), this.scheduleOverlay());
  }
  measure() {
    if (!this.mainCanvas || !this.overlayCanvas) return;
    const t = this.mainCanvas.getBoundingClientRect(),
      n = window.devicePixelRatio || 1;
    ((this.cssWidth = t.width), (this.cssHeight = t.height), (this.dpr = n));
    const o = Math.max(1, Math.round(t.width * n)),
      a = Math.max(1, Math.round(t.height * n));
    for (const s of [this.mainCanvas, this.overlayCanvas])
      (s.width !== o && (s.width = o), s.height !== a && (s.height = a));
  }
  scheduleRepaint() {
    this.rafMain === null &&
      (this.rafMain = requestAnimationFrame(() => {
        ((this.rafMain = null), this.paintMain());
      }));
  }
  scheduleOverlay() {
    this.rafOverlay === null &&
      (this.rafOverlay = requestAnimationFrame((t) => {
        ((this.rafOverlay = null), this.paintOverlay(t));
        const n = this.store.getState();
        (n.ui.selectedTile || n.ui.selectedArmyId || n.ui.movingArmyId) && this.scheduleOverlay();
      }));
  }
  expandKeys() {
    const n = this.store.getState().tiles,
      o = new Set(this.visibleKeys);
    return (
      this.visibleKeys.forEach((a) => {
        const s = n[a];
        s &&
          ut(s.q, s.r).forEach((c) => {
            const i = D(c.q, c.r);
            n[i] && o.add(i);
          });
      }),
      o
    );
  }
  applyViewportTransform(t) {
    const n = this.viewportRef.current;
    if (!n) return;
    const { dpr: o, cssWidth: a, cssHeight: s } = this;
    (t.setTransform(1, 0, 0, 1, 0, 0), t.clearRect(0, 0, a * o, s * o));
    const c = o * (a / 2 + n.x),
      i = o * (s / 2 + n.y),
      d = o * n.scale;
    t.setTransform(d, 0, 0, d, c, i);
  }
  groupArmiesByTile(t) {
    const n = {};
    return (
      Object.values(t.armies).forEach((o) => {
        const a = D(o.q, o.r);
        (n[a] || (n[a] = []), n[a].push(o));
      }),
      n
    );
  }
  paintMain() {
    if (!this.mainCtx || !this.mainCanvas || !this.viewportRef.current) return;
    const n = this.mainCtx;
    this.applyViewportTransform(n);
    const o = this.store.getState(),
      a = Br(o.terrainConfig.custom),
      s = {};
    o.factions.forEach((l) => {
      s[l.id] = l.color;
    });
    const c = this.groupArmiesByTile(o),
      i = this.expandKeys();
    (xo({ ctx: n, ghostKeys: this.ghostKeys, theme: A, hoveredKey: this.hoveredKey }),
      po({
        ctx: n,
        tiles: o.tiles,
        visibleKeys: this.visibleKeys,
        customTerrains: o.terrainConfig.custom,
        factions: o.factions,
        theme: A,
        patternCache: this.patternCache,
        mapMode: o.ui.mapMode,
        hoveredKey: this.hoveredKey,
      }));
    const d = Mo({ ctx: n, tiles: o.tiles, iterateKeys: i, deepWaterSet: a, theme: A });
    (So({
      ctx: n,
      tiles: o.tiles,
      iterateKeys: i,
      deepWaterSet: a,
      riverCurvesByTile: d,
      theme: A,
    }),
      To({ ctx: n, tiles: o.tiles, iterateKeys: i, deepWaterSet: a, theme: A }),
      Io({
        ctx: n,
        tiles: o.tiles,
        iterateKeys: i,
        deepWaterSet: a,
        armiesByTile: c,
        factionColorMap: s,
        theme: A,
      }),
      Eo({ ctx: n, tiles: o.tiles, iterateKeys: i, deepWaterSet: a, theme: A }),
      Oo({ ctx: n, tiles: o.tiles, iterateKeys: i, deepWaterSet: a, armiesByTile: c, theme: A }),
      No({
        ctx: n,
        tiles: o.tiles,
        iterateKeys: this.visibleKeys,
        armiesByTile: c,
        factionColorMap: s,
        theme: A,
        selectedArmyId: o.ui.selectedArmyId,
        movingArmyId: o.ui.movingArmyId,
      }));
  }
  paintOverlay(t) {
    if (!this.overlayCtx || !this.overlayCanvas || !this.viewportRef.current) return;
    const o = this.overlayCtx;
    this.applyViewportTransform(o);
    const a = this.store.getState(),
      s = this.groupArmiesByTile(a);
    Ko({
      ctx: o,
      tiles: a.tiles,
      armiesByTile: s,
      selectedTile: a.ui.selectedTile,
      selectedArmyId: a.ui.selectedArmyId,
      movingArmyId: a.ui.movingArmyId,
      nowMs: t,
      theme: A,
    });
  }
}
const Uo = (e, t, n, o) => {
    const a = (e - n.left - (n.width / 2 + o.x)) / o.scale,
      s = (t - n.top - (n.height / 2 + o.y)) / o.scale;
    return { worldX: a, worldY: s };
  },
  Ho = ({ state: e, ghostKeys: t, worldX: n, worldY: o }) => {
    const a = A.army.tokenRadius * A.army.tokenRadius,
      s = {};
    Object.values(e.armies).forEach((l) => {
      const u = D(l.q, l.r);
      (s[u] || (s[u] = []), s[u].push(l));
    });
    for (const l of Object.keys(s)) {
      const u = e.tiles[l];
      if (u != null && u.hasTown) continue;
      const [h, x] = l.split(','),
        { x: w, y: b } = Q(Number(h), Number(x)),
        v = s[l];
      for (let C = 0; C < v.length; C++) {
        const M = (C - (v.length - 1) / 2) * A.army.stackSpacing,
          y = w + M,
          $ = b - 8,
          E = n - y,
          I = o - $;
        if (E * E + I * I <= a) return { kind: 'army', army: v[C] };
      }
    }
    const { q: c, r: i } = yr(n, o),
      d = D(c, i);
    return e.tiles[d]
      ? { kind: 'tile', key: d, q: c, r: i }
      : t.has(d)
        ? { kind: 'ghost', key: d, q: c, r: i }
        : { kind: 'bg' };
  },
  _o = (e, t, n) => {
    const o = ut(e, t),
      a = {};
    if (
      (o.forEach(({ q: l, r: u }) => {
        const h = n[D(l, u)];
        h && (a[h.terrain] = (a[h.terrain] || 0) + 1);
      }),
      Object.keys(a).length === 0)
    )
      return 'grass';
    const s = Math.max(...Object.values(a)),
      c = Object.keys(a).filter((l) => a[l] === s);
    if (c.length === 1) return c[0];
    const i = new Set(o.map((l) => D(l.q, l.r))),
      d = Object.keys(n);
    for (let l = d.length - 1; l >= 0; l--) {
      const u = d[l];
      if (i.has(u) && c.includes(n[u].terrain)) return n[u].terrain;
    }
    return c[0];
  },
  Yo = 4,
  Ht = 500,
  Vo = 2,
  Ze = (e, t) => {
    if (e.size !== t.size) return !1;
    for (const n of e) if (!t.has(n)) return !1;
    return !0;
  },
  Xo = (e, t, n, o = Vo) => {
    const a = n.length < Ht,
      s = g.useCallback(
        (h) => {
          const x = e.current,
            w = t.current;
          if (!x || !w) return new Set(h);
          const { width: b, height: v } = w.getBoundingClientRect();
          if (b === 0 || v === 0) return new Set(h);
          const C = o * X * Math.sqrt(3) * x.scale,
            M = new Set();
          for (const y of h) {
            const [$, E] = y.split(','),
              { x: I, y: P } = Q(Number($), Number(E)),
              j = b / 2 + x.x + I * x.scale,
              f = v / 2 + x.y + P * x.scale;
            j > -C && j < b + C && f > -C && f < v + C && M.add(y);
          }
          return M;
        },
        [e, t, o]
      ),
      [c, i] = g.useState(() => {
        if (a) return new Set(n);
        const h = s(n);
        return h.size === n.length && n.length >= Ht ? new Set() : h;
      }),
      d = g.useRef(n);
    d.current = n;
    const l = g.useRef(c),
      u = g.useRef(0);
    return (
      g.useEffect(() => {
        if (a) {
          i((b) => {
            const v = new Set(n);
            return Ze(b, v) ? b : ((l.current = v), v);
          });
          return;
        }
        const h = s(n);
        Ze(l.current, h) || ((l.current = h), i(h));
        let x;
        const w = () => {
          if (((u.current += 1), u.current % Yo === 0)) {
            const b = s(d.current);
            Ze(l.current, b) || ((l.current = b), i(b));
          }
          x = requestAnimationFrame(w);
        };
        return (
          (x = requestAnimationFrame(w)),
          () => {
            cancelAnimationFrame(x);
          }
        );
      }, [n, o, a, s]),
      c
    );
  },
  Go = m.div`
  position: relative;
  flex: 1;
  display: block;
  min-height: 0;
  min-width: 0;
`,
  Zo = m.div`
  position: absolute;
  inset: 0;
  touch-action: none;
`,
  _t = m.canvas`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
`,
  Jo = () => {
    const e = Z(),
      t = ht(),
      n = O((p) => Object.keys(p.tiles), Ar),
      o = O((p) => p.ui.placingArmy),
      a = O((p) => p.ui.mapMode),
      s = g.useRef({ x: 0, y: 0, scale: 1 }),
      c = g.useRef(null),
      i = g.useRef(null),
      d = g.useRef(null),
      l = g.useRef(null),
      u = g.useRef(null),
      h = Xo(s, c, n);
    (g.useLayoutEffect(() => {
      if (!d.current || !l.current) return;
      const p = new qo({ store: t, viewportRef: s });
      return (
        p.attach(d.current, l.current),
        (u.current = p),
        () => {
          (p.detach(), (u.current = null));
        }
      );
    }, [t]),
      g.useEffect(() => {
        var p;
        (p = u.current) == null || p.setVisibleKeys(h);
      }, [h]));
    const x = g.useCallback(() => {
      var p;
      (p = u.current) == null || p.onViewportChanged();
    }, []);
    g.useLayoutEffect(() => {
      ((s.current = { ...t.getState().viewport }), x());
      const p = t.subscribe(() => {
          ((s.current = { ...t.getState().viewport }), x());
        }),
        L = c.current;
      let B;
      return (
        L && typeof ResizeObserver < 'u' && ((B = new ResizeObserver(() => x())), B.observe(L)),
        () => {
          (p(), B == null || B.disconnect());
        }
      );
    }, [t, x]);
    const w = g.useRef(!1),
      b = g.useRef({ x: 0, y: 0 }),
      v = g.useRef(null),
      C = g.useRef(!1),
      M = g.useRef(null),
      y = g.useCallback(() => {
        e(Ir({ ...s.current }));
      }, [e]),
      $ = g.useCallback(
        (p, L) => {
          const B = c.current;
          if (!B) return;
          const S = t.getState().ui;
          if (S.mapMode !== 'terrain-paint' && S.mapMode !== 'faction') return;
          const q = B.getBoundingClientRect(),
            { x: K, y: V, scale: re } = s.current,
            ee = (p - q.left - (q.width / 2 + K)) / re,
            he = (L - q.top - (q.height / 2 + V)) / re,
            te = yr(ee, he),
            le = M.current,
            pe = le ? Or(le.q, le.r, te.q, te.r) : [te];
          M.current = te;
          const xe = t.getState().tiles;
          if (S.mapMode === 'faction') {
            const _ = [];
            (pe.forEach(({ q: J, r: de }) => {
              xe[D(J, de)] &&
                _.push({ type: 'faction', q: J, r: de, factionId: S.activeFactionId });
            }),
              _.length > 0 && e(mt(_)));
            return;
          }
          const H = S.activePaintBrush;
          if (!H) return;
          const we = !!A.terrain[H] || t.getState().terrainConfig.custom.some((_) => _.id === H),
            ne = [];
          (pe.forEach(({ q: _, r: J }) => {
            const de = !!xe[D(_, J)];
            if (we)
              de
                ? ne.push({ type: 'update', q: _, r: J, terrain: H })
                : ne.push({ type: 'add', q: _, r: J, terrain: H });
            else if (de)
              H === 'river-on'
                ? ne.push({ type: 'feature', q: _, r: J, flag: 'hasRiver', value: !0 })
                : H === 'river-off'
                  ? ne.push({ type: 'feature', q: _, r: J, flag: 'hasRiver', value: !1 })
                  : H === 'road-on'
                    ? ne.push({ type: 'feature', q: _, r: J, flag: 'hasRoad', value: !0 })
                    : H === 'road-off' &&
                      ne.push({ type: 'feature', q: _, r: J, flag: 'hasRoad', value: !1 });
            else return;
          }),
            ne.length > 0 && e(mt(ne)));
        },
        [e, t]
      ),
      E = g.useCallback(
        (p) => {
          p.preventDefault();
          const L = p.currentTarget.getBoundingClientRect(),
            B = p.clientX - L.left,
            S = p.clientY - L.top,
            q = L.width,
            K = L.height,
            { x: V, y: re, scale: ee } = s.current,
            he = p.deltaY < 0 ? 1.1 : 0.9,
            te = Math.min(vt, Math.max(kt, ee * he)),
            le = q / 2 + V,
            pe = K / 2 + re,
            xe = (B - le) / ee,
            H = (S - pe) / ee;
          ((s.current = { x: B - q / 2 - xe * te, y: S - K / 2 - H * te, scale: te }), x(), y());
        },
        [x, y]
      ),
      I = g.useCallback((p) => {
        p.button === 0 && ((w.current = !0), (b.current = { x: p.clientX, y: p.clientY }));
      }, []),
      P = g.useCallback(
        (p) => {
          if (C.current) {
            $(p.clientX, p.clientY);
            return;
          }
          w.current &&
            ((s.current.x += p.clientX - b.current.x),
            (s.current.y += p.clientY - b.current.y),
            (b.current = { x: p.clientX, y: p.clientY }),
            x());
        },
        [x, $]
      ),
      j = g.useCallback(() => {
        ((C.current = !1), (M.current = null), w.current && ((w.current = !1), y()));
      }, [y]),
      f = g.useCallback(() => {
        const p = t.getState().ui;
        p.mapMode !== 'terrain-paint' &&
          (e(ae()),
          p.selectedArmyId && e(ce()),
          p.placingArmy && e(Ve(!1)),
          p.movingArmyId && e(me()));
      }, [e, t]),
      k = g.useCallback((p) => {
        if (p.touches.length === 1)
          ((w.current = !0),
            (b.current = { x: p.touches[0].clientX, y: p.touches[0].clientY }),
            (v.current = null));
        else if (p.touches.length === 2) {
          w.current = !1;
          const L = p.touches[0].clientX - p.touches[1].clientX,
            B = p.touches[0].clientY - p.touches[1].clientY;
          v.current = Math.hypot(L, B);
        }
      }, []),
      T = g.useCallback(
        (p) => {
          if ((p.preventDefault(), p.touches.length === 1 && w.current))
            ((s.current.x += p.touches[0].clientX - b.current.x),
              (s.current.y += p.touches[0].clientY - b.current.y),
              (b.current = { x: p.touches[0].clientX, y: p.touches[0].clientY }),
              x());
          else if (p.touches.length === 2 && v.current !== null) {
            const L = p.touches[0].clientX - p.touches[1].clientX,
              B = p.touches[0].clientY - p.touches[1].clientY,
              S = Math.hypot(L, B),
              q = (p.touches[0].clientX + p.touches[1].clientX) / 2,
              K = (p.touches[0].clientY + p.touches[1].clientY) / 2,
              V = p.currentTarget.getBoundingClientRect(),
              re = q - V.left,
              ee = K - V.top,
              he = V.width,
              te = V.height,
              le = S / v.current,
              { x: pe, y: xe, scale: H } = s.current,
              we = Math.min(vt, Math.max(kt, H * le)),
              ne = he / 2 + pe,
              _ = te / 2 + xe,
              J = (re - ne) / H,
              de = (ee - _) / H;
            ((s.current = { x: re - he / 2 - J * we, y: ee - te / 2 - de * we, scale: we }),
              x(),
              (v.current = S));
          }
        },
        [x]
      ),
      R = g.useCallback(
        (p) => {
          p.touches.length === 0
            ? ((w.current = !1), (v.current = null), y())
            : p.touches.length === 1 &&
              ((v.current = null),
              (w.current = !0),
              (b.current = { x: p.touches[0].clientX, y: p.touches[0].clientY }),
              y());
        },
        [y]
      );
    g.useEffect(() => {
      const p = (L) => {
        L.key === 'Escape' && t.getState().ui.mapMode === 'terrain-paint' && e(vr());
      };
      return (
        window.addEventListener('keydown', p),
        () => window.removeEventListener('keydown', p)
      );
    }, [e, t]);
    const W = g.useMemo(() => {
        const p = new Set();
        if (n.length === 0) return (p.add(D(0, 0)), p);
        const L = new Set(n);
        return (
          h.forEach((B) => {
            if (!L.has(B)) return;
            const [S, q] = B.split(','),
              K = Number(S),
              V = Number(q);
            ut(K, V).forEach((re) => {
              const ee = D(re.q, re.r);
              L.has(ee) || p.add(ee);
            });
          }),
          p
        );
      }, [n, h]),
      F = g.useRef(W);
    ((F.current = W),
      g.useEffect(() => {
        var p;
        (p = u.current) == null || p.setGhostKeys(W);
      }, [W]),
      g.useEffect(() => {}, [t]));
    const N = g.useCallback(
        (p, L) => {
          const B = c.current;
          if (!B) return null;
          const S = B.getBoundingClientRect(),
            { worldX: q, worldY: K } = Uo(p, L, S, s.current);
          return Ho({ state: t.getState(), ghostKeys: F.current, worldX: q, worldY: K });
        },
        [t]
      ),
      U = g.useCallback(
        (p) => {
          if (p.button !== 0) return;
          const L = t.getState().ui;
          (L.mapMode !== 'terrain-paint' && L.mapMode !== 'faction') ||
            ((C.current = !0), $(p.clientX, p.clientY));
        },
        [t, $]
      ),
      G = g.useCallback(
        (p) => {
          var B, S;
          const L = N(p.clientX, p.clientY);
          L &&
            (L.kind === 'tile' || L.kind === 'ghost'
              ? (B = u.current) == null || B.setHoveredKey(L.key)
              : (S = u.current) == null || S.setHoveredKey(null));
        },
        [N]
      ),
      ie = g.useCallback(() => {
        var p;
        (p = u.current) == null || p.setHoveredKey(null);
      }, []),
      Ye = g.useCallback(
        (p) => {
          var q;
          const L = t.getState(),
            B = L.ui;
          if (B.mapMode === 'terrain-paint') return;
          const S = N(p.clientX, p.clientY);
          if (S) {
            if (S.kind === 'army') {
              B.selectedArmyId === S.army.id ? e(ce()) : e(br(S.army.id));
              return;
            }
            if (S.kind === 'tile') {
              if (B.mapMode === 'faction') {
                e(yt({ q: S.q, r: S.r, factionId: B.activeFactionId }));
                return;
              }
              if (B.movingArmyId) {
                (e(bt({ id: B.movingArmyId, q: S.q, r: S.r })), e(me()));
                return;
              }
              if (B.placingArmy) {
                (e(tt({ q: S.q, r: S.r })), e(Ve(!1)));
                return;
              }
              if (B.selectedTile === S.key) e(ae());
              else {
                const K = ((q = L.tiles[S.key]) == null ? void 0 : q.hasTown) ?? !1;
                e(wt({ key: S.key, hasTown: K }));
              }
              return;
            }
            if (S.kind === 'ghost') {
              const K = _o(S.q, S.r, L.tiles);
              if (B.movingArmyId) {
                (e(Pe({ q: S.q, r: S.r, terrain: K })),
                  e(bt({ id: B.movingArmyId, q: S.q, r: S.r })),
                  e(me()));
                return;
              }
              if (B.placingArmy) {
                (e(Pe({ q: S.q, r: S.r, terrain: K })), e(tt({ q: S.q, r: S.r })), e(Ve(!1)));
                return;
              }
              if (B.mapMode === 'faction') {
                (e(Pe({ q: S.q, r: S.r, terrain: K })),
                  e(yt({ q: S.q, r: S.r, factionId: B.activeFactionId })));
                return;
              }
              (e(Pe({ q: S.q, r: S.r, terrain: K })), e(wt({ key: D(S.q, S.r), hasTown: !1 })));
              return;
            }
            f();
          }
        },
        [t, e, N, f]
      ),
      Le = g.useCallback(
        (p) => {
          p.preventDefault();
          const L = N(p.clientX, p.clientY);
          if (!L) return;
          const B = t.getState().ui;
          if (L.kind === 'army') {
            (e(wr(L.army.id)), e(ce()));
            return;
          }
          L.kind === 'tile' && (B.selectedTile === L.key && e(ae()), e(pt({ q: L.q, r: L.r })));
        },
        [N, e, t]
      );
    return r.jsxs(Go, {
      ref: c,
      children: [
        r.jsx(_t, { ref: d }),
        r.jsx(_t, { ref: l }),
        r.jsx(Zo, {
          ref: i,
          style: { cursor: o || a === 'terrain-paint' || a === 'faction' ? 'crosshair' : void 0 },
          onWheel: E,
          onMouseDown: I,
          onMouseMove: P,
          onMouseUp: j,
          onMouseLeave: j,
          onClick: Ye,
          onContextMenu: Le,
          onPointerDown: U,
          onPointerMove: G,
          onPointerLeave: ie,
          onTouchStart: k,
          onTouchMove: T,
          onTouchEnd: R,
        }),
      ],
    });
  },
  Qo = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'],
  es = xt(
    (e) => e.terrainConfig,
    (e) => {
      const { disabled: t, custom: n, order: o } = e,
        a = {};
      Qo.forEach((i) => {
        t.includes(i) ||
          (a[i] = {
            id: i,
            color: A.terrain[i].color,
            Icon: A.icons.terrain[i] ?? null,
            iconUrl: '',
            name: i,
            isCustom: !1,
          });
      });
      const s = {};
      n.forEach((i) => {
        s[i.id] = {
          id: i.id,
          color: i.color.trim(),
          Icon: null,
          iconUrl: i.icon ?? '',
          name: i.name,
          isCustom: !0,
        };
      });
      const c = [];
      return (
        o.forEach((i) => {
          a[i] ? c.push(a[i]) : s[i] && c.push(s[i]);
        }),
        Object.values(a).forEach((i) => {
          o.includes(i.id) || c.push(i);
        }),
        Object.values(s).forEach((i) => {
          o.includes(i.id) || c.push(i);
        }),
        c
      );
    }
  ),
  ts = () => O(es),
  ye = m.div`
  position: fixed;
  top: 0;
  right: 0;
  width: ${({ $width: e }) => e ?? '280px'};
  height: 100vh;
  background: ${({ theme: e }) => e.panelBackground};
  border-left: 2px solid
    ${({ theme: e }) => e.panelBorder};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap: e }) => e ?? '16px'};
  z-index: ${({ theme: e }) => e.zIndex.panel};
  overflow-y: auto;

  @media (min-width: 601px) {
    ${({ $open: e, $desktopSlide: t, $desktopVisible: n, $width: o }) => {
      const a = n ?? e;
      return t
        ? `right: ${a ? '0' : `calc(-${o ?? '280px'} - 24px)`}; transition: right 0.25s ease;`
        : `opacity: ${a ? '1' : '0'}; pointer-events: ${a ? 'auto' : 'none'}; transition: opacity 0.25s ease;`;
    }}
  }

  @media (max-width: 600px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: ${({ $open: e, $mobileHeight: t }) => (e ? '0' : `-${t ?? '60vh'}`)};
    width: 100%;
    height: ${({ $mobileHeight: e }) => e ?? '60vh'};
    border-left: none;
    border-top: 2px solid
      ${({ theme: e }) => e.panelBorder};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`,
  be = m.div`
  display: none;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme: e }) => e.panelBorder};
  margin: ${({ $margin: e }) => e ?? '0 auto 8px'};

  @media (max-width: 600px) {
    display: block;
  }
`,
  Y = m.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme: e }) => e.textMuted};
  margin-bottom: 4px;
`,
  lt = m.textarea`
  width: 100%;
  min-height: ${({ $minHeight: e }) => e ?? '130px'};
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.surface.active};
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.text};
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme: e }) => e.surface.borderFocus};
  }

  &::placeholder {
    color: ${({ theme: e }) => e.textMuted};
  }
`,
  rs = xt([(e) => e.armies, (e, t) => t], (e, t) =>
    t ? Object.values(e).filter((n) => D(n.q, n.r) === t) : []
  ),
  Yt = m.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme: e }) => e.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`,
  ns = m.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 1.2rem;
  cursor: pointer;
  &:hover {
    color: ${({ theme: e }) => e.text};
  }

  @media (min-width: 601px) {
    display: none;
  }
`,
  os = m.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  opacity: 0.45;
`,
  ss = m.div`
  width: 3.5rem;
  height: 3.5rem;
  color: ${({ theme: e }) => e.textMuted};
  opacity: 0.45;
`,
  ke = {
    width: '1em',
    height: '1em',
    style: { marginRight: '0.4em', flexShrink: 0 },
    'aria-hidden': !0,
  },
  is = {
    width: '1em',
    height: '1em',
    style: { marginRight: '0.4em', verticalAlign: '-0.15em' },
    'aria-hidden': !0,
  },
  as = m.p`
  font-size: 0.85rem;
  text-align: center;
  color: ${({ theme: e }) => e.textMuted};
  line-height: 1.5;
  margin: 0;
`,
  Vt = m.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`,
  Xt = m.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active: e, $color: t, theme: n }) => (e ? `color-mix(in srgb, ${t} ${n.terrainButtonMix.activePercent}%, white)` : 'transparent')};
  background: ${({ $color: e }) => e}33;
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: ${({ $color: e, theme: t }) => `color-mix(in srgb, ${e} ${t.terrainButtonMix.hoverPercent}%, white)`};
    background: ${({ $color: e }) => e}55;
  }

  &:focus-visible {
    outline: 3px solid
      ${({ $color: e, theme: t }) => `color-mix(in srgb, ${e} ${t.terrainButtonMix.focusPercent}%, white)`};
    outline-offset: 2px;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }
  span.label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`,
  cs = m.div`
  display: flex;
  flex-direction: column;
`,
  ls = m.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid
    ${({ $active: e, $color: t }) => (e ? t : A.surface.borderFaint)};
  border-radius: 0;
  background: ${({ $active: e, $color: t }) => (e ? `${t}22` : A.surface.subtle)};
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  &:first-child:last-child {
    border-radius: 8px;
  }
  & + & {
    margin-top: -2px;
  }
  &:hover {
    z-index: 1;
    border-color: ${({ $color: e }) => e}77;
  }

  .flag-icon {
    width: 1.2rem;
    height: 1.2rem;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }
  .flag-label {
    font-size: 0.85rem;
    letter-spacing: 0.03em;
  }
  .flag-state {
    margin-left: auto;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
`,
  Je = m.hr`
  border: none;
  border-top: 1px solid
    ${({ theme: e }) => e.panelBorder};
`,
  ds = m.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,
  us = m.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid
    ${({ theme: e }) => e.garrison.nameColor}59;
  background: ${({ theme: e }) => e.garrison.nameColor}0f;
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.garrison.nameColor}26;
    border-color: ${({ theme: e }) => e.garrison.nameColor}99;
  }
`,
  hs = m.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,
  ps = m.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.surface.borderMedium};
  background: ${({ theme: e }) => e.surface.subtle};
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.surface.hover};
    border-color: ${({ theme: e }) => e.surface.borderFocus};
  }
`,
  xs = m.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.town.color}66;
  background: ${({ theme: e }) => e.surface.subtle};
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.town.color}22;
    border-color: ${({ theme: e }) => e.town.color};
  }
`,
  fs = m.button`
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.accent};
  background: transparent;
  color: ${({ theme: e }) => e.accent};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.accent}22;
  }
`,
  gs = m.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
  padding-left: 4px;
`,
  ms = m.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: ${({ theme: e }) => e.textMuted};
`,
  ys = m.button`
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid
    ${({ $blocked: e, $color: t }) => (e ? A.surface.border : `${t}66`)};
  background: transparent;
  color: ${({ $blocked: e, theme: t }) => (e ? t.textMuted : t.text)};
  font-size: 0.7rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ $color: e }) => e};
    color: ${({ theme: e }) => e.text};
  }
`,
  bs = m.div`
  position: relative;
`,
  ws = m.button`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme: e }) => e.surface.borderMedium};
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.textMuted};
  cursor: pointer;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.surface.borderFaint};
    border-color: ${({ theme: e }) => e.surface.borderFocus};
    color: ${({ theme: e }) => e.text};
  }
`,
  Gt = m.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,
  Zt = m.span`
  flex: 0 0 72px;
  font-size: 0.85rem;
  color: ${({ theme: e }) => e.text};
`,
  Jt = m.div`
  display: flex;
  gap: 6px;
  flex: 1;
`,
  We = m.button`
  flex: 1;
  padding: 8px 6px;
  border-radius: 7px;
  border: 2px solid
    ${({ $active: e, $color: t }) => (e ? t : A.surface.borderFaint)};
  background: ${({ $active: e, $color: t }) => (e ? `${t}22` : A.surface.base)};
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
  &:hover {
    border-color: ${({ $color: e }) => e}77;
  }
  &:focus-visible {
    outline: 2px solid
      ${({ $color: e }) => e};
    outline-offset: 2px;
  }
`,
  vs = m.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.ui.paintMode}66;
  background: ${({ theme: e }) => e.ui.paintMode}0f;
  color: ${({ theme: e }) => e.text};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.ui.paintMode}26;
    border-color: ${({ theme: e }) => e.ui.paintMode}b3;
  }
`,
  Qt = ['E', 'NE', 'NW', 'W', 'SW', 'SE'],
  ks = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked', hasTown: 'portBlocked' },
  er = [
    {
      key: 'hasRiver',
      labelKey: 'features.river',
      Icon: A.icons.features.river,
      color: A.river.color,
    },
    { key: 'hasRoad', labelKey: 'features.road', Icon: A.icons.features.road, color: A.road.color },
    { key: 'hasTown', labelKey: 'features.town', Icon: A.icons.features.port, color: A.town.color },
  ],
  js = () => {
    const e = Z(),
      { t } = oe(),
      n = ts(),
      o = O((y) => y.ui.selectedTile),
      a = O((y) => y.ui.mapMode),
      s = O((y) => y.ui.showShortcuts),
      c = O((y) => y.ui.selectedArmyId),
      i = O((y) => y.ui.activePaintBrush),
      d = O((y) => y.ui.editingTownTile),
      l = O((y) => (o ? (y.tiles[o] ?? null) : null)),
      u = O((y) => y.tiles),
      h = O((y) => rs(y, o)),
      x = (y) => {
        l && e(zr({ q: l.q, r: l.r, terrain: y }));
      },
      w = (y) => {
        l && e(Dr({ q: l.q, r: l.r, flag: y }));
      },
      b = (y, $, E) => {
        l &&
          e(
            E
              ? Kr({ q: l.q, r: l.r, flag: y, neighborKey: $ })
              : qr({ q: l.q, r: l.r, flag: y, neighborKey: $ })
          );
      },
      v = (y) => {
        l && e(Ur({ q: l.q, r: l.r, notes: y.target.value }));
      },
      C = () => {
        l && (e(pt({ q: l.q, r: l.r })), e(ae()));
      },
      M = () => e(ae());
    return r.jsxs(ye, {
      $open: (!!o || a === 'terrain-paint') && !s && !c && !d,
      $desktopVisible: (a === 'terrain' || a === 'terrain-paint') && !s && !c && !d,
      $gap: '20px',
      children: [
        r.jsx(be, { $margin: '0 auto -8px' }),
        a === 'terrain-paint'
          ? r.jsxs(r.Fragment, {
              children: [
                r.jsxs(bs, {
                  children: [
                    r.jsxs(Yt, { children: [r.jsx(At, { ...is }), t('tilePanel.paintMode')] }),
                    r.jsxs(ws, {
                      'data-testid': 'exit-paint-btn',
                      onClick: () => e(vr()),
                      children: [r.jsx(se, { ...ke }), t('tilePanel.exitPaint')],
                    }),
                  ],
                }),
                r.jsxs('div', {
                  children: [
                    r.jsx(Y, { children: t('tilePanel.terrain') }),
                    r.jsx(Vt, {
                      children: n.map(({ id: y, color: $, Icon: E, iconUrl: I, name: P }) =>
                        r.jsxs(
                          Xt,
                          {
                            'data-testid': `paint-brush-${y}`,
                            $active: i === y,
                            $color: $,
                            onClick: () => e(ve(y)),
                            children: [
                              E
                                ? r.jsx(E, { className: 'icon' })
                                : I
                                  ? r.jsx('img', {
                                      className: 'icon',
                                      src: I,
                                      alt: '',
                                      'aria-hidden': !0,
                                    })
                                  : r.jsx('span', {
                                      className: 'icon',
                                      style: {
                                        width: '1.5rem',
                                        height: '1.5rem',
                                        background: $,
                                        borderRadius: '3px',
                                        display: 'block',
                                      },
                                    }),
                              r.jsx('span', {
                                className: 'label',
                                children: t(`terrain.${y}`, { defaultValue: P }),
                              }),
                            ],
                          },
                          y
                        )
                      ),
                    }),
                  ],
                }),
                r.jsx(Je, {}),
                r.jsxs('div', {
                  children: [
                    r.jsx(Y, { children: t('tilePanel.features') }),
                    r.jsxs('div', {
                      style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                      children: [
                        r.jsxs(Gt, {
                          children: [
                            r.jsxs(Zt, {
                              children: [
                                r.jsx(A.icons.features.river, {
                                  style: {
                                    width: '1rem',
                                    height: '1rem',
                                    verticalAlign: 'middle',
                                    filter: 'brightness(0) invert(1)',
                                    opacity: 0.85,
                                  },
                                }),
                                ' ',
                                t('features.river'),
                              ],
                            }),
                            r.jsxs(Jt, {
                              children: [
                                r.jsx(We, {
                                  $active: i === 'river-on',
                                  $color: A.river.color,
                                  onClick: () => e(ve('river-on')),
                                  children: t('tilePanel.riverAdd'),
                                }),
                                r.jsx(We, {
                                  $active: i === 'river-off',
                                  $color: A.textMuted,
                                  onClick: () => e(ve('river-off')),
                                  children: t('tilePanel.riverRemove'),
                                }),
                              ],
                            }),
                          ],
                        }),
                        r.jsxs(Gt, {
                          children: [
                            r.jsxs(Zt, {
                              children: [
                                r.jsx(A.icons.features.road, {
                                  style: {
                                    width: '1rem',
                                    height: '1rem',
                                    verticalAlign: 'middle',
                                    filter: 'brightness(0) invert(1)',
                                    opacity: 0.85,
                                  },
                                }),
                                ' ',
                                t('features.road'),
                              ],
                            }),
                            r.jsxs(Jt, {
                              children: [
                                r.jsx(We, {
                                  $active: i === 'road-on',
                                  $color: A.road.color,
                                  onClick: () => e(ve('road-on')),
                                  children: t('tilePanel.roadAdd'),
                                }),
                                r.jsx(We, {
                                  $active: i === 'road-off',
                                  $color: A.textMuted,
                                  onClick: () => e(ve('road-off')),
                                  children: t('tilePanel.roadRemove'),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          : r.jsxs(r.Fragment, {
              children: [
                r.jsx(Yt, { children: t('tilePanel.title') }),
                r.jsx(ns, { onClick: M, children: r.jsx(se, { width: '1em', height: '1em' }) }),
                o
                  ? r.jsxs(r.Fragment, {
                      children: [
                        r.jsxs('div', {
                          children: [
                            r.jsx(Y, { children: t('tilePanel.terrain') }),
                            r.jsx(Vt, {
                              children: n.map(({ id: y, color: $, Icon: E, iconUrl: I, name: P }) =>
                                r.jsxs(
                                  Xt,
                                  {
                                    'data-testid': `terrain-btn-${y}`,
                                    $active: (l == null ? void 0 : l.terrain) === y,
                                    $color: $,
                                    onClick: () => x(y),
                                    children: [
                                      E
                                        ? r.jsx(E, { className: 'icon' })
                                        : I
                                          ? r.jsx('img', {
                                              className: 'icon',
                                              src: I,
                                              alt: '',
                                              'aria-hidden': !0,
                                            })
                                          : r.jsx('span', {
                                              className: 'icon',
                                              style: {
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                background: $,
                                                borderRadius: '3px',
                                                display: 'block',
                                              },
                                            }),
                                      r.jsx('span', {
                                        className: 'label',
                                        children: t(`terrain.${y}`, { defaultValue: P }),
                                      }),
                                    ],
                                  },
                                  y
                                )
                              ),
                            }),
                            r.jsxs(vs, {
                              'data-testid': 'paint-terrain-btn',
                              style: { marginTop: '10px' },
                              onClick: () => e(Fr((l == null ? void 0 : l.terrain) ?? null)),
                              children: [r.jsx(At, { ...ke }), t('tilePanel.paintTerrain')],
                            }),
                          ],
                        }),
                        r.jsx(Je, {}),
                        r.jsxs('div', {
                          children: [
                            r.jsx(Y, { children: t('tilePanel.features') }),
                            r.jsx(cs, {
                              children: er.map(({ key: y, labelKey: $, Icon: E, color: I }) => {
                                const P = !!(l != null && l[y]);
                                return r.jsxs(
                                  ls,
                                  {
                                    'data-testid': `flag-toggle-${y}`,
                                    $active: P,
                                    $color: I,
                                    onClick: () => w(y),
                                    children: [
                                      r.jsx(E, { className: 'flag-icon' }),
                                      r.jsx('span', { className: 'flag-label', children: t($) }),
                                      r.jsx('span', {
                                        className: 'flag-state',
                                        children: P ? 'on' : 'off',
                                      }),
                                    ],
                                  },
                                  y
                                );
                              }),
                            }),
                            er.map(({ key: y, labelKey: $, color: E }) => {
                              const I = !!(l != null && l[y]),
                                P = ks[y],
                                j = y === 'hasTown';
                              if (!I || !P) return null;
                              const f = dt
                                .map((k, T) => {
                                  const R = D(
                                      ((l == null ? void 0 : l.q) ?? 0) + k.q,
                                      ((l == null ? void 0 : l.r) ?? 0) + k.r
                                    ),
                                    W = u[R];
                                  if (j) {
                                    if (!mr.has(W == null ? void 0 : W.terrain)) return null;
                                    const F = ((l == null ? void 0 : l[P]) ?? []).includes(R);
                                    return {
                                      nk: R,
                                      dirLabel: t(`dir.${Qt[T]}`),
                                      terrain: W.terrain,
                                      isBlocked: F,
                                    };
                                  } else {
                                    if (!(W != null && W[y])) return null;
                                    const F =
                                      ((l == null ? void 0 : l[P]) ?? []).includes(R) ||
                                      (W[P] ?? []).includes(o ?? '');
                                    return {
                                      nk: R,
                                      dirLabel: t(`dir.${Qt[T]}`),
                                      terrain: W.terrain,
                                      isBlocked: F,
                                    };
                                  }
                                })
                                .filter((k) => k !== null);
                              return f.length === 0
                                ? null
                                : r.jsx(
                                    gs,
                                    {
                                      children: f.map(
                                        ({ nk: k, dirLabel: T, terrain: R, isBlocked: W }) =>
                                          r.jsxs(
                                            ms,
                                            {
                                              children: [
                                                r.jsx('span', {
                                                  children: (() => {
                                                    const F = n.find((G) => G.id === R),
                                                      N =
                                                        (F == null ? void 0 : F.Icon) ??
                                                        A.icons.terrain[R] ??
                                                        null,
                                                      U = (F == null ? void 0 : F.iconUrl) ?? '';
                                                    return N
                                                      ? r.jsx(N, {
                                                          style: {
                                                            width: '1rem',
                                                            height: '1rem',
                                                            verticalAlign: 'middle',
                                                            filter: 'brightness(0) invert(1)',
                                                            opacity: 0.75,
                                                          },
                                                        })
                                                      : U
                                                        ? r.jsx('img', {
                                                            src: U,
                                                            alt: R,
                                                            style: {
                                                              width: '1rem',
                                                              height: '1rem',
                                                              verticalAlign: 'middle',
                                                              filter: 'brightness(0) invert(1)',
                                                              opacity: 0.75,
                                                            },
                                                          })
                                                        : r.jsx('span', {
                                                            style: {
                                                              fontSize: '0.75rem',
                                                              opacity: 0.6,
                                                            },
                                                            children: R,
                                                          });
                                                  })(),
                                                }),
                                                r.jsx('span', { children: T }),
                                                W &&
                                                  r.jsx('span', {
                                                    style: { opacity: 0.45 },
                                                    children: t(
                                                      j ? 'connection.noPort' : 'connection.blocked'
                                                    ),
                                                  }),
                                                r.jsx(ys, {
                                                  $blocked: W,
                                                  $color: E,
                                                  onClick: () => b(y, k, W),
                                                  children: t(
                                                    j
                                                      ? W
                                                        ? 'connection.addPort'
                                                        : 'connection.removePort'
                                                      : W
                                                        ? 'connection.restore'
                                                        : 'connection.disconnect'
                                                  ),
                                                }),
                                              ],
                                            },
                                            k
                                          )
                                      ),
                                    },
                                    y
                                  );
                            }),
                            (l == null ? void 0 : l.hasTown) &&
                              r.jsxs(xs, {
                                'data-testid': 'edit-town-btn',
                                style: { marginTop: '8px', width: '100%' },
                                onClick: () => o && e(Nr(o)),
                                children: [r.jsx(Un, { ...ke }), t('tilePanel.editTown')],
                              }),
                          ],
                        }),
                        r.jsx(Je, {}),
                        r.jsxs('div', {
                          children: [
                            r.jsx(Y, { children: t('tilePanel.notes') }),
                            r.jsx(lt, {
                              'data-testid': 'notes-textarea',
                              $minHeight: '160px',
                              value: (l == null ? void 0 : l.notes) ?? '',
                              onChange: v,
                              placeholder: t('tilePanel.notesPlaceholder'),
                            }),
                          ],
                        }),
                        h.length > 0 &&
                          r.jsxs('div', {
                            children: [
                              r.jsx(Y, { children: t('tilePanel.armies') }),
                              r.jsx(ds, {
                                children: h.map((y) =>
                                  r.jsxs(
                                    us,
                                    {
                                      'data-testid': `select-army-${y.id}`,
                                      onClick: () => e(br(y.id)),
                                      children: [
                                        r.jsx(A.icons.army.land, {
                                          style: {
                                            width: '1rem',
                                            height: '1rem',
                                            filter: 'brightness(0) invert(1)',
                                            opacity: 0.75,
                                          },
                                        }),
                                        r.jsx(hs, { children: y.name || 'Unnamed Army' }),
                                        r.jsx('span', {
                                          style: { fontSize: '0.7rem', opacity: 0.5 },
                                          children: 'Select →',
                                        }),
                                      ],
                                    },
                                    y.id
                                  )
                                ),
                              }),
                            ],
                          }),
                        r.jsxs(ps, {
                          'data-testid': 'add-army-btn',
                          onClick: () => l && e(tt({ q: l.q, r: l.r })),
                          children: [r.jsx(Mr, { ...ke }), t('tilePanel.addArmy')],
                        }),
                        r.jsxs(fs, {
                          'data-testid': 'delete-tile-btn',
                          onClick: C,
                          children: [r.jsx(Sr, { ...ke }), t('tilePanel.deleteTile')],
                        }),
                      ],
                    })
                  : r.jsxs(os, {
                      children: [
                        r.jsx(ss, { as: Wr }),
                        r.jsx(as, { children: t('tilePanel.noTileSelected') }),
                      ],
                    }),
              ],
            }),
      ],
    });
  },
  Fe = 30,
  Ne = 30,
  ue = 22,
  tr = ue - 2,
  rr = ue + 2,
  Cs = 1.5,
  $s = ({ fortification: e }) => {
    const t = e === 'none' ? null : A.town.fortification[e],
      n = t
        ? Array.from({ length: t.markCount }, (o, a) => {
            const s = (a / t.markCount) * 2 * Math.PI;
            return r.jsx(
              'line',
              {
                x1: Fe + tr * Math.cos(s),
                y1: Ne + tr * Math.sin(s),
                x2: Fe + rr * Math.cos(s),
                y2: Ne + rr * Math.sin(s),
                stroke: t.markColor,
                strokeWidth: Cs,
              },
              a
            );
          })
        : [];
    return r.jsxs('svg', {
      viewBox: '0 0 60 60',
      width: '60',
      height: '60',
      children: [
        r.jsx(kr, { x: Fe - ue, y: Ne - ue, width: ue * 2, height: ue * 2 }),
        t &&
          r.jsx('circle', {
            cx: Fe,
            cy: Ne,
            r: ue,
            fill: 'none',
            stroke: t.wallColor,
            strokeWidth: t.wallWidth,
          }),
        n,
      ],
    });
  },
  Ms = ({ townSize: e }) => {
    const t = { width: 60, height: 60 };
    return e === 'village'
      ? r.jsx(Hr, { ...t })
      : e === 'city'
        ? r.jsx(_r, { ...t })
        : r.jsx(kr, { ...t });
  },
  Ss = m.div`
  display: flex;
  align-items: center;
  gap: 12px;
`,
  Ts = m.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme: e }) => e.surface.borderMedium};
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.textMuted};
  cursor: pointer;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.surface.borderFaint};
    border-color: ${({ theme: e }) => e.surface.borderFocus};
    color: ${({ theme: e }) => e.text};
  }
`,
  Es = m.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme: e }) => e.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`,
  Ls = m.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.town.color}66;
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme: e }) => e.town.color};
  }

  &::placeholder {
    color: ${({ theme: e }) => e.textMuted};
  }
`,
  nr = m.div`
  display: flex;
  flex-direction: column;
`,
  or = m.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 2px solid
    ${({ $active: e, theme: t }) => (e ? t.town.color : t.surface.borderFaint)};
  border-radius: 0;
  background: ${({ $active: e, theme: t }) => (e ? `${t.town.color}18` : t.surface.base)};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  &:first-child:last-child {
    border-radius: 8px;
  }
  & + & {
    margin-top: -2px;
  }
  &:hover {
    z-index: 1;
    border-color: ${({ $active: e, theme: t }) => (e ? t.town.color : t.surface.hover)};
    background: ${({ $active: e, theme: t }) => (e ? `${t.town.color}22` : t.surface.hoverWeak)};
  }
`,
  sr = m.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`,
  ir = m.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme: e }) => e.text};
  letter-spacing: 0.04em;
`,
  ar = m.span`
  font-size: 0.7rem;
  color: ${({ theme: e }) => e.textMuted};
  line-height: 1.4;
`,
  Ps = ['none', 'palisade', 'stone'],
  Rs = ['village', 'town', 'city'],
  Bs = () => {
    const e = Z(),
      { t } = oe(),
      n = O((h) => h.ui.editingTownTile),
      o = O((h) => (n ? (h.tiles[n] ?? null) : null)),
      a = () => {
        e(Yr());
      },
      s = (h) => {
        o && e(Vr({ q: o.q, r: o.r, name: h.target.value }));
      },
      c = (h) => {
        o && e(Xr({ q: o.q, r: o.r, fortification: h }));
      },
      i = (h) => {
        o && e(Gr({ q: o.q, r: o.r, townSize: h }));
      },
      d = (o == null ? void 0 : o.fortification) ?? 'none',
      l = (o == null ? void 0 : o.townSize) ?? 'town',
      u = !!n;
    return r.jsxs(ye, {
      $open: u,
      $desktopVisible: u,
      $gap: '20px',
      children: [
        r.jsx(be, { $margin: '0 auto -8px' }),
        r.jsxs(Ss, {
          children: [
            r.jsx(Ts, {
              'data-testid': 'town-edit-back-btn',
              onClick: a,
              children: t('townPanel.back'),
            }),
            r.jsx(Es, { children: t('townPanel.title') }),
          ],
        }),
        r.jsxs('div', {
          children: [
            r.jsx(Y, { children: t('townPanel.name') }),
            r.jsx(Ls, {
              'data-testid': 'town-edit-name-input',
              value: (o == null ? void 0 : o.townName) ?? '',
              onChange: s,
              placeholder: t('townPanel.namePlaceholder'),
              maxLength: 32,
            }),
          ],
        }),
        r.jsxs('div', {
          children: [
            r.jsx(Y, { children: t('townPanel.fortification') }),
            r.jsx(nr, {
              children: Ps.map((h) =>
                r.jsxs(
                  or,
                  {
                    'data-testid': `fortification-${h}`,
                    'data-active': d === h,
                    $active: d === h,
                    onClick: () => c(h),
                    children: [
                      r.jsx($s, { fortification: h }),
                      r.jsxs(sr, {
                        children: [
                          r.jsx(ir, { children: t(`townPanel.fortification_${h}`) }),
                          r.jsx(ar, { children: t(`townPanel.fortification_${h}_desc`) }),
                        ],
                      }),
                    ],
                  },
                  h
                )
              ),
            }),
          ],
        }),
        r.jsxs('div', {
          children: [
            r.jsx(Y, { children: t('townPanel.sizeLabel') }),
            r.jsx(nr, {
              children: Rs.map((h) =>
                r.jsxs(
                  or,
                  {
                    'data-testid': `size-${h}`,
                    'data-active': l === h,
                    $active: l === h,
                    onClick: () => i(h),
                    children: [
                      r.jsx(Ms, { townSize: h }),
                      r.jsxs(sr, {
                        children: [
                          r.jsx(ir, { children: t(`townPanel.size_${h}`) }),
                          r.jsx(ar, { children: t(`townPanel.size_${h}_desc`) }),
                        ],
                      }),
                    ],
                  },
                  h
                )
              ),
            }),
          ],
        }),
      ],
    });
  },
  As = m.button`
  background: none;
  border: none;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${({ theme: e }) => e.text};
  }
`,
  Is = m.button`
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme: e }) => e.panelBorder};
  background: transparent;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: ${({ theme: e }) => e.panelBorder};
    color: ${({ theme: e }) => e.text};
  }
`,
  Os = ({ onClick: e, variant: t = 'simple', title: n, 'aria-label': o }) => {
    const a = t === 'bordered' ? Is : As;
    return r.jsx(a, {
      onClick: e,
      title: n,
      'aria-label': o,
      children: r.jsx(se, { width: '1em', height: '1em', 'aria-hidden': !0 }),
    });
  },
  Ws = m.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ $marginBottom: e }) => e ?? '0'};
`,
  Fs = m.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme: e }) => e.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.4em;

  & > svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }
`,
  _e = ({ title: e, onClose: t, icon: n, closeVariant: o = 'simple', $marginBottom: a }) =>
    r.jsxs(Ws, {
      $marginBottom: a,
      children: [r.jsxs(Fs, { children: [n, e] }), r.jsx(Os, { onClick: t, variant: o })],
    }),
  Qe = {
    width: '1em',
    height: '1em',
    style: { marginRight: '0.4em', flexShrink: 0 },
    'aria-hidden': !0,
  },
  Ns = m.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.surface.border};
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme: e }) => e.surface.borderFocus};
  }

  &::placeholder {
    color: ${({ theme: e }) => e.textMuted};
  }
`,
  zs = m.div`
  display: flex;
  flex-direction: column;
`,
  Ds = m.button`
  position: relative;
  padding: 10px;
  border-radius: 8px 8px 0 0;
  border: 2px solid
    ${({ $active: e, theme: t }) => (e ? t.army.movingColor : t.surface.borderMedium)};
  background: ${({ $active: e, theme: t }) => (e ? `${t.army.movingColor}26` : t.surface.subtle)};
  color: ${({ $active: e, theme: t }) => (e ? t.army.movingColor : t.text)};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  z-index: ${({ $active: e }) => (e ? 1 : 0)};
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ $active: e, theme: t }) => (e ? `${t.army.movingColor}40` : t.surface.hover)};
  }
`,
  Ks = m.button`
  position: relative;
  margin-top: -2px;
  padding: 10px;
  border-radius: 0 0 8px 8px;
  border: 2px solid
    ${({ theme: e }) => e.accent};
  background: transparent;
  color: ${({ theme: e }) => e.accent};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover {
    z-index: 1;
    background: ${({ theme: e }) => e.accent}22;
  }
`,
  qs = m.div`
  font-size: 0.75rem;
  color: ${({ theme: e }) => e.textMuted};
  background: ${({ theme: e }) => `${e.army.movingColor}14`};
  border: 1px solid
    ${({ theme: e }) => `${e.army.movingColor}33`};
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`,
  Us = m.div`
  position: relative;
  width: 100%;
`,
  Hs = m.button`
  width: 100%;
  padding: 8px 36px 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ $open: e, theme: t }) => (e ? t.surface.borderFocus : t.surface.border)};
  background: ${({ theme: e }) => e.surface.card};
  color: ${({ theme: e }) => e.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
  position: relative;

  &:hover {
    border-color: ${({ theme: e }) => e.surface.borderMedium};
  }

  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%)
      ${({ $open: e }) => (e ? 'rotate(180deg)' : 'rotate(0deg)')};
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid
      ${({ theme: e }) => e.surface.borderFocus};
    transition: transform 0.15s;
  }
`,
  _s = m.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: e }) => e.surface.border};
  background: ${({ theme: e }) => e.panelBackground};
  box-shadow: 0 8px 24px
    ${({ theme: e }) => e.surface.overlayMedium};
  z-index: ${({ theme: e }) => e.zIndex.dropdown};
  max-height: 200px;
  overflow-y: auto;
`,
  Ys = m.li`
  padding: 8px 12px;
  font-size: 0.9rem;
  color: ${({ $selected: e, theme: t }) => (e ? t.text : t.textMuted)};
  background: ${({ $selected: e, theme: t }) => (e ? t.surface.hover : 'transparent')};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme: e }) => e.surface.borderFaint};
    color: ${({ theme: e }) => e.text};
  }
`,
  Vs = ({ value: e, options: t, onChange: n }) => {
    var d, l;
    const [o, a] = g.useState(!1),
      s = g.useRef(null),
      c =
        ((d = t.find((u) => u.value === e)) == null ? void 0 : d.label) ??
        ((l = t[0]) == null ? void 0 : l.label) ??
        '';
    g.useEffect(() => {
      if (!o) return;
      const u = (h) => {
        s.current && !s.current.contains(h.target) && a(!1);
      };
      return (
        document.addEventListener('mousedown', u),
        () => document.removeEventListener('mousedown', u)
      );
    }, [o]);
    const i = (u) => {
      (u.key === 'Escape' && a(!1),
        (u.key === 'Enter' || u.key === ' ') && (u.preventDefault(), a((h) => !h)));
    };
    return r.jsxs(Us, {
      ref: s,
      children: [
        r.jsx(Hs, {
          type: 'button',
          $open: o,
          onClick: () => {
            a((u) => !u);
          },
          onKeyDown: i,
          'aria-haspopup': 'listbox',
          'aria-expanded': o,
          children: c,
        }),
        o &&
          r.jsx(_s, {
            role: 'listbox',
            children: t.map((u) =>
              r.jsx(
                Ys,
                {
                  $selected: u.value === e,
                  role: 'option',
                  'aria-selected': u.value === e,
                  onClick: () => {
                    (n(u.value), a(!1));
                  },
                  children: u.label,
                },
                u.value
              )
            ),
          }),
      ],
    });
  },
  Xs = () => {
    const e = Z(),
      t = O((j) => j.ui.selectedArmyId),
      n = O((j) => j.ui.movingArmyId),
      o = O((j) => (t ? (j.armies[t] ?? null) : null)),
      a = O((j) => j.factions),
      s = t !== null && o !== null,
      c = n === t,
      { t: i } = oe(),
      [d, l] = g.useState(''),
      [u, h] = g.useState(''),
      [x, w] = g.useState('');
    (g.useEffect(() => {
      o && (l(o.name), h(o.composition), w(o.notes ?? ''));
    }, [t]),
      g.useEffect(() => {
        const j = (f) => {
          f.key === 'Escape' && e(c ? me() : ce());
        };
        return (
          document.addEventListener('keydown', j),
          () => document.removeEventListener('keydown', j)
        );
      }, [e, c]));
    const b = g.useCallback(() => {
        if (!o) return;
        const j = d.trim() || 'New Army';
        (l(j), e(Xe({ id: o.id, name: j })));
      }, [o, d, e]),
      v = g.useCallback((j) => {
        j.key === 'Enter' && j.target.blur();
      }, []),
      C = g.useCallback(() => {
        o && e(Xe({ id: o.id, composition: u }));
      }, [o, u, e]),
      M = g.useCallback(() => {
        o && e(Xe({ id: o.id, notes: x }));
      }, [o, x, e]),
      y = g.useCallback(
        (j) => {
          o && e(Zr({ id: o.id, factionId: j === '' ? null : j }));
        },
        [o, e]
      ),
      $ = g.useCallback(() => {
        o && e(c ? me() : Jr(o.id));
      }, [o, c, e]),
      E = g.useCallback(() => {
        !o ||
          ((u.trim().length > 0 || x.trim().length > 0) &&
            !window.confirm(i('armyPanel.deleteConfirm'))) ||
          (e(wr(o.id)), e(ce()));
      }, [o, u, x, i, e]),
      I = g.useCallback(() => {
        (c && e(me()), e(ce()));
      }, [c, e]),
      P = [
        { value: '', label: i('armyPanel.factionNone') },
        ...a.map((j) => ({ value: j.id, label: j.name })),
      ];
    return r.jsxs(ye, {
      $open: s,
      $gap: '20px',
      children: [
        r.jsx(be, { $margin: '0 auto -8px' }),
        r.jsx(_e, {
          title: i('armyPanel.title'),
          icon: r.jsx(Mr, { 'aria-hidden': !0 }),
          onClose: I,
        }),
        o &&
          r.jsxs(r.Fragment, {
            children: [
              r.jsxs('div', {
                children: [
                  r.jsx(Y, { children: i('armyPanel.name') }),
                  r.jsx(Ns, {
                    'data-testid': 'army-name-input',
                    value: d,
                    onChange: (j) => l(j.target.value),
                    onBlur: b,
                    onKeyDown: v,
                    placeholder: i('armyPanel.namePlaceholder'),
                    maxLength: 40,
                  }),
                ],
              }),
              a.length > 0 &&
                r.jsxs('div', {
                  children: [
                    r.jsx(Y, { children: i('armyPanel.faction') }),
                    r.jsx(Vs, { value: o.factionId ?? '', options: P, onChange: y }),
                  ],
                }),
              r.jsxs(zs, {
                children: [
                  r.jsx(Ds, {
                    'data-testid': 'move-army-btn',
                    $active: c,
                    onClick: $,
                    children: c
                      ? r.jsxs(r.Fragment, {
                          children: [r.jsx(se, { ...Qe }), i('armyPanel.cancelMove')],
                        })
                      : r.jsxs(r.Fragment, {
                          children: [r.jsx(qn, { ...Qe }), i('armyPanel.moveArmy')],
                        }),
                  }),
                  r.jsxs(Ks, {
                    'data-testid': 'delete-army-btn',
                    onClick: E,
                    children: [r.jsx(Sr, { ...Qe }), i('armyPanel.deleteArmy')],
                  }),
                ],
              }),
              c && r.jsx(qs, { children: i('armyPanel.moveHint') }),
              r.jsxs('div', {
                children: [
                  r.jsx(Y, { children: i('armyPanel.composition') }),
                  r.jsx(lt, {
                    value: u,
                    onChange: (j) => h(j.target.value),
                    onBlur: C,
                    placeholder: i('armyPanel.compositionPlaceholder'),
                  }),
                ],
              }),
              r.jsxs('div', {
                children: [
                  r.jsx(Y, { children: i('armyPanel.notes') }),
                  r.jsx(lt, {
                    value: x,
                    onChange: (j) => w(j.target.value),
                    onBlur: M,
                    placeholder: i('armyPanel.notesPlaceholder'),
                  }),
                ],
              }),
            ],
          }),
      ],
    });
  },
  cr = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'],
  Gs = [
    'grass',
    'farm',
    'forest',
    'mountain',
    'lake',
    'ocean',
    'desert',
    'swamp',
    'jungle',
    'hills',
    'badlands',
    'none',
  ],
  Zs = m.div`
  position: fixed;
  inset: 0;
  background: ${({ theme: e }) => e.surface.overlayHeavy};
  z-index: ${({ theme: e }) => e.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
`,
  Js = m.div`
  background: ${({ theme: e }) => e.panelBackground};
  border: 2px solid
    ${({ theme: e }) => e.panelBorder};
  border-radius: 12px;
  padding: 20px;
  width: min(520px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`,
  lr = m.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,
  dr = m.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme: e }) => e.text};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`,
  et = m.button`
  background: none;
  border: none;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    color: ${({ theme: e }) => e.text};
  }
`,
  Qs = m.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme: e }) => e.panelBorder};
  background: ${({ theme: e }) => e.surface.subtle};
`,
  ei = m.div`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: ${({ $color: e }) => e};
  border: 1px solid
    ${({ theme: e }) => e.surface.borderMedium};
  flex-shrink: 0;
`,
  ti = m.img`
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
  opacity: 0.8;
`,
  ri = m.span`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: ${({ $color: e }) => e};
  flex-shrink: 0;
  opacity: 0.5;
`,
  ni = m.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ $muted: e, theme: t }) => (e ? t.textMuted : t.text)};
`,
  je = m.button`
  padding: 3px 7px;
  border-radius: 4px;
  border: 1px solid
    ${({ $variant: e, theme: t }) => (e === 'danger' ? t.ui.danger : t.panelBorder)};
  background: transparent;
  color: ${({ $variant: e, theme: t }) => (e === 'danger' ? t.ui.dangerLight : t.textMuted)};
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`,
  oi = m.button`
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: ${({ $enabled: e, theme: t }) => (e ? t.ui.success : t.surface.border)};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  padding: 0;
  &:hover {
    opacity: 0.85;
  }
`,
  si = m.span`
  position: absolute;
  top: 3px;
  left: ${({ $enabled: e }) => (e ? '19px' : '3px')};
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
  pointer-events: none;
`,
  ii = m.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px dashed
    ${({ theme: e }) => e.panelBorder};
  background: transparent;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  &:hover {
    border-color: ${({ theme: e }) => e.text};
    color: ${({ theme: e }) => e.text};
  }
`,
  Ce = m.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,
  $e = m.label`
  font-size: 0.8rem;
  color: ${({ theme: e }) => e.textMuted};
  width: 90px;
  flex-shrink: 0;
`,
  ze = m.input`
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid
    ${({ theme: e }) => e.panelBorder};
  background: ${({ theme: e }) => e.surface.overlayLight};
  color: ${({ theme: e }) => e.text};
  font-size: 0.85rem;
  outline: none;
  &:focus {
    border-color: ${({ theme: e }) => e.surface.borderFocus};
  }
`,
  ur = m.p`
  font-size: 0.72rem;
  color: ${({ theme: e }) => e.textMuted};
  margin: -4px 0 0 98px;
  line-height: 1.4;
  a {
    color: inherit;
    text-decoration: underline;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
`,
  ai = m.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-left: 98px;
`,
  ci = m.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-radius: 6px;
  border: 2px solid
    ${({ $selected: e, theme: t }) => (e ? t.selectedStroke : 'transparent')};
  background: ${({ $selected: e, theme: t }) => (e ? t.surface.hover : 'transparent')};
  cursor: pointer;
  &:hover {
    background: ${({ theme: e }) => e.surface.hoverWeak};
  }
`,
  li = m.span`
  font-size: 0.65rem;
  color: ${({ theme: e }) => e.textMuted};
  text-transform: capitalize;
`,
  di = m.button`
  padding: 8px 0;
  border-radius: 8px;
  border: 1.5px solid
    ${({ theme: e }) => e.ui.success};
  background: transparent;
  color: ${({ theme: e }) => e.ui.successLight};
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
  &:hover {
    background: ${({ theme: e }) => `${e.ui.successLight}1a`};
  }
`,
  ui = (e, t, n) => {
    switch (t) {
      case 'grass':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '14',
          height: '14',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('line', {
              x1: '2',
              y1: '11',
              x2: '4',
              y2: '6',
              stroke: n,
              strokeWidth: '1.2',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '4',
              y1: '11',
              x2: '6',
              y2: '7',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '9',
              y1: '11',
              x2: '11',
              y2: '6',
              stroke: n,
              strokeWidth: '1.2',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '11',
              y1: '11',
              x2: '13',
              y2: '7',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '5',
              y1: '5',
              x2: '7',
              y2: '1',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
          ],
        });
      case 'farm':
        return r.jsx('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '20',
          height: '7',
          patternUnits: 'userSpaceOnUse',
          children: r.jsx('line', {
            x1: '0',
            y1: '3.5',
            x2: '20',
            y2: '3.5',
            stroke: n,
            strokeWidth: '1.2',
          }),
        });
      case 'forest':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '15',
          height: '15',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('circle', { cx: '4', cy: '4', r: '2.8', fill: n }),
            r.jsx('circle', { cx: '11.5', cy: '4', r: '2', fill: n }),
            r.jsx('circle', { cx: '7.5', cy: '10.5', r: '2.8', fill: n }),
            r.jsx('circle', { cx: '1', cy: '11', r: '1.6', fill: n }),
            r.jsx('circle', { cx: '14', cy: '11', r: '1.6', fill: n }),
          ],
        });
      case 'mountain':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '22',
          height: '13',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('polyline', {
              points: '0,11 5.5,5 11,11 16.5,5 22,11',
              stroke: n,
              strokeWidth: '1.5',
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
            r.jsx('polyline', {
              points: '0,7 5.5,1 11,7 16.5,1 22,7',
              stroke: n,
              strokeWidth: '1',
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
          ],
        });
      case 'lake':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '30',
          height: '10',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('path', {
              d: 'M0,3 C4,1.5 8,4.5 12,3 C16,1.5 20,4.5 24,3 C26,2.3 28,1.8 30,3',
              stroke: n,
              strokeWidth: '1.4',
              fill: 'none',
              strokeLinecap: 'round',
            }),
            r.jsx('path', {
              d: 'M0,7.5 C4,6 8,9 12,7.5 C16,6 20,9 24,7.5 C26,6.8 28,6.3 30,7.5',
              stroke: n,
              strokeWidth: '1',
              fill: 'none',
              strokeLinecap: 'round',
            }),
          ],
        });
      case 'ocean':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '50',
          height: '18',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('path', {
              d: 'M0,5 C7,2 14,8 21,5 C28,2 35,8 42,5 C45,3.5 47.5,2.5 50,5',
              stroke: n,
              strokeWidth: '1.8',
              fill: 'none',
              strokeLinecap: 'round',
            }),
            r.jsx('path', {
              d: 'M0,12 C7,9 14,15 21,12 C28,9 35,15 42,12 C45,10.5 47.5,9.5 50,12',
              stroke: n,
              strokeWidth: '1.2',
              fill: 'none',
              strokeLinecap: 'round',
            }),
          ],
        });
      case 'desert':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '16',
          height: '16',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('circle', { cx: '3', cy: '4', r: '1', fill: n }),
            r.jsx('circle', { cx: '10', cy: '2', r: '0.8', fill: n }),
            r.jsx('circle', { cx: '7', cy: '9', r: '1.1', fill: n }),
            r.jsx('circle', { cx: '14', cy: '7', r: '0.8', fill: n }),
            r.jsx('circle', { cx: '2', cy: '13', r: '0.9', fill: n }),
            r.jsx('circle', { cx: '11', cy: '13', r: '1', fill: n }),
            r.jsx('circle', { cx: '5', cy: '7', r: '0.7', fill: n }),
          ],
        });
      case 'swamp':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '18',
          height: '16',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('line', {
              x1: '3',
              y1: '14',
              x2: '3',
              y2: '6',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '3',
              y1: '8',
              x2: '1',
              y2: '5',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '3',
              y1: '8',
              x2: '5',
              y2: '5',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '12',
              y1: '14',
              x2: '12',
              y2: '7',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '12',
              y1: '9',
              x2: '10',
              y2: '6',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '12',
              y1: '9',
              x2: '14',
              y2: '6',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('path', {
              d: 'M0,14.5 C3,13.5 6,15.5 9,14.5 C12,13.5 15,15.5 18,14.5',
              stroke: n,
              strokeWidth: '0.8',
              fill: 'none',
              strokeLinecap: 'round',
            }),
          ],
        });
      case 'jungle':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '12',
          height: '12',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('circle', { cx: '3', cy: '3', r: '2.5', fill: n }),
            r.jsx('circle', { cx: '9', cy: '2.5', r: '2', fill: n }),
            r.jsx('circle', { cx: '6', cy: '8', r: '2.5', fill: n }),
            r.jsx('circle', { cx: '1', cy: '9', r: '1.5', fill: n }),
            r.jsx('circle', { cx: '11', cy: '8.5', r: '1.5', fill: n }),
            r.jsx('circle', { cx: '5', cy: '5.5', r: '1.2', fill: n }),
          ],
        });
      case 'hills':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '24',
          height: '14',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('path', {
              d: 'M0,12 Q6,5 12,12 Q18,5 24,12',
              stroke: n,
              strokeWidth: '1.5',
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
            r.jsx('path', {
              d: 'M0,8 Q6,1 12,8 Q18,1 24,8',
              stroke: n,
              strokeWidth: '0.9',
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }),
          ],
        });
      case 'badlands':
        return r.jsxs('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '20',
          height: '20',
          patternUnits: 'userSpaceOnUse',
          children: [
            r.jsx('line', {
              x1: '2',
              y1: '5',
              x2: '7',
              y2: '9',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '7',
              y1: '9',
              x2: '5',
              y2: '14',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '5',
              y1: '14',
              x2: '10',
              y2: '17',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '12',
              y1: '2',
              x2: '16',
              y2: '7',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '16',
              y1: '7',
              x2: '13',
              y2: '12',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '13',
              y1: '12',
              x2: '18',
              y2: '16',
              stroke: n,
              strokeWidth: '1',
              strokeLinecap: 'round',
            }),
            r.jsx('line', {
              x1: '7',
              y1: '9',
              x2: '13',
              y2: '12',
              stroke: n,
              strokeWidth: '0.8',
              strokeLinecap: 'round',
            }),
          ],
        });
      default:
        return r.jsx('pattern', {
          id: e,
          x: '0',
          y: '0',
          width: '1',
          height: '1',
          patternUnits: 'userSpaceOnUse',
        });
    }
  },
  hi = nn.memo(({ patternKey: e, color: t, selected: n, onClick: o }) => {
    const a = g.useRef(Math.random().toString(36).slice(2, 9)).current,
      s = Er(t, 0.3),
      c = `sp-${a}`;
    return r.jsxs(ci, {
      $selected: n,
      onClick: o,
      children: [
        r.jsxs('svg', {
          width: '40',
          height: '40',
          style: { borderRadius: 5, display: 'block' },
          children: [
            e !== 'none' && r.jsx('defs', { children: ui(c, e, s) }),
            r.jsx('rect', { x: '0', y: '0', width: '40', height: '40', rx: '5', fill: t }),
            e !== 'none' &&
              r.jsx('rect', {
                x: '0',
                y: '0',
                width: '40',
                height: '40',
                rx: '5',
                fill: `url(#${c})`,
              }),
          ],
        }),
        r.jsx(li, { children: e }),
      ],
    });
  }),
  hr = { name: 'New Terrain', color: '#8B6914', patternKey: 'grass', isDeepWater: !1, icon: '' },
  pi = ({ onClose: e }) => {
    const { t } = oe(),
      n = Z(),
      { disabled: o, custom: a, order: s } = O((f) => f.terrainConfig),
      c = O((f) => f.tiles),
      [i, d] = g.useState('list'),
      [l, u] = g.useState('add'),
      [h, x] = g.useState(null),
      [w, b] = g.useState(hr),
      v = s
        .map((f) => {
          const k = cr.find((R) => R === f);
          if (k) {
            const R = A.terrain[k];
            return {
              id: f,
              color: R.color,
              Icon: A.icons.terrain[k] ?? null,
              iconUrl: '',
              name: k,
              isCustom: !1,
            };
          }
          const T = a.find((R) => R.id === f);
          return T
            ? {
                id: T.id,
                color: T.color,
                Icon: null,
                iconUrl: T.icon ?? '',
                name: T.name,
                isCustom: !0,
              }
            : null;
        })
        .filter((f) => f !== null);
    (cr.forEach((f) => {
      if (!s.includes(f)) {
        const k = A.terrain[f];
        v.push({
          id: f,
          color: k.color,
          Icon: A.icons.terrain[f] ?? null,
          iconUrl: '',
          name: f,
          isCustom: !1,
        });
      }
    }),
      a.forEach((f) => {
        s.includes(f.id) ||
          v.push({
            id: f.id,
            color: f.color,
            Icon: null,
            iconUrl: f.icon ?? '',
            name: f.name,
            isCustom: !0,
          });
      }));
    const C = (f) => {
        if (f === 0) return;
        const k = [...s],
          T = k[f - 1],
          R = k[f];
        ((k[f - 1] = R), (k[f] = T), n(jt(k)));
      },
      M = (f) => {
        if (f >= v.length - 1) return;
        const k = [...s],
          T = k[f],
          R = k[f + 1];
        ((k[f] = R), (k[f + 1] = T), n(jt(k)));
      },
      y = (f) => {
        if (o.includes(f)) n(en(f));
        else {
          const T = Object.values(c).filter((R) => R.terrain === f).length;
          if (T > 0 && !window.confirm(t('terrainConfig.disableWarning', { count: T }))) return;
          n(Qr(f));
        }
      },
      $ = (f) => {
        const k = Object.values(c).filter((T) => T.terrain === f).length;
        (k > 0 && window.confirm(t('terrainConfig.deleteWarning', { count: k })) && n(tn(f)),
          n(rn(f)));
      },
      E = () => {
        (u('add'), x(null), b(hr), d('form'));
      },
      I = (f) => {
        (u('edit'),
          x(f.id),
          b({
            name: f.name,
            color: f.color,
            patternKey: f.patternKey,
            isDeepWater: f.isDeepWater,
            icon: f.icon,
          }),
          d('form'));
      },
      P = () => {
        const f = { ...w, color: w.color.trim() };
        (n(l === 'edit' && h ? on({ id: h, ...f }) : sn({ id: an('terrain'), ...f })), d('list'));
      },
      j = () => {
        d('list');
      };
    return r.jsx(Zs, {
      onClick: e,
      children: r.jsx(Js, {
        onClick: (f) => {
          f.stopPropagation();
        },
        children:
          i === 'list'
            ? r.jsxs(r.Fragment, {
                children: [
                  r.jsxs(lr, {
                    children: [
                      r.jsx(dr, { children: t('terrainConfig.title') }),
                      r.jsx(et, {
                        onClick: e,
                        children: r.jsx(se, { width: '1em', height: '1em', 'aria-hidden': !0 }),
                      }),
                    ],
                  }),
                  v.map((f, k) => {
                    const T = !o.includes(f.id);
                    return r.jsxs(
                      Qs,
                      {
                        children: [
                          r.jsx(je, {
                            onClick: () => {
                              C(k);
                            },
                            disabled: k === 0,
                            children: '↑',
                          }),
                          r.jsx(je, {
                            onClick: () => {
                              M(k);
                            },
                            disabled: k >= v.length - 1,
                            children: '↓',
                          }),
                          r.jsx(ei, { $color: f.color }),
                          f.Icon
                            ? r.jsx(f.Icon, {
                                style: {
                                  width: '22px',
                                  height: '22px',
                                  flexShrink: 0,
                                  filter: 'brightness(0) invert(1)',
                                  opacity: 0.8,
                                },
                              })
                            : f.iconUrl
                              ? r.jsx(ti, { src: f.iconUrl, alt: '', 'aria-hidden': !0 })
                              : r.jsx(ri, { $color: f.color }),
                          r.jsx(ni, {
                            $muted: !T && !f.isCustom,
                            children: f.isCustom ? f.name : String(t(`terrain.${f.id}`)),
                          }),
                          !f.isCustom &&
                            r.jsx(oi, {
                              $enabled: T,
                              onClick: () => {
                                y(f.id);
                              },
                              children: r.jsx(si, { $enabled: T }),
                            }),
                          f.isCustom &&
                            r.jsxs(r.Fragment, {
                              children: [
                                r.jsx(je, {
                                  onClick: () => {
                                    const R = a.find((W) => W.id === f.id);
                                    R && I(R);
                                  },
                                  children: r.jsx(_n, {
                                    width: '1em',
                                    height: '1em',
                                    'aria-hidden': !0,
                                  }),
                                }),
                                r.jsx(je, {
                                  $variant: 'danger',
                                  onClick: () => {
                                    $(f.id);
                                  },
                                  children: r.jsx(se, {
                                    width: '1em',
                                    height: '1em',
                                    'aria-hidden': !0,
                                  }),
                                }),
                              ],
                            }),
                        ],
                      },
                      f.id
                    );
                  }),
                  r.jsx(ii, { onClick: E, children: t('terrainConfig.addTerrain') }),
                ],
              })
            : r.jsxs(r.Fragment, {
                children: [
                  r.jsxs(lr, {
                    children: [
                      r.jsx(et, { onClick: j, children: t('terrainConfig.back') }),
                      r.jsx(dr, {
                        children: t(
                          l === 'add'
                            ? 'terrainConfig.newTerrainTitle'
                            : 'terrainConfig.editTerrainTitle'
                        ),
                      }),
                      r.jsx(et, {
                        onClick: e,
                        children: r.jsx(se, { width: '1em', height: '1em', 'aria-hidden': !0 }),
                      }),
                    ],
                  }),
                  r.jsxs(Ce, {
                    children: [
                      r.jsx($e, { children: t('terrainConfig.fieldName') }),
                      r.jsx(ze, {
                        value: w.name,
                        onChange: (f) => {
                          b((k) => ({ ...k, name: f.target.value }));
                        },
                      }),
                    ],
                  }),
                  r.jsxs(Ce, {
                    children: [
                      r.jsx($e, { children: t('terrainConfig.fieldColor') }),
                      r.jsx(ze, {
                        type: 'color',
                        value: w.color,
                        style: { maxWidth: 48, padding: '2px 4px' },
                        onChange: (f) => {
                          b((k) => ({ ...k, color: f.target.value }));
                        },
                      }),
                      r.jsx(ze, {
                        value: w.color,
                        onChange: (f) => {
                          b((k) => ({ ...k, color: f.target.value }));
                        },
                        style: { maxWidth: 100 },
                      }),
                    ],
                  }),
                  r.jsx(Ce, { children: r.jsx($e, { children: t('terrainConfig.fieldPattern') }) }),
                  r.jsx(ai, {
                    children: Gs.map((f) =>
                      r.jsx(
                        hi,
                        {
                          patternKey: f,
                          color: w.color,
                          selected: w.patternKey === f,
                          onClick: () => {
                            b((k) => ({ ...k, patternKey: f }));
                          },
                        },
                        f
                      )
                    ),
                  }),
                  r.jsxs(Ce, {
                    children: [
                      r.jsx($e, { children: t('terrainConfig.fieldIcon') }),
                      r.jsxs('div', {
                        style: { display: 'flex', alignItems: 'center', gap: 10 },
                        children: [
                          w.icon &&
                            r.jsx('img', {
                              src: w.icon,
                              alt: '',
                              style: {
                                width: 32,
                                height: 32,
                                objectFit: 'contain',
                                filter: 'brightness(0) invert(1)',
                                opacity: 0.85,
                                border: `1px solid ${A.surface.border}`,
                                borderRadius: 4,
                                padding: 2,
                              },
                            }),
                          r.jsx(ze, {
                            type: 'file',
                            accept: '.svg,image/svg+xml',
                            style: { maxWidth: 220, padding: '4px' },
                            onChange: (f) => {
                              var R;
                              const k = (R = f.target.files) == null ? void 0 : R[0];
                              if (!k) return;
                              const T = new FileReader();
                              ((T.onload = () => {
                                b((W) => ({ ...W, icon: T.result }));
                              }),
                                T.readAsDataURL(k));
                            },
                          }),
                          w.icon &&
                            r.jsx(je, {
                              onClick: () => {
                                b((f) => ({ ...f, icon: '' }));
                              },
                              children: r.jsx(se, {
                                width: '1em',
                                height: '1em',
                                'aria-hidden': !0,
                              }),
                            }),
                        ],
                      }),
                    ],
                  }),
                  r.jsx(ur, { children: t('terrainConfig.iconHint') }),
                  r.jsxs(Ce, {
                    children: [
                      r.jsx($e, { children: t('terrainConfig.fieldDeepWater') }),
                      r.jsx('input', {
                        type: 'checkbox',
                        checked: w.isDeepWater,
                        onChange: (f) => {
                          b((k) => ({ ...k, isDeepWater: f.target.checked }));
                        },
                      }),
                    ],
                  }),
                  r.jsx(ur, {
                    style: { marginTop: '-8px' },
                    children: t('terrainConfig.deepWaterHint'),
                  }),
                  r.jsx(di, { onClick: P, children: t('terrainConfig.save') }),
                ],
              }),
      }),
    });
  },
  xi = m.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: ${({ theme: e }) => e.panelBackground};
  border-bottom: 2px solid
    ${({ theme: e }) => e.panelBorder};
  z-index: ${({ theme: e }) => e.zIndex.toolbar};
  flex-shrink: 0;

  @media (min-width: 601px) {
    padding-right: ${({ $rightPanelOpen: e }) => (e ? '296px' : '16px')};
    transition: padding-right 0.25s ease;
  }
`,
  fi = m.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme: e }) => e.panelBorder};
  background: transparent;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
  &:hover {
    background: ${({ theme: e }) => e.panelBorder};
    color: ${({ theme: e }) => e.text};
  }
`,
  gi = m.input`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme: e }) => e.text};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid
    ${({ $hasError: e, theme: t }) => (e ? t.accent : 'transparent')};
  border-radius: 0;
  padding: 2px 4px;
  outline: none;
  min-width: 0;
  flex: 1;
  max-width: 260px;
  transition: border-color 0.15s;
  cursor: text;

  @media (min-width: 601px) {
    max-width: 100%;
    margin-right: auto;
  }

  &:hover,
  &:focus {
    border-bottom-color: ${({ $hasError: e, theme: t }) => (e ? t.accent : t.textMuted)};
  }
`,
  mi = m.div`
  font-size: 0.7rem;
  color: ${({ theme: e }) => e.accent};
  position: absolute;
  top: 100%;
  left: 0;
  white-space: nowrap;
  padding: 2px 4px;
`,
  yi = m.div`
  position: relative;
  min-width: 0;
  flex: 1;

  @media (min-width: 601px) {
    margin-right: auto;
  }
`,
  bi = m.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme: e }) => e.panelBorder};
    background: ${({ $active: e, theme: t }) => (e ? t.panelBorder : 'transparent')};
    color: ${({ theme: e }) => e.text};
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme: e }) => e.panelBorder};
    }
  }
`,
  wi = m.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme: e }) => e.panelBorder};
    background: ${({ $active: e, theme: t }) => (e ? t.panelBorder : 'transparent')};
    color: ${({ theme: e }) => e.text};
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s;
    line-height: 1;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme: e }) => e.panelBorder};
    }
  }
`,
  vi = m.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme: e }) => e.panelBorder};
    background: transparent;
    color: ${({ theme: e }) => e.textMuted};
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
    line-height: 1;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme: e }) => e.panelBorder};
      color: ${({ theme: e }) => e.text};
    }
  }
`,
  ki = m.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${({ $open: e }) => (e ? '0' : '-100%')};
  z-index: ${({ theme: e }) => e.zIndex.sheet};
  background: ${({ theme: e }) => e.panelBackground};
  border-top: 2px solid
    ${({ theme: e }) => e.panelBorder};
  border-radius: 16px 16px 0 0;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
  transition: bottom 0.25s ease;
  max-width: 480px;
  margin: 0 auto;

  @media (min-width: 601px) {
    left: auto;
    right: 16px;
    bottom: auto;
    top: ${({ $open: e }) => (e ? '52px' : '-200%')};
    border-radius: 8px;
    border: 2px solid
      ${({ theme: e }) => e.panelBorder};
    min-width: 220px;
    padding: 4px 0;
    transition:
      top 0.2s ease,
      opacity 0.2s ease;
    opacity: ${({ $open: e }) => (e ? 1 : 0)};
    pointer-events: ${({ $open: e }) => (e ? 'auto' : 'none')};
  }
`,
  ji = m.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme: e }) => e.panelBorder};
  margin: 8px auto 12px;

  @media (min-width: 601px) {
    display: none;
  }
`,
  Ci = () => {
    const e = Z(),
      t = jr(),
      { t: n } = oe(),
      o = O((p) => p.tiles),
      a = O((p) => p.armies),
      s = O((p) => p.factions),
      c = O((p) => p.currentMap.name),
      i = O((p) => p.currentMap.id),
      d = O((p) => p.ui.factionsOpen),
      l = O((p) => p.ui.mapMode),
      u = O((p) => p.ui.showShortcuts),
      h = O((p) => p.ui.selectedArmyId),
      [x, w] = g.useState(''),
      [b, v] = g.useState(!1),
      [C, M] = g.useState(null),
      [y, $] = g.useState(!1),
      [E, I] = g.useState(!1),
      [P, j] = g.useState(!1),
      f = ht(),
      k = l === 'terrain' || l === 'terrain-paint' || l === 'faction' || u || h !== null,
      T = b ? x : c,
      R = () => {
        (w(c), v(!0), M(null));
      },
      W = () => {
        v(!1);
        const p = x.trim() || n('home.untitledMap');
        if (i) {
          if (!fn(i, p).ok) {
            M(n('toolbar.nameTaken'));
            return;
          }
          M(null);
        }
        e(gn(p));
      },
      F = (p) => {
        (p.key === 'Enter' && p.target.blur(), p.key === 'Escape' && v(!1));
      },
      N = () => {
        (e(ae()), e(ce()), e(xn()), e(rt({})), e(nt({})), t('/'));
      },
      U = () => {
        $(!1);
        const p = f.getState().terrainConfig,
          L = yn(o, p.custom),
          S = JSON.stringify(
            {
              name: c || 'hex-map',
              tiles: o,
              armies: a,
              factions: s,
              terrainConfig: p,
              thumbnail: L,
            },
            null,
            2
          ),
          q = new Blob([S], { type: 'application/json' }),
          K = URL.createObjectURL(q),
          V = document.createElement('a');
        ((V.href = K), (V.download = `${c || 'hex-map'}.json`), V.click(), URL.revokeObjectURL(K));
      },
      G = () => {
        ($(!1), e(mn()));
      },
      ie = () => {
        e(u ? ot() : Ct());
      },
      Ye = () => {
        ($(!1), e(Ct()));
      },
      Le = () => {
        ($(!1), t('/help'));
      };
    return r.jsxs(r.Fragment, {
      children: [
        r.jsxs(xi, {
          $rightPanelOpen: k,
          children: [
            r.jsx(fi, { onClick: N, 'data-testid': 'back-btn', children: n('toolbar.back') }),
            r.jsxs(yi, {
              children: [
                r.jsx(gi, {
                  'data-testid': 'map-name-input',
                  $hasError: C !== null,
                  value: T,
                  onChange: (p) => w(p.target.value),
                  onFocus: R,
                  onBlur: W,
                  onKeyDown: F,
                  maxLength: 48,
                }),
                C && r.jsx(mi, { children: C }),
              ],
            }),
            r.jsxs(bi, {
              'data-testid': 'factions-btn',
              $active: d,
              onClick: G,
              children: [
                r.jsx(Se, { width: '1em', height: '1em', 'aria-hidden': !0 }),
                n('toolbar.factions'),
              ],
            }),
            r.jsx(wi, {
              $active: u,
              onClick: ie,
              'aria-label': n('toolbar.keyboardShortcuts'),
              children: r.jsx(It, { width: '1.1em', height: '1.1em', 'aria-hidden': !0 }),
            }),
            r.jsx(vi, {
              onClick: Le,
              'aria-label': n('help.helpButtonLabel'),
              children: r.jsx(Ot, { width: '1.1em', height: '1.1em', 'aria-hidden': !0 }),
            }),
            r.jsx(cn, { onAfterSelect: () => $(!1) }),
            r.jsx(ln, {
              $active: y,
              onClick: () => $((p) => !p),
              'aria-label': 'Settings',
              children: r.jsx(dn, { width: '1.1em', height: '1.1em', 'aria-hidden': !0 }),
            }),
          ],
        }),
        r.jsx(un, { $open: y, onClick: () => $(!1) }),
        r.jsxs(ki, {
          $open: y,
          children: [
            r.jsx(ji, {}),
            r.jsxs(fe, {
              'data-testid': 'mobile-factions-btn',
              $active: d,
              $desktopHide: !0,
              onClick: G,
              children: [
                r.jsx(ge, { children: r.jsx(Se, { 'aria-hidden': !0 }) }),
                n('toolbar.factions'),
              ],
            }),
            r.jsxs(fe, {
              $desktopHide: !0,
              onClick: Ye,
              children: [
                r.jsx(ge, { children: r.jsx(It, { 'aria-hidden': !0 }) }),
                n('toolbar.keyboardShortcuts'),
              ],
            }),
            r.jsxs(fe, {
              $desktopHide: !0,
              onClick: Le,
              children: [
                r.jsx(ge, { children: r.jsx(Ot, { 'aria-hidden': !0 }) }),
                n('help.helpButtonLabel'),
              ],
            }),
            r.jsxs(fe, {
              onClick: () => {
                ($(!1), j(!0));
              },
              children: [
                r.jsx(ge, { children: r.jsx(Tr, { 'aria-hidden': !0 }) }),
                n('terrainConfig.title'),
              ],
            }),
            r.jsxs(fe, {
              'data-testid': 'export-json-btn',
              onClick: U,
              children: [
                r.jsx(ge, { children: r.jsx(Hn, { 'aria-hidden': !0 }) }),
                n('toolbar.exportJSON'),
              ],
            }),
            r.jsxs(fe, {
              $desktopHide: !0,
              onClick: () => {
                ($(!1), I(!0));
              },
              children: [
                r.jsx(ge, { children: r.jsx(hn, { 'aria-hidden': !0 }) }),
                n('toolbar.languageLabel'),
              ],
            }),
          ],
        }),
        r.jsx(pn, { open: E, onClose: () => I(!1), onAfterSelect: () => $(!1) }),
        P && r.jsx(pi, { onClose: () => j(!1) }),
      ],
    });
  },
  $i = m.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`,
  Mi = m.div`
  background: ${({ theme: e }) => e.surface.card};
  border: 1px solid
    ${({ theme: e }) => e.panelBorder};
  border-left: 4px solid
    ${({ $color: e }) => e};
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,
  Si = m.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,
  Ti = m.input`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme: e }) => e.text};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  padding: 2px 4px;
  outline: none;
  min-width: 0;
  &:hover,
  &:focus {
    border-bottom-color: ${({ theme: e }) => e.textMuted};
  }
`,
  Ei = m.button`
  background: none;
  border: none;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 4px;
  flex-shrink: 0;
  &:hover {
    color: ${({ theme: e }) => e.accent};
  }
`,
  Li = m.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`,
  Pi = m.button`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid
    ${({ $active: e }) => (e ? '#fff' : 'transparent')};
  background: ${({ $color: e }) => e};
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  outline: none;
  &:hover {
    border-color: ${({ theme: e }) => e.surface.borderFocus};
  }
`,
  Ri = m.textarea`
  width: 100%;
  box-sizing: border-box;
  font-size: 0.78rem;
  color: ${({ theme: e }) => e.text};
  background: ${({ theme: e }) => e.surface.overlayLight};
  border: 1px solid
    ${({ theme: e }) => e.panelBorder};
  border-radius: 4px;
  padding: 6px 8px;
  resize: vertical;
  min-height: 52px;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  &:focus {
    border-color: ${({ theme: e }) => e.textMuted};
  }
`,
  Bi = m.button`
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1.5px dashed
    ${({ theme: e }) => e.panelBorder};
  background: transparent;
  color: ${({ theme: e }) => e.textMuted};
  font-size: 0.82rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ theme: e }) => e.textMuted};
    color: ${({ theme: e }) => e.text};
  }
`,
  Ai = m.div`
  color: ${({ theme: e }) => e.textMuted};
  font-size: 0.82rem;
  text-align: center;
  padding: 24px 0 8px;
`,
  Ii = ({ faction: e }) => {
    const t = Cr(),
      n = Z(),
      { t: o } = oe(),
      [a, s] = g.useState(e.name),
      [c, i] = g.useState(e.description),
      d = g.useCallback(() => {
        const u = a.trim() || 'New Faction';
        (s(u), n(Ge({ id: e.id, name: u })));
      }, [n, e.id, a]),
      l = g.useCallback(() => {
        n(Ge({ id: e.id, description: c }));
      }, [n, e.id, c]);
    return r.jsxs(Mi, {
      $color: e.color,
      children: [
        r.jsxs(Si, {
          children: [
            r.jsx(Ti, {
              'data-testid': `faction-name-${e.id}`,
              value: a,
              onChange: (u) => s(u.target.value),
              onBlur: d,
              onKeyDown: (u) => {
                u.key === 'Enter' && u.target.blur();
              },
              maxLength: 48,
            }),
            r.jsx(Ei, {
              'data-testid': `faction-delete-${e.id}`,
              onClick: () => n(wn(e.id)),
              title: 'Delete faction',
              children: r.jsx(se, { width: '1em', height: '1em', 'aria-hidden': !0 }),
            }),
          ],
        }),
        r.jsxs('div', {
          children: [
            r.jsx(Y, { children: o('factionsPanel.colour') }),
            r.jsx(Li, {
              children: t.factionColors.map((u) =>
                r.jsx(
                  Pi,
                  {
                    $color: u,
                    $active: e.color === u,
                    onClick: () => n(Ge({ id: e.id, color: u })),
                    title: u,
                  },
                  u
                )
              ),
            }),
          ],
        }),
        r.jsxs('div', {
          children: [
            r.jsx(Y, { children: o('factionsPanel.description') }),
            r.jsx(Ri, {
              value: c,
              onChange: (u) => i(u.target.value),
              onBlur: l,
              placeholder: o('factionsPanel.descriptionPlaceholder'),
              maxLength: 500,
            }),
          ],
        }),
      ],
    });
  },
  Oi = () => {
    const e = Cr(),
      t = Z(),
      { t: n } = oe(),
      o = O((c) => c.factions),
      a = O((c) => c.ui.factionsOpen),
      s = () => {
        const c = new Set(o.map((d) => d.color)),
          i = e.factionColors.find((d) => !c.has(d)) ?? e.factionColors[0];
        t(vn({ color: i }));
      };
    return r.jsxs(ye, {
      $open: a,
      $desktopSlide: !0,
      $width: '300px',
      $mobileHeight: '70vh',
      $gap: '0',
      children: [
        r.jsx(be, { $margin: '0 auto 12px' }),
        r.jsx(_e, {
          title: n('factionsPanel.title'),
          icon: r.jsx(Se, { 'aria-hidden': !0 }),
          onClose: () => t(bn()),
          $marginBottom: '20px',
        }),
        r.jsxs($i, {
          children: [
            o.length === 0 && r.jsx(Ai, { children: n('factionsPanel.noFactions') }),
            o.map((c) => r.jsx(Ii, { faction: c }, c.id)),
          ],
        }),
        r.jsx(Bi, {
          'data-testid': 'add-faction-btn',
          onClick: s,
          children: n('factionsPanel.addFaction'),
        }),
      ],
    });
  },
  Wi = window.matchMedia('(pointer: coarse)').matches,
  Fi = m.p`
  font-size: 0.75rem;
  color: ${({ theme: e }) => e.textMuted};
  margin: 0 0 12px;
  line-height: 1.5;
`,
  pr = m.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active: e, $color: t, theme: n }) => (e ? (t ?? n.surface.borderFocus) : 'transparent')};
  background: ${({ $active: e, $color: t, theme: n }) => (e ? (t ? `${t}22` : n.surface.hoverWeak) : n.surface.subtle)};
  color: ${({ theme: e }) => e.text};
  font-size: 0.875rem;
  font-weight: ${({ $active: e }) => (e ? '600' : '400')};
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    background: ${({ $color: e, theme: t }) => (e ? `${e}18` : t.surface.hoverWeak)};
    border-color: ${({ $color: e, theme: t }) => e ?? t.surface.borderMedium};
  }
`,
  Ni = m.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${({ $color: e }) => e};
  flex-shrink: 0;
  border: 1px solid
    ${({ theme: e }) => e.surface.border};
`,
  zi = m.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px dashed
    ${({ theme: e }) => e.textMuted};
  flex-shrink: 0;
`,
  Di = m.div`
  color: ${({ theme: e }) => e.textMuted};
  font-size: 0.82rem;
  text-align: center;
  padding: 16px 0;
  line-height: 1.6;
`,
  Ki = ({ suppressed: e }) => {
    const t = Z(),
      { t: n } = oe(),
      o = O((i) => i.factions),
      a = O((i) => i.ui.activeFactionId),
      c = O((i) => i.ui.mapMode) === 'faction';
    return r.jsxs(ye, {
      $open: c && !e,
      $gap: '8px',
      children: [
        r.jsx(be, {}),
        r.jsx(_e, {
          title: n('factionPaintPanel.title'),
          icon: r.jsx(Se, { 'aria-hidden': !0 }),
          onClose: () => t(st('terrain')),
          $marginBottom: '4px',
        }),
        r.jsx(Fi, { children: n(Wi ? 'factionPaintPanel.hintTouch' : 'factionPaintPanel.hint') }),
        r.jsxs(pr, {
          $active: a === null,
          $color: null,
          onClick: () => t($t(null)),
          children: [r.jsx(zi, {}), n('factionPaintPanel.unassigned')],
        }),
        o.length === 0 &&
          r.jsx(Di, {
            children: n('factionPaintPanel.noFactions')
              .split(
                `
`
              )
              .map((i, d) => r.jsxs('span', { children: [i, d === 0 && r.jsx('br', {})] }, d)),
          }),
        o.map((i) =>
          r.jsxs(
            pr,
            {
              $active: a === i.id,
              $color: i.color,
              onClick: () => t($t(i.id)),
              children: [r.jsx(Ni, { $color: i.color }), i.name],
            },
            i.id
          )
        ),
      ],
    });
  },
  qi = '300px',
  Ui = m.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: ${({ theme: e }) => e.zIndex.toggle};
  display: flex;
  border-radius: 24px;
  border: 2px solid
    ${({ theme: e }) => e.panelBorder};
  background: ${({ theme: e }) => e.panelBackground};
  overflow: hidden;
  box-shadow: 0 4px 16px
    ${({ theme: e }) => e.surface.overlayMedium};

  @media (min-width: 601px) {
    right: ${qi};
  }
`,
  xr = m.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: ${({ $active: e, theme: t }) => (e ? t.panelBorder : 'transparent')};
  color: ${({ $active: e, theme: t }) => (e ? t.text : t.textMuted)};
  font-size: 0.78rem;
  font-weight: ${({ $active: e }) => (e ? '600' : '400')};
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;

  & > svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme: e }) => e.text};
  }
`,
  Hi = () => {
    const e = Z(),
      { t } = oe(),
      n = O((o) => o.ui.mapMode);
    return r.jsxs(Ui, {
      children: [
        r.jsxs(xr, {
          $active: n === 'terrain',
          onClick: () => e(st('terrain')),
          children: [r.jsx(Tr, { 'aria-hidden': !0 }), t('mapModeToggle.terrain')],
        }),
        r.jsxs(xr, {
          $active: n === 'faction',
          onClick: () => e(st('faction')),
          children: [r.jsx(Se, { 'aria-hidden': !0 }), t('mapModeToggle.faction')],
        }),
      ],
    });
  },
  _i = m.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`,
  Yi = m.div`
  display: flex;
  align-items: center;
  gap: 12px;
`,
  Vi = m.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1.5px solid
    ${({ theme: e }) => e.panelBorder};
  background: ${({ theme: e }) => e.panelBackground};
  color: ${({ theme: e }) => e.text};
  font-family: monospace;
  font-size: 0.78rem;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 1px 0
    ${({ theme: e }) => e.panelBorder};
`,
  Xi = m.span`
  font-size: 0.85rem;
  color: ${({ theme: e }) => e.textMuted};
  flex: 1;
`,
  Gi = () => {
    const e = Z(),
      { t } = oe(),
      n = O((a) => a.ui.showShortcuts),
      o = [
        { keys: ['Ctrl+Z'], desc: t('shortcuts.undo') },
        { keys: ['Ctrl+Y', 'Ctrl+⇧+Z'], desc: t('shortcuts.redo') },
        { keys: ['Escape'], desc: t('shortcuts.escape') },
        { keys: ['Delete', 'Backspace'], desc: t('shortcuts.delete') },
        { keys: ['R'], desc: t('shortcuts.resetViewport') },
      ];
    return (
      g.useEffect(() => {
        if (!n) return;
        const a = (s) => {
          s.key === 'Escape' && e(ot());
        };
        return (
          window.addEventListener('keydown', a),
          () => window.removeEventListener('keydown', a)
        );
      }, [n, e]),
      r.jsxs(ye, {
        $open: n,
        $desktopSlide: !0,
        children: [
          r.jsx(be, { $margin: '0 auto 4px' }),
          r.jsx(_e, {
            title: t('shortcuts.title'),
            onClose: () => e(ot()),
            closeVariant: 'bordered',
          }),
          r.jsx(_i, {
            children: o.map(({ keys: a, desc: s }) =>
              r.jsxs(
                Yi,
                {
                  children: [
                    r.jsx('div', {
                      style: { display: 'flex', gap: 4, flexWrap: 'wrap', minWidth: 100 },
                      children: a.map((c) => r.jsx(Vi, { children: c }, c)),
                    }),
                    r.jsx(Xi, { children: s }),
                  ],
                },
                s
              )
            ),
          }),
        ],
      })
    );
  },
  Zi = () => {
    const e = Z(),
      t = ht(),
      n = g.useCallback(
        (o) => {
          var c;
          const a = (c = document.activeElement) == null ? void 0 : c.tagName;
          if (a === 'INPUT' || a === 'TEXTAREA') return;
          const s = o.ctrlKey || o.metaKey;
          if (o.key === 'Escape') {
            (e(ae()), e(ce()));
            return;
          }
          if (o.key === 'Delete' || o.key === 'Backspace') {
            const { selectedTile: i } = t.getState().ui;
            if (i) {
              const [d, l] = i.split(',').map(Number);
              (e(ae()), e(pt({ q: d, r: l })));
            }
            return;
          }
          if (!s && o.key === 'r') {
            e(it());
            return;
          }
          if (s && !o.shiftKey && o.key === 'z') {
            o.preventDefault();
            const i = t.getState(),
              d = { tiles: i.tiles, armies: i.armies, factions: i.factions },
              l = kn(d);
            l && e(Mt(l));
            return;
          }
          if (
            s &&
            (o.key === 'y' || (o.shiftKey && o.key === 'z') || (o.shiftKey && o.key === 'Z'))
          ) {
            o.preventDefault();
            const i = t.getState(),
              d = { tiles: i.tiles, armies: i.armies, factions: i.factions },
              l = jn(d);
            l && e(Mt(l));
          }
        },
        [e, t]
      );
    g.useEffect(
      () => (window.addEventListener('keydown', n), () => window.removeEventListener('keydown', n)),
      [n]
    );
  },
  Ji = m.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`,
  Qi = m.div`
  flex: 1;
  position: relative;
  display: flex;
`,
  ea = () => {
    (Cn(), Zi());
    const e = O((t) => t.ui.selectedArmyId);
    return r.jsxs(Ji, {
      children: [
        r.jsx(Ci, {}),
        r.jsxs(Qi, {
          children: [
            r.jsx(Xs, {}),
            r.jsx(Jo, {}),
            r.jsx(Hi, {}),
            r.jsx(js, {}),
            r.jsx(Bs, {}),
            r.jsx(Ki, { suppressed: e !== null }),
            r.jsx(Oi, {}),
            r.jsx(Gi, {}),
          ],
        }),
      ],
    });
  },
  ra = () => {
    const { mapSlug: e } = $n(),
      t = jr(),
      n = Mn(),
      o = Z(),
      a = O((u) => u.currentMap.id),
      s = O((u) => u.currentMap.name),
      [c, i] = g.useState(!1),
      [d, l] = g.useState(null);
    return (
      g.useEffect(() => {
        var x;
        if (e === 'example') {
          if (!!((x = n.state) != null && x.examplePreloaded) || a !== null || c) {
            i(!0);
            return;
          }
          const b = Sn[0];
          if (!b) {
            l('/');
            return;
          }
          (o(St({ id: null, name: b.name })),
            o(rt(b.tiles)),
            o(nt(b.armies)),
            o(Tt(b.factions)),
            o(Et(b.terrainConfig ?? Lt)),
            o(it()),
            i(!0));
          return;
        }
        if (!e) {
          l('/');
          return;
        }
        const u = Tn(e);
        if (u && a === u.id) {
          i(!0);
          return;
        }
        if (!u) {
          t('/', { replace: !0, state: { warning: 'mapNotFound' } });
          return;
        }
        const h = En(u.id);
        (o(St({ id: u.id, name: u.name })),
          Rn(),
          o(rt((h == null ? void 0 : h.tiles) ?? {})),
          o(nt((h == null ? void 0 : h.armies) ?? {})),
          o(Tt((h == null ? void 0 : h.factions) ?? [])),
          o(Et((h == null ? void 0 : h.terrainConfig) ?? Lt)),
          o(it()),
          i(!0));
      }, [e]),
      g.useEffect(() => {
        if (!c || !a || e === 'example') return;
        const u = Pt(s);
        e !== u && t(`/map/${u}`, { replace: !0 });
      }, [s, a, c, e, t]),
      g.useEffect(() => {
        if (!c || e !== 'example' || a === null) return;
        const u = Pt(s);
        t(`/map/${u}`, { replace: !0 });
      }, [a, e, c, s, t]),
      d ? r.jsx(Ln, { to: d, replace: !0 }) : c ? r.jsx(Pn, { children: r.jsx(ea, {}) }) : null
    );
  };
export { ra as default };
