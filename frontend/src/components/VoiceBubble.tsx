import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceBubbleProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

export const VoiceBubble = ({ isListening, isSpeaking, onClick }: VoiceBubbleProps) => {
  return (
    <div className="relative flex items-center justify-center">
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
        className={cn(
          "relative w-48 h-48 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-primary to-primary/80",
          "shadow-2xl shadow-primary/50",
          "transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-primary/50"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isListening || isSpeaking
            ? [
                "0 25px 50px -12px rgba(14, 165, 233, 0.5)",
                "0 25px 50px -12px rgba(14, 165, 233, 0.8)",
                "0 25px 50px -12px rgba(14, 165, 233, 0.5)",
              ]
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

        {/* Icon */}
        {!isListening && !isSpeaking ? (
          <Mic className="w-16 h-16 text-white" />
        ) : isListening ? (
          <Square className="w-12 h-12 text-white" />
        ) : null}
      </motion.button>
    </div>
  );
};
