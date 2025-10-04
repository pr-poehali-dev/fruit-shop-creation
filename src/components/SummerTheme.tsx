const SummerTheme = () => {
  return (
    <>
      <div className="hidden md:block fixed bottom-0 right-0 z-[99] pointer-events-none summer-sun">
        <div className="relative">
          <div className="sun-speech">
            <p className="text-sm font-bold text-orange-900">
              ☀️ Лето! <br/>
              Наслаждайтесь! 🌻
            </p>
          </div>

          <div className="sun">
            <div className="sun-core"></div>
            <div className="sun-ray" style={{ transform: 'rotate(0deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(45deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(90deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(135deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(180deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(225deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(270deg)' }}></div>
            <div className="sun-ray" style={{ transform: 'rotate(315deg)' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        .summer-sun {
          animation: float-summer 5s ease-in-out infinite;
        }

        @keyframes float-summer {
          0%, 100% { transform: translateY(0) translateX(85%); }
          50% { transform: translateY(-20px) translateX(0%); }
        }

        .sun-speech {
          position: absolute;
          top: 50px;
          right: 200px;
          background: linear-gradient(135deg, #fff9e6 0%, #fffacd 100%);
          padding: 12px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(255, 200, 0, 0.4);
          animation: bubble-float-summer 2s ease-in-out infinite;
          min-width: 150px;
          z-index: 10;
          border: 2px solid #ffd700;
        }

        .sun-speech::after {
          content: '';
          position: absolute;
          bottom: 50%;
          right: -15px;
          width: 0;
          height: 0;
          border-left: 15px solid #fffacd;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
        }

        @keyframes bubble-float-summer {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .sun {
          position: relative;
          width: 180px;
          height: 180px;
          animation: sun-rotate 20s linear infinite;
        }

        @keyframes sun-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sun-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #ffeb3b 0%, #ffc107 50%, #ff9800 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 40px rgba(255, 200, 0, 0.8),
            0 0 80px rgba(255, 200, 0, 0.5),
            inset 0 0 30px rgba(255, 255, 255, 0.5);
          animation: sun-pulse 3s ease-in-out infinite;
        }

        @keyframes sun-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }

        .sun-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 8px;
          background: linear-gradient(to right, #ffc107 0%, transparent 100%);
          transform-origin: left center;
          border-radius: 4px;
          animation: ray-glow 2s ease-in-out infinite;
        }

        @keyframes ray-glow {
          0%, 100% { opacity: 0.8; width: 60px; }
          50% { opacity: 1; width: 70px; }
        }
      `}</style>
    </>
  );
};

export default SummerTheme;