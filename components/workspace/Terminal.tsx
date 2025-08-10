"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, Terminal as TerminalIcon, X, Minimize2, Maximize2 } from 'lucide-react';

interface TerminalOutput {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  sandboxStatus?: any; // Add sandbox status prop
}

export default function Terminal({ isOpen, onToggle, onMinimize, onMaximize, sandboxStatus }: TerminalProps) {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState('/home/user/app');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add initial welcome message
  useEffect(() => {
    if (outputs.length === 0) {
      const sandboxInfo = sandboxStatus?.active 
        ? `\n✓ Sandbox is active and ready`
        : sandboxStatus?.type === 'creating'
        ? `\n⏳ Creating sandbox... Please wait`
        : `\n⚠ No active sandbox - commands will be limited`;
      
      setOutputs([{
        type: 'output',
        content: `Welcome to the MIT Hackathon Terminal! 🚀

Available commands:
• help - Show this help message
• clear - Clear terminal output
• create-sandbox - Manually create a new sandbox
• status - Show current sandbox status
• refresh - Refresh sandbox status
• ls - List files in current directory
• pwd - Show current working directory
• cat <file> - Display file contents
• npm install <package> - Install npm packages
• python <script> - Run Python scripts${sandboxInfo}

Working directory: ${workingDirectory}

Type 'help' for more information.`,
        timestamp: new Date()
      }]);
    }
  }, [workingDirectory, sandboxStatus]);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    // Handle built-in commands
    if (command === 'help') {
      const sandboxInfo = sandboxStatus?.active 
        ? `\n✓ Sandbox is active and ready`
        : sandboxStatus?.type === 'creating'
        ? `\n⏳ Creating sandbox... Please wait`
        : `\n⚠ No active sandbox - commands will be limited`;
      
      setOutputs(prev => [...prev, {
        type: 'input',
        content: `$ ${command}`,
        timestamp: new Date()
      }, {
        type: 'output',
        content: `Available commands:
• help - Show this help message
• clear - Clear terminal output
• create-sandbox - Manually create a new sandbox
• status - Show current sandbox status
• refresh - Refresh sandbox status
• ls - List files in current directory
• pwd - Show current working directory
• cat <file> - Display file contents
• npm install <package> - Install npm packages
• python <script> - Run Python scripts${sandboxInfo}

Working directory: ${workingDirectory}

For other commands, they will be executed in your sandbox environment.`,
        timestamp: new Date()
      }]);
      setCurrentCommand('');
      return;
    }

    if (command === 'clear') {
      clearTerminal();
      return;
    }

    if (command === 'create-sandbox') {
      setOutputs(prev => [...prev, {
        type: 'input',
        content: `$ ${command}`,
        timestamp: new Date()
      }, {
        type: 'output',
        content: 'Creating new sandbox... This may take a few moments.',
        timestamp: new Date()
      }]);
      
      // Call the create sandbox API
      fetch('/api/create-ai-sandbox', {
        method: 'POST',
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setOutputs(prev => [...prev, {
            type: 'output',
            content: `✓ Sandbox created successfully!\nURL: ${result.url}\nSandbox ID: ${result.sandboxId}`,
            timestamp: new Date()
          }]);
        } else {
          setOutputs(prev => [...prev, {
            type: 'error',
            content: `Failed to create sandbox: ${result.error}`,
            timestamp: new Date()
          }]);
        }
      })
      .catch(error => {
        setOutputs(prev => [...prev, {
          type: 'error',
          content: `Error creating sandbox: ${error.message}`,
          timestamp: new Date()
        }]);
      });
      
      setCurrentCommand('');
      return;
    }

    if (command === 'status') {
      setOutputs(prev => [...prev, {
        type: 'input',
        content: `$ ${command}`,
        timestamp: new Date()
      }, {
        type: 'output',
        content: `Sandbox Status:
• Active: ${sandboxStatus?.active ? 'Yes' : 'No'}
• Type: ${sandboxStatus?.type || 'Unknown'}
• Text: ${sandboxStatus?.text || 'No status'}
• Last Check: ${sandboxStatus?.lastCheck ? new Date(sandboxStatus.lastCheck).toLocaleString() : 'Never'}`,
        timestamp: new Date()
      }]);
      setCurrentCommand('');
      return;
    }

    if (command === 'refresh') {
      setOutputs(prev => [...prev, {
        type: 'input',
        content: `$ ${command}`,
        timestamp: new Date()
      }, {
        type: 'output',
        content: 'Refreshing sandbox status...',
        timestamp: new Date()
      }]);
      
      // Call the sandbox status API to refresh
      fetch('/api/sandbox-status')
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setOutputs(prev => [...prev, {
            type: 'output',
            content: `✓ Status refreshed!\nActive: ${result.active}\nHealthy: ${result.healthy}\nMessage: ${result.message}`,
            timestamp: new Date()
          }]);
        } else {
          setOutputs(prev => [...prev, {
            type: 'error',
            content: `Failed to refresh status: ${result.error}`,
            timestamp: new Date()
          }]);
        }
      })
      .catch(error => {
        setOutputs(prev => [...prev, {
          type: 'error',
          content: `Error refreshing status: ${error.message}`,
          timestamp: new Date()
        }]);
      });
      
      setCurrentCommand('');
      return;
    }

    // Check if sandbox is available for external commands
    if (!sandboxStatus?.active && command !== 'help' && command !== 'clear') {
      setOutputs(prev => [...prev, {
        type: 'input',
        content: `$ ${command}`,
        timestamp: new Date()
      }, {
        type: 'error',
        content: `Error: No active sandbox. The sandbox is being created or is unavailable. Please wait for it to be ready or try again later.`,
        timestamp: new Date()
      }]);
      setCurrentCommand('');
      return;
    }

    // Add command to history
    const newHistory = [...commandHistory, command];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);

    // Add command to output
    setOutputs(prev => [...prev, {
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date()
    }]);

    // Clear current command
    setCurrentCommand('');
    setIsExecuting(true);

    try {
      const response = await fetch('/api/run-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();

      if (result.success) {
        setOutputs(prev => [...prev, {
          type: 'output',
          content: result.output || 'Command executed successfully.',
          timestamp: new Date()
        }]);
      } else {
        setOutputs(prev => [...prev, {
          type: 'error',
          content: `Error: ${result.error}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setOutputs(prev => [...prev, {
        type: 'error',
        content: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsExecuting(false);
    }
  }, [commandHistory, workingDirectory, sandboxStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete could be implemented here
    }
  };

  const clearTerminal = () => {
    setOutputs([{
      type: 'output',
      content: `Terminal cleared.\nWorking directory: ${workingDirectory}\n`,
      timestamp: new Date()
    }]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 bg-gray-900 border-t border-gray-700 shadow-2xl z-50">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
          <span className="text-xs text-gray-400">({workingDirectory})</span>
          
          {/* Sandbox Status Indicator */}
          {sandboxStatus && (
            <div className="flex items-center space-x-1 ml-2">
              <div className={`w-2 h-2 rounded-full ${
                sandboxStatus.active 
                  ? 'bg-green-400' 
                  : sandboxStatus.type === 'creating'
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-red-400'
              }`} />
              <span className={`text-xs ${
                sandboxStatus.active 
                  ? 'text-green-400' 
                  : sandboxStatus.type === 'creating'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {sandboxStatus.active 
                  ? 'Sandbox Ready' 
                  : sandboxStatus.type === 'creating'
                  ? 'Creating...'
                  : 'No Sandbox'
                }
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onMinimize}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onMaximize}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm text-gray-200"
        style={{ height: 'calc(100% - 120px)' }}
      >
        {outputs.map((output, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 text-xs mt-1 flex-shrink-0">
                [{formatTimestamp(output.timestamp)}]
              </span>
              <div className={`flex-1 ${output.type === 'input' ? 'text-green-400' : output.type === 'error' ? 'text-red-400' : 'text-gray-200'}`}>
                {output.content.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* Command input line */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-gray-500 text-xs flex-shrink-0">
            [{formatTimestamp(new Date())}]
          </span>
          <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0" />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? "Executing command..." : "Enter command..."}
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none border-none"
            />
          </form>
          {isExecuting && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <button
            onClick={clearTerminal}
            className="hover:text-gray-200 transition-colors"
          >
            Clear
          </button>
          <span>History: {commandHistory.length} commands</span>
          <span>Output: {outputs.length} lines</span>
        </div>
        
        <div className="text-xs text-gray-500">
          Press ↑↓ for command history • Tab for auto-complete
        </div>
      </div>
    </div>
  );
}
