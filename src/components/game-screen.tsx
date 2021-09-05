import React from 'react'
import { GameBoard } from './game-board'

export function GameScreen({}) {
  return (
    <div className="game-screen">
      <p>Test text</p>
      <GameBoard size={5} />
    </div>
  )
}
