'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CatanTable from '@/components/catan/CatanTable';
import DiceCharts from '@/components/DiceCharts';
import { rollDie } from '@/lib/dice';
import { toCSV, toJSON } from '@/lib/diceStats';
import {
  PHASES,
  MIN_PLAYERS,
  MAX_PLAYERS,
  makePlayers,
  initialSeats,
  swapSeats,
  rotateSeats,
  buildTurnOrder,
  snakeOrder,
  resolveRollOff,
  advanceTurn,
  playerRollStats,
} from '@/lib/catanGame';

const SETTLE_MS = 1900;
const STATE_KEY = 'catan-game-state';

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */

function loadState() {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.players) || s.players.length === 0) return null;
    if (!Array.isArray(s.seats) || s.seats.length !== s.players.length) return null;
    // Seats must be a permutation of the player ids, or the table breaks.
    const ids = new Set(s.players.map((p) => p.id));
    if (s.seats.some((id) => !ids.has(id)) || new Set(s.seats).size !== s.seats.length) {
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function saveState(s) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    /* private mode / quota — the game still runs in memory */
  }
}

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

function Swatch({ color, size = 14 }) {
  return (
    <span
      className="inline-block rounded-sm border border-white/30 shrink-0"
      style={{ background: color.body, width: size, height: size }}
      aria-hidden="true"
    />
  );
}

