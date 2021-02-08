/* PrismJS 1.23.0
https://prismjs.com/download.html#themes=prism-okaidia&languages=clike+c+csharp+cpp&plugins=line-highlight+line-numbers+remove-initial-line-feed+normalize-whitespace */
var _self =
    "undefined" != typeof window
      ? window
      : "undefined" != typeof WorkerGlobalScope &&
        self instanceof WorkerGlobalScope
      ? self
      : {},
  Prism = (function (u) {
    var c = /\blang(?:uage)?-([\w-]+)\b/i,
      n = 0,
      M = {
        manual: u.Prism && u.Prism.manual,
        disableWorkerMessageHandler:
          u.Prism && u.Prism.disableWorkerMessageHandler,
        util: {
          encode: function e(n) {
            return n instanceof W
              ? new W(n.type, e(n.content), n.alias)
              : Array.isArray(n)
              ? n.map(e)
              : n
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/\u00a0/g, " ");
          },
          type: function (e) {
            return Object.prototype.toString.call(e).slice(8, -1);
          },
          objId: function (e) {
            return (
              e.__id || Object.defineProperty(e, "__id", { value: ++n }), e.__id
            );
          },
          clone: function r(e, t) {
            var a, n;
            switch (((t = t || {}), M.util.type(e))) {
              case "Object":
                if (((n = M.util.objId(e)), t[n])) return t[n];
                for (var i in ((a = {}), (t[n] = a), e))
                  e.hasOwnProperty(i) && (a[i] = r(e[i], t));
                return a;
              case "Array":
                return (
                  (n = M.util.objId(e)),
                  t[n]
                    ? t[n]
                    : ((a = []),
                      (t[n] = a),
                      e.forEach(function (e, n) {
                        a[n] = r(e, t);
                      }),
                      a)
                );
              default:
                return e;
            }
          },
          getLanguage: function (e) {
            for (; e && !c.test(e.className); ) e = e.parentElement;
            return e
              ? (e.className.match(c) || [, "none"])[1].toLowerCase()
              : "none";
          },
          currentScript: function () {
            if ("undefined" == typeof document) return null;
            if ("currentScript" in document) return document.currentScript;
            try {
              throw new Error();
            } catch (e) {
              var n = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack) || [])[1];
              if (n) {
                var r = document.getElementsByTagName("script");
                for (var t in r) if (r[t].src == n) return r[t];
              }
              return null;
            }
          },
          isActive: function (e, n, r) {
            for (var t = "no-" + n; e; ) {
              var a = e.classList;
              if (a.contains(n)) return !0;
              if (a.contains(t)) return !1;
              e = e.parentElement;
            }
            return !!r;
          },
        },
        languages: {
          extend: function (e, n) {
            var r = M.util.clone(M.languages[e]);
            for (var t in n) r[t] = n[t];
            return r;
          },
          insertBefore: function (r, e, n, t) {
            var a = (t = t || M.languages)[r],
              i = {};
            for (var l in a)
              if (a.hasOwnProperty(l)) {
                if (l == e)
                  for (var o in n) n.hasOwnProperty(o) && (i[o] = n[o]);
                n.hasOwnProperty(l) || (i[l] = a[l]);
              }
            var s = t[r];
            return (
              (t[r] = i),
              M.languages.DFS(M.languages, function (e, n) {
                n === s && e != r && (this[e] = i);
              }),
              i
            );
          },
          DFS: function e(n, r, t, a) {
            a = a || {};
            var i = M.util.objId;
            for (var l in n)
              if (n.hasOwnProperty(l)) {
                r.call(n, l, n[l], t || l);
                var o = n[l],
                  s = M.util.type(o);
                "Object" !== s || a[i(o)]
                  ? "Array" !== s || a[i(o)] || ((a[i(o)] = !0), e(o, r, l, a))
                  : ((a[i(o)] = !0), e(o, r, null, a));
              }
          },
        },
        plugins: {},
        highlightAll: function (e, n) {
          M.highlightAllUnder(document, e, n);
        },
        highlightAllUnder: function (e, n, r) {
          var t = {
            callback: r,
            container: e,
            selector:
              'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
          };
          M.hooks.run("before-highlightall", t),
            (t.elements = Array.prototype.slice.apply(
              t.container.querySelectorAll(t.selector)
            )),
            M.hooks.run("before-all-elements-highlight", t);
          for (var a, i = 0; (a = t.elements[i++]); )
            M.highlightElement(a, !0 === n, t.callback);
        },
        highlightElement: function (e, n, r) {
          var t = M.util.getLanguage(e),
            a = M.languages[t];
          e.className =
            e.className.replace(c, "").replace(/\s+/g, " ") + " language-" + t;
          var i = e.parentElement;
          i &&
            "pre" === i.nodeName.toLowerCase() &&
            (i.className =
              i.className.replace(c, "").replace(/\s+/g, " ") +
              " language-" +
              t);
          var l = { element: e, language: t, grammar: a, code: e.textContent };
          function o(e) {
            (l.highlightedCode = e),
              M.hooks.run("before-insert", l),
              (l.element.innerHTML = l.highlightedCode),
              M.hooks.run("after-highlight", l),
              M.hooks.run("complete", l),
              r && r.call(l.element);
          }
          if ((M.hooks.run("before-sanity-check", l), !l.code))
            return M.hooks.run("complete", l), void (r && r.call(l.element));
          if ((M.hooks.run("before-highlight", l), l.grammar))
            if (n && u.Worker) {
              var s = new Worker(M.filename);
              (s.onmessage = function (e) {
                o(e.data);
              }),
                s.postMessage(
                  JSON.stringify({
                    language: l.language,
                    code: l.code,
                    immediateClose: !0,
                  })
                );
            } else o(M.highlight(l.code, l.grammar, l.language));
          else o(M.util.encode(l.code));
        },
        highlight: function (e, n, r) {
          var t = { code: e, grammar: n, language: r };
          return (
            M.hooks.run("before-tokenize", t),
            (t.tokens = M.tokenize(t.code, t.grammar)),
            M.hooks.run("after-tokenize", t),
            W.stringify(M.util.encode(t.tokens), t.language)
          );
        },
        tokenize: function (e, n) {
          var r = n.rest;
          if (r) {
            for (var t in r) n[t] = r[t];
            delete n.rest;
          }
          var a = new i();
          return (
            I(a, a.head, e),
            (function e(n, r, t, a, i, l) {
              for (var o in t)
                if (t.hasOwnProperty(o) && t[o]) {
                  var s = t[o];
                  s = Array.isArray(s) ? s : [s];
                  for (var u = 0; u < s.length; ++u) {
                    if (l && l.cause == o + "," + u) return;
                    var c = s[u],
                      g = c.inside,
                      f = !!c.lookbehind,
                      h = !!c.greedy,
                      d = c.alias;
                    if (h && !c.pattern.global) {
                      var v = c.pattern.toString().match(/[imsuy]*$/)[0];
                      c.pattern = RegExp(c.pattern.source, v + "g");
                    }
                    for (
                      var p = c.pattern || c, m = a.next, y = i;
                      m !== r.tail && !(l && y >= l.reach);
                      y += m.value.length, m = m.next
                    ) {
                      var k = m.value;
                      if (r.length > n.length) return;
                      if (!(k instanceof W)) {
                        var b,
                          x = 1;
                        if (h) {
                          if (!(b = z(p, y, n, f))) break;
                          var w = b.index,
                            A = b.index + b[0].length,
                            P = y;
                          for (P += m.value.length; P <= w; )
                            (m = m.next), (P += m.value.length);
                          if (
                            ((P -= m.value.length),
                            (y = P),
                            m.value instanceof W)
                          )
                            continue;
                          for (
                            var S = m;
                            S !== r.tail &&
                            (P < A || "string" == typeof S.value);
                            S = S.next
                          )
                            x++, (P += S.value.length);
                          x--, (k = n.slice(y, P)), (b.index -= y);
                        } else if (!(b = z(p, 0, k, f))) continue;
                        var w = b.index,
                          E = b[0],
                          O = k.slice(0, w),
                          L = k.slice(w + E.length),
                          N = y + k.length;
                        l && N > l.reach && (l.reach = N);
                        var j = m.prev;
                        O && ((j = I(r, j, O)), (y += O.length)), q(r, j, x);
                        var C = new W(o, g ? M.tokenize(E, g) : E, d, E);
                        if (((m = I(r, j, C)), L && I(r, m, L), 1 < x)) {
                          var _ = { cause: o + "," + u, reach: N };
                          e(n, r, t, m.prev, y, _),
                            l && _.reach > l.reach && (l.reach = _.reach);
                        }
                      }
                    }
                  }
                }
            })(e, a, n, a.head, 0),
            (function (e) {
              var n = [],
                r = e.head.next;
              for (; r !== e.tail; ) n.push(r.value), (r = r.next);
              return n;
            })(a)
          );
        },
        hooks: {
          all: {},
          add: function (e, n) {
            var r = M.hooks.all;
            (r[e] = r[e] || []), r[e].push(n);
          },
          run: function (e, n) {
            var r = M.hooks.all[e];
            if (r && r.length) for (var t, a = 0; (t = r[a++]); ) t(n);
          },
        },
        Token: W,
      };
    function W(e, n, r, t) {
      (this.type = e),
        (this.content = n),
        (this.alias = r),
        (this.length = 0 | (t || "").length);
    }
    function z(e, n, r, t) {
      e.lastIndex = n;
      var a = e.exec(r);
      if (a && t && a[1]) {
        var i = a[1].length;
        (a.index += i), (a[0] = a[0].slice(i));
      }
      return a;
    }
    function i() {
      var e = { value: null, prev: null, next: null },
        n = { value: null, prev: e, next: null };
      (e.next = n), (this.head = e), (this.tail = n), (this.length = 0);
    }
    function I(e, n, r) {
      var t = n.next,
        a = { value: r, prev: n, next: t };
      return (n.next = a), (t.prev = a), e.length++, a;
    }
    function q(e, n, r) {
      for (var t = n.next, a = 0; a < r && t !== e.tail; a++) t = t.next;
      ((n.next = t).prev = n), (e.length -= a);
    }
    if (
      ((u.Prism = M),
      (W.stringify = function n(e, r) {
        if ("string" == typeof e) return e;
        if (Array.isArray(e)) {
          var t = "";
          return (
            e.forEach(function (e) {
              t += n(e, r);
            }),
            t
          );
        }
        var a = {
            type: e.type,
            content: n(e.content, r),
            tag: "span",
            classes: ["token", e.type],
            attributes: {},
            language: r,
          },
          i = e.alias;
        i &&
          (Array.isArray(i)
            ? Array.prototype.push.apply(a.classes, i)
            : a.classes.push(i)),
          M.hooks.run("wrap", a);
        var l = "";
        for (var o in a.attributes)
          l +=
            " " +
            o +
            '="' +
            (a.attributes[o] || "").replace(/"/g, "&quot;") +
            '"';
        return (
          "<" +
          a.tag +
          ' class="' +
          a.classes.join(" ") +
          '"' +
          l +
          ">" +
          a.content +
          "</" +
          a.tag +
          ">"
        );
      }),
      !u.document)
    )
      return (
        u.addEventListener &&
          (M.disableWorkerMessageHandler ||
            u.addEventListener(
              "message",
              function (e) {
                var n = JSON.parse(e.data),
                  r = n.language,
                  t = n.code,
                  a = n.immediateClose;
                u.postMessage(M.highlight(t, M.languages[r], r)),
                  a && u.close();
              },
              !1
            )),
        M
      );
    var e = M.util.currentScript();
    function r() {
      M.manual || M.highlightAll();
    }
    if (
      (e &&
        ((M.filename = e.src),
        e.hasAttribute("data-manual") && (M.manual = !0)),
      !M.manual)
    ) {
      var t = document.readyState;
      "loading" === t || ("interactive" === t && e && e.defer)
        ? document.addEventListener("DOMContentLoaded", r)
        : window.requestAnimationFrame
        ? window.requestAnimationFrame(r)
        : window.setTimeout(r, 16);
    }
    return M;
  })(_self);
