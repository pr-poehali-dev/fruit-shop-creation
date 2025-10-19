import { useEffect, useState } from 'react';

const DecorativeBranch = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'winter'>('light');

  useEffect(() => {
    const updateTheme = () => {
      const storedTheme = localStorage.getItem('theme');
      const siteSettings = localStorage.getItem('siteSettings');
      
      let parsedSettings;
      try {
        parsedSettings = siteSettings ? JSON.parse(siteSettings) : null;
      } catch (e) {
        parsedSettings = null;
      }

      if (parsedSettings?.winterTheme) {
        setTheme('winter');
      } else if (storedTheme === 'dark') {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    updateTheme();

    const handleStorageChange = () => {
      updateTheme();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(updateTheme, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 h-screen w-64 pointer-events-none z-40 hidden lg:block">
      <svg
        viewBox="0 0 200 800"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>

        {theme === 'winter' ? (
          <>
            <path
              d="M 20 0 Q 40 100 35 200 Q 30 300 45 400 Q 50 500 40 600 Q 35 700 30 800"
              stroke="#8B7355"
              strokeWidth="8"
              fill="none"
              className="drop-shadow-md"
            />
            <path
              d="M 35 200 Q 60 220 80 210"
              stroke="#8B7355"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M 45 400 Q 70 420 90 415"
              stroke="#8B7355"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M 40 600 Q 65 620 85 610"
              stroke="#8B7355"
              strokeWidth="5"
              fill="none"
            />

            <ellipse cx="35" cy="195" rx="18" ry="10" fill="#E8F4F8" opacity="0.9" filter="url(#shadow)" />
            <ellipse cx="45" cy="200" rx="16" ry="9" fill="#F0F8FF" opacity="0.85" />
            <ellipse cx="55" cy="205" rx="20" ry="11" fill="#E8F4F8" opacity="0.9" />
            <ellipse cx="70" cy="210" rx="17" ry="10" fill="#FFFFFF" opacity="0.8" />

            <ellipse cx="45" cy="395" rx="19" ry="11" fill="#E8F4F8" opacity="0.9" filter="url(#shadow)" />
            <ellipse cx="55" cy="400" rx="18" ry="10" fill="#F0F8FF" opacity="0.85" />
            <ellipse cx="65" cy="405" rx="21" ry="12" fill="#E8F4F8" opacity="0.9" />
            <ellipse cx="80" cy="415" rx="16" ry="9" fill="#FFFFFF" opacity="0.8" />

            <ellipse cx="40" cy="595" rx="20" ry="11" fill="#E8F4F8" opacity="0.9" filter="url(#shadow)" />
            <ellipse cx="50" cy="600" rx="17" ry="10" fill="#F0F8FF" opacity="0.85" />
            <ellipse cx="60" cy="605" rx="19" ry="11" fill="#E8F4F8" opacity="0.9" />
            <ellipse cx="75" cy="610" rx="18" ry="10" fill="#FFFFFF" opacity="0.8" />

            <circle cx="50" cy="150" r="3" fill="#B8E6F0" opacity="0.6" />
            <circle cx="70" cy="180" r="2.5" fill="#D4F1F9" opacity="0.5" />
            <circle cx="40" cy="320" r="3.5" fill="#B8E6F0" opacity="0.6" />
            <circle cx="60" cy="350" r="2" fill="#D4F1F9" opacity="0.5" />
            <circle cx="55" cy="520" r="3" fill="#B8E6F0" opacity="0.6" />
            <circle cx="45" cy="550" r="2.5" fill="#D4F1F9" opacity="0.5" />
          </>
        ) : (
          <>
            <path
              d="M 20 0 Q 40 100 35 200 Q 30 300 45 400 Q 50 500 40 600 Q 35 700 30 800"
              stroke="#8B7355"
              strokeWidth="6"
              fill="none"
              className="drop-shadow-md"
            />

            <path
              d="M 35 200 Q 60 220 80 210"
              stroke="#6B5D48"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 45 400 Q 70 420 90 415"
              stroke="#6B5D48"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 40 600 Q 65 620 85 610"
              stroke="#6B5D48"
              strokeWidth="4"
              fill="none"
            />

            <ellipse 
              cx="35" cy="195" rx="12" ry="18" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              filter="url(#shadow)"
              className="animate-[sway_4s_ease-in-out_infinite]"
            />
            <ellipse 
              cx="50" cy="200" rx="10" ry="16" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_3.5s_ease-in-out_infinite_0.2s]"
            />
            <ellipse 
              cx="60" cy="205" rx="13" ry="19" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              className="animate-[sway_4.2s_ease-in-out_infinite_0.4s]"
            />
            <ellipse 
              cx="75" cy="210" rx="11" ry="17" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_3.8s_ease-in-out_infinite_0.6s]"
            />

            <ellipse 
              cx="45" cy="395" rx="13" ry="19" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              filter="url(#shadow)"
              className="animate-[sway_3.9s_ease-in-out_infinite_0.3s]"
            />
            <ellipse 
              cx="60" cy="400" rx="11" ry="17" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_4.1s_ease-in-out_infinite_0.5s]"
            />
            <ellipse 
              cx="70" cy="405" rx="14" ry="20" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              className="animate-[sway_3.7s_ease-in-out_infinite_0.7s]"
            />
            <ellipse 
              cx="85" cy="415" rx="10" ry="16" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_4s_ease-in-out_infinite_0.1s]"
            />

            <ellipse 
              cx="40" cy="595" rx="12" ry="18" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              filter="url(#shadow)"
              className="animate-[sway_4.3s_ease-in-out_infinite_0.4s]"
            />
            <ellipse 
              cx="55" cy="600" rx="11" ry="17" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_3.6s_ease-in-out_infinite_0.6s]"
            />
            <ellipse 
              cx="65" cy="605" rx="13" ry="19" 
              fill={theme === 'dark' ? '#2D5016' : '#4CAF50'} 
              opacity="0.9"
              className="animate-[sway_4.1s_ease-in-out_infinite_0.2s]"
            />
            <ellipse 
              cx="80" cy="610" rx="10" ry="16" 
              fill={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} 
              opacity="0.85"
              className="animate-[sway_3.9s_ease-in-out_infinite_0.8s]"
            />
          </>
        )}
      </svg>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

export default DecorativeBranch;
