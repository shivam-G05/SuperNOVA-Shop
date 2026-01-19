import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./AIBuddy.css";

const AIBuddy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const authCheckIntervalRef = useRef(null);

  // Check if token exists in cookies
  const checkAuth = async () => {
  try {
    const res = await fetch("http://43.205.124.107:3000/api/auth/me", {
      credentials: "include",
    });

    return res.ok;
  } catch (error) {
    return false;
  }
};


  // Initialize or reinitialize socket connection
  const initializeSocket = () => {
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('Initializing socket connection...');
    
    socketRef.current = io("http://43.205.124.107:3005", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to AI Buddy");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from AI Buddy");
    });

    socketRef.current.on("message", (data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: data,
          timestamp: new Date(),
        },
      ]);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    // Add welcome message only if messages array is empty
    setMessages(prev => {
      if (prev.length === 0) {
        return [
          {
            type: "bot",
            content: "Hi! I'm your AI Shopping Buddy. I can help you search for products and add them to your cart. What would you like to do today?",
            timestamp: new Date(),
          },
        ];
      }
      return prev;
    });
  };

  // Initial auth check and socket setup
  useEffect(() => {
  (async () => {
    const hasToken = await checkAuth();
    setIsAuthenticated(hasToken);

    if (hasToken) {
      initializeSocket();
    }
  })();

  return () => {
    socketRef.current?.disconnect();
    clearInterval(authCheckIntervalRef.current);
  };
}, []);


  // Periodic auth check
  useEffect(() => {
  authCheckIntervalRef.current = setInterval(async () => {
    const hasToken = await checkAuth();

    if (hasToken !== isAuthenticated) {
      setIsAuthenticated(hasToken);

      if (hasToken) {
        initializeSocket();
      } else {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setMessages([]);
      }
    }
  }, 3000); // every 3s (1s is too aggressive)

  return () => clearInterval(authCheckIntervalRef.current);
}, [isAuthenticated]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !isConnected) return;

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: inputMessage,
        timestamp: new Date(),
      },
    ]);

    // Send message to server
    socketRef.current.emit("message", inputMessage);
    setIsTyping(true);
    setInputMessage("");
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      console.log('Showing auth warning');
      setShowAuthWarning(true);
      setTimeout(() => {
        setShowAuthWarning(false);
      }, 3000);
      return;
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {/* Authentication Warning Toast */}
      {showAuthWarning && (
        <div className="auth-warning-toast">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>Please login first to access AI Buddy</span>
        </div>
      )}

      {/* Chat Window */}
      <div className={`ai-buddy-chat ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="header-content">
            <div className="ai-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                <circle cx="9" cy="9" r="1.5"/>
                <circle cx="15" cy="9" r="1.5"/>
              </svg>
            </div>
            <div className="header-text">
              <h3>AI Shopping Buddy</h3>
              <span className={`status ${isConnected ? "connected" : "disconnected"}`}>
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={toggleChat}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing-indicator">
              <div className="message-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <button type="submit" disabled={!inputMessage.trim() || !isConnected}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        className={`ai-buddy-button ${isOpen ? "hidden" : ""} ${!isAuthenticated ? "disabled" : ""}`}
        onClick={toggleChat}
        aria-label="Open AI Buddy Chat"
      >
        <div className="button-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            {isAuthenticated ? (
              <>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                <circle cx="9" cy="10" r="1.5"/>
                <circle cx="15" cy="10" r="1.5"/>
              </>
            ) : (
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            )}
          </svg>
        </div>
        {!isAuthenticated && <div className="lock-badge">🔒</div>}
        {isAuthenticated && !isConnected && <div className="connection-badge">!</div>}
        {isAuthenticated && <div className="pulse-ring"></div>}
      </button>
    </>
  );
};

export default AIBuddy;