"undefined" != typeof module && module.exports && (module.exports = Prism),
  "undefined" != typeof global && (global.Prism = Prism);
Prism.languages.clike = {
  comment: [
    { pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: !0, greedy: !0 },
    { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 },
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: !0,
  },
  "class-name": {
    pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
    lookbehind: !0,
    inside: { punctuation: /[.\\]/ },
  },
  keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  boolean: /\b(?:true|false)\b/,
  function: /\w+(?=\()/,
  number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  punctuation: /[{}[\];(),.:]/,
};
(Prism.languages.c = Prism.languages.extend("clike", {
  comment: {
    pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
    greedy: !0,
  },
  "class-name": {
    pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
    lookbehind: !0,
  },
  keyword: /\b(?:__attribute__|_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|diagRequest|diagResponse|variables|includes|testcase)\b/,
  function: /[a-z_]\w*(?=\s*\()/i,
  number: /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
  operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/,
})),
  Prism.languages.insertBefore("c", "string", {
    macro: {
      pattern: /(^\s*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
      lookbehind: !0,
      greedy: !0,
      alias: "property",
      inside: {
        string: [
          { pattern: /^(#\s*include\s*)<[^>]+>/, lookbehind: !0 },
          Prism.languages.c.string,
        ],
        comment: Prism.languages.c.comment,
        "macro-name": [
          { pattern: /(^#\s*define\s+)\w+\b(?!\()/i, lookbehind: !0 },
          {
            pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
            lookbehind: !0,
            alias: "function",
          },
        ],
        directive: {
          pattern: /^(#\s*)[a-z]+/,
          lookbehind: !0,
          alias: "keyword",
        },
        "directive-hash": /^#/,
        punctuation: /##|\\(?=[\r\n])/,
        expression: { pattern: /\S[\s\S]*/, inside: Prism.languages.c },
      },
    },
    constant: /\b(?:__FILE__|__LINE__|__DATE__|__TIME__|__TIMESTAMP__|__func__|EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|stdin|stdout|stderr)\b/,
  }),
  delete Prism.languages.c.boolean;
!(function (s) {
  function a(e, s) {
    return e.replace(/<<(\d+)>>/g, function (e, n) {
      return "(?:" + s[+n] + ")";
    });
  }
  function t(e, n, s) {
    return RegExp(a(e, n), s || "");
  }
  function e(e, n) {
    for (var s = 0; s < n; s++)
      e = e.replace(/<<self>>/g, function () {
        return "(?:" + e + ")";
      });
    return e.replace(/<<self>>/g, "[^\\s\\S]");
  }
  var n =
      "bool byte char decimal double dynamic float int long object sbyte short string uint ulong ushort var void",
    i = "class enum interface struct",
    r =
      "add alias and ascending async await by descending from get global group into join let nameof not notnull on or orderby partial remove select set unmanaged value when where",
    o =
      "abstract as base break case catch checked const continue default delegate do else event explicit extern finally fixed for foreach goto if implicit in internal is lock namespace new null operator out override params private protected public readonly ref return sealed sizeof stackalloc static switch this throw try typeof unchecked unsafe using virtual volatile while yield";
  function l(e) {
    return "\\b(?:" + e.trim().replace(/ /g, "|") + ")\\b";
  }
  var d = l(i),
    p = RegExp(l(n + " " + i + " " + r + " " + o)),
    c = l(i + " " + r + " " + o),
    u = l(n + " " + i + " " + o),
    g = e("<(?:[^<>;=+\\-*/%&|^]|<<self>>)*>", 2),
    b = e("\\((?:[^()]|<<self>>)*\\)", 2),
    h = "@?\\b[A-Za-z_]\\w*\\b",
    f = a("<<0>>(?:\\s*<<1>>)?", [h, g]),
    m = a("(?!<<0>>)<<1>>(?:\\s*\\.\\s*<<1>>)*", [c, f]),
    k = "\\[\\s*(?:,\\s*)*\\]",
    y = a("<<0>>(?:\\s*(?:\\?\\s*)?<<1>>)*(?:\\s*\\?)?", [m, k]),
    w = a("(?:<<0>>|<<1>>)(?:\\s*(?:\\?\\s*)?<<2>>)*(?:\\s*\\?)?", [
      a("\\(<<0>>+(?:,<<0>>+)+\\)", [
        a("[^,()<>[\\];=+\\-*/%&|^]|<<0>>|<<1>>|<<2>>", [g, b, k]),
      ]),
      m,
      k,
    ]),
    v = { keyword: p, punctuation: /[<>()?,.:[\]]/ },
    x = "'(?:[^\r\n'\\\\]|\\\\.|\\\\[Uux][\\da-fA-F]{1,8})'",
    $ = '"(?:\\\\.|[^\\\\"\r\n])*"';
  (s.languages.csharp = s.languages.extend("clike", {
    string: [
      {
        pattern: t("(^|[^$\\\\])<<0>>", ['@"(?:""|\\\\[^]|[^\\\\"])*"(?!")']),
        lookbehind: !0,
        greedy: !0,
      },
      { pattern: t("(^|[^@$\\\\])<<0>>", [$]), lookbehind: !0, greedy: !0 },
      { pattern: RegExp(x), greedy: !0, alias: "character" },
    ],
    "class-name": [
      {
        pattern: t("(\\busing\\s+static\\s+)<<0>>(?=\\s*;)", [m]),
        lookbehind: !0,
        inside: v,
      },
      {
        pattern: t("(\\busing\\s+<<0>>\\s*=\\s*)<<1>>(?=\\s*;)", [h, w]),
        lookbehind: !0,
        inside: v,
      },
      { pattern: t("(\\busing\\s+)<<0>>(?=\\s*=)", [h]), lookbehind: !0 },
      { pattern: t("(\\b<<0>>\\s+)<<1>>", [d, f]), lookbehind: !0, inside: v },
      {
        pattern: t("(\\bcatch\\s*\\(\\s*)<<0>>", [m]),
        lookbehind: !0,
        inside: v,
      },
      { pattern: t("(\\bwhere\\s+)<<0>>", [h]), lookbehind: !0 },
      {
        pattern: t("(\\b(?:is(?:\\s+not)?|as)\\s+)<<0>>", [y]),
        lookbehind: !0,
        inside: v,
      },
      {
        pattern: t(
          "\\b<<0>>(?=\\s+(?!<<1>>)<<2>>(?:\\s*[=,;:{)\\]]|\\s+(?:in|when)\\b))",
          [w, u, h]
        ),
        inside: v,
      },
    ],
    keyword: p,
    number: /(?:\b0(?:x[\da-f_]*[\da-f]|b[01_]*[01])|(?:\B\.\d+(?:_+\d+)*|\b\d+(?:_+\d+)*(?:\.\d+(?:_+\d+)*)?)(?:e[-+]?\d+(?:_+\d+)*)?)(?:ul|lu|[dflmu])?\b/i,
    operator: />>=?|<<=?|[-=]>|([-+&|])\1|~|\?\?=?|[-+*/%&|^!=<>]=?/,
    punctuation: /\?\.?|::|[{}[\];(),.:]/,
  })),
    s.languages.insertBefore("csharp", "number", {
      range: { pattern: /\.\./, alias: "operator" },
    }),
    s.languages.insertBefore("csharp", "punctuation", {
      "named-parameter": {
        pattern: t("([(,]\\s*)<<0>>(?=\\s*:)", [h]),
        lookbehind: !0,
        alias: "punctuation",
      },
    }),
    s.languages.insertBefore("csharp", "class-name", {
      namespace: {
        pattern: t(
          "(\\b(?:namespace|using)\\s+)<<0>>(?:\\s*\\.\\s*<<0>>)*(?=\\s*[;{])",
          [h]
        ),
        lookbehind: !0,
        inside: { punctuation: /\./ },
      },
      "type-expression": {
        pattern: t(
          "(\\b(?:default|typeof|sizeof)\\s*\\(\\s*(?!\\s))(?:[^()\\s]|\\s(?!\\s)|<<0>>)*(?=\\s*\\))",
          [b]
        ),
        lookbehind: !0,
        alias: "class-name",
        inside: v,
      },
      "return-type": {
        pattern: t(
          "<<0>>(?=\\s+(?:<<1>>\\s*(?:=>|[({]|\\.\\s*this\\s*\\[)|this\\s*\\[))",
          [w, m]
        ),
        inside: v,
        alias: "class-name",
      },
      "constructor-invocation": {
        pattern: t("(\\bnew\\s+)<<0>>(?=\\s*[[({])", [w]),
        lookbehind: !0,
        inside: v,
        alias: "class-name",
      },
      "generic-method": {
        pattern: t("<<0>>\\s*<<1>>(?=\\s*\\()", [h, g]),
        inside: {
          function: t("^<<0>>", [h]),
          generic: { pattern: RegExp(g), alias: "class-name", inside: v },
        },
      },
      "type-list": {
        pattern: t(
          "\\b((?:<<0>>\\s+<<1>>|where\\s+<<2>>)\\s*:\\s*)(?:<<3>>|<<4>>)(?:\\s*,\\s*(?:<<3>>|<<4>>))*(?=\\s*(?:where|[{;]|=>|$))",
          [d, f, h, w, p.source]
        ),
        lookbehind: !0,
        inside: {
          keyword: p,
          "class-name": { pattern: RegExp(w), greedy: !0, inside: v },
          punctuation: /,/,
        },
      },
      preprocessor: {
        pattern: /(^\s*)#.*/m,
        lookbehind: !0,
        alias: "property",
        inside: {
          directive: {
            pattern: /(\s*#)\b(?:define|elif|else|endif|endregion|error|if|line|pragma|region|undef|warning)\b/,
            lookbehind: !0,
            alias: "keyword",
          },
        },
      },
    });
  var _ = $ + "|" + x,
    B = a("/(?![*/])|//[^\r\n]*[\r\n]|/\\*(?:[^*]|\\*(?!/))*\\*/|<<0>>", [_]),
    E = e(a("[^\"'/()]|<<0>>|\\(<<self>>*\\)", [B]), 2),
    R =
      "\\b(?:assembly|event|field|method|module|param|property|return|type)\\b",
    P = a("<<0>>(?:\\s*\\(<<1>>*\\))?", [m, E]);
  s.languages.insertBefore("csharp", "class-name", {
    attribute: {
      pattern: t(
        "((?:^|[^\\s\\w>)?])\\s*\\[\\s*)(?:<<0>>\\s*:\\s*)?<<1>>(?:\\s*,\\s*<<1>>)*(?=\\s*\\])",
        [R, P]
      ),
      lookbehind: !0,
      greedy: !0,
      inside: {
        target: { pattern: t("^<<0>>(?=\\s*:)", [R]), alias: "keyword" },
        "attribute-arguments": {
          pattern: t("\\(<<0>>*\\)", [E]),
          inside: s.languages.csharp,
        },
        "class-name": { pattern: RegExp(m), inside: { punctuation: /\./ } },
        punctuation: /[:,]/,
      },
    },
  });
  var z = ":[^}\r\n]+",
    S = e(a("[^\"'/()]|<<0>>|\\(<<self>>*\\)", [B]), 2),
    j = a("\\{(?!\\{)(?:(?![}:])<<0>>)*<<1>>?\\}", [S, z]),
    A = e(
      a("[^\"'/()]|/(?!\\*)|/\\*(?:[^*]|\\*(?!/))*\\*/|<<0>>|\\(<<self>>*\\)", [
        _,
      ]),
      2
    ),
    F = a("\\{(?!\\{)(?:(?![}:])<<0>>)*<<1>>?\\}", [A, z]);
  function U(e, n) {
    return {
      interpolation: {
        pattern: t("((?:^|[^{])(?:\\{\\{)*)<<0>>", [e]),
        lookbehind: !0,
        inside: {
          "format-string": {
            pattern: t("(^\\{(?:(?![}:])<<0>>)*)<<1>>(?=\\}$)", [n, z]),
            lookbehind: !0,
            inside: { punctuation: /^:/ },
          },
          punctuation: /^\{|\}$/,
          expression: {
            pattern: /[\s\S]+/,
            alias: "language-csharp",
            inside: s.languages.csharp,
          },
        },
      },
      string: /[\s\S]+/,
    };
  }
  s.languages.insertBefore("csharp", "string", {
    "interpolation-string": [
      {
        pattern: t(
          '(^|[^\\\\])(?:\\$@|@\\$)"(?:""|\\\\[^]|\\{\\{|<<0>>|[^\\\\{"])*"',
          [j]
        ),
        lookbehind: !0,
        greedy: !0,
        inside: U(j, S),
      },
      {
        pattern: t('(^|[^@\\\\])\\$"(?:\\\\.|\\{\\{|<<0>>|[^\\\\"{])*"', [F]),
        lookbehind: !0,
        greedy: !0,
        inside: U(F, A),
      },
    ],
  });
})(Prism),
  (Prism.languages.dotnet = Prism.languages.cs = Prism.languages.csharp);
!(function (e) {
  var t = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|long|mutable|namespace|new|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|diagRequest|diagResponse)\b/;
  (e.languages.cpp = e.languages.extend("c", {
    "class-name": [
      {
        pattern: RegExp(
          "(\\b(?:class|concept|enum|struct|typename)\\s+)(?!<keyword>)\\w+".replace(
            /<keyword>/g,
            function () {
              return t.source;
            }
          )
        ),
        lookbehind: !0,
      },
      /\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,
      /\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,
      /\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/,
    ],
    keyword: t,
    number: {
      pattern: /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,
      greedy: !0,
    },
    operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,
    boolean: /\b(?:true|false)\b/,
  })),
    e.languages.insertBefore("cpp", "string", {
      "raw-string": {
        pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,
        alias: "string",
        greedy: !0,
      },
    }),
    e.languages.insertBefore("cpp", "class-name", {
      "base-clause": {
        pattern: /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,
        lookbehind: !0,
        greedy: !0,
        inside: e.languages.extend("cpp", {}),
      },
    }),
    e.languages.insertBefore(
      "inside",
      "operator",
      { "class-name": /\b[a-z_]\w*\b(?!\s*::)/i },
      e.languages.cpp["base-clause"]
    );
})(Prism);
!(function () {
  if (
    "undefined" != typeof self &&
    self.Prism &&
    self.document &&
    document.querySelector
  ) {
    var t,
      s = function () {
        if (void 0 === t) {
          var e = document.createElement("div");
          (e.style.fontSize = "13px"),
            (e.style.lineHeight = "1.5"),
            (e.style.padding = "0"),
            (e.style.border = "0"),
            (e.innerHTML = "&nbsp;<br />&nbsp;"),
            document.body.appendChild(e),
            (t = 38 === e.offsetHeight),
            document.body.removeChild(e);
        }
        return t;
      },
      b = !0,
      a = 0;
    Prism.hooks.add("before-sanity-check", function (e) {
      var t = e.element.parentElement,
        n = t && t.getAttribute("data-line");
      if (t && n && /pre/i.test(t.nodeName)) {
        var i = 0;
        v(".line-highlight", t).forEach(function (e) {
          (i += e.textContent.length), e.parentNode.removeChild(e);
        }),
          i &&
            /^( \n)+$/.test(e.code.slice(-i)) &&
            (e.code = e.code.slice(0, -i));
      }
    }),
      Prism.hooks.add("complete", function e(t) {
        var n = t.element.parentElement,
          i = n && n.getAttribute("data-line");
        if (n && i && /pre/i.test(n.nodeName)) {
          clearTimeout(a);
          var r = Prism.plugins.lineNumbers,
            o = t.plugins && t.plugins.lineNumbers;
          if (y(n, "line-numbers") && r && !o)
            Prism.hooks.add("line-numbers", e);
          else l(n, i)(), (a = setTimeout(u, 1));
        }
      }),
      window.addEventListener("hashchange", u),
      window.addEventListener("resize", function () {
        v("pre[data-line]")
          .map(function (e) {
            return l(e);
          })
          .forEach(E);
      });
  }
  function v(e, t) {
    return Array.prototype.slice.call((t || document).querySelectorAll(e));
  }
  function y(e, t) {
    return (
      (t = " " + t + " "),
      -1 < (" " + e.className + " ").replace(/[\n\t]/g, " ").indexOf(t)
    );
  }
  function E(e) {
    e();
  }
  function l(u, e, d) {
    var t = (e = "string" == typeof e ? e : u.getAttribute("data-line"))
        .replace(/\s+/g, "")
        .split(",")
        .filter(Boolean),
      c = +u.getAttribute("data-line-offset") || 0,
      f = (s() ? parseInt : parseFloat)(getComputedStyle(u).lineHeight),
      p = y(u, "line-numbers"),
      n = u.querySelector("code"),
      m = p ? u : n || u,
      h = [],
      g =
        n && m != n
          ? (function (e, t) {
              var n = getComputedStyle(e),
                i = getComputedStyle(t);
              function r(e) {
                return +e.substr(0, e.length - 2);
              }
              return (
                t.offsetTop +
                r(i.borderTopWidth) +
                r(i.paddingTop) -
                r(n.paddingTop)
              );
            })(u, n)
          : 0;
    t.forEach(function (e) {
      var t = e.split("-"),
        n = +t[0],
        i = +t[1] || n,
        r =
          u.querySelector('.line-highlight[data-range="' + e + '"]') ||
          document.createElement("div");
      if (
        (h.push(function () {
          r.setAttribute("aria-hidden", "true"),
            r.setAttribute("data-range", e),
            (r.className = (d || "") + " line-highlight");
        }),
        p && Prism.plugins.lineNumbers)
      ) {
        var o = Prism.plugins.lineNumbers.getLine(u, n),
          a = Prism.plugins.lineNumbers.getLine(u, i);
        if (o) {
          var l = o.offsetTop + g + "px";
          h.push(function () {
            r.style.top = l;
          });
        }
        if (a) {
          var s = a.offsetTop - o.offsetTop + a.offsetHeight + "px";
          h.push(function () {
            r.style.height = s;
          });
        }
      } else
        h.push(function () {
          r.setAttribute("data-start", String(n)),
            n < i && r.setAttribute("data-end", String(i)),
            (r.style.top = (n - c - 1) * f + g + "px"),
            (r.textContent = new Array(i - n + 2).join(" \n"));
        });
      h.push(function () {
        m.appendChild(r);
      });
    });
    var i = u.id;
    if (p && i) {
      for (var r = "linkable-line-numbers", o = !1, a = u; a; ) {
        if (y(a, r)) {
          o = !0;
          break;
        }
        a = a.parentElement;
      }
      if (o) {
        y(u, r) ||
          h.push(function () {
            u.className = (u.className + " " + r).trim();
          });
        var l = parseInt(u.getAttribute("data-start") || "1");
        v(".line-numbers-rows > span", u).forEach(function (e, t) {
          var n = t + l;
          e.onclick = function () {
            var e = i + "." + n;
            (b = !1),
              (location.hash = e),
              setTimeout(function () {
                b = !0;
              }, 1);
          };
        });
      }
    }
    return function () {
      h.forEach(E);
    };
  }
  function u() {
    var e = location.hash.slice(1);
    v(".temporary.line-highlight").forEach(function (e) {
      e.parentNode.removeChild(e);
    });
    var t = (e.match(/\.([\d,-]+)$/) || [, ""])[1];
    if (t && !document.getElementById(e)) {
      var n = e.slice(0, e.lastIndexOf(".")),
        i = document.getElementById(n);
      if (i)
        i.hasAttribute("data-line") || i.setAttribute("data-line", ""),
          l(i, t, "temporary ")(),
          b &&
            document
              .querySelector(".temporary.line-highlight")
              .scrollIntoView();
    }
  }
})();
!(function () {
  if ("undefined" != typeof self && self.Prism && self.document) {
    var o = "line-numbers",
      a = /\n(?!$)/g,
      e = (Prism.plugins.lineNumbers = {
        getLine: function (e, n) {
          if ("PRE" === e.tagName && e.classList.contains(o)) {
            var t = e.querySelector(".line-numbers-rows");
            if (t) {
              var i = parseInt(e.getAttribute("data-start"), 10) || 1,
                r = i + (t.children.length - 1);
              n < i && (n = i), r < n && (n = r);
              var s = n - i;
              return t.children[s];
            }
          }
        },
        resize: function (e) {
          u([e]);
        },
        assumeViewportIndependence: !0,
      }),
      t = function (e) {
        return e
          ? window.getComputedStyle
            ? getComputedStyle(e)
            : e.currentStyle || null
          : null;
      },
      n = void 0;
    window.addEventListener("resize", function () {
      (e.assumeViewportIndependence && n === window.innerWidth) ||
        ((n = window.innerWidth),
        u(Array.prototype.slice.call(document.querySelectorAll("pre." + o))));
    }),
      Prism.hooks.add("complete", function (e) {
        if (e.code) {
          var n = e.element,
            t = n.parentNode;
          if (
            t &&
            /pre/i.test(t.nodeName) &&
            !n.querySelector(".line-numbers-rows") &&
            Prism.util.isActive(n, o)
          ) {
            n.classList.remove(o), t.classList.add(o);
            var i,
              r = e.code.match(a),
              s = r ? r.length + 1 : 1,
              l = new Array(s + 1).join("<span></span>");
            (i = document.createElement("span")).setAttribute(
              "aria-hidden",
              "true"
            ),
              (i.className = "line-numbers-rows"),
              (i.innerHTML = l),
              t.hasAttribute("data-start") &&
                (t.style.counterReset =
                  "linenumber " +
                  (parseInt(t.getAttribute("data-start"), 10) - 1)),
              e.element.appendChild(i),
              u([t]),
              Prism.hooks.run("line-numbers", e);
          }
        }
      }),
      Prism.hooks.add("line-numbers", function (e) {
        (e.plugins = e.plugins || {}), (e.plugins.lineNumbers = !0);
      });
  }
  function u(e) {
    if (
      0 !=
      (e = e.filter(function (e) {
        var n = t(e)["white-space"];
        return "pre-wrap" === n || "pre-line" === n;
      })).length
    ) {
      var n = e
        .map(function (e) {
          var n = e.querySelector("code"),
            t = e.querySelector(".line-numbers-rows");
          if (n && t) {
            var i = e.querySelector(".line-numbers-sizer"),
              r = n.textContent.split(a);
            i ||
              (((i = document.createElement("span")).className =
                "line-numbers-sizer"),
              n.appendChild(i)),
              (i.innerHTML = "0"),
              (i.style.display = "block");
            var s = i.getBoundingClientRect().height;
            return (
              (i.innerHTML = ""),
              {
                element: e,
                lines: r,
                lineHeights: [],
                oneLinerHeight: s,
                sizer: i,
              }
            );
          }
        })
        .filter(Boolean);
      n.forEach(function (e) {
        var i = e.sizer,
          n = e.lines,
          r = e.lineHeights,
          s = e.oneLinerHeight;
        (r[n.length - 1] = void 0),
          n.forEach(function (e, n) {
            if (e && 1 < e.length) {
              var t = i.appendChild(document.createElement("span"));
              (t.style.display = "block"), (t.textContent = e);
            } else r[n] = s;
          });
      }),
        n.forEach(function (e) {
          for (
            var n = e.sizer, t = e.lineHeights, i = 0, r = 0;
            r < t.length;
            r++
          )
            void 0 === t[r] &&
              (t[r] = n.children[i++].getBoundingClientRect().height);
        }),
        n.forEach(function (e) {
          var n = e.sizer,
            t = e.element.querySelector(".line-numbers-rows");
          (n.style.display = "none"),
            (n.innerHTML = ""),
            e.lineHeights.forEach(function (e, n) {
              t.children[n].style.height = e + "px";
            });
        });
    }
  }
})();
"undefined" != typeof self &&
  self.Prism &&
  self.document &&
  Prism.hooks.add("before-sanity-check", function (e) {
    if (e.code) {
      var s = e.element.parentNode,
        n = /(?:^|\s)keep-initial-line-feed(?:\s|$)/;
      !s ||
        "pre" !== s.nodeName.toLowerCase() ||
        n.test(s.className) ||
        n.test(e.element.className) ||
        (e.code = e.code.replace(/^(?:\r?\n|\r)/, ""));
    }
  });
!(function () {
  var i =
    Object.assign ||
    function (e, n) {
      for (var t in n) n.hasOwnProperty(t) && (e[t] = n[t]);
      return e;
    };
  function e(e) {
    this.defaults = i({}, e);
  }
  function s(e) {
    for (var n = 0, t = 0; t < e.length; ++t)
      e.charCodeAt(t) == "\t".charCodeAt(0) && (n += 3);
    return e.length + n;
  }
  (e.prototype = {
    setDefaults: function (e) {
      this.defaults = i(this.defaults, e);
    },
    normalize: function (e, n) {
      for (var t in (n = i(this.defaults, n))) {
        var r = t.replace(/-(\w)/g, function (e, n) {
          return n.toUpperCase();
        });
        "normalize" !== t &&
          "setDefaults" !== r &&
          n[t] &&
          this[r] &&
          (e = this[r].call(this, e, n[t]));
      }
      return e;
    },
    leftTrim: function (e) {
      return e.replace(/^\s+/, "");
    },
    rightTrim: function (e) {
      return e.replace(/\s+$/, "");
    },
    tabsToSpaces: function (e, n) {
      return (n = 0 | n || 4), e.replace(/\t/g, new Array(++n).join(" "));
    },
    spacesToTabs: function (e, n) {
      return (n = 0 | n || 4), e.replace(RegExp(" {" + n + "}", "g"), "\t");
    },
    removeTrailing: function (e) {
      return e.replace(/\s*?$/gm, "");
    },
    removeInitialLineFeed: function (e) {
      return e.replace(/^(?:\r?\n|\r)/, "");
    },
    removeIndent: function (e) {
      var n = e.match(/^[^\S\n\r]*(?=\S)/gm);
      return n && n[0].length
        ? (n.sort(function (e, n) {
            return e.length - n.length;
          }),
          n[0].length ? e.replace(RegExp("^" + n[0], "gm"), "") : e)
        : e;
    },
    indent: function (e, n) {
      return e.replace(/^[^\S\n\r]*(?=\S)/gm, new Array(++n).join("\t") + "$&");
    },
    breakLines: function (e, n) {
      n = !0 === n ? 80 : 0 | n || 80;
      for (var t = e.split("\n"), r = 0; r < t.length; ++r)
        if (!(s(t[r]) <= n)) {
          for (var i = t[r].split(/(\s+)/g), o = 0, a = 0; a < i.length; ++a) {
            var l = s(i[a]);
            n < (o += l) && ((i[a] = "\n" + i[a]), (o = l));
          }
          t[r] = i.join("");
        }
      return t.join("\n");
    },
  }),
    "undefined" != typeof module && module.exports && (module.exports = e),
    "undefined" != typeof Prism &&
      ((Prism.plugins.NormalizeWhitespace = new e({
        "remove-trailing": !0,
        "remove-indent": !0,
        "left-trim": !0,
        "right-trim": !0,
      })),
      Prism.hooks.add("before-sanity-check", function (e) {
        var n = Prism.plugins.NormalizeWhitespace;
        if (
          (!e.settings || !1 !== e.settings["whitespace-normalization"]) &&
          Prism.util.isActive(e.element, "whitespace-normalization", !0)
        )
          if ((e.element && e.element.parentNode) || !e.code) {
            var t = e.element.parentNode;
            if (e.code && t && "pre" === t.nodeName.toLowerCase()) {
              for (
                var r = t.childNodes, i = "", o = "", a = !1, l = 0;
                l < r.length;
                ++l
              ) {
                var s = r[l];
                s == e.element
                  ? (a = !0)
                  : "#text" === s.nodeName &&
                    (a ? (o += s.nodeValue) : (i += s.nodeValue),
                    t.removeChild(s),
                    --l);
              }
              if (e.element.children.length && Prism.plugins.KeepMarkup) {
                var c = i + e.element.innerHTML + o;
                (e.element.innerHTML = n.normalize(c, e.settings)),
                  (e.code = e.element.textContent);
              } else
                (e.code = i + e.code + o),
                  (e.code = n.normalize(e.code, e.settings));
            }
          } else e.code = n.normalize(e.code, e.settings);
      }));
})();
