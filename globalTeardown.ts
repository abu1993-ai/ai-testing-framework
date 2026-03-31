import { printSummary, exportCSV } from './core/testSummary';

async function globalTeardown() {
  printSummary();
  exportCSV();
}

export default globalTeardown;