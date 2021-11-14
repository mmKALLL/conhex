import React from 'react'
import { render } from 'react-dom'
import { GameScreen } from './components/game-screen'
import { Header } from './components/header'

// Set up firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: 'AIzaSyAW-OFBhUB9kB5dxArebt3vkuf0Hp80fVc', // ok to be public, see https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
  authDomain: 'conhex-book.firebaseapp.com',
  projectId: 'conhex-book',
  storageBucket: 'conhex-book.appspot.com',
  messagingSenderId: '945686076379',
  appId: '1:945686076379:web:3e366251fc1705bce4e5fe',
  measurementId: 'G-G4NBB64HZ2',
}

const app = initializeApp(firebaseConfig)
getAnalytics(app)

render(
  <div>
    <Header />
    <GameScreen />
  </div>,
  document.getElementById('app')
)
