import React, { createContext, useContext, useState, useEffect } from 'react';

export type Model = "Shifty 2.0 by Shift AI" | "Claude Sonnet 4.6" | "Gemini 3.1 Flash" | "GPT 5.4" | "Gemini 3.1 Pro" | "Claude Opus 4.6" | "Moonshot Kimi K2.5";
export type Agent = "Sin Especialidad" | "Brand Guardian" | "Campaign Architect" | "Insight Miner" | "Copy Alchemist";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: Agent;
  model?: Model;
};

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
  model: Model;
  agent: Agent;
};

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentMessages: Message[];
  selectedModel: Model;
  selectedAgent: Agent;
  isLoading: boolean;
  hasInteracted: boolean;
  
  setCurrentSessionId: (id: string | null) => void;
  setSelectedModel: (model: Model) => void;
  setSelectedAgent: (agent: Agent) => void;
  setIsLoading: (loading: boolean) => void;
  setHasInteracted: (interacted: boolean) => void;
  
  addMessage: (message: Message) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [selectedModel, setSelectedModel] = useState<Model>("Shifty 2.0 by Shift AI");
  const [selectedAgent, setSelectedAgent] = useState<Agent>("Sin Especialidad");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('shift_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('shift_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  // Update hasInteracted based on current session
  useEffect(() => {
    if (currentSessionId && currentMessages.length > 0) {
      setHasInteracted(true);
    } else if (currentSessionId === null) {
      setHasInteracted(false);
    }
  }, [currentSessionId, currentMessages.length]);

  const createNewSession = () => {
    setCurrentSessionId(null);
    setHasInteracted(false);
    setSelectedModel("Shifty 2.0 by Shift AI");
    setSelectedAgent("Sin Especialidad");
  };

  const addMessage = (message: Message) => {
    setSessions(prev => {
      let updatedSessions = [...prev];
      let sessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);

      if (sessionIndex === -1) {
        // Create new session
        const newSessionId = Date.now().toString();
        const newSession: ChatSession = {
          id: newSessionId,
          title: message.role === 'user' ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '') : 'Nuevo Chat',
          updatedAt: Date.now(),
          messages: [message],
          model: selectedModel,
          agent: selectedAgent
        };
        updatedSessions.unshift(newSession);
        setCurrentSessionId(newSessionId);
      } else {
        // Update existing session
        const session = { ...updatedSessions[sessionIndex] };
        session.messages = [...session.messages, message];
        session.updatedAt = Date.now();
        session.model = selectedModel;
        session.agent = selectedAgent;
        
        // If it's the first user message, update the title
        if (session.messages.length === 1 && message.role === 'user') {
            session.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
        }
        
        updatedSessions[sessionIndex] = session;
        // Move to top
        updatedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return updatedSessions;
    });
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      createNewSession();
    }
  };

  const handleSetCurrentSessionId = (id: string | null) => {
    setCurrentSessionId(id);
    if (id) {
      const session = sessions.find(s => s.id === id);
      if (session) {
        setSelectedModel(session.model);
        setSelectedAgent(session.agent);
      }
    }
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSessionId,
      currentMessages,
      selectedModel,
      selectedAgent,
      isLoading,
      hasInteracted,
      setCurrentSessionId: handleSetCurrentSessionId,
      setSelectedModel,
      setSelectedAgent,
      setIsLoading,
      setHasInteracted,
      addMessage,
      createNewSession,
      deleteSession
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
