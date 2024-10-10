import React, { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

const StressMeter = ({ stress }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-green-500 text-lg mb-2">Stress Level: {stress}%</h3>
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={[{ name: 'Stress', value: stress }]}>
        <Bar dataKey="value" fill={stress < 70 ? '#4ade80' : '#ef4444'} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const DangerMeter = ({ danger }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-green-500 text-lg mb-2">Danger Level: {danger}/10</h3>
    <div className="flex">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-4 h-8 mr-1 ${i < danger ? 'bg-red-500' : 'bg-green-900'}`}
        />
      ))}
    </div>
  </div>
);

const ChatLog = ({ messages }) => (
  <div className="bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto">
    {messages.map((msg, index) => (
      <div key={index} className="mb-2">
        <span className="text-green-500 font-bold">{msg.sender}: </span>
        <span className="text-green-300">{msg.content}</span>
      </div>
    ))}
  </div>
);

const InputBox = ({ onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 bg-gray-800 text-green-300 border border-green-500 rounded"
        placeholder="Enter your action..."
      />
    </form>
  );
};

const ApiKeyInput = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="w-full p-2 bg-gray-800 text-green-300 border border-green-500 rounded mb-2"
        placeholder="Enter your Groq API key..."
      />
      <button type="submit" className="w-full p-2 bg-green-700 text-white rounded hover:bg-green-600">
        Start Game
      </button>
    </form>
  );
};

const AlienConsoleGame = () => {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [stress, setStress] = useState(50);
  const [danger, setDanger] = useState(0);

  useEffect(() => {
    if (apiKey) {
      setMessages([{ sender: 'GAMEMASTER', content: 'DESCRIBE YOUR CHARACTER. NAME, OCCUPATION, SKILLS, EQUIPMENT' }]);
    }
  }, [apiKey]);

  const getAIResponse = async (userMessage) => {
    const systemMessage = `
    You are an AI game master for an open-world text-based adventure game. Don't tell them you are a games master or any other detail that will break immersion.
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
    8. The player will have a few other companions of varying backgrounds like doctor, engineer and soldier. They can offer help or even fatally injured. Other people can appear and even join the team.
    
    If the player has a companion behave as if they are asking what to do, otherwise behave as if your the characters inner monologue.
    
    Keep responses short enough to not overwhelm the player with text.
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemMessage },
            ...messages.map(msg => ({ role: msg.sender === 'PLAYER' ? 'user' : 'assistant', content: msg.content })),
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
  };

  const handleSendMessage = async (userMessage) => {
    setMessages(prev => [...prev, { sender: 'PLAYER', content: userMessage }]);
    
    const aiResponse = await getAIResponse(userMessage);
    setMessages(prev => [...prev, { sender: 'GAMEMASTER', content: aiResponse }]);
    
    setStress(prev => Math.max(0, Math.min(100, prev + Math.floor(Math.random() * 21) - 10)));
    setDanger(prev => Math.min(10, prev + 1));
  };

  if (!apiKey) {
    return (
      <div className="bg-black text-green-300 p-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-4xl text-center mb-8">Alien Planet Console</h1>
          <ApiKeyInput onSubmit={setApiKey} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-green-300 p-8 min-h-screen">
      <h1 className="text-4xl text-center mb-8">Alien Planet Console</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <StressMeter stress={stress} />
          <DangerMeter danger={danger} />
        </div>
        <div className="col-span-3">
          <ChatLog messages={messages} />
          <InputBox onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default AlienConsoleGame;