/* eslint-disable no-console */
/* Fertility Rate Calculator - Leslie model */

function createZeroMatrix(n) {
  const data = new Float64Array(n * n);
  return { n, data };
}

function setMatrix(m, r, c, v) {
  m.data[r * m.n + c] = v;
}

function getMatrix(m, r, c) {
  return m.data[r * m.n + c];
}

function identitySubDiagonal(m) {
  for (let i = 1; i < m.n; i += 1) {
    setMatrix(m, i, i - 1, 1);
  }
}

function multiplyMatrixVector(m, v) {
  const out = new Float64Array(m.n);
  for (let r = 0; r < m.n; r += 1) {
    let sum = 0;
    const rowStart = r * m.n;
    for (let c = 0; c < m.n; c += 1) {
      sum += m.data[rowStart + c] * v[c];
    }
    out[r] = sum;
  }
  return out;
}

function vectorDot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
}

function vectorNorm(v) {
  return Math.hypot(...v);
}

function multiplyMatrixVectorTranspose(m, v) {
  // returns m^T * v
  const out = new Float64Array(m.n);
  for (let c = 0; c < m.n; c += 1) {
    let sum = 0;
    for (let r = 0; r < m.n; r += 1) {
      sum += m.data[r * m.n + c] * v[r];
    }
    out[c] = sum;
  }
  return out;
}

function l1Normalize(v) {
  const s = v.reduce((a, b) => a + Math.abs(b), 0);
  return new Float64Array(v.map((z) => z / (s || 1)));
}

function powerVector(L, transpose = false, maxIter = 10000, tol = 1e-13) {
  const n = L.n;
  let x = new Float64Array(n).fill(1 / n);
  for (let k = 0; k < maxIter; k += 1) {
    const y = transpose ? multiplyMatrixVectorTranspose(L, x) : multiplyMatrixVector(L, x);
    const yNorm = l1Normalize(y);
    // check convergence in L1
    let diff = 0;
    for (let i = 0; i < n; i += 1) diff += Math.abs(yNorm[i] - x[i]);
    x = yNorm;
    if (diff <= tol) break;
  }
  return x;
}

function dominantEigenLogNorm(L, steps = 5000, burnIn = 500) {
  // Estimate spectral radius via average log growth of a positive vector
  // This avoids periodicity issues in imprimitive Leslie matrices
  const n = L.n;
  let x = new Float64Array(n).fill(1 / n);
  let logSum = 0;
  for (let t = 0; t < steps; t += 1) {
    const y = multiplyMatrixVector(L, x);
    const s = y.reduce((a, b) => a + b, 0);
    if (t >= burnIn) logSum += Math.log(s || 1);
    // Normalize to keep vector well-scaled (sum to 1)
    const invS = 1 / (s || 1);
    for (let i = 0; i < n; i += 1) x[i] = y[i] * invS;
  }
  const avgLog = logSum / Math.max(1, steps - burnIn);
  return Math.exp(avgLog);
}

function buildLeslieMatrix(maxAge, fertilityMap) {
  // fertilityMap: { [age: number]: birthsCount } supports multiple children at a given age
  const n = maxAge + 1;
  const L = createZeroMatrix(n);
  const daughtersFactor = 0.5;

  // fertility row
  Object.entries(fertilityMap).forEach(([ageStr, count]) => {
    const age = Number(ageStr);
    const births = Number(count);
    if (Number.isFinite(age) && Number.isFinite(births) && births > 0 && age >= 0 && age <= maxAge) {
      setMatrix(L, 0, age, daughtersFactor * births);
    }
  });

  // survival sub-diagonal (probability 1)
  identitySubDiagonal(L);

  return L;
}

