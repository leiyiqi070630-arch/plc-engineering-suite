import { g as v1, r as v2, d as v3 } from "./chunk-6Q2QTUOP-C0jK6__A.js";
import { p as v4 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v5, l as v6 } from "./index-CXb3UsfP.js";
import { M as v7, c as v8 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var langiumParser = v8().Railroad.parser.LangiumParser;
var transformExpression = v5(v9 => {
  switch (v9.$type) {
    case "RailroadTerminalExpr":
      return {
        type: "terminal",
        value: v9.value
      };
    case "RailroadNonTerminalExpr":
      return {
        type: "nonterminal",
        name: v9.name
      };
    case "RailroadSpecialExpr":
      return {
        type: "special",
        text: v9.text
      };
    case "RailroadSequenceExpr":
      {
        const v10 = v9.elements.map(transformExpression);
        if (v10.length === 1) {
          return v10[0];
        } else {
          return {
            type: "sequence",
            elements: v10
          };
        }
      }
    case "RailroadChoiceExpr":
      {
        const v11 = v9.alternatives.map(transformExpression);
        if (v11.length === 1) {
          return v11[0];
        } else {
          return {
            type: "choice",
            alternatives: v11
          };
        }
      }
    case "RailroadOptionalExpr":
      return {
        type: "optional",
        element: transformExpression(v9.element)
      };
    case "RailroadOneOrMoreExpr":
      return {
        type: "repetition",
        element: transformExpression(v9.element),
        min: 1,
        max: Infinity
      };
    case "RailroadZeroOrMoreExpr":
      return {
        type: "repetition",
        element: transformExpression(v9.element),
        min: 0,
        max: Infinity
      };
    default:
      throw new Error("Unsupported railroad expression: " + v9.$type);
  }
}, "transformExpression");
var transformRule = v5(v12 => {
  return {
    name: v12.name,
    definition: transformExpression(v12.definition)
  };
}, "transformRule");
var populateDb = v5(v13 => {
  v4(v13, v3);
  if (v13.title) {
    v3.setTitle(v13.title);
  }
  v13.rules.map(v14 => v3.addRule(transformRule(v14)));
}, "populateDb");
var parser = {
  parse: v5(v15 => {
    v3.clear();
    v6.debug("[Railroad Parser] Starting Langium parse");
    const v16 = langiumParser.parse(v15);
    if (v16.lexerErrors.length > 0 || v16.parserErrors.length > 0) {
      throw new v7(v16);
    }
    const v17 = v16.value;
    v6.debug("[Railroad Parser] Parsed rules:", v17.rules.length);
    populateDb(v17);
    v6.debug("[Railroad Parser] Parse complete");
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