import { useEffect, useState } from 'react';

const DecorativePlants = () => {
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

  const plants = [
    { x: 5, y: 10, size: 1.2, delay: 0 },
    { x: 15, y: 25, size: 0.9, delay: 0.5 },
    { x: 85, y: 15, size: 1.1, delay: 0.2 },
    { x: 92, y: 30, size: 0.8, delay: 0.7 },
    { x: 8, y: 50, size: 1.0, delay: 0.3 },
    { x: 90, y: 55, size: 1.3, delay: 0.6 },
    { x: 12, y: 75, size: 0.95, delay: 0.4 },
    { x: 88, y: 80, size: 1.15, delay: 0.8 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {plants.map((plant, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            left: `${plant.x}%`,
            top: `${plant.y}%`,
            transform: `scale(${plant.size})`,
          }}
        >
          <svg
            width="120"
            height="140"
            viewBox="0 0 120 140"
            className="drop-shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id={`shadow-${idx}`}>
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.25"/>
              </filter>
              <radialGradient id={`leaf-gradient-${idx}`}>
                <stop offset="0%" stopColor={theme === 'dark' ? '#3A6B1F' : '#66BB6A'} />
                <stop offset="100%" stopColor={theme === 'dark' ? '#2D5016' : '#4CAF50'} />
              </radialGradient>
            </defs>

            {theme === 'winter' ? (
              <>
                <path
                  d="M 60 140 Q 58 100 60 60 Q 62 20 60 0"
                  stroke="#8B7355"
                  strokeWidth="4"
                  fill="none"
                  filter={`url(#shadow-${idx})`}
                />
                
                <ellipse
                  cx="45"
                  cy="40"
                  rx="15"
                  ry="8"
                  fill="#E8F4F8"
                  opacity="0.9"
                  className="animate-[sway_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay}s` }}
                />
                <ellipse
                  cx="75"
                  cy="45"
                  rx="18"
                  ry="9"
                  fill="#F0F8FF"
                  opacity="0.85"
                  className="animate-[sway_3.5s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.2}s` }}
                />
                <ellipse
                  cx="40"
                  cy="70"
                  rx="16"
                  ry="10"
                  fill="#E8F4F8"
                  opacity="0.9"
                  className="animate-[sway_4.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.4}s` }}
                />
                <ellipse
                  cx="80"
                  cy="75"
                  rx="17"
                  ry="9"
                  fill="#FFFFFF"
                  opacity="0.8"
                  className="animate-[sway_3.8s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.6}s` }}
                />
                <ellipse
                  cx="50"
                  cy="100"
                  rx="19"
                  ry="11"
                  fill="#E8F4F8"
                  opacity="0.9"
                  className="animate-[sway_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.8}s` }}
                />
                <ellipse
                  cx="70"
                  cy="105"
                  rx="16"
                  ry="8"
                  fill="#F0F8FF"
                  opacity="0.85"
                  className="animate-[sway_3.7s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 1}s` }}
                />
              </>
            ) : (
              <>
                <path
                  d="M 60 140 Q 58 100 60 60 Q 62 20 60 0"
                  stroke="#6B5D48"
                  strokeWidth="3"
                  fill="none"
                  filter={`url(#shadow-${idx})`}
                />

                <ellipse
                  cx="40"
                  cy="35"
                  rx="18"
                  ry="12"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.95"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay}s` }}
                />
                <ellipse
                  cx="80"
                  cy="40"
                  rx="20"
                  ry="13"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.9"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_3.5s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.3}s` }}
                />
                <ellipse
                  cx="35"
                  cy="65"
                  rx="22"
                  ry="14"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.95"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_4.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.6}s` }}
                />
                <ellipse
                  cx="85"
                  cy="70"
                  rx="19"
                  ry="12"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.9"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_3.8s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 0.9}s` }}
                />
                <ellipse
                  cx="45"
                  cy="95"
                  rx="24"
                  ry="15"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.95"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 1.2}s` }}
                />
                <ellipse
                  cx="75"
                  cy="100"
                  rx="21"
                  ry="13"
                  fill={`url(#leaf-gradient-${idx})`}
                  opacity="0.9"
                  filter={`url(#shadow-${idx})`}
                  className="animate-[sway_3.7s_ease-in-out_infinite]"
                  style={{ animationDelay: `${plant.delay + 1.5}s` }}
                />

                <circle
                  cx="30"
                  cy="50"
                  r="3"
                  fill={theme === 'dark' ? '#FDD835' : '#FFD54F'}
                  opacity="0.8"
                  className="animate-pulse"
                />
                <circle
                  cx="90"
                  cy="85"
                  r="3.5"
                  fill={theme === 'dark' ? '#FF6B6B' : '#FF8A80'}
                  opacity="0.8"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
              </>
            )}
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes sway {
          0%, 100% { 
            transform: translateX(0) rotate(0deg); 
          }
          25% { 
            transform: translateX(-5px) rotate(-2deg); 
          }
          75% { 
            transform: translateX(5px) rotate(2deg); 
          }
        }
      `}</style>
    </div>
  );
};

export default DecorativePlants;
