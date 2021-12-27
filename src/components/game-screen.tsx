import React from 'react'
import { GameState, readGame } from '../utils/gamestate-utils'
import { isDefined } from '../utils/type-utils'
import { GameBoard } from './game-board'

export function GameScreen() {

  const queryParams = new URL(window.location.href).searchParams
  const gameType = queryParams.get('type')?.toLowerCase()
  const sgf = queryParams.get('sgf')

  let initialState: GameState | undefined = undefined

  if (isDefined(gameType) && gameType !== 'lg') {
    console.error('Unknown game type, only "lg" is supported. Received value:', gameType)
  }

  if (gameType === 'lg') {
    if (isDefined(sgf)) {
      initialState = readGame(sgf)
    } else {
      console.error('Game type is "lg", but no sgf query parameter was passed.')
    }
  }

  return (
    <div className="game-screen">
      <GameBoard size={5} initialState={initialState} />
      <p>
        Version 0.6.1
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