function solveEulerLotka(maxAge, fertilityMap) {
  // Discrete-time Euler–Lotka: sum_a m(a) * exp(-r*(a+1)) = 1, with m(a)=daughters per female at age a
  // Here survival l(a)=1 for a<=maxAge by assumption
  const daughtersFactor = 0.5;
  const terms = [];
  Object.entries(fertilityMap).forEach(([ageStr, count]) => {
    const age = Number(ageStr);
    const births = Number(count);
    if (Number.isFinite(age) && Number.isFinite(births) && births > 0 && age >= 0 && age <= maxAge) {
      terms.push({ age, m: daughtersFactor * births });
    }
  });
  if (terms.length === 0) return { lambda: 0, r: -Infinity, Td: Infinity };

  function phi(r) {
    let s = 0;
    for (let i = 0; i < terms.length; i += 1) {
      const { age, m } = terms[i];
      s += m * Math.exp(-r * (age + 1));
    }
    return s - 1;
  }

  // Bracket and bisection on r
  let rLow = -10;
  let rHigh = 10;
  let fLow = phi(rLow);
  let fHigh = phi(rHigh);
  // Ensure proper bracketing (phi is strictly decreasing in r)
  if (!(fLow > 0 && fHigh < 0)) {
    // Expand until bracketed or give up after reasonable attempts
    for (let k = 0; k < 60 && !(fLow > 0 && fHigh < 0); k += 1) {
      if (fLow <= 0) {
        rLow -= 5;
        fLow = phi(rLow);
      }
      if (fHigh >= 0) {
        rHigh += 5;
        fHigh = phi(rHigh);
      }
    }
  }

  // If still not bracketed due to numerical issues, fall back to r=0
  if (!(fLow > 0 && fHigh < 0)) {
    const r0 = 0;
    const lambda0 = Math.exp(r0);
    const Td0 = Number.isFinite(r0) && r0 !== 0 ? Math.log(2) / r0 : Infinity;
    return { lambda: lambda0, r: r0, Td: Td0 };
  }

  for (let it = 0; it < 200; it += 1) {
    const mid = 0.5 * (rLow + rHigh);
    const fMid = phi(mid);
    if (Math.abs(fMid) < 1e-14 || Math.abs(rHigh - rLow) < 1e-12) {
      rLow = rHigh = mid;
      break;
    }
    if (fMid > 0) {
      rLow = mid;
      fLow = fMid;
    } else {
      rHigh = mid;
      fHigh = fMid;
    }
  }
  const r = 0.5 * (rLow + rHigh);
  const lambda = Math.exp(r);
  const Td = r !== 0 ? Math.log(2) / r : Infinity;
  return { lambda, r, Td };
}

function calcMetrics(maxAge, fertilityMap) {
  // Prefer exact discrete-time Euler–Lotka solution for this simplified model
  return solveEulerLotka(maxAge, fertilityMap);
}

function projectPopulation(years, maxAge, fertilityMap, initialPop) {
  const L = buildLeslieMatrix(maxAge, fertilityMap);
  const n = L.n;
  let state = new Float64Array(n);
  state[0] = initialPop; // start with newborns only for simplicity
  const series = [initialPop];

  for (let t = 1; t <= years; t += 1) {
    state = multiplyMatrixVector(L, state);
    series.push(state.reduce((a, b) => a + b, 0));
  }
  return series;
}

function makeScenarioId() {
  return `scenario-${Math.random().toString(36).slice(2, 9)}`;
}

function scenarioTemplate(id, name, color) {
  return `
  <div class="scenario" data-id="${id}" style="--color:${color}">
    <div class="row">
      <div class="col">
        <label>Name
          <input type="text" class="sc-name" value="${name}" />
        </label>
      </div>
      <div class="col">
        <label>Color
          <input type="color" class="sc-color" value="${color}" />
        </label>
      </div>
      <div class="col">
        <button class="remove danger">Remove</button>
      </div>
    </div>

    <div class="row" style="margin-top:8px">
      <div class="col" style="min-width:260px;">
        <label>Fertility ages and counts (age:count)
          <div class="age-list" data-role="age-list"></div>
        </label>
        <div style="margin-top:6px;display:flex;gap:6px;">
          <button class="add-age ghost">+ Add age</button>
          <button class="clear-ages secondary">Clear ages</button>
        </div>
      </div>
    </div>

    <div class="row" style="margin-top:8px">
      <button class="update secondary">Update</button>
    </div>

    <div class="row" style="margin-top:8px">
      <div class="metric-card">
        <h3>λ (dominant eigenvalue)</h3>
        <div class="val" data-field="lambda">–</div>
      </div>
      <div class="metric-card">
        <h3>r (%/yr)</h3>
        <div class="val" data-field="r">–</div>
      </div>
      <div class="metric-card">
        <h3>Doubling time (yr)</h3>
        <div class="val" data-field="Td">–</div>
      </div>
    </div>
  </div>
  `;
}

function readFertilityMap(container, maxAge) {
  const items = container.querySelectorAll('.age-item');
  const map = {};
  items.forEach((row) => {
    const age = Number(row.querySelector('.age').value);
    const count = Number(row.querySelector('.count').value);
    if (Number.isFinite(age) && Number.isFinite(count) && age >= 0 && age <= maxAge && count > 0) {
      map[age] = (map[age] || 0) + count; // allow multiple entries per age (twins via count)
    }
  });
  return map;
}