function Btn({ children, onClick, disabled, variant = 'default', className = '', ...rest }) {
  const base =
    'px-4 py-2 text-sm font-bold border-[3px] transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    default:
      'border-[var(--theme-border)] bg-[var(--theme-panel)] text-[var(--theme-text)] hover:bg-[var(--theme-panel-hover)]',
    primary:
      'border-[var(--theme-border)] bg-[var(--theme-button)] text-[var(--theme-button-text)] hover:bg-[var(--theme-button-hover)] active:translate-y-[2px]',
    quiet:
      'border-[var(--theme-border-dark)] bg-transparent text-[var(--theme-muted)] hover:text-[var(--theme-accent)]',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children, note }) {
  return (
    <div className="text-center mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-accent)]">{children}</h2>
      {note && <p className="text-xs mt-1 text-[var(--theme-muted)]">{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function CatanGame() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState(PHASES.WELCOME);

  const [players, setPlayers] = useState([]);
  const [seats, setSeats] = useState([]);
  const [tableRotation, setTableRotation] = useState(0);
  const [direction, setDirection] = useState(1);
  const [swapPick, setSwapPick] = useState(null);

  const [nameDraft, setNameDraft] = useState(['', '']);

  // roll-off
  const [rollOffRolls, setRollOffRolls] = useState({});
  const [contenders, setContenders] = useState([]);
  const [rollOffIdx, setRollOffIdx] = useState(0);
  const [rollOffNote, setRollOffNote] = useState('');

  const [firstSeat, setFirstSeat] = useState(0);
  const [placementIdx, setPlacementIdx] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [rolledThisTurn, setRolledThisTurn] = useState(false);

  const [log, setLog] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // dice
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [rollId, setRollId] = useState(0);
  const [rolling, setRolling] = useState(false);
  const rollingRef = useRef(false);
  const timerRef = useRef(null);

  /* ---------------- derived ---------------- */

  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const seatedPlayers = useMemo(
    () => seats.map((id) => byId[id]).filter(Boolean),
    [seats, byId]
  );
  const turnOrder = useMemo(
    () => buildTurnOrder(seats, firstSeat, direction),
    [seats, firstSeat, direction]
  );
  const placementOrder = useMemo(() => snakeOrder(turnOrder), [turnOrder]);

  const activeId =
    phase === PHASES.PLAY
      ? turnOrder[turnIndex]
      : phase === PHASES.PLACEMENT
        ? placementOrder[placementIdx]
        : phase === PHASES.ROLL_OFF
          ? contenders[rollOffIdx]
          : null;

  const nextId =
    phase === PHASES.PLAY
      ? turnOrder[(turnIndex + 1) % Math.max(turnOrder.length, 1)]
      : phase === PHASES.PLACEMENT
        ? placementOrder[placementIdx + 1]
        : null;

  const activePlayer = activeId ? byId[activeId] : null;

  /* ---------------- persistence ---------------- */

  useEffect(() => {
    const s = loadState();
    if (s) {
      setPhase(s.phase ?? PHASES.WELCOME);
      setPlayers(s.players);
      setSeats(s.seats);
      setTableRotation(s.tableRotation ?? 0);
      setDirection(s.direction ?? 1);
      setFirstSeat(s.firstSeat ?? 0);
      setPlacementIdx(s.placementIdx ?? 0);
      setTurnIndex(s.turnIndex ?? 0);
      setRound(s.round ?? 1);
      setRolledThisTurn(s.rolledThisTurn ?? false);
      setRollOffNote(s.rollOffNote ?? '');
      setLog(Array.isArray(s.log) ? s.log : []);
      setDiceValues(Array.isArray(s.diceValues) ? s.diceValues : [1, 1]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || players.length === 0) return;
    saveState({
      phase, players, seats, tableRotation, direction, firstSeat,
      placementIdx, turnIndex, round, rolledThisTurn, rollOffNote, log, diceValues,
    });
  }, [ready, phase, players, seats, tableRotation, direction, firstSeat,
      placementIdx, turnIndex, round, rolledThisTurn, rollOffNote, log, diceValues]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /* ---------------- dice ---------------- */

  /**
   * Roll two dice. `attribute` decides whether the result is written to the
   * game log — roll-off throws are not part of the game's roll history.
   */
  const throwDice = useCallback(
    (onSettled, attribute) => {
      if (rollingRef.current) return;
      rollingRef.current = true;

      const next = [rollDie(), rollDie()];
      const sum = next[0] + next[1];
      setDiceValues(next);
      setRollId((id) => id + 1);
      setRolling(true);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        rollingRef.current = false;
        setRolling(false);
        if (attribute) {
          setLog((prev) => [
            ...prev,
            {
              t: Date.now(),
              dice: next,
              sum,
              playerId: attribute.playerId,
              playerName: attribute.playerName,
              turn: attribute.turn,
              round: attribute.round,
            },
          ]);
        }
        onSettled?.(sum, next);
      }, SETTLE_MS);
    },
    []
  );

  /* ---------------- phase: players ---------------- */

  const setPlayerCount = (n) => {
    setNameDraft((d) => {
      const next = [...d];
      while (next.length < n) next.push('');
      return next.slice(0, n);
    });
  };

  const confirmPlayers = () => {
    const p = makePlayers(nameDraft);
    setPlayers(p);
    setSeats(initialSeats(p));
    setSwapPick(null);
    setPhase(PHASES.SEATING);
  };

  /* ---------------- phase: seating ---------------- */

  const handleSeatClick = (seatIdx) => {
    if (swapPick === null) {
      setSwapPick(seatIdx);
    } else if (swapPick === seatIdx) {
      setSwapPick(null);
    } else {
      setSeats((s) => swapSeats(s, swapPick, seatIdx));
      setSwapPick(null);
    }
  };

  const startRollOff = () => {
    setRollOffRolls({});
    setContenders(seats.slice());
    setRollOffIdx(0);
    setRollOffNote('');
    setPhase(PHASES.ROLL_OFF);
  };

  /* ---------------- phase: roll-off ---------------- */

  const rollForContender = () => {
    const id = contenders[rollOffIdx];
    if (!id) return;

    throwDice((sum) => {
      const updated = { ...rollOffRolls, [id]: sum };
      setRollOffRolls(updated);

      const isLast = rollOffIdx >= contenders.length - 1;
      if (!isLast) {
        setRollOffIdx((i) => i + 1);
        return;
      }

      const result = resolveRollOff(updated);
      if (result.tied) {
        // Classic rule: only the tied players roll again.
        const names = result.contenders.map((c) => byId[c]?.name).join(' and ');
        setRollOffNote(`Tied on ${result.top} — ${names} roll again.`);
        setContenders(result.contenders);
        setRollOffRolls({});
        setRollOffIdx(0);
      } else {
        const seatOfWinner = seats.indexOf(result.winner);
        setFirstSeat(seatOfWinner < 0 ? 0 : seatOfWinner);
        setRollOffNote(`${byId[result.winner]?.name} rolled ${result.top} and goes first.`);
        setContenders([]);
        setPlacementIdx(0);
        setPhase(PHASES.PLACEMENT);
      }
    }, null);
  };

  const pickFirstManually = (seatIdx) => {
    setFirstSeat(seatIdx);
    setRollOffNote(`${byId[seats[seatIdx]]?.name} was chosen to go first.`);
    setContenders([]);
    setPlacementIdx(0);
    setPhase(PHASES.PLACEMENT);
  };

  /* ---------------- phase: placement ---------------- */

  const advancePlacement = () => {
    const next = placementIdx + 1;
    if (next >= placementOrder.length) {
      setTurnIndex(0);
      setRound(1);
      setRolledThisTurn(false);
      setPhase(PHASES.PLAY);
    } else {
      setPlacementIdx(next);
    }
  };

  /* ---------------- phase: play ---------------- */

  const rollForTurn = () => {
    if (rolledThisTurn || !activePlayer) return;
    throwDice(() => setRolledThisTurn(true), {
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      turn: turnIndex + 1,
      round,
    });
  };

  const endTurn = () => {
    const { turnIndex: nextIdx, wrapped } = advanceTurn(turnIndex, turnOrder.length);
    setTurnIndex(nextIdx);
    if (wrapped) setRound((r) => r + 1);
    setRolledThisTurn(false);
  };

  /* ---------------- reset ---------------- */

  const newGame = () => {
    clearTimeout(timerRef.current);
    rollingRef.current = false;
    setRolling(false);
    setPhase(PHASES.WELCOME);
    setPlayers([]);
    setSeats([]);
    setNameDraft(['', '']);
    setLog([]);
    setTableRotation(0);
    setDirection(1);
    setFirstSeat(0);
    setTurnIndex(0);
    setRound(1);
    setPlacementIdx(0);
    setRolledThisTurn(false);
    setRollOffRolls({});
    setContenders([]);
    setRollOffNote('');
    try {
      window.localStorage.removeItem(STATE_KEY);
    } catch {
      /* ignore */
    }
  };

  /* ---------------- export ---------------- */

  const download = (filename, text, mime) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  /* ---------------- render ---------------- */

  const total = diceValues.reduce((a, b) => a + b, 0);
  const isSeven = total === 7 && !rolling;

  const showTable =
    phase === PHASES.SEATING ||
    phase === PHASES.ROLL_OFF ||
    phase === PHASES.PLACEMENT ||
    phase === PHASES.PLAY;

  return (
    <div className="min-h-screen bg-[var(--theme-page)] text-[var(--theme-text)] font-['Comic_Sans_MS'] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto bg-[var(--theme-shell)] border-[5px] border-[var(--theme-border)] p-4 sm:p-6">

        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--theme-accent)] [text-shadow:3px_3px_var(--theme-shadow-one),_-2px_-2px_var(--theme-shadow-two)]">
            ⚔️ Catan Table ⚔️
          </h1>
          <p className="text-xs sm:text-sm mt-2 opacity-80">
            Seat the players, roll for first, and let the table keep track.
          </p>
        </div>

        {!ready ? (
          <div className="py-16 text-center text-[var(--theme-muted)]">Loading…</div>
        ) : (
          <>
            {/* ---------------- WELCOME ---------------- */}
            {phase === PHASES.WELCOME && (
              <div className="py-10 text-center">
                <div className="text-6xl mb-6">🎲 🏝️ 🐑</div>
                <SectionTitle note="Real dice, real turn order, no arguments.">
                  Ready to play?
                </SectionTitle>
                <Btn variant="primary" className="text-lg px-8 py-3" onClick={() => setPhase(PHASES.PLAYERS)}>
                  Start game
                </Btn>
              </div>
            )}

            {/* ---------------- PLAYERS ---------------- */}
            {phase === PHASES.PLAYERS && (
              <div className="max-w-md mx-auto">
                <SectionTitle note="2 to 6 players.">Who's playing?</SectionTitle>

                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="text-xs text-[var(--theme-muted)]">Players:</span>
                  {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPlayerCount(n)}
                      className={`w-9 h-9 border-[3px] font-bold transition-all ${
                        nameDraft.length === n
                          ? 'bg-[var(--theme-selected)] border-[var(--theme-selected-border)] text-black'
                          : 'bg-[var(--theme-panel)] border-[var(--theme-border)] hover:bg-[var(--theme-panel-hover)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  {nameDraft.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Swatch color={makePlayers(nameDraft)[i].color} size={18} />
                      <input
                        value={v}
                        maxLength={18}
                        placeholder={`Player ${i + 1}`}
                        onChange={(e) =>
                          setNameDraft((d) => d.map((x, j) => (j === i ? e.target.value : x)))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && confirmPlayers()}
                        className="flex-1 px-3 py-2 bg-[var(--theme-stage)] border-2 border-[var(--theme-border-dark)] text-[var(--theme-text)] focus:border-[var(--theme-accent)] outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-2">
                  <Btn variant="quiet" onClick={() => setPhase(PHASES.WELCOME)}>Back</Btn>
                  <Btn variant="primary" onClick={confirmPlayers}>Seat everyone →</Btn>
                </div>
              </div>
            )}

            {/* ---------------- TABLE (seating / roll-off / placement / play) ---------------- */}
            {showTable && (
              <>
                <CatanTable
                  seatedPlayers={seatedPlayers}
                  tableRotation={tableRotation}
                  diceValues={diceValues}
                  rollId={rollId}
                  activeId={activeId}
                  nextId={nextId}
                  onRoll={
                    phase === PHASES.PLAY && !rolledThisTurn && !rolling
                      ? rollForTurn
                      : phase === PHASES.ROLL_OFF && !rolling
                        ? rollForContender
                        : undefined
                  }
                />

                {/* ---------------- SEATING ---------------- */}
                {phase === PHASES.SEATING && (
                  <div className="mt-4">
                    <SectionTitle note="Match the screen to how you're actually sitting. Tap two seats to swap them.">
                      Seating
                    </SectionTitle>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {seats.map((id, i) => {
                        const p = byId[id];
                        if (!p) return null;
                        const picked = swapPick === i;
                        return (
                          <button
                            key={id}
                            onClick={() => handleSeatClick(i)}
                            className={`flex items-center gap-2 px-3 py-2 border-[3px] text-sm transition-all ${
                              picked
                                ? 'bg-[var(--theme-selected)] border-[var(--theme-selected-border)] text-black'
                                : 'bg-[var(--theme-panel)] border-[var(--theme-border)] hover:bg-[var(--theme-panel-hover)]'
                            }`}
                          >
                            <Swatch color={p.color} />
                            <span>{p.name}</span>
                            <span className="text-[10px] opacity-60">seat {i + 1}</span>
                          </button>
                        );
                      })}
                    </div>

                    {swapPick !== null && (
                      <p className="text-center text-xs text-[var(--theme-accent)] mb-3">
                        Pick another seat to swap with {byId[seats[swapPick]]?.name}.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                      <span className="text-xs text-[var(--theme-muted)]">Spin the table:</span>
                      <Btn onClick={() => setTableRotation((r) => r - Math.PI / 12)}>↺</Btn>
                      <Btn onClick={() => setTableRotation((r) => r + Math.PI / 12)}>↻</Btn>
                      <Btn onClick={() => setSeats((s) => rotateSeats(s, 1))}>Shift seats →</Btn>
                      <Btn onClick={() => setDirection((d) => -d)}>
                        Play {direction === 1 ? 'clockwise ↻' : 'counter-clockwise ↺'}
                      </Btn>
                    </div>

                    <div className="flex justify-center gap-2">
                      <Btn variant="quiet" onClick={() => setPhase(PHASES.PLAYERS)}>Back</Btn>
                      <Btn variant="primary" onClick={startRollOff}>Roll for first player →</Btn>
                    </div>
                  </div>
                )}

                {/* ---------------- ROLL-OFF ---------------- */}
                {phase === PHASES.ROLL_OFF && (
                  <div className="mt-4">
                    <SectionTitle note="Highest roll starts. Ties roll again.">
                      Who goes first?
                    </SectionTitle>

                    {rollOffNote && (
                      <p className="text-center text-sm text-[var(--theme-accent)] mb-3">{rollOffNote}</p>
                    )}

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {contenders.map((id, i) => {
                        const p = byId[id];
                        const rolled = rollOffRolls[id];
                        const isTurn = i === rollOffIdx;
                        return (
                          <div
                            key={id}
                            className={`flex items-center gap-2 px-3 py-2 border-[3px] text-sm ${
                              isTurn
                                ? 'border-[var(--theme-accent)] bg-[var(--theme-panel-hover)]'
                                : 'border-[var(--theme-border-dark)] bg-[var(--theme-panel)]'
                            }`}
                          >
                            <Swatch color={p.color} />
                            <span>{p.name}</span>
                            <span className="font-mono text-[var(--theme-accent)]">
                              {rolled ?? '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center mb-3">
                      <div className="text-4xl font-bold text-[var(--theme-accent)]">
                        {rolling ? '—' : total}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Btn
                        variant="primary"
                        onClick={rollForContender}
                        disabled={rolling || !activePlayer}
                      >
                        {rolling ? 'Rolling…' : `Roll for ${activePlayer?.name ?? '…'} 🎲`}
                      </Btn>
                      <Btn variant="quiet" onClick={() => setPhase(PHASES.SEATING)} disabled={rolling}>
                        Back to seating
                      </Btn>
                    </div>

                    <details className="mt-4 text-center">
                      <summary className="text-xs text-[var(--theme-muted)] cursor-pointer hover:text-[var(--theme-accent)]">
                        or just pick who starts
                      </summary>
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {seats.map((id, i) => (
                          <Btn key={id} onClick={() => pickFirstManually(i)} disabled={rolling}>
                            <span className="flex items-center gap-2">
                              <Swatch color={byId[id].color} />
                              {byId[id].name}
                            </span>
                          </Btn>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* ---------------- PLACEMENT ---------------- */}
                {phase === PHASES.PLACEMENT && (
                  <div className="mt-4">
                    <SectionTitle
                      note="Everyone places one settlement in order, then the order slingshots back for the second."
                    >
                      Opening placement
                    </SectionTitle>

                    {/* Carried over from the roll-off: the result would otherwise
                        vanish the moment the phase advances, and this is exactly
                        the fact the table wants to see. */}
                    {rollOffNote && (
                      <p className="text-center text-sm text-[var(--theme-accent)] mb-3">
                        {rollOffNote}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                      {placementOrder.map((id, i) => {
                        const p = byId[id];
                        const done = i < placementIdx;
                        const now = i === placementIdx;
                        return (
                          <React.Fragment key={i}>
                            {i === placementOrder.length / 2 && (
                              <span className="text-[var(--theme-accent)] text-lg px-1" title="order reverses here">
                                ↩
                              </span>
                            )}
                            <span
                              className={`w-7 h-7 flex items-center justify-center border-2 text-[10px] font-bold ${
                                now
                                  ? 'border-[var(--theme-accent)] scale-125'
                                  : done
                                    ? 'border-[var(--theme-border-dark)] opacity-40'
                                    : 'border-[var(--theme-border-dark)]'
                              }`}
                              style={{ background: p.color.body, color: p.color.ink }}
                              title={p.name}
                            >
                              {p.name.slice(0, 2)}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <p className="text-center text-sm mb-1">
                      Placement {placementIdx + 1} of {placementOrder.length}
                      {placementIdx >= placementOrder.length / 2 && (
                        <span className="text-[var(--theme-accent)]"> · second round (reversed)</span>
                      )}
                    </p>
                    <p className="text-center text-2xl font-bold mb-4" style={{ color: activePlayer?.color.body }}>
                      {activePlayer?.name} places
                    </p>

                    <div className="flex justify-center gap-2">
                      {placementIdx > 0 && (
                        <Btn variant="quiet" onClick={() => setPlacementIdx((i) => i - 1)}>Undo</Btn>
                      )}
                      <Btn variant="primary" onClick={advancePlacement}>
                        {placementIdx === placementOrder.length - 1 ? 'Start playing →' : 'Placed ✓'}
                      </Btn>
                    </div>
                  </div>
                )}

                {/* ---------------- PLAY ---------------- */}
                {phase === PHASES.PLAY && (
                  <div className="mt-4">
                    {/* turn ribbon */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                      {turnOrder.map((id, i) => {
                        const p = byId[id];
                        const now = i === turnIndex;
                        return (
                          <span
                            key={id}
                            className={`flex items-center gap-1.5 px-2 py-1 border-2 text-xs ${
                              now
                                ? 'border-[var(--theme-accent)]'
                                : 'border-[var(--theme-border-dark)] opacity-55'
                            }`}
                            style={now ? { background: p.color.body, color: p.color.ink } : undefined}
                          >
                            {!now && <Swatch color={p.color} size={10} />}
                            {p.name}
                          </span>
                        );
                      })}
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-[10px] uppercase tracking-widest text-[var(--theme-muted)]">
                        Round {round} · {direction === 1 ? 'clockwise' : 'counter-clockwise'}
                      </div>
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: activePlayer?.color.body }}
                      >
                        {activePlayer?.name}'s turn
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-6">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[var(--theme-muted)]">
                            Roll
                          </div>
                          <div
                            className="text-5xl font-bold leading-none"
                            style={{
                              color: isSeven && rolledThisTurn
                                ? 'var(--theme-alert)'
                                : 'var(--theme-accent)',
                            }}
                          >
                            {rolling ? '—' : rolledThisTurn ? total : '·'}
                          </div>
                        </div>
                        {rolledThisTurn && !rolling && (
                          <div className="text-lg font-mono">{diceValues.join(' + ')}</div>
                        )}
                        {isSeven && rolledThisTurn && (
                          <div className="text-lg font-bold text-[var(--theme-alert)] animate-pulse">
                            🥷 ROBBER!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      <Btn
                        variant="primary"
                        onClick={rollForTurn}
                        disabled={rolling || rolledThisTurn}
                        className="text-lg px-6"
                      >
                        {rolling ? 'Rolling…' : rolledThisTurn ? 'Rolled ✓' : 'Roll 🎲'}
                      </Btn>
                      <Btn onClick={endTurn} disabled={rolling}>End turn →</Btn>
                    </div>

                    {/* per-player summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {turnOrder.map((id) => {
                        const p = byId[id];
                        const st = playerRollStats(log, id);
                        return (
                          <div
                            key={id}
                            className="border-2 border-[var(--theme-border-dark)] bg-[var(--theme-panel)] p-2"
                          >
                            <div className="flex items-center gap-1.5 text-xs mb-1">
                              <Swatch color={p.color} size={10} />
                              <span className="truncate">{p.name}</span>
                            </div>
                            <div className="text-[10px] text-[var(--theme-muted)] font-mono">
                              {st.total} roll{st.total === 1 ? '' : 's'} · avg{' '}
                              {st.total ? st.mean.toFixed(1) : '—'} · {st.sevens} seven
                              {st.sevens === 1 ? '' : 's'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Btn variant="quiet" onClick={() => setShowStats((s) => !s)}>
                        📊 {showStats ? 'Hide' : 'Stats & export'}
                      </Btn>
                      <Btn variant="quiet" onClick={newGame}>New game</Btn>
                    </div>

                    {showStats && (
                      <div className="mt-4 border-[3px] border-[var(--theme-border)] bg-[var(--theme-stage-frame)] p-3 sm:p-4">
                        <DiceCharts
                          rolls={log}
                          diceCount={2}
                          palettes={players.map((p) => ({ body: p.color.body, pip: p.color.ink }))}
                          onExportCSV={() =>
                            download(`catan-game-${stamp()}.csv`, toCSV(log), 'text/csv;charset=utf-8')
                          }
                          onExportJSON={() =>
                            download(`catan-game-${stamp()}.json`, toJSON(log), 'application/json')
                          }
                          onClear={() => setLog([])}
                        />
                        <p className="mt-3 text-[10px] text-[var(--theme-muted)]">
                          Exports include which player made each roll, plus turn and round.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
