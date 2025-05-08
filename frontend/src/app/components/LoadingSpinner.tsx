// LoadingSpinner.tsx
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = "md" 
}: LoadingSpinnerProps) {
  // Get size values based on size prop
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-12 w-12";
      case "md":
      default: return "h-8 w-8";
    }
  };

  // Animation for the spinner
  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <motion.div
        className="mb-2"
        variants={spinnerVariants}
        animate="spin"
      >
        <Loader2 className={`${getSizeClass()} text-primary`} />
      </motion.div>
      {message && (
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}