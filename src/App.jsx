import { useEffect, useRef, useState } from 'react'

const starterMessages = [
  {
    id: 1,
    role: 'assistant',
    content:
      'Hi! I can help with problem solving, brainstorming, writing, coding, and planning. Ask me anything.',
  },
]

const suggestions = [
  'Help me debug this bug',
  'Plan my study schedule',
  'Summarize this idea',
  'Write a clear response',
]

function createAssistantReply(input) {
  const lowerText = input.toLowerCase()

  if (lowerText.includes('debug') || lowerText.includes('error')) {
    return 'Let me help you debug it. Start by sharing the error message, the code involved, and what you expected to happen. I can walk through the root cause and suggest a fix step by step.'
  }

  if (lowerText.includes('plan') || lowerText.includes('schedule')) {
    return 'A strong plan starts with your goal, timeline, and priorities. I can help you break it into manageable tasks, set milestones, and suggest a consistent routine.'
  }

  if (lowerText.includes('write') || lowerText.includes('email') || lowerText.includes('message')) {
    return 'I can draft a professional, clear version for you. Tell me the tone you want: formal, friendly, persuasive, or concise, and I will shape the wording.'
  }

  if (lowerText.includes('code') || lowerText.includes('program')) {
    return 'I can help you design, debug, or improve code. Share the language, the issue, and the expected behavior, and I will guide you toward a working solution.'
  }

  return 'That sounds like a good challenge. I can help you break it into smaller steps, identify the main issue, and suggest the best next move.'
}

function App() {
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isListening])

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  const handleSendMessage = (messageText = input) => {
    const trimmed = messageText.trim()
    if (!trimmed) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: createAssistantReply(trimmed),
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    recognitionRef.current.start()
    setIsListening(true)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">AI</div>
          <div>
            <p className="brand-title">Assistant</p>
          </div>
        </div>

        <button className="new-chat-btn">+ New chat</button>

        <div className="sidebar-section">
          <p className="section-label">Recent</p>
          <ul className="history-list">
            <li>Product strategy</li>
            <li>Bug debugging</li>
            <li>Study planner</li>
          </ul>
        </div>

        <div className="voice-card">
          <p className="voice-title">Voice command</p>
          <button
            className={`voice-toggle ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            type="button"
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <span className="voice-status">
            {isListening ? 'Listening...' : 'Ready for voice input'}
          </span>
        </div>
      </aside>

      <main className="chat-panel">
        <header className="topbar">
          <div className="topbar-left">
            <div className="status-dot" />
            <span>AI Assistant</span>
          </div>
          <button type="button" className="ghost-btn">
            Upgrade
          </button>
        </header>

        <div className="messages-wrapper">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.role === 'user' ? 'user-row' : 'assistant-row'}`}
            >
              <div className={`message-bubble ${message.role}`}>
                {message.content}
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="suggestions-row">
          {suggestions.map((prompt) => (
            <button key={prompt} type="button" onClick={() => handleSendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault()
            handleSendMessage()
          }}
        >
          <button type="button" className="icon-btn" aria-label="Voice input" onClick={toggleVoice}>
            🎙️
          </button>

          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <button type="submit" className="send-btn">
            Send
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
