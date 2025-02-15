import { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';

export function AIChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);

    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Add system message to guide AI response format
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant that helps create learning paths. If the user asks for a learning plan, respond with a JSON object in this format:
        {
          "title": "Learning Path Title",
          "description": "Brief description",
          "days": [
            {
              "day": 1,
              "title": "Day's Topic",
              "tasks": [
                {
                  "id": "unique_id",
                  "title": "Task Description",
                  "completed": false
                }
              ]
            }
          ]
        }`
      };

      const { response } = await aiService.sendMessage(userMessage, [systemMessage, ...messages]);
      
      // Try to parse response as JSON if it's a learning path request
      if (userMessage.toLowerCase().includes('plan') || 
          userMessage.toLowerCase().includes('learn') || 
          userMessage.toLowerCase().includes('path')) {
        try {
          const jsonResponse = JSON.parse(response);
          if (jsonResponse.title && jsonResponse.days) {
            // Store the learning path in localStorage
            const paths = JSON.parse(localStorage.getItem('paths') || '[]');
            const newPath = {
              id: Date.now(),
              ...jsonResponse,
            };
            localStorage.setItem('paths', JSON.stringify([...paths, newPath]));
            
            // Add success message
            setMessages(prev => [
              ...prev, 
              { role: 'assistant', content: response },
              { role: 'assistant', content: 'I\'ve created this learning path for you! You can find it in your dashboard.' }
            ]);
            return;
          }
        } catch (e) {
          // If parsing fails, treat as regular message
          console.log('Not a valid JSON response');
        }
      }

      // Add regular response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setError(error.message);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Try asking: "Create a 30-day plan to learn programming" or "Make a learning path for REST APIs"
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center text-red-500 p-2 bg-red-100 dark:bg-red-900/50 rounded">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              AI is thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a learning plan or any question..."
            className="flex-1 p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 