'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const PLAYER_MAX_HP = 100;
const JAKE_MAX_HP = 120;

const playerMoves = [
  {
    id: 'tackle',
    name: 'TACKLE',
    label: 'TACKLE',
    type: 'NORMAL',
    typeLabel: 'NOR',
    sound: '/tackle.mp3',
    minDamage: 18,
    maxDamage: 26,
    accuracy: 0.96,
    critChance: 0.1,
  },
  {
    id: 'thunderbolt',
    name: 'THUNDERBOLT',
    label: 'THUNDER\nBOLT',
    type: 'ELECTRIC',
    typeLabel: 'ELE',
    sound: '/thunderbolt.mp3',
    minDamage: 30,
    maxDamage: 42,
    accuracy: 0.84,
    critChance: 0.18,
  },
  {
    id: 'recover',
    name: 'RECOVER',
    label: 'RECOVER',
    type: 'PSYCHIC',
    typeLabel: 'PSY',
    sound: '/recover.mp3',
    heal: 24,
    boost: true,
    accuracy: 1,
    critChance: 0,
  },
  {
    id: 'nuke',
    name: 'NUKE',
    label: 'NUKE',
    type: 'ATOMIC',
    typeLabel: 'ATM',
    sound: '/nuke.mp3',
    accuracy: 1,
    critChance: 0,
    instantKill: true,
    tooltip: 'dont wanna do this just give me the contact details',
  },
];

const jakeMoves = [
  {
    id: 'code-review',
    name: 'CODE REVIEW',
    minDamage: 14,
    maxDamage: 21,
    accuracy: 0.94,
    critChance: 0.1,
    weight: 4,
  },
  {
    id: 'prod-alert',
    name: 'PROD ALERT',
    minDamage: 20,
    maxDamage: 31,
    accuracy: 0.78,
    critChance: 0.18,
    weight: 3,
  },
  {
    id: 'rubber-duck',
    name: 'RUBBER DUCK',
    heal: 18,
    accuracy: 1,
    critChance: 0,
    weight: 1,
    lowHpWeight: 5,
  },
  {
    id: 'merge-conflict',
    name: 'MERGE CONFLICT',
    minDamage: 30,
    maxDamage: 42,
    accuracy: 0.6,
    critChance: 0.2,
    weight: 2,
  },
];