function setupUI() {
  const scenariosEl = document.getElementById('scenarios');
  const metricsEl = document.getElementById('metrics');
  const addBtn = document.getElementById('addScenario');
  const maxAgeEl = document.getElementById('maxAge');
  const yearsEl = document.getElementById('years');
  const initialPopEl = document.getElementById('initialPop');
  const yScaleEl = document.getElementById('yScale');

  // Chart
  const ctx = document.getElementById('projectionChart');
  const chart = new window.Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        y: { type: 'linear', title: { display: true, text: 'Total population' } },
        x: { title: { display: true, text: 'Year' } },
      },
      plugins: { legend: { display: true } },
    },
  });

  function refreshChart() {
    const years = Number(yearsEl.value);
    chart.data.labels = Array.from({ length: years + 1 }, (_, i) => i);
    chart.update();
  }

  function addScenario(name = 'Scenario', color = '#34d399', preset = null) {
    const id = makeScenarioId();
    const html = scenarioTemplate(id, name, color);
    scenariosEl.insertAdjacentHTML('beforeend', html);

    const scEl = scenariosEl.querySelector(`[data-id="${id}"]`);

    const ageList = scEl.querySelector('[data-role="age-list"]');
    function addAgeRow(age = '', count = '') {
      ageList.insertAdjacentHTML('beforeend', `<div class="age-item"><input type="number" class="age" min="0" placeholder="age" value="${age}"/><input type="number" class="count" min="0" step="0.1" placeholder="count" value="${count}"/></div>`);
    }
    scEl.querySelector('.add-age').addEventListener('click', () => {
      addAgeRow();
    });
    scEl.querySelector('.clear-ages').addEventListener('click', () => {
      ageList.innerHTML = '';
      updateScenario(scEl);
      updateAll();
    });

    scEl.querySelector('.remove').addEventListener('click', () => {
      scEl.remove();
      updateAll();
    });

    scEl.querySelector('.update').addEventListener('click', () => {
      updateScenario(scEl);
      updateAll();
    });

    // live updates when inputs change
    scEl.addEventListener('input', (e) => {
      if (e.target && (e.target.classList.contains('age') || e.target.classList.contains('count') || e.target.classList.contains('sc-name') || e.target.classList.contains('sc-color'))) {
        updateScenario(scEl);
        updateAll();
      }
    });

    // Seed ages
    ageList.innerHTML = '';
    if (Array.isArray(preset) && preset.length > 0) {
      preset.forEach(([age, count]) => addAgeRow(age, count));
    } else {
      [24, 26, 28].forEach((a) => addAgeRow(a, 1));
    }

    updateScenario(scEl);
    updateAll();
  }

  function updateScenario(scEl) {
    const maxAge = Number(maxAgeEl.value);
    const fert = readFertilityMap(scEl, maxAge);
    const { lambda, r, Td } = calcMetrics(maxAge, fert);

    scEl.querySelector('[data-field="lambda"]').textContent = isFinite(lambda) ? lambda.toFixed(6) : '–';
    scEl.querySelector('[data-field="r"]').textContent = isFinite(r) ? (r * 100).toFixed(4) : '–';
    scEl.querySelector('[data-field="Td"]').textContent = isFinite(Td) ? Td.toFixed(2) : '–';

    scEl.dataset.lambda = String(lambda);
    scEl.dataset.r = String(r);
    scEl.dataset.Td = String(Td);
  }

  function updateAll() {
    const years = Number(yearsEl.value);
    const maxAge = Number(maxAgeEl.value);
    const initialPop = Number(initialPopEl.value);

    const datasets = [];
    metricsEl.innerHTML = '';

    scenariosEl.querySelectorAll('.scenario').forEach((scEl, idx) => {
      const name = scEl.querySelector('.sc-name').value || `Scenario ${idx + 1}`;
      const color = scEl.querySelector('.sc-color').value || '#60a5fa';
      const fert = readFertilityMap(scEl, maxAge);
      const series = projectPopulation(years, maxAge, fert, initialPop);

      datasets.push({
        label: name,
        data: series,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
      });

      const { lambda, r, Td } = calcMetrics(maxAge, fert);
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML = `<h3>${name}</h3>
        <div class="val">λ=${isFinite(lambda) ? lambda.toFixed(6) : '–'}, r=${isFinite(r) ? (r * 100).toFixed(4) : '–'} %/yr, Td=${isFinite(Td) ? Td.toFixed(2) : '–'} yr</div>`;
      metricsEl.appendChild(card);
    });

    chart.data.datasets = datasets;
    refreshChart();
  }

  addBtn.addEventListener('click', () => addScenario(`Scenario ${scenariosEl.children.length + 1}`, randomColor()));
  [maxAgeEl, yearsEl, initialPopEl].forEach((el) => el.addEventListener('change', () => updateAll()));
  yScaleEl.addEventListener('change', () => {
    const isLog = yScaleEl.value === 'log';
    chart.options.scales.y.type = isLog ? 'logarithmic' : 'linear';
    chart.options.scales.y.title.text = isLog ? 'Total population (log)' : 'Total population';
    chart.update();
  });

  // seed with two example scenarios
  addScenario('Younger (24,26,28)', '#34d399', [[24, 1], [26, 1], [28, 1]]);
  addScenario('Older (38,40,42)', '#60a5fa', [[38, 1], [40, 1], [42, 1]]);
}

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  return hslToHex(h, 0.7, 0.5);
}

window.addEventListener('DOMContentLoaded', setupUI);


