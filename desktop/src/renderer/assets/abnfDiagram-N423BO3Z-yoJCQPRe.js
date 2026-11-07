import { g as v1, r as v2, d as v3 } from "./chunk-6Q2QTUOP-C0jK6__A.js";
import { p as v4 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v5, l as v6 } from "./index-CXb3UsfP.js";
import { M as v7, b as v8 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var langiumParser = v8().RailroadAbnf.parser.LangiumParser;
var transformAlternation = v5(v9 => {
  const v10 = v9.alternatives.map(transformConcatenation);
  if (v10.length === 1) {
    return v10[0];
  }
  return {
    type: "choice",
    alternatives: v10
  };
}, "transformAlternation");
var transformConcatenation = v5(v11 => {
  const v12 = v11.elements.map(transformElement);
  if (v12.length === 1) {
    return v12[0];
  }
  return {
    type: "sequence",
    elements: v12
  };
}, "transformConcatenation");
var parseRepeat = v5(v13 => {
  if (v13.includes("*")) {
    const [v14, v15] = v13.split("*");
    const v16 = v14 ? parseInt(v14, 10) : 0;
    const v17 = v15 ? parseInt(v15, 10) : Infinity;
    return {
      min: v16,
      max: v17
    };
  }
  const v18 = parseInt(v13, 10);
  return {
    min: v18,
    max: v18
  };
}, "parseRepeat");
var transformElement = v5(v19 => {
  const v20 = transformPrimary(v19.primary);
  if (!v19.repeat) {
    return v20;
  }
  const {
    min: v21,
    max: v22
  } = parseRepeat(v19.repeat);
  if (v21 === 0 && v22 === 1) {
    return {
      type: "optional",
      element: v20
    };
  }
  return {
    type: "repetition",
    element: v20,
    min: v21,
    max: v22
  };
}, "transformElement");
var transformPrimary = v5(v23 => {
  switch (v23.$type) {
    case "AbnfStringLiteral":
      return {
        type: "terminal",
        value: v23.value
      };
    case "AbnfNumVal":
      return {
        type: "terminal",
        value: v23.value
      };
    case "AbnfRuleName":
      return {
        type: "nonterminal",
        name: v23.name
      };
    case "AbnfGroup":
      return transformAlternation(v23.element);
    case "AbnfOptionalGroup":
      return {
        type: "optional",
        element: transformAlternation(v23.element)
      };
    default:
      throw new Error("Unsupported ABNF primary node: " + v23.$type);
  }
}, "transformPrimary");
var transformRule = v5(v24 => {
  return {
    name: v24.name,
    definition: transformAlternation(v24.definition)
  };
}, "transformRule");
var populateDb = v5(v25 => {
  v4(v25, v3);
  if (v25.title) {
    v3.setTitle(v25.title);
  }
  v25.rules.map(v26 => v3.addRule(transformRule(v26)));
}, "populateDb");
var parser = {
  parse: v5(v27 => {
    v3.clear();
    v6.debug("[ABNF Parser] Starting Langium parse");
    const v28 = langiumParser.parse(v27);
    if (v28.lexerErrors.length > 0 || v28.parserErrors.length > 0) {
      throw new v7(v28);
    }
    const v29 = v28.value;
    v6.debug("[ABNF Parser] Parsed rules:", v29.rules.length);
    populateDb(v29);
    v6.debug("[ABNF Parser] Parse complete");
  }, "parse"),
  parser: {
    yy: v3
  }
};
var diagram = {
  parser: parser,
  db: v3,
  renderer: v2,
  styles: v1
};
export { diagram };