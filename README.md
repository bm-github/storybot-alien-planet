# Alien Console Game

A React-based text adventure game set on a remote mining planet where strange events are unfolding. This interactive console-style game uses the Groq API to generate dynamic responses to player actions.

## Features

- Immersive text-based gameplay
- Dynamic storytelling that adapts to player choices
- Real-time stress and danger level indicators
- Chat-like interface for game interactions
- Integration with Groq API for AI-generated responses

## Prerequisites

- Node.js and npm installed on your system
- A Groq API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/alien-console-game.git
   ```

2. Navigate to the project directory:
   ```
   cd alien-console-game
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter your Groq API key when prompted to start the game

4. Describe your character and begin your adventure!

## Components

- `StressMeter`: Displays the player's current stress level
- `DangerMeter`: Shows the current danger level in the game
- `ChatLog`: Renders the game's chat history
- `InputBox`: Allows players to input their actions
- `ApiKeyInput`: Prompts for the Groq API key
- `AlienConsoleGame`: Main game component that orchestrates the gameplay

## Customization

You can modify the `systemMessage` in the `getAIResponse` function to alter the game's theme, rules, or narrative style.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Groq API](https://groq.com/)
- [Recharts](https://recharts.org/)

## Disclaimer

This game is a work of fiction. Any resemblance to actual events or persons, living or dead, is purely coincidental.