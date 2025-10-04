import { useEffect, useRef } from 'react';

const NewYearBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Snowflake {
      x: number;
      y: number;
      radius: number;
      speed: number;
      wind: number;
      opacity: number;
    }

    const snowflakes: Snowflake[] = [];
    const snowflakeCount = 120;

    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        speed: Math.random() * 1.5 + 0.5,
        wind: Math.random() * 0.8 - 0.4,
        opacity: Math.random() * 0.7 + 0.3
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        if (flake.x > canvas.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      <div className="fixed bottom-0 right-0 z-[99] pointer-events-none santa-peek">
        <div className="relative">
          <div className="santa-speech-bubble">
            <p className="text-sm font-bold text-gray-800">
              🎅 Хо-хо-хо!<br/>
              С Новым Годом! 🎄
            </p>
          </div>

          <div className="santa">
            <div className="santa-hat">
              <div className="hat-white-trim"></div>
              <div className="hat-pompom"></div>
            </div>

            <div className="santa-face">
              <div className="eyes-container">
                <div className="eye left-eye">
                  <div className="pupil"></div>
                </div>
                <div className="eye right-eye">
                  <div className="pupil"></div>
                </div>
              </div>

              <div className="cheeks">
                <div className="cheek left-cheek"></div>
                <div className="cheek right-cheek"></div>
              </div>

              <div className="nose"></div>

              <div className="beard">
                <div className="mustache left-mustache"></div>
                <div className="mustache right-mustache"></div>
              </div>
            </div>

            <div className="santa-hand">
              <div className="glove"></div>
              <div className="wave-fingers"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .santa-peek {
          animation: peek 6s ease-in-out infinite;
        }

        @keyframes peek {
          0%, 100% { transform: translateX(85%); }
          50% { transform: translateX(0%); }
        }

        .santa-speech-bubble {
          position: absolute;
          top: 20px;
          right: 180px;
          background: white;
          padding: 12px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          animation: bubble-float 2s ease-in-out infinite;
          min-width: 150px;
          z-index: 10;
        }

        .santa-speech-bubble::after {
          content: '';
          position: absolute;
          bottom: 50%;
          right: -15px;
          width: 0;
          height: 0;
          border-left: 15px solid white;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
        }

        @keyframes bubble-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .santa {
          position: relative;
          width: 180px;
          height: 250px;
          animation: wave-body 3s ease-in-out infinite;
        }

        @keyframes wave-body {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }

        .santa-hat {
          position: absolute;
          top: -20px;
          left: 20px;
          width: 80px;
          height: 70px;
          background: #c41e3a;
          border-radius: 0 50px 0 0;
          transform: rotate(-15deg);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .hat-white-trim {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 12px;
          background: white;
          border-radius: 6px;
        }

        .hat-pompom {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .santa-face {
          position: absolute;
          top: 50px;
          left: 30px;
          width: 100px;
          height: 120px;
          background: #ffd4a3;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .eyes-container {
          position: absolute;
          top: 25px;
          width: 100%;
        }

        .eye {
          position: absolute;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          border: 2px solid #333;
        }

        .left-eye { left: 20px; }
        .right-eye { right: 20px; }

        .pupil {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 6px;
          height: 6px;
          background: #333;
          border-radius: 50%;
          animation: look-around 4s ease-in-out infinite;
        }

        @keyframes look-around {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 0); }
          75% { transform: translate(2px, 0); }
        }

        .cheeks {
          position: absolute;
          top: 35px;
          width: 100%;
        }

        .cheek {
          position: absolute;
          width: 18px;
          height: 18px;
          background: #ff9999;
          border-radius: 50%;
          opacity: 0.7;
        }

        .left-cheek { left: 8px; }
        .right-cheek { right: 8px; }

        .nose {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          background: #ff6b6b;
          border-radius: 50%;
        }

        .beard {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 60px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .mustache {
          position: absolute;
          top: -15px;
          width: 30px;
          height: 20px;
          background: white;
          border-radius: 50%;
        }

        .left-mustache {
          left: 5px;
          transform: rotate(-10deg);
        }

        .right-mustache {
          right: 5px;
          transform: rotate(10deg);
        }

        .santa-hand {
          position: absolute;
          top: 140px;
          left: -10px;
          width: 60px;
          height: 80px;
          animation: wave-hand 2s ease-in-out infinite;
          transform-origin: top center;
        }

        @keyframes wave-hand {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }

        .glove {
          position: absolute;
          top: 0;
          left: 0;
          width: 35px;
          height: 50px;
          background: #c41e3a;
          border-radius: 20px 20px 15px 15px;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .wave-fingers {
          position: absolute;
          top: 40px;
          left: 5px;
          width: 25px;
          height: 15px;
          background: #c41e3a;
          border-radius: 0 0 12px 12px;
          border: 3px solid white;
          border-top: none;
        }
      `}</style>
    </>
  );
};

export default NewYearBackground;
