import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function AccessibilityToggle() {
  const [isAccessible, setIsAccessible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('accessibility-mode');
    if (saved === 'true') {
      setIsAccessible(true);
      document.documentElement.classList.add('accessibility-mode');
    }
  }, []);

  const toggleAccessibility = () => {
    const newState = !isAccessible;
    setIsAccessible(newState);
    
    if (newState) {
      document.documentElement.classList.add('accessibility-mode');
      localStorage.setItem('accessibility-mode', 'true');
    } else {
      document.documentElement.classList.remove('accessibility-mode');
      localStorage.setItem('accessibility-mode', 'false');
    }
  };

  return (
    <Button
      onClick={toggleAccessibility}
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg bg-background border-2"
      aria-label={isAccessible ? 'Выключить режим для слабовидящих' : 'Включить режим для слабовидящих'}
    >
      <Icon name={isAccessible ? 'EyeOff' : 'Eye'} size={20} />
    </Button>
  );
}
