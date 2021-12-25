import React from 'react'
import { readGame } from '../utils/gamestate-utils'
import { GameBoard } from './game-board'

export function GameScreen({}) {
  return (
    <div className="game-screen">
      <GameBoard size={5} initialState={readGame(`(;FF[CONHEX]VA[CONHEX]EV[conhex.ch.21.1.1]PB[David Milne]PW[leandro ?]SO[https://www.littlegolem.net];
B[J3];R[H5];B[I6];R[I8];B[H7];R[I4];B[J4];R[I7];B[H6];R[J6];B[I5];R[G9];B[E8];R[F8];B[C10];R[D9];B[C8];
R[B8];B[B9];R[D6];B[D7];R[F7];B[G8];R[F9];B[C5];R[C6];B[D5];R[E3];B[C2];R[C4];B[D3];R[resign])`)} />
      <p>
        Version 0.6.0
        {/* TODO: Fix formatting with CSS */}
        <br />
        <br />
        <br />
        <br />
        This page will be used by Esa Koskinen (mmKALLL) as part of his ConHex book project.
        <br />
        Currently it features a Little Golem style board demo (with Richard's permission). <br />
        <br />
        Book draft available at:
        <br />
        <a
          href="https://docs.google.com/document/d/12A8YN087o_tDDRz441If80GwMRLwgh5FRBScE4sE_RY/edit?usp=sharing"
          target="_blank"
        >
          https://docs.google.com/document/d/12A8YN087o_tDDRz441If80GwMRLwgh5FRBScE4sE_RY/edit?usp=sharing
        </a>
      </p>
    </div>
  )
}
