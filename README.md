# Rock-paper-scissors vs PC

## Description

This program implements a generalized version of the Rock-Paper-Scissors game, supporting an arbitrary odd number of moves (e.g., Rock, Paper, Scissors, Lizard, Spock). It is designed to be run in a Node.js environment. The game ensures fairness by generating a cryptographically secure random move for the computer, displaying an HMAC of the move to the user before they make their choice. This allows users to verify that the computer's move was not altered after they made their choice.

The game accepts command-line arguments to define the moves, ensuring flexibility and customization. The victory logic is determined by the ordering of moves: half of the subsequent moves in the list win against a given move, and half of the previous moves lose to it.

## Installation

To run this game, you need Node.js installed on your computer. If you don't have Node.js installed, download and install it from [nodejs.org](https://nodejs.org/).

## Running the game
`node game.js Rock Paper Scissors Lizard Spock`

