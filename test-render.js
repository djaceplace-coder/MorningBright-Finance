const origEnv = typeof process !== 'undefined' ? process.env : {};
globalThis.import = { meta: { env: origEnv } };

import React from 'react';
import { renderToString } from 'react-dom/server';
import { CardsView } from './src/components/CardsView';
import { SavingsView } from './src/components/SavingsView';
import { SupportView } from './src/components/SupportView';

try {
  renderToString(React.createElement(CardsView));
  console.log("CardsView OK");
} catch (e) {
  console.error("CardsView Error:", e);
}
try {
  renderToString(React.createElement(SavingsView));
  console.log("SavingsView OK");
} catch (e) {
  console.error("SavingsView Error:", e);
}
try {
  renderToString(React.createElement(SupportView));
  console.log("SupportView OK");
} catch (e) {
  console.error("SupportView Error:", e);
}
