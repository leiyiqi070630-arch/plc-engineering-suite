import { g as v1, r as v2, d as v3 } from "./chunk-6Q2QTUOP-C0jK6__A.js";
import { p as v4 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v5, l as v6 } from "./index-CXb3UsfP.js";
import { M as v7, a as v8 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var langiumParser = v8().RailroadEbnf.parser.LangiumParser;
var transformChoice = v5(v9 => {
  const v10 = v9.alternatives.map(transformSequence);
  if (v10.length === 1) {
    return v10[0];
  }
  return {
    type: "choice",
    alternatives: v10
  };
}, "transformChoice");
var transformSequence = v5(v11 => {
  const v12 = v11.elements.map(transformTerm);
  if (v12.length === 1) {
    return v12[0];
  }
  return {
    type: "sequence",
    elements: v12
  };
}, "transformSequence");
var transformPrimary = v5(v13 => {
  switch (v13.$type) {
    case "EbnfTerminal":
      return {
        type: "terminal",
        value: v13.value
      };
    case "EbnfNonTerminal":
      return {
        type: "nonterminal",
        name: v13.name
      };
    case "EbnfSpecial":
      return {
        type: "special",
        text: v13.text
      };
    case "EbnfGroup":
      return transformChoice(v13.element);
    case "EbnfOptional":
      return {
        type: "optional",
        element: transformChoice(v13.element)
      };
    case "EbnfRepetition":
      return {
        type: "repetition",
        element: transformChoice(v13.element),
        min: 0,
        max: Infinity
      };
    default:
      throw new Error("Unsupported EBNF primary node: " + v13.$type);
  }
}, "transformPrimary");
var transformPostfix = v5((v14, v15) => {
  switch (v15.$type) {
    case "EbnfOptionalPostfix":
      return {
        type: "optional",
        element: v14
      };
    case "EbnfZeroOrMorePostfix":
      return {
        type: "repetition",
        element: v14,
        min: 0,
        max: Infinity
      };
    case "EbnfOneOrMorePostfix":
      return {
        type: "repetition",
        element: v14,
        min: 1,
        max: Infinity
      };
    case "EbnfExceptionPostfix":
      return {
        type: "sequence",
        elements: [v14, {
          type: "terminal",
          value: "-"
        }, transformPrimary(v15.except)]
      };
    default:
      throw new Error("Unsupported EBNF postfix node: " + v15.$type);
  }
}, "transformPostfix");
var transformTerm = v5(v16 => {
  return v16.postfixes.reduce((v17, v18) => {
    return transformPostfix(v17, v18);
  }, transformPrimary(v16.base));
}, "transformTerm");
var transformRule = v5(v19 => {
  return {
    name: v19.name,
    definition: transformChoice(v19.definition)
  };
}, "transformRule");
var populateDb = v5(v20 => {
  v4(v20, v3);
  if (v20.title) {
    v3.setTitle(v20.title);
  }
  v20.rules.map(v21 => v3.addRule(transformRule(v21)));
}, "populateDb");
var parser = {
  parse: v5(v22 => {
    v3.clear();
    v6.debug("[EBNF Parser] Starting Langium parse");
    const v23 = langiumParser.parse(v22);
    if (v23.lexerErrors.length > 0 || v23.parserErrors.length > 0) {
      throw new v7(v23);
    }
    const v24 = v23.value;
    v6.debug("[EBNF Parser] Parsed rules:", v24.rules.length);
    populateDb(v24);
    v6.debug("[EBNF Parser] Parse complete");
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