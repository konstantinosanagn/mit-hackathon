'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './MinimalDropdown.module.css';

interface MinimalDropdownProps {
  label: string;
  options: string[];
  onSelect?: (option: string | string[]) => void;
  selectedOptions?: string[];
  className?: string;
  multiSelect?: boolean;
  showIcons?: boolean;
}

export default function MinimalDropdown({ 
  label, 
  options, 
  onSelect, 
  selectedOptions: externalSelectedOptions = [],
  className = '',
  multiSelect = false,
  showIcons = false
}: MinimalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedOptions, setInternalSelectedOptions] = useState<string[]>(externalSelectedOptions);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // Small delay to allow moving to dropdown menu
  };

  // Sync external selected options
  useEffect(() => {
    setInternalSelectedOptions(externalSelectedOptions);
  }, [externalSelectedOptions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getIconForOption = (option: string) => {
    if (!showIcons) return null;
    
    const modelIconMap: { [key: string]: string } = {
      'GPT-4': '/openai-logo.png',
      'Claude 3': '/anthropic-logo.png',
      'Gemini Pro': '/google-logo.png',
      'Llama 3': '/meta-logo.png',
      'Mistral': '/mistral-logo.png'
    };
    
    const techIconMap: { [key: string]: string } = {
      'Python': '/python-logo.png',
      'JavaScript': '/javascript-logo.png',
      'React': '/react-logo.png',
      'TensorFlow': '/tensorflow-logo.png',
      'PyTorch': '/pytorch-logo.png'
    };
    
    const taskIconMap: { [key: string]: string } = {
      'Image Generation': '/image-generation-logo.png',
      'Text Generation': '/text-generation-logo.png',
      'Fine-tuning': '/fine-tuning-logo.png',
      'Chatbot': '/chatbot-logo.png',
      'Data Analysis': '/data-analysis-logo.png'
    };
    
    return modelIconMap[option] || techIconMap[option] || taskIconMap[option];
  };

  const handleOptionSelect = (option: string) => {
    let newSelectedOptions: string[];
    
    if (multiSelect) {
      const isSelected = internalSelectedOptions.includes(option);
      if (isSelected) {
        newSelectedOptions = internalSelectedOptions.filter(item => item !== option);
      } else {
        newSelectedOptions = [...internalSelectedOptions, option];
      }
    } else {
      newSelectedOptions = [option];
    }
    
    setInternalSelectedOptions(newSelectedOptions);
    onSelect?.(multiSelect ? newSelectedOptions : option);
  };

  return (
    <div 
      id="minimal-dropdown"
      className={`${styles['minimal-dropdown']} ${className}`} 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={styles['dropdown-trigger']} 
      >
        <div className={styles['dropdown-label']}>
          {label}
        </div>
        <div className={`${styles['dropdown-icon']} ${isOpen ? styles['rotated'] : ''}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
            className="size-4"
          >
                         <path 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               d="m4.5 15.75 7.5-7.5 7.5 7.5" 
             />
          </svg>
        </div>
      </div>
      
             {isOpen && (
         <div className={styles['dropdown-menu']}>
                       {options.map((option, index) => (
                             <div
                 key={index}
                 className={styles['dropdown-option']}
                 onClick={() => handleOptionSelect(option)}
                 onMouseEnter={() => {
                   if (timeoutRef.current) {
                     clearTimeout(timeoutRef.current);
                     timeoutRef.current = null;
                   }
                 }}
               >
                 <div className={styles['option-content']}>
                   {getIconForOption(option) && (
                     <div className={styles['option-icon']}>
                       <img 
                         src={getIconForOption(option)} 
                         alt={`${option} logo`}
                         className={styles['company-logo']}
                       />
                     </div>
                   )}
                   <span>{option}</span>
                 </div>
                 {internalSelectedOptions.includes(option) && (
                   <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     strokeWidth="1.5" 
                     stroke="currentColor" 
                     className="size-4"
                   >
                     <path 
                       strokeLinecap="round" 
                       strokeLinejoin="round" 
                       d="m4.5 12.75 6 6 9-13.5" 
                     />
                   </svg>
                 )}
               </div>
            ))}
         </div>
       )}
    </div>
  );
}
