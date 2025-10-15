import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-pink-300/50 dark:bg-pink-600/30 rounded-full animate-pulse" />
          <img
            src="https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/f469c131-60fb-4b01-a400-999056a9af11.jpg"
            alt="Love"
            className="relative w-32 h-32 object-contain mx-auto drop-shadow-2xl animate-in zoom-in duration-1000"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            С любовью
          </h2>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
