const fs = require('fs');
const html = fs.readFileSync('invest-today.html', 'utf8');

const fallbackRates = `
  const defaultRates = {
    "villas_1": 9.5, "villas_2": 10.5, "villas_3": 11.5, "villas_4": 11.8, "villas_5": 12.0,
    "apartments_1": 9.0, "apartments_2": 10.0, "apartments_3": 10.5, "apartments_4": 10.8, "apartments_5": 11.0,
    "resorts_1": 10.0, "resorts_2": 11.0, "resorts_3": 11.5, "resorts_4": 12.0, "resorts_5": 12.5,
    "commercial_1": 9.5, "commercial_2": 10.5, "commercial_3": 11.5, "commercial_4": 11.8, "commercial_5": 12.0,
    "layouts_1": 10.5, "layouts_2": 11.5, "layouts_3": 12.5, "layouts_4": 12.8, "layouts_5": 13.0
  };
`;

let newHtml = html.replace("let investmentRates = {};", fallbackRates + "\n  let investmentRates = {...defaultRates};");
newHtml = newHtml.replace("const rate = investmentRates[rateKey] || 10.0; // fallback", "const rate = investmentRates[rateKey] || 10.0;");

fs.writeFileSync('invest-today.html', newHtml);
