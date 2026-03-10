import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldCheck, Zap, ChevronDown, ArrowUp, Paperclip, Bot, Box, TrendingUp, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button as MovingBorderContainer } from "@/components/ui/moving-border";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TextLoop } from "@/components/ui/text-loop";
import { useChat, Model, Agent, Message } from "@/lib/chat-context";
import { MessageRenderer } from "./message-renderer";
import { DynamicSVG } from "./DynamicSVG";

// Hook for auto-resizing textarea
function useAutoResizeTextarea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, ref]);
}

const getAgentColor = (agent: string) => {
  switch (agent) {
    case "Brand Guardian": return "#9333ea"; // purple-600
    case "Campaign Architect": return "#2563eb"; // blue-600
    case "Insight Miner": return "#10b981"; // emerald-600
    case "Copy Alchemist": return "#eab308"; // yellow-500
    default: return "#0047AB"; // primary
  }
};

const getAgentBestUses = (agent: string) => {
  switch (agent) {
    case "Brand Guardian": return ["un Manual de Marca", "un Tono de Voz", "una Guía de Estilo", "una Auditoría de Marca"];
    case "Campaign Architect": return ["una Estrategia Bimensual", "un Plan de Medios", "un Funnel de Ventas", "un Calendario de Contenidos"];
    case "Insight Miner": return ["un Análisis de Competencia", "un Perfil de Buyer Persona", "un Reporte de Tendencias", "un Análisis de Sentimiento"];
    case "Copy Alchemist": return ["un Copy Ganador", "un Email Marketing", "un Guion para Video", "una Landing Page"];
    default: return ["un Asistente Virtual", "un Resumen de Reunión", "un Análisis de Datos", "una Idea Creativa"];
  }
};

const getAgentPlaceholder = (agent: string) => {
  switch (agent) {
    case "Brand Guardian": return "Pídele una revisión de marca...";
    case "Campaign Architect": return "Pídele una estrategia de campaña...";
    case "Insight Miner": return "Pídele insights del mercado...";
    case "Copy Alchemist": return "Pídele un copy creativo...";
    default: return "Escribe tu mensaje...";
  }
};

