import { g as v1, r as v2, d as v3 } from "./chunk-6Q2QTUOP-C0jK6__A.js";
import { p as v4 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v5, l as v6 } from "./index-CXb3UsfP.js";
import { M as v7, d as v8 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var langiumParser = v8().RailroadPeg.parser.LangiumParser;
var transformOrderedChoice = v5(v9 => {
  const v10 = v9.alternatives.map(transformSequence);
  if (v10.length === 1) {
    return v10[0];
  }
  return {
    type: "choice",
    alternatives: v10
  };
}, "transformOrderedChoice");
var transformSequence = v5(v11 => {
  const v12 = v11.elements.map(transformPrefix);
  if (v12.length === 1) {
    return v12[0];
  }
  return {
    type: "sequence",
    elements: v12
  };
}, "transformSequence");
var transformPrefix = v5(v13 => {
  const v14 = transformSuffix(v13.suffix);
  if (!v13.operator) {
    return v14;
  }
  const v15 = v13.operator === "&" ? "&" + nodeToLabel(v14) : "!" + nodeToLabel(v14);
  return {
    type: "special",
    text: v15
  };
}, "transformPrefix");
var nodeToLabel = v5(v16 => {
  switch (v16.type) {
    case "terminal":
      return "\"" + v16.value + "\"";
    case "nonterminal":
      return v16.name;
    case "special":
      return v16.text;
    default:
      return "(...)";
  }
}, "nodeToLabel");
var transformSuffix = v5(v17 => {
  const v18 = transformPrimary(v17.primary);
  if (!v17.operator) {
    return v18;
  }
  switch (v17.operator) {
    case "?":
      return {
        type: "optional",
        element: v18
      };
    case "*":
      return {
        type: "repetition",
        element: v18,
        min: 0,
        max: Infinity
      };
    case "+":
      return {
        type: "repetition",
        element: v18,
        min: 1,
        max: Infinity
      };
    default:
      throw new Error("Unsupported PEG suffix operator: " + v17.operator);
  }
}, "transformSuffix");
var transformPrimary = v5(v19 => {
  switch (v19.$type) {
    case "PegLiteral":
      return {
        type: "terminal",
        value: v19.value
      };
    case "PegIdentifier":
      return {
        type: "nonterminal",
        name: v19.name
      };
    case "PegGroup":
      return transformOrderedChoice(v19.element);
    case "PegAny":
      return {
        type: "special",
        text: v19.dot
      };
    default:
      throw new Error("Unsupported PEG primary node: " + v19.$type);
  }
}, "transformPrimary");
var transformRule = v5(v20 => {
  return {
    name: v20.name,
    definition: transformOrderedChoice(v20.definition)
  };
}, "transformRule");
var populateDb = v5(v21 => {
  v4(v21, v3);
  if (v21.title) {
    v3.setTitle(v21.title);
  }
  v21.rules.map(v22 => v3.addRule(transformRule(v22)));
}, "populateDb");
var parser = {
  parse: v5(v23 => {
    v3.clear();
    v6.debug("[PEG Parser] Starting Langium parse");
    const v24 = langiumParser.parse(v23);
    if (v24.lexerErrors.length > 0 || v24.parserErrors.length > 0) {
      throw new v7(v24);
    }
    const v25 = v24.value;
    v6.debug("[PEG Parser] Parsed rules:", v25.rules.length);
    populateDb(v25);
    v6.debug("[PEG Parser] Parse complete");
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