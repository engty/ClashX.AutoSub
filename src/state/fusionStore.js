const fusionResults = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function storeFusionResult(result) {
  fusionResults.push(clone(result));
}

export function getFusionResults() {
  return fusionResults.map((entry) => clone(entry));
}

export function removeFusionResult(region) {
  const index = fusionResults
    .map((entry) => entry.region)
    .lastIndexOf(region);
  if (index === -1) {
    return undefined;
  }
  const [removed] = fusionResults.splice(index, 1);
  return removed;
}

export function resetFusionResults() {
  fusionResults.length = 0;
}