export function AnimatedAiInput() {
  const {
    currentMessages: messages,
    selectedModel,
    setSelectedModel,
    selectedAgent,
    setSelectedAgent,
    isLoading,
    setIsLoading,
    hasInteracted,
    setHasInteracted,
    addMessage
  } = useChat();

  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(textareaRef, value);

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAgentSelected = selectedAgent !== "Sin Especialidad";
  const activeColor = getAgentColor(selectedAgent);

  // Track first interaction
  useEffect(() => {
    if (value.trim().length > 0 && !hasInteracted) {
      setHasInteracted(true);
    }
  }, [value, hasInteracted]);

  const handleFocus = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const models: Model[] = ["Shifty 2.0 by Shift AI", "Claude Sonnet 4.6", "Gemini 3.1 Flash", "GPT 5.4"];
  const advancedModels: Model[] = ["Gemini 3.1 Pro", "Claude Opus 4.6", "Moonshot Kimi K2.5"];
  const agents: Agent[] = ["Sin Especialidad", "Brand Guardian", "Campaign Architect", "Insight Miner", "Copy Alchemist"];

  const getModelDescription = (model: Model) => {
    switch (model) {
      case "Shifty 2.0 by Shift AI": return "El modelo por defecto de Shift AI. Rápido, inteligente y alineado con nuestra marca.";
      case "Claude Sonnet 4.6": return "Ideal para tareas rápidas, redacción y análisis general con excelente equilibrio entre velocidad y calidad.";
      case "Gemini 3.1 Flash": return "El más rápido para respuestas inmediatas y tareas sencillas de procesamiento de texto.";
      case "GPT 5.4": return "Excelente para razonamiento lógico, matemáticas y tareas creativas cotidianas.";
      case "Gemini 3.1 Pro": return "Máximo rendimiento para razonamiento complejo, código y proyectos de larga duración.";
      case "Claude Opus 4.6": return "La mejor opción para escritura creativa, análisis profundo y comprensión de contexto extenso.";
      case "Moonshot Kimi K2.5": return "Especializado en lectura de documentos largos y análisis de grandes volúmenes de datos.";
      default: return "";
    }
  };

  const [isAdvancedDropdownOpen, setIsAdvancedDropdownOpen] = useState(false);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsModelDropdownOpen(false);
      setIsAgentDropdownOpen(false);
      setIsAdvancedDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleModelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModelDropdownOpen(!isModelDropdownOpen);
    setIsAgentDropdownOpen(false);
    setIsAdvancedDropdownOpen(false);
  };

  const handleAdvancedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdvancedDropdownOpen(!isAdvancedDropdownOpen);
    setIsModelDropdownOpen(false);
    setIsAgentDropdownOpen(false);
  };

  const handleAgentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAgentDropdownOpen(!isAgentDropdownOpen);
    setIsModelDropdownOpen(false);
    setIsAdvancedDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!value.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value.trim(),
    };

    addMessage(userMessage);
    setValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          model: selectedModel,
          agent: selectedAgent,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result,
        agent: selectedAgent,
        model: selectedModel,
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        agent: selectedAgent,
        model: selectedModel,
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn(
      "w-full max-w-3xl mx-auto flex flex-col relative z-10 h-full pt-24 pb-4",
      !hasInteracted ? "justify-center items-center" : "justify-end"
    )}>
      <AnimatePresence>
        {messages.length === 0 && !value && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-medium text-[#0e1745]/60 dark:text-white/60 text-center tracking-tight flex flex-col md:flex-row items-center justify-center gap-2"
            >
              <span>¿Querés que creemos</span>
              <TextLoop 
                className={cn(
                  "font-semibold",
                  isAgentSelected ? "" : "text-[#0e1745] dark:text-white"
                )}
                style={isAgentSelected ? { color: activeColor, textShadow: `0 0 20px ${activeColor}40` } : {}}
              >
                {getAgentBestUses(selectedAgent).map((text) => (
                  <span key={text}>{text}</span>
                ))}
              </TextLoop>
              <span>?</span>
            </motion.h1>
          </div>
        )}
      </AnimatePresence>

      {/* Chat History Area */}
      {hasInteracted && (
        <div className="flex-1 w-full relative mb-6 px-4 flex flex-col min-h-0">
          {messages.length > 0 && (
            <>
              <div className="fixed top-0 left-0 w-full z-20 pointer-events-none">
                <div className="dark:hidden">
                  <ProgressiveBlur position="top" backgroundColor="#f8f9fc" height="120px" blurAmount="8px" />
                </div>
                <div className="hidden dark:block">
                  <ProgressiveBlur position="top" backgroundColor="#0e1745" height="120px" blurAmount="8px" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4 pb-4 pt-16" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={cn(
                        "w-full flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "user" ? (
                        <div className="max-w-[80%] bg-primary/10 dark:bg-primary/20 backdrop-blur-md border border-primary/20 dark:border-primary/30 text-[#0e1745] dark:text-white rounded-3xl rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed shadow-sm">
                          <MessageRenderer content={msg.content} isUser={true} />
                        </div>
                      ) : (
                        <div className="w-full bg-white/60 dark:glass-dark backdrop-blur-md border border-white/50 dark:border-white/10 rounded-3xl p-5 text-[#0e1745] dark:text-white/90 leading-relaxed shadow-[0px_8px_32px_0px_rgba(14,23,69,0.04)] dark:shadow-elevation-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-white border border-transparent dark:border-primary/30">
                              <Bot className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-[#0e1745] dark:text-white">
                              {msg.agent !== "Sin Especialidad" ? msg.agent : msg.model}
                            </span>
                          </div>
                          <div className="text-[15px] opacity-90">
                            <MessageRenderer content={msg.content} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="w-full flex justify-start"
                    >
                      <div className="w-full bg-white/60 dark:glass-dark backdrop-blur-md border border-white/50 dark:border-white/10 rounded-3xl p-5 text-[#0e1745] dark:text-white/90 leading-relaxed shadow-[0px_8px_32px_0px_rgba(14,23,69,0.04)] dark:shadow-elevation-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-white border border-transparent dark:border-primary/30">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                          <span className="font-medium text-sm text-[#0e1745]/60 dark:text-white/60">
                            Generando respuesta...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="w-full mt-auto shrink-0 relative">
        <motion.div
          className="relative w-full rounded-[1.5rem] bg-white/70 dark:glass-dark backdrop-blur-3xl transition-shadow duration-300"
          animate={{
            boxShadow: isAgentSelected && isFocused
              ? `0 8px 40px -8px ${activeColor}40, 0 20px 80px -16px ${activeColor}30, inset 0 0 0 2px ${activeColor}`
              : isAgentSelected
              ? `0 8px 40px -8px ${activeColor}25, 0 20px 80px -16px ${activeColor}15, inset 0 0 0 1px ${activeColor}40`
              : isFocused
              ? "0 8px 40px -8px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(0,0,0,0.2)"
              : "0 8px 40px -8px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* 2. EFECTO: Resplandor de Borde (Glow Ring) */}
          <AnimatePresence>
            {isAgentSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-[1] rounded-[1.5rem]"
                style={{
                  background: `linear-gradient(135deg, ${activeColor}40, transparent 40%, transparent 60%, ${activeColor}30)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1.5px',
                }}
              />
            )}
          </AnimatePresence>

          {/* 3. EFECTO: Pulso de Respiración (Breathing Pulse) */}
          {isAgentSelected && (
            <motion.div
              animate={{
                opacity: [0, 0.15, 0],
                scale: [0.99, 1.02, 0.99],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-[-4px] rounded-[1.75rem] pointer-events-none z-[-1]"
              style={{ border: `2px solid ${activeColor}` }}
            />
          )}

          {/* CONTENIDO DEL COMPONENTE */}
          <div className="relative z-10 flex flex-col w-full">
            <div className="relative p-5 pb-3 w-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={(e) => {
              handleFocus();
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={getAgentPlaceholder(selectedAgent)}
            className="w-full bg-transparent text-[#0e1745] dark:text-white placeholder-[#0e1745]/40 dark:placeholder-white/40 resize-none outline-none min-h-[48px] max-h-[400px] text-[17px] leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-4 pt-1 w-full">
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#0e1745]/40 dark:text-white/40 hover:text-[#0e1745]/70 dark:hover:text-white/70 transition-colors rounded-full hover:bg-[#edf0fe] dark:hover:bg-white/10">
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                onClick={handleModelClick}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors border",
                  models.includes(selectedModel)
                    ? "text-primary dark:text-white bg-primary/10 dark:bg-primary/40 border-primary/20 dark:border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/50"
                    : "text-[#0e1745]/70 dark:text-white/70 bg-[#edf0fe]/80 dark:bg-white/10 border-transparent hover:bg-[#edf0fe] dark:hover:bg-white/20"
                )}
              >
                <Box className="w-3.5 h-3.5" />
                {models.includes(selectedModel) ? selectedModel : "Básico"}
                <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-0.5" />
              </button>

              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 bottom-full mb-2 w-64 bg-white/90 dark:glass-dark backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(14,23,69,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-50 p-1"
                  >
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                          setIsModelDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-[13px] rounded-xl transition-colors flex items-center justify-between group",
                          selectedModel === model 
                            ? "bg-[#edf0fe] dark:bg-white/10 text-[#0e1745] dark:text-white font-medium" 
                            : "text-[#0e1745]/70 dark:text-white/70 hover:bg-[#edf0fe]/50 dark:hover:bg-white/5 hover:text-[#0e1745] dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(selectedModel === model && "text-secondary")}>{model}</span>
                          <div className="relative flex items-center">
                            <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0e1745]/90 dark:bg-black/90 text-white/90 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                              {getModelDescription(model)}
                            </div>
                          </div>
                        </div>
                        {selectedModel === model && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Advanced Model Selector Pill */}
            <div className="relative">
              <button
                onClick={handleAdvancedClick}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors border",
                  advancedModels.includes(selectedModel)
                    ? "text-secondary dark:text-white bg-secondary/10 dark:bg-secondary/40 border-secondary/20 dark:border-secondary/50 hover:bg-secondary/20 dark:hover:bg-secondary/50"
                    : "text-[#0e1745]/70 dark:text-white/70 bg-[#edf0fe]/80 dark:bg-white/10 border-transparent hover:bg-[#edf0fe] dark:hover:bg-white/20"
                )}
              >
                <Zap className="w-3.5 h-3.5" />
                {advancedModels.includes(selectedModel) ? selectedModel : "Avanzado"}
                <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-0.5" />
              </button>

              <AnimatePresence>
                {isAdvancedDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 bottom-full mb-2 w-64 bg-white/90 dark:glass-dark backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(14,23,69,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-50 p-1"
                  >
                    {advancedModels.map((model) => (
                      <button
                        key={model}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                          setIsAdvancedDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-[13px] rounded-xl transition-colors flex items-center justify-between group",
                          selectedModel === model 
                            ? "bg-[#edf0fe] dark:bg-white/10 text-[#0e1745] dark:text-white font-medium" 
                            : "text-[#0e1745]/70 dark:text-white/70 hover:bg-[#edf0fe]/50 dark:hover:bg-white/5 hover:text-[#0e1745] dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(selectedModel === model && "text-secondary")}>{model}</span>
                          <div className="relative flex items-center">
                            <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0e1745]/90 dark:bg-black/90 text-white/90 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                              {getModelDescription(model)}
                            </div>
                          </div>
                        </div>
                        {selectedModel === model && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Agent Selector Pill */}
            <div className="relative">
              <button
                onClick={handleAgentClick}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-300 border",
                  isAgentSelected
                    ? "text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30"
                    : "text-[#0e1745]/70 dark:text-white/70 bg-[#edf0fe]/80 dark:bg-white/10 border-transparent hover:bg-[#edf0fe] dark:hover:bg-white/20"
                )}
              >
                {selectedAgent === "Brand Guardian" && <ShieldCheck className="w-3.5 h-3.5" />}
                {selectedAgent === "Campaign Architect" && <TrendingUp className="w-3.5 h-3.5" />}
                {selectedAgent === "Insight Miner" && <Zap className="w-3.5 h-3.5" />}
                {selectedAgent === "Copy Alchemist" && <Sparkles className="w-3.5 h-3.5" />}
                {selectedAgent === "Sin Especialidad" && <Bot className="w-3.5 h-3.5" />}
                {selectedAgent}
                <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-0.5" />
              </button>

              <AnimatePresence>
                {isAgentDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 bottom-full mb-2 w-56 bg-white/90 dark:glass-dark backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(14,23,69,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-50 p-1"
                  >
                    {agents.map((agent) => (
                      <button
                        key={agent}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(agent);
                          setIsAgentDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-colors",
                          selectedAgent === agent
                            ? "bg-[#edf0fe] dark:bg-white/10 text-[#0e1745] dark:text-white font-medium"
                            : "text-[#0e1745]/70 dark:text-white/70 hover:bg-[#edf0fe]/50 dark:hover:bg-white/5 hover:text-[#0e1745] dark:hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-md",
                          agent === "Brand Guardian" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" :
                          agent === "Campaign Architect" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                          agent === "Insight Miner" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                          agent === "Copy Alchemist" ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                          "bg-[#edf0fe] dark:bg-white/10 text-[#0e1745]/50 dark:text-white/50"
                        )}>
                          {agent === "Brand Guardian" && <ShieldCheck className="w-3.5 h-3.5" />}
                          {agent === "Campaign Architect" && <TrendingUp className="w-3.5 h-3.5" />}
                          {agent === "Insight Miner" && <Zap className="w-3.5 h-3.5" />}
                          {agent === "Copy Alchemist" && <Sparkles className="w-3.5 h-3.5" />}
                          {agent === "Sin Especialidad" && <Bot className="w-3.5 h-3.5" />}
                        </div>
                        {agent}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 flex items-center justify-center",
              value.trim() && !isLoading
                ? "bg-primary text-white hover:scale-105 shadow-md hover:bg-tertiary"
                : "bg-[#edf0fe] dark:bg-white/10 text-[#0e1745]/30 dark:text-white/30 cursor-not-allowed"
            )}
            disabled={!value.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <ArrowUp className="w-4.5 h-4.5" />}
          </button>
        </div>
          </div>
        </motion.div>
      </div>

      {/* Micro Branding Footer (PCB Style) */}
      <div className="mt-3 flex items-center justify-center pointer-events-none select-none opacity-60">
        <span className="font-mono text-[9px] font-bold text-[#0e1745]/40 dark:text-white/40 tracking-widest">
          Shifty Studio <span className="mx-1 opacity-50 font-normal">|</span> BY SHIFT APPLIED INTELLIGENCE
        </span>
      </div>
    </div>
  );
}
