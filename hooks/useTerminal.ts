import { useState, useCallback } from 'react';

export function useTerminal() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(prev => !prev);
  }, []);

  const openTerminal = useCallback(() => {
    setIsTerminalOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    setIsTerminalOpen(false);
  }, []);

  return {
    isTerminalOpen,
    toggleTerminal,
    openTerminal,
    closeTerminal,
  };
}
