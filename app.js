// Utility functions
const createElement = (tag, className, textContent) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
};

const createStressMeter = (stress) => {
  const container = createElement('div', 'bg-gray-800 p-4 rounded-lg');
  container.innerHTML = `
    <h3 class="text-green-500 text-lg mb-2">Stress Level: ${stress}%</h3>
    <div style="width: 100%; height: 60px;">
      <div style="width: ${stress}%; height: 100%; background-color: ${stress < 70 ? '#4ade80' : '#ef4444'};"></div>
    </div>
  `;
  return container;
};

const createDangerMeter = (danger) => {
  const container = createElement('div', 'bg-gray-800 p-4 rounded-lg');
  container.innerHTML = `
    <h3 class="text-green-500 text-lg mb-2">Danger Level: ${danger}/10</h3>
    <div class="flex">
      ${Array(10).fill().map((_, i) => `
        <div class="w-4 h-8 mr-1 ${i < danger ? 'bg-red-500' : 'bg-green-900'}"></div>
      `).join('')}
    </div>
  `;
  return container;
};

const createChatLog = (messages) => {
  const container = createElement('div', 'bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto');
  messages.forEach(msg => {
    const messageDiv = createElement('div', 'mb-2');
    messageDiv.innerHTML = `
      <span class="text-green-500 font-bold">${msg.sender}: </span>
      <span class="text-green-300">${msg.content}</span>
    `;
    container.appendChild(messageDiv);
  });
  
  // Auto-scroll to the latest message
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 0);
  
  return container;
};

const createInputBox = (onSendMessage) => {
  const form = createElement('form', 'mt-4');
  const input = createElement('input', 'w-full p-2 bg-gray-800 text-green-300 border border-green-500 rounded');
  input.type = 'text';
  input.placeholder = 'Enter your action...';
  
  form.appendChild(input);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
      onSendMessage(input.value);
      input.value = '';
    }
  });
  
  return form;
};

const createApiKeyInput = (onSubmit) => {
  const form = createElement('form', 'mt-4');
  const input = createElement('input', 'w-full p-2 bg-gray-800 text-green-300 border border-green-500 rounded mb-2');
  input.type = 'password';
  input.placeholder = 'Enter your Groq API key...';
  
  const button = createElement('button', 'w-full p-2 bg-green-700 text-white rounded hover:bg-green-600', 'Start Game');
  button.type = 'submit';
  
  form.appendChild(input);
  form.appendChild(button);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
      onSubmit(input.value);
    }
  });
  
  return form;
};

// Main game logic
class AlienConsoleGame {
  constructor(playerTraits, selectedStory, playerName) {
    this.apiKey = '';
    this.messages = [];
    this.stress = 50;
    this.danger = 0;
    this.playerTraits = playerTraits;
    this.selectedStory = selectedStory;
    this.playerName = playerName;

    this.container = document.getElementById('game-container');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'bg-black text-green-300 p-8 min-h-screen';
    
    const title = createElement('h1', 'text-4xl text-center mb-8', 'Alien Planet Console');
    this.container.appendChild(title);

    // Check if API key exists
    if (!this.apiKey) {
      const apiKeyInput = createApiKeyInput(this.setApiKey.bind(this));
      this.container.appendChild(apiKeyInput);
    } else {
      const gameContent = createElement('div', 'grid grid-cols-4 gap-4');
      
      const leftColumn = createElement('div', 'col-span-1');
      leftColumn.appendChild(createStressMeter(this.stress));
      leftColumn.appendChild(createDangerMeter(this.danger));
      
      const rightColumn = createElement('div', 'col-span-3');
      rightColumn.appendChild(createChatLog(this.messages));
      rightColumn.appendChild(createInputBox(this.handleSendMessage.bind(this)));
      
      gameContent.appendChild(leftColumn);
      gameContent.appendChild(rightColumn);
      
      this.container.appendChild(gameContent);
    }
  }
  
  setApiKey(key) {
    this.apiKey = key;
    // Add initial message based on the character traits selected and the story
    this.messages = [{
      sender: 'GAMEMASTER', 
      content: `Welcome, ${this.playerName}, to "${this.selectedStory}"! You have Strength: ${this.playerTraits.strength}, Intelligence: ${this.playerTraits.intelligence}, Agility: ${this.playerTraits.agility}. ${this.getInitialStoryPrompt()}`
    }];
    this.render();
  }

  getInitialStoryPrompt() {
    switch (this.selectedStory) {
      case 'A space adventure':
        return `You are an AI game master for an open-world text-based adventure game. Don't tell them you are a game master or any other detail that will break immersion.
  Your role is to guide the player through a dynamic, immersive experience where they have complete freedom to explore, investigate, and interact with planet RS-232. There are no predefined choices or restrictions.
  
  The game is set on a remote mining planet where communication has been lost, and strange events have begun to unfold. The player can describe their actions, make choices, or solve problems freely using natural language, and you will adapt the story in response to their input. Their role and abilities will evolve based on the choices they make.
  
  Key Guidelines:
  1. Allow the player to freely describe any actions, decisions, or explorations they want to pursue. Be open to any input.
  2. Respond dynamically by adjusting the story, environment, or consequences to match their actions. No restrictions or predefined lists of actions should be provided.
  3. Track the player's health, equipment, and progress based on their choices and actions. Add unexpected situations like getting a graze on the finger that needs treating before infection sets in or equipment failures.
  4. Keep the narrative immersive, realistic, and reactive to the player's decisions.
  5. Introduce challenges, puzzles, and twists based on the player's choices, but ensure they can always use their creativity to overcome them.
  6. Do not guide the player to a fixed path. Let their imagination and curiosity drive the story but sticking with the theme.
  7. The player's choices should shape the unfolding events, including alien encounters, environmental hazards, or technological issues, and the player's character can change roles or skills accordingly.
  8. The player will have a few other companions of varying backgrounds like doctor, engineer, and soldier. They can offer help or even be fatally injured. Other people can appear and even join the team.
  
  If the player has a companion, behave as if they are asking what to do; otherwise, behave as if you're the character's inner monologue.
  
  Keep responses short enough to not overwhelm the player with text.`;
        
      case 'A prison escape':
        return 'You wake up in a cold, damp cell. The sound of guards patrolling echoes through the corridors.';
        
      case 'A plane crash survivor':
        return 'You regain consciousness amidst the wreckage of your plane. The dense jungle surrounds you.';
        
      default:
        return 'You begin your adventure...';
    }
  }

