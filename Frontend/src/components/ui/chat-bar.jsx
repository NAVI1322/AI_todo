import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';

// Helper function to format text with bold and bullet points
function formatMessageContent(content) {
  // Split the content into lines
  const lines = content.split('\n');
  
  // Check if any line starts with a bullet point marker
  const hasBullets = lines.some(line => 
    line.trim().match(/^[•\-\*\d+\.]/)
  );
  
  if (!hasBullets) {
    // If no bullets, just format bold text
    return formatBoldText(content);
  }

  // Format each line
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    // Check for different types of bullet points
    if (trimmedLine.match(/^[•\-\*\d+\.]/)) {
      return (
        <li key={index} className="ml-4 flex items-center space-x-2">
          <span className="text-blue-500">•</span>
          <span>{formatBoldText(trimmedLine.replace(/^[•\-\*\d+\.\s]+/, ''))}</span>
        </li>
      );
    }
    // Return regular lines as paragraphs if they're not empty
    return trimmedLine ? <p key={index} className="leading-relaxed">{formatBoldText(trimmedLine)}</p> : null;
  });
}

// Helper function to format bold text (text between asterisks)
function formatBoldText(text) {
  if (typeof text !== 'string' || !text.includes('**')) return text;

  // Split text into parts, preserving the delimiters
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is wrapped in **
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the asterisks and wrap in strong tag
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-semibold text-blue-600 dark:text-blue-400">{boldText}</strong>;
    }
    return part;
  });
}

export function ChatBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const messagesEndRef = useRef(null);
  const typingSpeed = 20; // Faster typing speed (was 30)
  const pauseRef = useRef(false); // Use ref to access latest value in async function

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Function to simulate typing effect
  const simulateTyping = async (text) => {
    setIsTyping(true);
    setIsPaused(false);
    pauseRef.current = false;
    let currentText = '';
    
    // Split into words for more natural typing
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      if (pauseRef.current) {
        setTypingText(text);
        break;
      }
      
      currentText += (i > 0 ? ' ' : '') + words[i];
      setTypingText(currentText);
      
      // Random delay between words (20-50ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }
    
    setIsTyping(false);
    setIsPaused(false);
    setTypingText('');
    setMessages(prev => [...prev, { role: 'assistant', content: text }]);
  };

  const handlePause = () => {
    pauseRef.current = true;
    setIsPaused(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { response } = await aiService.sendMessage(userMessage, messages);
      setIsLoading(false);
      await simulateTyping(response);
    } catch (error) {
      console.error('Chat error details:', error);
      setError(error.message || 'Failed to get AI response');
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
        aria-label="AI Assistant"
      >
        {!isOpen ? (
          <svg 
            className="w-7 h-7" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          </svg>
        ) : (
          <svg 
            className="w-7 h-7" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <h3 className="font-medium">AI Assistant</h3>
              </div>
            </div>
            
            <div className="h-[460px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Welcome to TaskForge AI
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        I'm here to help you with your learning journey
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => {
                          setInput("Tell me about the pricing plans");
                          sendMessage({ preventDefault: () => {} });
                        }}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-colors"
                      >
                        <span className="text-xl">💰</span>
                        <span>Pricing Plans</span>
                      </button>
                      <button
                        onClick={() => {
                          setInput("What features does this website offer?");
                          sendMessage({ preventDefault: () => {} });
                        }}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-colors"
                      >
                        <span className="text-xl">✨</span>
                        <span>Platform Features</span>
                      </button>
                      <button
                        onClick={() => {
                          setInput("How can this platform help me learn?");
                          sendMessage({ preventDefault: () => {} });
                        }}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-colors"
                      >
                        <span className="text-xl">📚</span>
                        <span>Learning Benefits</span>
                      </button>
                    </div>
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
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <ul className="list-none space-y-2">
                          {formatMessageContent(message.content)}
                        </ul>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Animation with Pause Button */}
                {isTyping && typingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl p-3 bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                      <div className="relative pr-6">
                        <ul className="list-none space-y-2">
                          {formatMessageContent(typingText)}
                        </ul>
                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-500 animate-pulse"></span>
                        {!isPaused && (
                          <button
                            onClick={handlePause}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                            title="Skip typing"
                          >
                            <svg 
                              className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Animation */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 dark:bg-gray-700/50">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-500 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                    {error}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about our platform..."
                    className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    disabled={isLoading || isTyping}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || isTyping || !input.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading || isTyping ? 'Wait...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 