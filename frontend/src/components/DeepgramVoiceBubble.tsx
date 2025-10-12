import { motion } from "framer-motion";
import { Mic, Square, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepgramVoiceBubbleProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  onClick: () => void;
  error?: string | null;
}

export const DeepgramVoiceBubble = ({ 
  isListening, 
  isSpeaking, 
  isConnected, 
  onClick, 
  error 
}: DeepgramVoiceBubbleProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Connection status indicator */}
      <div className="absolute -top-2 -right-2 z-10">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
      </div>

      {/* Error indicator */}
      {error && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {error}
          </div>
        </div>
      )}

      {/* Outer pulsing rings */}
      {(isListening || isSpeaking) && (
        <>
          <motion.div
            className="absolute rounded-full bg-primary/20"
            style={{ width: 280, height: 280 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute rounded-full bg-primary/30"
            style={{ width: 240, height: 240 }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </>
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={!isConnected && !error}
        className={cn(
          "relative w-48 h-48 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-primary to-primary/80",
          "shadow-2xl shadow-primary/50",
          "transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-primary/50",
          !isConnected && !error && "opacity-50 cursor-not-allowed",
          error && "bg-gradient-to-br from-red-500 to-red-600"
        )}
        whileHover={isConnected || error ? { scale: 1.05 } : {}}
        whileTap={isConnected || error ? { scale: 0.95 } : {}}
        animate={{
          boxShadow: isListening || isSpeaking
            ? [
                "0 25px 50px -12px rgba(14, 165, 233, 0.5)",
                "0 25px 50px -12px rgba(14, 165, 233, 0.8)",
                "0 25px 50px -12px rgba(14, 165, 233, 0.5)",
              ]
            : error
            ? "0 25px 50px -12px rgba(239, 68, 68, 0.5)"
            : "0 25px 50px -12px rgba(14, 165, 233, 0.5)",
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Waveform animation when listening */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: ["20%", "60%", "20%"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Speaking animation */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Deepgram processing indicator */}
        {isConnected && !isListening && !isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Icon */}
        {!isListening && !isSpeaking ? (
          <Mic className="w-16 h-16 text-white" />
        ) : isListening ? (
          <Square className="w-12 h-12 text-white" />
        ) : null}
      </motion.button>

      {/* Status text */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        {error ? (
          <p className="text-xs text-red-500 font-medium">Connection Error</p>
        ) : !isConnected ? (
          <p className="text-xs text-yellow-500 font-medium">Connecting...</p>
        ) : isListening ? (
          <p className="text-xs text-green-500 font-medium">Deepgram Listening</p>
        ) : isSpeaking ? (
          <p className="text-xs text-blue-500 font-medium">AI Speaking</p>
        ) : (
          <p className="text-xs text-gray-500 font-medium">Ready</p>
        )}
      </div>
    </div>
  );
};
