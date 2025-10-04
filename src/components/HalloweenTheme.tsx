const HalloweenTheme = () => {
  return (
    <>
      <div className="hidden md:block fixed inset-0 pointer-events-none z-[98] overflow-hidden">
        <div className="bat bat-1">🦇</div>
        <div className="bat bat-2">🦇</div>
        <div className="bat bat-3">🦇</div>
        <div className="bat bat-4">🦇</div>
        <div className="bat bat-5">🦇</div>
        
        <div className="ghost ghost-1">👻</div>
        <div className="ghost ghost-2">👻</div>
        
        <div className="spider spider-1">
          <div className="spider-web"></div>
          🕷️
        </div>
        <div className="spider spider-2">
          <div className="spider-web"></div>
          🕷️
        </div>
      </div>

      <div className="hidden md:block fixed bottom-0 right-0 z-[99] pointer-events-none halloween-pumpkin">
        <div className="relative">
          <div className="pumpkin-speech">
            <p className="text-sm font-bold text-orange-100">
              🎃 Бу-у-у! <br/>
              Happy Halloween! 👻
            </p>
          </div>

          <div className="pumpkin">
            <div className="pumpkin-glow"></div>
            <div className="pumpkin-body">
              🎃
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-900/30 to-transparent pointer-events-none z-[97]"></div>
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/30 to-transparent pointer-events-none z-[97]"></div>

      <style>{`
        .halloween-pumpkin {
          animation: float-halloween 4s ease-in-out infinite;
        }

        @keyframes float-halloween {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(-20px); }
        }

        .pumpkin-speech {
          position: absolute;
          top: 30px;
          right: 220px;
          background: linear-gradient(135deg, #2d1b00 0%, #5c3a00 100%);
          padding: 14px 20px;
          border-radius: 20px;
          box-shadow: 
            0 0 30px rgba(255, 120, 0, 0.6),
            0 4px 20px rgba(0, 0, 0, 0.8);
          animation: bubble-float-halloween 2.5s ease-in-out infinite;
          min-width: 160px;
          z-index: 10;
          border: 3px solid #ff7700;
        }

        .pumpkin-speech::after {
          content: '';
          position: absolute;
          bottom: 50%;
          right: -15px;
          width: 0;
          height: 0;
          border-left: 15px solid #5c3a00;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          filter: drop-shadow(2px 0 4px rgba(255, 120, 0, 0.4));
        }

        @keyframes bubble-float-halloween {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }

        .pumpkin {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pumpkin-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(255, 120, 0, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: pumpkin-pulse 2s ease-in-out infinite;
          filter: blur(20px);
        }

        @keyframes pumpkin-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .pumpkin-body {
          font-size: 140px;
          animation: pumpkin-bounce 3s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(255, 120, 0, 0.8));
          z-index: 2;
        }

        @keyframes pumpkin-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-5deg); }
          75% { transform: scale(1.05) rotate(5deg); }
        }

        .bat {
          position: absolute;
          font-size: 32px;
          animation: bat-fly 15s linear infinite;
          filter: drop-shadow(0 0 8px rgba(139, 0, 139, 0.8));
        }

        .bat-1 {
          top: 10%;
          animation-duration: 18s;
          animation-delay: 0s;
        }

        .bat-2 {
          top: 25%;
          animation-duration: 22s;
          animation-delay: 3s;
        }

        .bat-3 {
          top: 40%;
          animation-duration: 20s;
          animation-delay: 6s;
        }

        .bat-4 {
          top: 60%;
          animation-duration: 19s;
          animation-delay: 2s;
        }

        .bat-5 {
          top: 75%;
          animation-duration: 21s;
          animation-delay: 8s;
        }

        @keyframes bat-fly {
          0% {
            left: -50px;
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) rotate(-10deg);
          }
          50% {
            transform: translateY(20px) rotate(10deg);
          }
          75% {
            transform: translateY(-20px) rotate(-5deg);
          }
          100% {
            left: calc(100% + 50px);
            transform: translateY(0) rotate(0deg);
          }
        }

        .ghost {
          position: absolute;
          font-size: 48px;
          animation: ghost-float 8s ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
        }

        .ghost-1 {
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .ghost-2 {
          top: 50%;
          right: 15%;
          animation-delay: 4s;
        }

        @keyframes ghost-float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-40px) translateX(20px) rotate(5deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-60px) translateX(-20px) rotate(-5deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-30px) translateX(10px) rotate(3deg);
            opacity: 0.6;
          }
        }

        .spider {
          position: absolute;
          font-size: 28px;
          animation: spider-swing 4s ease-in-out infinite;
        }

        .spider-1 {
          top: 5%;
          left: 20%;
        }

        .spider-2 {
          top: 8%;
          right: 25%;
          animation-delay: 2s;
        }

        .spider-web {
          position: absolute;
          top: -100px;
          left: 50%;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, rgba(200, 200, 200, 0.6), rgba(200, 200, 200, 0.2));
          transform-origin: top center;
        }

        @keyframes spider-swing {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(15px) rotate(10deg);
          }
          75% {
            transform: translateX(-15px) rotate(-10deg);
          }
        }
      `}</style>
    </>
  );
};

export default HalloweenTheme;