const jakeMoveSounds = [
  '/frustration.mp3',
  '/headbutt.mp3',
  '/kick.mp3',
  '/peck.mp3',
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pickJakeMove = (jakeHp) => {
  const weightedMoves = jakeMoves.flatMap((move) => {
    const isLowHpHeal = move.id === 'rubber-duck' && jakeHp <= JAKE_MAX_HP * 0.45;
    const weight = isLowHpHeal ? move.lowHpWeight : move.weight;

    return Array.from({ length: weight }, () => move);
  });

  return weightedMoves[randomInt(0, weightedMoves.length - 1)];
};

const hpPercent = (current, max) => `${clamp((current / max) * 100, 0, 100)}%`;

const getHpStatus = (current, max) => {
  const ratio = current / max;

  if (ratio <= 0.25) return 'danger';
  if (ratio <= 0.5) return 'warning';

  return 'healthy';
};

const initialBattleState = () => ({
  playerHp: PLAYER_MAX_HP,
  jakeHp: JAKE_MAX_HP,
  playerBoost: false,
  turn: 'intro',
  message: 'JAKE wants to battle!',
  jakePose: 'enter',
  playerPose: 'enter',
  lastMove: null,
  result: null,
});

export default function PokemonBattle({ onVictory }) {
  const [battle, setBattle] = useState(initialBattleState);
  const [typedMessage, setTypedMessage] = useState(battle.message);
  const [isNukeAnimating, setIsNukeAnimating] = useState(false);
  const audioRefs = useRef({});

  const canChooseMove = battle.turn === 'player';
  const isEnded = battle.turn === 'ended';

  useEffect(() => {
    let index = 0;
    setTypedMessage('');

    const interval = setInterval(() => {
      index += 1;
      setTypedMessage(battle.message.slice(0, index));

      if (index >= battle.message.length) {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [battle.message]);

  useEffect(() => {
    if (battle.turn !== 'intro') return undefined;

    const introTimer = setTimeout(() => {
      setBattle((current) => ({
        ...current,
        turn: 'player',
        message: 'What will YOU do?',
        jakePose: 'idle',
        playerPose: 'idle',
      }));
    }, 1100);

    return () => clearTimeout(introTimer);
  }, [battle.turn]);

  const restartBattle = () => {
    setIsNukeAnimating(false);
    setBattle(initialBattleState());
  };

  const playSound = (sound, key, volume = 0.72) => {
    if (!sound || typeof window === 'undefined') return;

    if (!audioRefs.current[key]) {
      audioRefs.current[key] = new Audio(sound);
      audioRefs.current[key].preload = 'auto';
      audioRefs.current[key].volume = volume;
    }

    const audio = audioRefs.current[key];
    audio.currentTime = 0;
    audio.play().catch(() => { });
  };

  const playMoveSound = (move) => {
    playSound(move.sound, `player-${move.id}`, move.id === 'nuke' ? 0.9 : 0.72);
  };

  const playJakeMoveSound = () => {
    const sound = jakeMoveSounds[randomInt(0, jakeMoveSounds.length - 1)];
    playSound(sound, `jake-${sound}`, sound.includes('nuke') ? 0.82 : 0.62);
  };

  const resolvePlayerMove = async (move) => {
    let nextJakeHp = battle.jakeHp;
    let nextPlayerHp = battle.playerHp;
    let nextBoost = battle.playerBoost;

    setBattle((current) => ({
      ...current,
      turn: 'resolving',
      lastMove: move.id,
      message: `YOU used ${move.name}!`,
    }));
    await wait(move.instantKill ? 220 : 420);

    if (move.instantKill) {
      nextJakeHp = 0;
      nextBoost = false;
      setIsNukeAnimating(true);
      playMoveSound(move);

      setBattle((current) => ({
        ...current,
        jakeHp: 0,
        playerBoost: false,
        playerPose: 'attack',
        jakePose: 'hit',
        message: 'CONTACT DETAILS OVERRIDE!',
      }));
      await wait(950);
      setIsNukeAnimating(false);

      return { nextJakeHp, nextPlayerHp, nextBoost };
    }

    if (move.heal) {
      nextPlayerHp = clamp(nextPlayerHp + move.heal, 0, PLAYER_MAX_HP);
      nextBoost = move.boost;
      playMoveSound(move);

      setBattle((current) => ({
        ...current,
        playerHp: nextPlayerHp,
        playerBoost: nextBoost,
        playerPose: 'boost',
        message: 'Fresh caffeine restored your focus!',
      }));
      await wait(840);

      return { nextJakeHp, nextPlayerHp, nextBoost };
    }

    const hit = Math.random() <= move.accuracy;

    if (!hit) {
      playMoveSound(move);
      setBattle((current) => ({
        ...current,
        playerBoost: false,
        playerPose: 'attack',
        jakePose: 'dodge',
        message: 'The move missed!',
      }));
      await wait(840);

      return { nextJakeHp, nextPlayerHp, nextBoost: false };
    }

    const crit = Math.random() <= move.critChance;
    const boostMultiplier = nextBoost ? 1.35 : 1;
    const critMultiplier = crit ? 1.55 : 1;
    const damage = Math.round(randomInt(move.minDamage, move.maxDamage) * boostMultiplier * critMultiplier);
    nextJakeHp = clamp(nextJakeHp - damage, 0, JAKE_MAX_HP);
    nextBoost = false;
    playMoveSound(move);

    setBattle((current) => ({
      ...current,
      jakeHp: nextJakeHp,
      playerBoost: false,
      playerPose: 'attack',
      jakePose: 'hit',
      message: crit ? 'A critical hit!' : `${move.name} connected!`,
    }));
    await wait(780);

    if (move.recoil) {
      nextPlayerHp = clamp(nextPlayerHp - move.recoil, 0, PLAYER_MAX_HP);
      setBattle((current) => ({
        ...current,
        playerHp: nextPlayerHp,
        playerPose: 'hit',
        message: 'YOU took recoil from shipping fast!',
      }));
      await wait(720);
    }

    return { nextJakeHp, nextPlayerHp, nextBoost };
  };

  const resolveJakeMove = async (jakeHp, playerHp) => {
    const move = pickJakeMove(jakeHp);
    let nextJakeHp = jakeHp;
    let nextPlayerHp = playerHp;

    setBattle((current) => ({
      ...current,
      jakePose: 'attack',
      playerPose: 'idle',
      message: `JAKE used ${move.name}!`,
    }));
    playJakeMoveSound();
    await wait(520);

    if (move.heal) {
      nextJakeHp = clamp(nextJakeHp + move.heal, 0, JAKE_MAX_HP);

      setBattle((current) => ({
        ...current,
        jakeHp: nextJakeHp,
        jakePose: 'boost',
        message: 'JAKE explained it to the duck and recovered!',
      }));
      await wait(620);

      return { nextJakeHp, nextPlayerHp };
    }

    const hit = Math.random() <= move.accuracy;

    if (!hit) {
      setBattle((current) => ({
        ...current,
        jakePose: 'attack',
        playerPose: 'dodge',
        message: 'YOU dodged it!',
      }));
      await wait(760);

      return { nextJakeHp, nextPlayerHp };
    }

    const crit = Math.random() <= move.critChance;
    const damage = Math.round(randomInt(move.minDamage, move.maxDamage) * (crit ? 1.5 : 1));
    nextPlayerHp = clamp(nextPlayerHp - damage, 0, PLAYER_MAX_HP);

    setBattle((current) => ({
      ...current,
      playerHp: nextPlayerHp,
      jakePose: 'idle',
      playerPose: 'hit',
      message: crit ? 'A critical bug appeared!' : `${move.name} landed!`,
    }));
    await wait(620);

    return { nextJakeHp, nextPlayerHp };
  };

  const chooseMove = async (move) => {
    if (!canChooseMove) return;

    const playerResult = await resolvePlayerMove(move);

    if (playerResult.nextJakeHp <= 0) {
      onVictory?.();
      setBattle((current) => ({
        ...current,
        jakeHp: 0,
        jakePose: 'faint',
        playerPose: 'win',
        turn: 'ended',
        result: 'win',
        message: 'JAKE fainted! YOU got the callback!',
      }));
      return;
    }

    if (playerResult.nextPlayerHp <= 0) {
      setBattle((current) => ({
        ...current,
        playerHp: 0,
        playerPose: 'faint',
        turn: 'ended',
        result: 'loss',
        message: 'YOU fainted from scope creep!',
      }));
      return;
    }

    await wait(260);
    const jakeResult = await resolveJakeMove(playerResult.nextJakeHp, playerResult.nextPlayerHp);

    if (jakeResult.nextPlayerHp <= 0) {
      setBattle((current) => ({
        ...current,
        playerHp: 0,
        playerPose: 'faint',
        jakePose: 'win',
        turn: 'ended',
        result: 'loss',
        message: 'YOU fainted from scope creep!',
      }));
      return;
    }

    if (jakeResult.nextJakeHp <= 0) {
      onVictory?.();
      setBattle((current) => ({
        ...current,
        jakeHp: 0,
        jakePose: 'faint',
        playerPose: 'win',
        turn: 'ended',
        result: 'win',
        message: 'JAKE fainted! YOU got the callback!',
      }));
      return;
    }

    setBattle((current) => ({
      ...current,
      turn: 'player',
      jakePose: 'idle',
      playerPose: current.playerBoost ? 'boost' : 'idle',
      message: current.playerBoost ? 'Your next attack is powered up!' : 'What will YOU do?',
    }));
  };

  const jakeSprite = useMemo(() => {
    if (battle.jakePose === 'boost' || battle.jakePose === 'attack') return '/sprites/battle2.png';
    if (battle.jakePose === 'faint') return '/sprites/stand1.png';

    return '/sprites/battle1.png';
  }, [battle.jakePose]);

  return (
    <section id="battle" className="pokemon-battle-section my-4 sm:my-6">
      <div className="text-center mb-2 sm:mb-3">
        {/* <span className="inline-block animate-[rainbow_3s_infinite] text-base sm:text-xl font-bold">
          JAKE BATTLE SIMULATOR
        </span> */}
      </div>

      <div className="pokemon-battle-shell" aria-label="Vintage battle between you and Jake">
        <div className="pokemon-battle-screen">
          <div className="pokemon-scanlines" aria-hidden="true" />

          <div className="pokemon-battlefield">
            <div className="pokemon-status pokemon-status--enemy">
              <div className="pokemon-status__top">
                <span>JAKE</span>
                <span>Lv42</span>
              </div>
              <div className="pokemon-hp-row">
                <span>HP</span>
                <div className="pokemon-hp-track">
                  <div
                    className={`pokemon-hp-fill is-${getHpStatus(battle.jakeHp, JAKE_MAX_HP)}`}
                    style={{ width: hpPercent(battle.jakeHp, JAKE_MAX_HP) }}
                  />
                </div>
              </div>
            </div>

            <div className={`pokemon-jake pokemon-sprite pokemon-sprite--${battle.jakePose}`}>
              <img src={jakeSprite} alt="Pixel sprite of Jake ready to battle" draggable="false" />
            </div>

            <div className={`pokemon-player pokemon-player--${battle.playerPose}`}>
              <img src="/sprites/char1.png" alt="Back-facing trainer sprite representing YOU" draggable="false" />
            </div>

            <div className="pokemon-platform pokemon-platform--enemy" aria-hidden="true" />
            <div className="pokemon-platform pokemon-platform--player" aria-hidden="true" />

            {isNukeAnimating && (
              <div className="pokemon-nuke-effect" aria-hidden="true">
                <div className="pokemon-nuke-effect__flash" />
                <div className="pokemon-nuke-effect__beam" />
                <div className="pokemon-nuke-effect__cloud">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="pokemon-nuke-effect__label">NUKE</div>
              </div>
            )}

            <div className="pokemon-status pokemon-status--player">
              <div className="pokemon-status__top">
                <span>YOU</span>
                <span>Lv30</span>
              </div>
              <div className="pokemon-hp-row">
                <span>HP</span>
                <div className="pokemon-hp-track">
                  <div
                    className={`pokemon-hp-fill is-${getHpStatus(battle.playerHp, PLAYER_MAX_HP)}`}
                    style={{ width: hpPercent(battle.playerHp, PLAYER_MAX_HP) }}
                  />
                </div>
              </div>
              <div className="pokemon-hp-numbers">
                {battle.playerHp}/{PLAYER_MAX_HP}
              </div>
            </div>
          </div>

          <div className="pokemon-dialog-grid">
            <div className="pokemon-text-box" aria-live="polite">
              <span>{typedMessage}</span>
              <span className="pokemon-caret" aria-hidden="true">▼</span>
            </div>

            <div className="pokemon-menu" aria-label="Choose a battle move">
              {isEnded ? (
                <button type="button" className="pokemon-restart" onClick={restartBattle}>
                  {battle.result === 'win' ? 'BATTLE AGAIN' : 'TRY AGAIN'}
                </button>
              ) : (
                playerMoves.map((move) => (
                  <button
                    key={move.id}
                    type="button"
                    onClick={() => chooseMove(move)}
                    disabled={!canChooseMove}
                    className={`pokemon-move pokemon-move--${move.type.toLowerCase()} ${battle.lastMove === move.id ? 'is-last' : ''}`}
                    data-tooltip={move.tooltip}
                  >
                    <span>{move.label}</span>
                    <small>{move.typeLabel}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
