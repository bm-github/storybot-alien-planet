// Utility functions
const createElement = (tag, className, textContent) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
};

const getThemeColors = (story) => {
  switch (story) {
    case 'A space adventure':
      return {
        primary: 'text-green-500',
        secondary: 'text-green-300',
        background: 'bg-black',
        accent: 'bg-green-700',
        meterFill: 'bg-green-500',
        meterEmpty: 'bg-green-900'
      };
    case 'A prison escape':
      return {
        primary: 'text-orange-500',
        secondary: 'text-orange-300',
        background: 'bg-gray-900',
        accent: 'bg-orange-700',
        meterFill: 'bg-orange-500',
        meterEmpty: 'bg-orange-900'
      };
    case 'A plane crash survivor':
      return {
        primary: 'text-blue-500',
        secondary: 'text-blue-300',
        background: 'bg-gray-800',
        accent: 'bg-blue-700',
        meterFill: 'bg-blue-500',
        meterEmpty: 'bg-blue-900'
      };
    default:
      return {
        primary: 'text-purple-500',
        secondary: 'text-purple-300',
        background: 'bg-gray-900',
        accent: 'bg-purple-700',
        meterFill: 'bg-purple-500',
        meterEmpty: 'bg-purple-900'
      };
  }
};

const createMeter = (label, value, max, colors) => {
  const container = createElement('div', `${colors.background} p-4 rounded-lg mb-4`);
  container.innerHTML = `
    <h3 class="${colors.primary} text-lg mb-2">${label}: ${value}${max ? '/' + max : '%'}</h3>
    <div class="w-full h-6 ${colors.meterEmpty} rounded-full overflow-hidden">
      <div style="width: ${(value / (max || 100)) * 100}%;" class="h-full ${colors.meterFill} rounded-full transition-all duration-500 ease-in-out"></div>
    </div>
  `;
  return container;
};

const createChatLog = (messages, colors) => {
  const container = createElement('div', `${colors.background} p-4 rounded-lg h-96 overflow-y-auto`);
  messages.forEach(msg => {
    const messageDiv = createElement('div', 'mb-2');
    messageDiv.innerHTML = `
      <span class="${colors.primary} font-bold">${msg.sender}: </span>
      <span class="${colors.secondary}">${msg.content}</span>
    `;
    container.appendChild(messageDiv);
  });
  
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 0);
  
  return container;
};

