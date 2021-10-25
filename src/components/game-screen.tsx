import React from 'react'
import { GameBoard } from './game-board'

export function GameScreen({}) {
  return (
    <div className="game-screen">
      <GameBoard size={5} />
      <p>
        This page will be used by Esa Koskinen (mmKALLL) as part of his ConHex book
        project.
        <br />
        Currently it features a Little Golem style board demo (with Richard's permission).{' '}
        <br />
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
