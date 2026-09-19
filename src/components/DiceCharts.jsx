'use client';

import React, { useMemo, useState } from 'react';
import {
  aggregate,
  expectedSumProbabilities,
  faceFairness,
  fairnessVerdict,
} from '@/lib/diceStats';

/* ------------------------------------------------------------------ */
/*  Chart primitives                                                   */
/* ------------------------------------------------------------------ */

const VB_W = 640;
const PAD = { l: 44, r: 16, t: 16, b: 34 };

// Round a max up to a readable tick interval. Every y-axis here counts rolls,
// so the step is clamped to whole numbers — no "0.5 rolls" tick.
function niceScale(max, targetTicks = 4) {
  if (max <= 0) return { max: 1, ticks: [0, 1] };
  const raw = max / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = Math.max(1, Math.round((norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag));
  let top = Math.ceil(max / step) * step;
  // Guarantee headroom above the tallest bar, otherwise the direct value label
  // sitting above its tip gets clipped by the top of the plot.
  if (top <= max) top += step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { max: top, ticks };
}

// Column with a rounded data-end and a square baseline.
function columnPath(x, y, w, h, r = 4) {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

function Gridlines({ ticks, scaleY, x0, x1 }) {
  return (
    <g>
      {ticks.map((t) => (
        <line
          key={t}
          x1={x0}
          x2={x1}
          y1={scaleY(t)}
          y2={scaleY(t)}
          className="viz-grid"
        />
      ))}
    </g>
  );
}

function Legend({ items }) {
  if (items.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[11px] viz-ink-2">
          {it.kind === 'line' ? (
            <span
              className="inline-block w-4 h-0.5 rounded-full"
              style={{ background: it.color }}
            />
          ) : it.kind === 'dot' ? (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: it.color }}
            />
          ) : it.kind === 'rule' ? (
            <span
              className="inline-block w-4 h-0 border-t-2"
              style={{ borderColor: it.color, borderTopStyle: 'solid' }}
            />
          ) : (
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: it.color }}
            />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Tooltip({ tip }) {
  if (!tip) return null;
  return (
    <div
      className="viz-tooltip"
      style={{
        left: `${tip.xPct}%`,
        top: `${tip.yPct}%`,
        transform: `translate(${tip.xPct > 70 ? '-100%' : tip.xPct < 12 ? '0%' : '-50%'}, -120%)`,
      }}
    >
      <div className="font-semibold viz-ink-1">{tip.title}</div>
      {tip.rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-3 viz-ink-2">
          <span>{r.label}</span>
          <span className="tabular-nums viz-ink-1">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Sum distribution — observed vs expected                         */
/* ------------------------------------------------------------------ */

function DistributionChart({ agg, diceCount }) {
  const [tip, setTip] = useState(null);
  const VB_H = 250;

  const expectedP = useMemo(
    () => expectedSumProbabilities(diceCount),
    [diceCount]
  );

  const cats = Object.keys(agg.sums).map(Number).sort((a, b) => a - b);
  const observed = cats.map((s) => agg.sums[s]);
  const expected = cats.map((s) => (expectedP[s] || 0) * agg.total);

  const { max: yMax, ticks } = niceScale(Math.max(1, ...observed, ...expected));

  const x0 = PAD.l;
  const x1 = VB_W - PAD.r;
  const y0 = VB_H - PAD.b;
  const y1 = PAD.t;
  const plotW = x1 - x0;
  const scaleY = (v) => y0 - (v / yMax) * (y0 - y1);

  const band = plotW / cats.length;
  const barW = Math.min(24, band - 2); // 2px surface gap between neighbours
  const peak = Math.max(...observed);

  return (
    <div className="viz-card">
      <div className="viz-title">Sum distribution</div>
      <div className="viz-sub">
        How often each total came up, against what fair dice predict
      </div>
      <Legend
        items={[
          { label: 'Observed', color: 'var(--series-1)', kind: 'swatch' },
          { label: 'Expected', color: 'var(--viz-ref)', kind: 'rule' },
        ]}
      />
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block">
          <Gridlines ticks={ticks} scaleY={scaleY} x0={x0} x1={x1} />

          {ticks.map((t) => (
            <text key={t} x={x0 - 8} y={scaleY(t) + 4} className="viz-axis" textAnchor="end">
              {t}
            </text>
          ))}

          {cats.map((s, i) => {
            const cx = x0 + band * i + band / 2;
            const bx = cx - barW / 2;
            const h = y0 - scaleY(observed[i]);
            const isPeak = observed[i] === peak && peak > 0;

            return (
              <g key={s}>
                {/* generous invisible hit target */}
                <rect
                  x={x0 + band * i}
                  y={y1}
                  width={band}
                  height={y0 - y1}
                  fill="transparent"
                  onMouseEnter={() =>
                    setTip({
                      xPct: (cx / VB_W) * 100,
                      yPct: (scaleY(Math.max(observed[i], expected[i])) / VB_H) * 100,
                      title: `Sum ${s}`,
                      rows: [
                        { label: 'Rolled', value: `${observed[i]}×` },
                        {
                          label: 'Expected',
                          value: `${expected[i].toFixed(1)}×`,
                        },
                        {
                          label: 'Share',
                          value: agg.total
                            ? `${((observed[i] / agg.total) * 100).toFixed(1)}%`
                            : '—',
                        },
                      ],
                    })
                  }
                  onMouseLeave={() => setTip(null)}
                />

                <path d={columnPath(bx, scaleY(observed[i]), barW, h)} fill="var(--series-1)" />

                {/* expected reference tick */}
                <line
                  x1={bx - 3}
                  x2={bx + barW + 3}
                  y1={scaleY(expected[i])}
                  y2={scaleY(expected[i])}
                  className="viz-ref-line"
                />

                {/* direct-label only the peak */}
                {isPeak && (
                  <text x={cx} y={scaleY(observed[i]) - 7} className="viz-value" textAnchor="middle">
                    {observed[i]}
                  </text>
                )}

                <text x={cx} y={y0 + 16} className="viz-axis" textAnchor="middle">
                  {s}
                </text>
                {diceCount === 2 && s === 7 && (
                  <text x={cx} y={y0 + 29} className="viz-axis-note" textAnchor="middle">
                    robber
                  </text>
                )}
              </g>
            );
          })}

          <line x1={x0} x2={x1} y1={y0} y2={y0} className="viz-axis-line" />
        </svg>
        <Tooltip tip={tip} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Rolls over time                                                 */
/* ------------------------------------------------------------------ */

const DOT_LIMIT = 120;

function TimelineChart({ rolls, diceCount }) {
  const [tip, setTip] = useState(null);
  const VB_H = 230;

  const n = rolls.length;
  const showDots = n > 0 && n <= DOT_LIMIT;

  const runningMean = useMemo(() => {
    let acc = 0;
    return rolls.map((r, i) => {
      acc += r.sum;
      return acc / (i + 1);
    });
  }, [rolls]);

  const yMin = diceCount;
  const yMax = diceCount * 6;
  const expectedMean = diceCount * 3.5;

  const x0 = PAD.l;
  const x1 = VB_W - PAD.r;
  const y0 = VB_H - PAD.b;
  const y1 = PAD.t;

  const scaleX = (i) => (n <= 1 ? (x0 + x1) / 2 : x0 + (i / (n - 1)) * (x1 - x0));
  const scaleY = (v) => y0 - ((v - yMin) / (yMax - yMin)) * (y0 - y1);

  // Pick a step that divides the range exactly, so the last tick lands on yMax
  // instead of being force-appended next to an uneven one (2,5,8,11,12).
  const yTicks = useMemo(() => {
    const range = yMax - yMin;
    let step = range;
    for (const s of [1, 2, 3, 4, 5, 6, 10, 15, 20]) {
      if (range % s === 0 && range / s <= 7) {
        step = s;
        break;
      }
    }
    const out = [];
    for (let v = yMin; v <= yMax; v += step) out.push(v);
    return out;
  }, [yMin, yMax]);

  const meanPath = runningMean
    .map((m, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(m)}`)
    .join(' ');

  const lastMean = runningMean[n - 1];

  const legendItems = [
    { label: 'Running average', color: 'var(--series-1)', kind: 'line' },
    ...(showDots
      ? [{ label: 'Individual roll', color: 'var(--series-2)', kind: 'dot' }]
      : []),
    { label: `Fair average (${expectedMean})`, color: 'var(--viz-ref)', kind: 'rule' },
  ];

  return (
    <div className="viz-card">
      <div className="viz-title">Rolls over time</div>
      <div className="viz-sub">
        {showDots
          ? 'Every roll, with the running average settling toward the fair value'
          : `Running average across all ${n} rolls — individual rolls hidden above ${DOT_LIMIT} for density`}
      </div>
      <Legend items={legendItems} />
      <div className="relative">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block">
          <Gridlines ticks={yTicks} scaleY={scaleY} x0={x0} x1={x1} />
          {yTicks.map((t) => (
            <text key={t} x={x0 - 8} y={scaleY(t) + 4} className="viz-axis" textAnchor="end">
              {t}
            </text>
          ))}

          {/* fair-average reference */}
          <line
            x1={x0}
            x2={x1}
            y1={scaleY(expectedMean)}
            y2={scaleY(expectedMean)}
            className="viz-ref-line"
          />

          {showDots &&
            rolls.map((r, i) => (
              <circle
                key={i}
                cx={scaleX(i)}
                cy={scaleY(r.sum)}
                r={4}
                fill="var(--series-2)"
                className="viz-dot"
                onMouseEnter={() =>
                  setTip({
                    xPct: (scaleX(i) / VB_W) * 100,
                    yPct: (scaleY(r.sum) / VB_H) * 100,
                    title: `Roll ${i + 1}`,
                    rows: [
                      { label: 'Dice', value: r.dice.join(' + ') },
                      { label: 'Sum', value: r.sum },
                      { label: 'Avg so far', value: runningMean[i].toFixed(2) },
                    ],
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            ))}

          {n > 1 && (
            <path d={meanPath} fill="none" stroke="var(--series-1)" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />
          )}

          {n > 0 && (
            <>
              <circle cx={scaleX(n - 1)} cy={scaleY(lastMean)} r={4.5}
                fill="var(--series-1)" className="viz-dot" />
              <text
                x={Math.min(scaleX(n - 1) + 8, x1 - 4)}
                y={scaleY(lastMean) - 8}
                className="viz-value"
                textAnchor={scaleX(n - 1) > x1 - 60 ? 'end' : 'start'}
              >
                {lastMean.toFixed(2)}
              </text>
            </>
          )}

          <line x1={x0} x2={x1} y1={y0} y2={y0} className="viz-axis-line" />
          <text x={x0} y={y0 + 18} className="viz-axis" textAnchor="start">1</text>
          <text x={x1} y={y0 + 18} className="viz-axis" textAnchor="end">{n}</text>
          <text x={(x0 + x1) / 2} y={y0 + 29} className="viz-axis-note" textAnchor="middle">
            roll number
          </text>
        </svg>
        <Tooltip tip={tip} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Per-die faces — small multiples                                 */
/* ------------------------------------------------------------------ */

function DieFacetChart({ counts, index, swatch, total }) {
  const [tip, setTip] = useState(null);
  const W = 210;
  const H = 130;
  const p = { l: 24, r: 8, t: 10, b: 22 };

  const faces = [1, 2, 3, 4, 5, 6];
  const values = faces.map((f) => counts[f] || 0);
  const expected = total / 6;
  const { max: yMax, ticks } = niceScale(Math.max(1, ...values, expected), 2);

  const x0 = p.l;
  const x1 = W - p.r;
  const y0 = H - p.b;
  const y1 = p.t;
  const band = (x1 - x0) / 6;
  const barW = Math.min(18, band - 2);
  const scaleY = (v) => y0 - (v / yMax) * (y0 - y1);

  const fair = faceFairness(counts);
  const verdict = fairnessVerdict(fair);

  return (
    <div className="viz-facet">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-3 h-3 rounded-sm border"
          style={{ background: swatch.body, borderColor: 'rgba(255,255,255,.25)' }}
          aria-hidden="true"
        />
        <span className="text-[11px] viz-ink-1 font-semibold">Die {index + 1}</span>
        <span className={`viz-chip viz-chip--${verdict.tone}`}>{verdict.label}</span>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <Gridlines ticks={ticks} scaleY={scaleY} x0={x0} x1={x1} />
          {ticks.map((t) => (
            <text key={t} x={x0 - 5} y={scaleY(t) + 3} className="viz-axis-sm" textAnchor="end">
              {t}
            </text>
          ))}

          {faces.map((f, i) => {
            const cx = x0 + band * i + band / 2;
            const bx = cx - barW / 2;
            const h = y0 - scaleY(values[i]);
            return (
              <g key={f}>
                <rect
                  x={x0 + band * i} y={y1} width={band} height={y0 - y1}
                  fill="transparent"
                  onMouseEnter={() =>
                    setTip({
                      xPct: (cx / W) * 100,
                      yPct: (scaleY(values[i]) / H) * 100,
                      title: `Die ${index + 1} · face ${f}`,
                      rows: [
                        { label: 'Rolled', value: `${values[i]}×` },
                        { label: 'Expected', value: `${expected.toFixed(1)}×` },
                      ],
                    })
                  }
                  onMouseLeave={() => setTip(null)}
                />
                <path d={columnPath(bx, scaleY(values[i]), barW, h, 3)} fill="var(--series-1)" />
                <text x={cx} y={y0 + 13} className="viz-axis-sm" textAnchor="middle">{f}</text>
              </g>
            );
          })}

          <line x1={x0} x2={x1} y1={scaleY(expected)} y2={scaleY(expected)} className="viz-ref-line" />
          <line x1={x0} x2={x1} y1={y0} y2={y0} className="viz-axis-line" />
        </svg>
        <Tooltip tip={tip} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat tiles                                                         */
/* ------------------------------------------------------------------ */

function StatTile({ label, value, note, tone = 'neutral' }) {
  return (
    <div className="viz-tile">
      <div className="viz-tile__label">{label}</div>
      <div className={`viz-tile__value viz-tone--${tone}`}>{value}</div>
      {note && <div className="viz-tile__note">{note}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table view (accessibility fallback)                                */
/* ------------------------------------------------------------------ */

function TableView({ agg, diceCount }) {
  const expectedP = expectedSumProbabilities(diceCount);
  const cats = Object.keys(agg.sums).map(Number).sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto">
      <table className="viz-table">
        <thead>
          <tr>
            <th>Sum</th>
            <th>Rolled</th>
            <th>Observed %</th>
            <th>Expected %</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((s) => {
            const obs = agg.sums[s];
            const op = agg.total ? (obs / agg.total) * 100 : 0;
            const ep = (expectedP[s] || 0) * 100;
            const d = op - ep;
            return (
              <tr key={s}>
                <td>{s}</td>
                <td className="tabular-nums">{obs}</td>
                <td className="tabular-nums">{op.toFixed(1)}%</td>
                <td className="tabular-nums">{ep.toFixed(1)}%</td>
                <td className="tabular-nums">
                  {agg.total ? `${d > 0 ? '+' : ''}${d.toFixed(1)}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="tabular-nums">{agg.total}</td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

export default function DiceCharts({ rolls, diceCount, palettes, onExportCSV, onExportJSON, onClear }) {
  const [view, setView] = useState('charts');

  const agg = useMemo(() => aggregate(rolls, diceCount), [rolls, diceCount]);
  const fair = useMemo(() => faceFairness(agg.allFaces), [agg.allFaces]);
  const verdict = fairnessVerdict(fair);

  const hottest = useMemo(() => {
    const entries = Object.entries(agg.sums);
    if (!agg.total) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  }, [agg]);

  const isEmpty = rolls.length === 0;

  return (
    <div className="viz-root">
      {/* Controls row. Export stays reachable even with nothing at this dice
          count — the log may still hold rolls made with a different number. */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1">
          {!isEmpty &&
            ['charts', 'table'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`viz-toggle ${view === v ? 'viz-toggle--on' : ''}`}
              >
                {v === 'charts' ? 'Charts' : 'Table'}
              </button>
            ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExportCSV} className="viz-btn">⬇ CSV</button>
          <button onClick={onExportJSON} className="viz-btn">⬇ JSON</button>
          <button onClick={onClear} className="viz-btn viz-btn--quiet">Clear log</button>
        </div>
      </div>

      {isEmpty && (
        <div className="viz-empty">
          No rolls logged for {diceCount} {diceCount === 1 ? 'die' : 'dice'} yet — roll a
          few and the charts will fill in.
        </div>
      )}

      {/* Stat tiles */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 ${isEmpty ? 'hidden' : ''}`}>
        <StatTile label="Rolls logged" value={agg.total} />
        <StatTile
          label="Average roll"
          value={agg.mean.toFixed(2)}
          note={`fair value ${agg.expectedMean}`}
        />
        <StatTile
          label="Hottest number"
          value={hottest ? hottest[0] : '—'}
          note={hottest ? `${hottest[1]} of ${agg.total} rolls` : ''}
        />
        <StatTile
          label="Fairness test"
          value={verdict.label}
          tone={verdict.tone}
          note={
            Number.isNaN(fair.p)
              ? `${fair.total} face samples`
              : `χ²=${fair.chi2.toFixed(1)}, p=${fair.p.toFixed(2)}`
          }
        />
      </div>

      {isEmpty ? null : view === 'charts' ? (
        <div className="space-y-4">
          <DistributionChart agg={agg} diceCount={diceCount} />
          <TimelineChart rolls={rolls} diceCount={diceCount} />

          <div className="viz-card">
            <div className="viz-title">Each die on its own</div>
            <div className="viz-sub">
              Face counts per physical die — a die that is genuinely loaded shows up here,
              not in the totals
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
              {agg.perDie.map((counts, i) => (
                <DieFacetChart
                  key={i}
                  counts={counts}
                  index={i}
                  total={agg.total}
                  swatch={palettes[i % palettes.length]}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="viz-card">
          <div className="viz-title">Sum distribution</div>
          <div className="viz-sub">The same data as the chart, as numbers</div>
          <TableView agg={agg} diceCount={diceCount} />
        </div>
      )}
    </div>
  );
}
