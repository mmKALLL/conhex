import React from 'react'
import { GameState, readGame } from '../utils/gamestate-utils'
import { isDefined } from '../utils/type-utils'
import { Footer } from './footer'
import { GameBoard } from './game-board'

export function GameScreen() {
  const queryParams = new URL(window.location.href).searchParams
  const gameType = queryParams.get('type')?.toLowerCase()
  const sgf = queryParams.get('sgf')

  let initialState: GameState | undefined = undefined

  if (isDefined(gameType) && gameType !== 'little-golem') {
    console.error('Unknown game type, only "little-golem" is supported. Received value:', gameType)
  }

  if (gameType === 'little-golem') {
    if (isDefined(sgf)) {
      initialState = readGame(sgf, gameType)
    } else {
      console.error(`Game type is ${gameType}, but no sgf query parameter was passed.`)
    }
  }

  return (
    <div className="game-screen">
      <GameBoard boardSize={5} initialState={initialState} />
      <p>
        Version 0.7.2.
        <br />
        Made by Esa Koskinen (mmKALLL), with permission from Richard.
      </p>
      {initialState === undefined && <Footer />}
    </div>
  )
}
