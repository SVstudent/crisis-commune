import { motion } from "framer-motion";
import { Phone, MapPin, AlertTriangle, Radio, LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AgentMessageProps {
  agent: "intake" | "geo" | "severity" | "dispatcher";
  message: string;
  timestamp?: string;
}

const agentConfig: Record<
  string,
  {
    name: string;
    color: string;
    bgColor: string;
    icon: LucideIcon;
    avatar: string;
  }
> = {
  intake: {
    name: "Intake Agent",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    icon: Phone,
    avatar: "IA",
  },
  geo: {
    name: "Geo Locator",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950/50 border-green-200 dark:border-green-800",
    icon: MapPin,
    avatar: "GL",
  },
  severity: {
    name: "Severity Analyzer",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    avatar: "SA",
  },
  dispatcher: {
    name: "Dispatcher",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    icon: Radio,
    avatar: "DS",
  },
};

export function AgentMessage({ agent, message, timestamp }: AgentMessageProps) {
  const config = agentConfig[agent];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <Avatar className={`h-10 w-10 ${config.bgColor} border-2`}>
        <AvatarFallback className={`${config.color} font-semibold`}>
          {config.avatar}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.name}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`rounded-lg border-2 p-3 ${config.bgColor}`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
