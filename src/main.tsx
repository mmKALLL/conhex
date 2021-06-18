import React from 'react'
import { render } from 'react-dom'
import { GameScreen } from './components/game-screen'
import { Header } from './components/header'

render(
  <div>
    <Header />
    <GameScreen />
  </div>,
  document.getElementById('app')
)