const createInputBox = (onSendMessage, colors) => {
  const form = createElement('form', 'mt-4');
  const input = createElement('input', `w-full p-2 ${colors.background} ${colors.secondary} border border-${colors.primary} rounded`);
  input.type = 'text';
  input.placeholder = 'Enter your action...';
  input.id = 'user-input';
  
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

const createApiKeyInput = (onSubmit, colors) => {
  const form = createElement('form', 'mt-4');
  const input = createElement('input', `w-full p-2 ${colors.background} ${colors.secondary} border border-${colors.primary} rounded mb-2`);
  input.type = 'password';
  input.placeholder = 'Enter your Groq API key...';
  
  const button = createElement('button', `w-full p-2 ${colors.accent} text-white rounded hover:opacity-90`, 'Start Game');
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
class AdventureStoryGame {
  constructor(playerTraits, selectedStory, playerName) {
    this.apiKey = '';
    this.messages = [];
    this.health = 100;
    this.danger = 0;
    this.playerTraits = playerTraits;
    this.selectedStory = selectedStory;
    this.playerName = playerName;
    this.colors = getThemeColors(selectedStory);

    this.container = document.getElementById('game-container');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = `${this.colors.background} ${this.colors.secondary} p-8 min-h-screen`;
    
    const title = createElement('h1', `text-4xl text-center mb-8 ${this.colors.primary}`, this.getGameTitle());
    this.container.appendChild(title);
  
    if (!this.apiKey) {
      const apiKeyInput = createApiKeyInput(this.setApiKey.bind(this), this.colors);
      this.container.appendChild(apiKeyInput);
    } else {
      const gameContent = createElement('div', 'grid grid-cols-4 gap-4');
      
      const leftColumn = createElement('div', 'col-span-1');
      leftColumn.appendChild(createMeter('Health', this.health, 100, this.colors));
      leftColumn.appendChild(createMeter('Danger', this.danger, 10, this.colors));
      
      const rightColumn = createElement('div', 'col-span-3');
      rightColumn.appendChild(createChatLog(this.messages, this.colors));
      rightColumn.appendChild(createInputBox(this.handleSendMessage.bind(this), this.colors));
      
      gameContent.appendChild(leftColumn);
      gameContent.appendChild(rightColumn);
      
      this.container.appendChild(gameContent);
      
      // Set focus on the input field after a short delay
      setTimeout(() => {
        const inputField = document.getElementById('user-input');
        if (inputField) {
          inputField.focus();
        }
      }, 0);
    }
  }

  getGameTitle() {
    switch (this.selectedStory) {
      case 'A space adventure':
        return 'Alien Planet Console';
      case 'A prison escape':
        return 'Prison Break Terminal';
      case 'A plane crash survivor':
        return 'Wilderness Survival System';
      default:
        return 'Adventure Console';
    }
  }
  
  setApiKey(key) {
    this.apiKey = key;
    this.messages = [{
      sender: 'SYSTEM', 
      content: `Welcome, ${this.playerName}, to "${this.selectedStory}"! You have Strength: ${this.playerTraits.strength}, Intelligence: ${this.playerTraits.intelligence}, Agility: ${this.playerTraits.agility}. ${this.getInitialStoryPrompt()}`
    }];
    this.render();
  }

  getInitialStoryPrompt() {
    switch (this.selectedStory) {
      case 'A space adventure':
        return `You are guiding the player through a dynamic, open-world space adventure set on the remote mining planet RS-232. Strange events have occurred, and communication has been lost. The player has complete freedom to explore, investigate, and interact with the environment.

        Key Guidelines:
        1. Let the player freely choose their actions. Accept any input.
        2. Adjust the environment and story to match their choices. Add surprises like equipment failure or injuries.
        3. Track health, equipment, and progress. Introduce realistic challenges and twists based on their decisions.
        4. Keep the narrative immersive and reactive. Avoid predefined paths.
        5. Player choices shape the unfolding story, including alien encounters and environmental hazards.
        6. Companions like a doctor, engineer, or soldier can offer help or be injured. Others may join.

        If the player has a companion, act like they’re discussing options. If solo, respond as inner thoughts.`;
      case 'A prison escape':
        return `You are guiding the player through a tense prison escape in a high-security desert prison. The player can plan their escape, interact with the environment, and outsmart guards.

        Key Guidelines:
        1. Let the player freely choose actions or strategies. Accept any input.
        2. Adjust the environment dynamically. Include events like cell checks, alarms, or betrayal.
        3. Track status (health, gear, trust) and introduce obstacles like guards or cameras.
        4. Keep the narrative immersive. Let player creativity drive the story. Avoid predefined paths.
        5. Their choices will shape allies' reactions and security responses.
        6. Include dynamic dangers like lockdowns or riots.

        If they have an ally, act like they’re discussing plans. If solo, respond as inner thoughts.`;
      case 'A plane crash survivor':
        return `You are guiding the player through a survival experience after a plane crash on a remote island. They can gather resources, interact with the environment, and find a way to survive or escape.

        Key Guidelines:
        1. Let the player freely choose actions. Accept any input.
        2. Adjust the environment to match their choices. Introduce obstacles like bad weather, hunger, or wildlife.
        3. Track health, injuries, hunger, and emotional state. Add realistic survival challenges.
        4. Keep the narrative immersive. Let player creativity determine survival or escape. Avoid predefined paths.
        5. Their actions affect finding other survivors or facing natural hazards.
        6. Tension builds with events like storm surges or signs of others.

        If they find another survivor, treat it as conversation. If solo, respond as inner thoughts.`;
      default:
        return 'You begin your adventure...';
    }
  }

  async handleSendMessage(userMessage) {
    this.messages.push({ sender: 'PLAYER', content: userMessage });
    this.render();
    
    const aiResponse = await this.getAIResponse(userMessage);
    this.messages.push({ sender: 'SYSTEM', content: aiResponse });
    
    this.health = Math.max(0, Math.min(100, this.health + Math.floor(Math.random() * 21) - 10));
    this.danger = Math.min(10, this.danger + Math.floor(Math.random() * 3));
    
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
  const colors = getThemeColors('default');
  gameContainer.innerHTML = `
    <div class="story-selection ${colors.background} ${colors.secondary} p-8 min-h-screen">
      <h2 class="${colors.primary} text-2xl mb-4">Select Your Story</h2>
      <div id="stories" class="flex flex-col items-center">
        ${createStoryOption('A space adventure', 'Explore the unknown reaches of the galaxy.')}
        ${createStoryOption('A prison escape', 'Plan your daring escape from a high-security facility.')}
        ${createStoryOption('A plane crash survivor', 'Survive in the wilderness after a catastrophic crash.')}
      </div>
    </div>
  `;
}

function createStoryOption(title, description) {
  const colors = getThemeColors(title);
  return `
    <div class="story mb-4 p-4 ${colors.background} rounded cursor-pointer hover:opacity-90 w-full transition-all duration-300" onclick="selectStory('${title}')">
      <h3 class="text-xl ${colors.primary}">${title}</h3>
      <p class="${colors.secondary}">${description}</p>
    </div>
  `;
}

function selectStory(story) {
  selectedStory = story;
  characterSelectionPage();
}

// Character selection logic
let playerTraits = {};
let playerName = '';

function characterSelectionPage() {
  const gameContainer = document.getElementById('game-container');
  const colors = getThemeColors(selectedStory);
  gameContainer.innerHTML = `
    <div class="character-selection ${colors.background} ${colors.secondary} p-8 min-h-screen">
      <h2 class="${colors.primary} text-2xl mb-4">Create Your Character</h2>
      <div id="character-creation" class="flex flex-col items-center">
        <input id="player-name" type="text" placeholder="Enter your character's name" class="mb-4 p-2 ${colors.background} ${colors.secondary} border border-${colors.primary} rounded w-full">
        ${createTraitSlider('Strength', colors)}
        ${createTraitSlider('Intelligence', colors)}
        ${createTraitSlider('Agility', colors)}
        <button onclick="createCharacter()" class="p-2 ${colors.accent} text-white rounded hover:opacity-90 w-full transition-all duration-300">Create Character</button>
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

function createTraitSlider(trait, colors) {
  return `
    <div class="mb-4 w-full">
      <label class="block mb-2">${trait}:</label>
      <input id="${trait.toLowerCase()}" type="range" min="1" max="10" value="5" class="w-full">
      <span id="${trait.toLowerCase()}-value" class="${colors.primary}">5</span>
    </div>
  `;
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

  startGame();
}

function startGame() {
  new AdventureStoryGame(playerTraits, selectedStory, playerName);
}

// Initialize the story selection on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  storySelectionPage();
});