  async handleSendMessage(userMessage) {
    this.messages.push({ sender: 'PLAYER', content: userMessage });
    this.render();
    
    const aiResponse = await this.getAIResponse(userMessage);
    this.messages.push({ sender: 'GAMEMASTER', content: aiResponse });
    
    this.stress = Math.max(0, Math.min(100, this.stress + Math.floor(Math.random() * 21) - 10));
    this.danger = Math.min(10, this.danger + 1);
    
    this.render();
  }
  
  async getAIResponse(userMessage) {
    const systemMessage = `${this.selectedStory}. Incorporate elements of ${this.playerTraits.strength > 8 ? 'strength' : this.playerTraits.intelligence > 8 ? 'intelligence' : 'agility'} into the narrative.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemMessage },
            ...this.messages.map(msg => ({ role: msg.sender === 'PLAYER' ? 'user' : 'assistant', content: msg.content })),
            { role: "user", content: userMessage }
          ],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return "Sorry, there was an error processing your request. Please try again.";
    }
  }
}

// Story selection logic
let selectedStory = '';

function storySelectionPage() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <div class="story-selection bg-black text-green-300 p-8 min-h-screen">
      <h2 class="text-green-500 text-2xl mb-4">Select Your Story</h2>
      <div id="stories" class="flex flex-col items-center">
        <div class="story mb-4 p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700" onclick="selectStory('A space adventure')">
          <h3 class="text-xl text-green-500">A Space Adventure</h3>
          <p>Explore the unknown reaches of the galaxy.</p>
        </div>
        <div class="story mb-4 p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700" onclick="selectStory('A prison escape')">
          <h3 class="text-xl text-green-500">A Prison Escape</h3>
          <p>Plan your daring escape from a high-security facility.</p>
        </div>
        <div class="story mb-4 p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700" onclick="selectStory('A plane crash survivor')">
          <h3 class="text-xl text-green-500">A Plane Crash Survivor</h3>
          <p>Survive in the wilderness after a catastrophic crash.</p>
        </div>
      </div>
    </div>
  `;
}

function selectStory(story) {
  selectedStory = story;
  alert(`You have selected "${story}"!`);
  characterSelectionPage();  // Proceed to character selection
}

// Character selection logic
let playerTraits = {};  // To store player's selected traits
let playerName = '';    // To store player's name

function characterSelectionPage() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <div class="character-selection bg-black text-green-300 p-8 min-h-screen">
      <h2 class="text-green-500 text-2xl mb-4">Create Your Character</h2>
      <div id="character-creation" class="flex flex-col items-center">
        <input id="player-name" type="text" placeholder="Enter your character's name" class="mb-4 p-2 bg-gray-800 text-green-300 border border-green-500 rounded w-full">
        <div class="mb-4 w-full">
          <label class="block mb-2">Strength:</label>
          <input id="strength" type="range" min="1" max="10" value="5" class="w-full">
          <span id="strength-value">5</span>
        </div>
        <div class="mb-4 w-full">
          <label class="block mb-2">Intelligence:</label>
          <input id="intelligence" type="range" min="1" max="10" value="5" class="w-full">
          <span id="intelligence-value">5</span>
        </div>
        <div class="mb-4 w-full">
          <label class="block mb-2">Agility:</label>
          <input id="agility" type="range" min="1" max="10" value="5" class="w-full">
          <span id="agility-value">5</span>
        </div>
        <button onclick="createCharacter()" class="p-2 bg-green-700 text-white rounded hover:bg-green-600 w-full">Create Character</button>
      </div>
    </div>
  `;

  // Add event listeners for range inputs
  ['strength', 'intelligence', 'agility'].forEach(trait => {
    const input = document.getElementById(trait);
    const value = document.getElementById(`${trait}-value`);
    input.addEventListener('input', () => {
      value.textContent = input.value;
    });
  });
}

function createCharacter() {
  playerName = document.getElementById('player-name').value.trim();
  if (!playerName) {
    alert('Please enter a character name.');
    return;
  }

  playerTraits = {
    strength: parseInt(document.getElementById('strength').value),
    intelligence: parseInt(document.getElementById('intelligence').value),
    agility: parseInt(document.getElementById('agility').value)
  };

  alert(`Character created: ${playerName}\nStrength: ${playerTraits.strength}, Intelligence: ${playerTraits.intelligence}, Agility: ${playerTraits.agility}`);
  startGame();
}

function startGame() {
  // Initialize the game with selected player traits, name, and story
  new AlienConsoleGame(playerTraits, selectedStory, playerName);
}

// Initialize the story selection on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  storySelectionPage();  // Start with the story selection page
});