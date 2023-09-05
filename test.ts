import ChemicalElement from "./src/batr/common/ChemicalElement";
console.log(ChemicalElement.getElementFromSample("H"));
let el = ChemicalElement.getElementFromSample("Pb") as ChemicalElement;
console.log(el.sample_CN);