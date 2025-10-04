import { useEffect, useRef } from 'react';

const HalloweenTheme = () => {
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

    interface Bat {
      x: number;
      y: number;
      speed: number;
      size: number;
      angle: number;
    }

    const bats: Bat[] = [];
    const batCount = 15;

    for (let i = 0; i < batCount; i++) {
      bats.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 20 + 15,
        angle: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bats.forEach(bat => {
        bat.x += Math.cos(bat.angle) * bat.speed;
        bat.y += Math.sin(bat.angle) * bat.speed * 0.3;
        bat.angle += 0.02;

        if (bat.x > canvas.width) bat.x = 0;
        if (bat.x < 0) bat.x = canvas.width;
        if (bat.y > canvas.height) bat.y = 0;
        if (bat.y < 0) bat.y = canvas.height;

        ctx.fillStyle = '#1a0a1f';
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        ctx.moveTo(bat.x, bat.y);
        ctx.lineTo(bat.x - bat.size, bat.y - bat.size * 0.5);
        ctx.lineTo(bat.x - bat.size * 0.5, bat.y);
        ctx.lineTo(bat.x, bat.y + bat.size * 0.3);
        ctx.lineTo(bat.x + bat.size * 0.5, bat.y);
        ctx.lineTo(bat.x + bat.size, bat.y - bat.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
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
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      <div className="fixed bottom-0 right-0 z-[99] pointer-events-none halloween-pumpkin">
        <div className="relative">
          <div className="pumpkin-speech">
            <p className="text-sm font-bold text-orange-900">
              👻 Бу-у-у!<br/>
              Happy Halloween! 🎃
            </p>
          </div>

          <div className="pumpkin">
            <div className="pumpkin-body">
              <div className="pumpkin-eye left"></div>
              <div className="pumpkin-eye right"></div>
              <div className="pumpkin-nose"></div>
              <div className="pumpkin-mouth"></div>
              <div className="pumpkin-glow"></div>
            </div>
            <div className="pumpkin-stem"></div>
          </div>
        </div>
      </div>

      <style>{`
        .halloween-pumpkin {
          animation: float-halloween 4s ease-in-out infinite;
        }

        @keyframes float-halloween {
          0%, 100% { transform: translateY(0) translateX(85%); }
          50% { transform: translateY(-15px) translateX(0%); }
        }

        .pumpkin-speech {
          position: absolute;
          top: 30px;
          right: 180px;
          background: linear-gradient(135deg, #fff5e6 0%, #ffe4b3 100%);
          padding: 12px 18px;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(255, 100, 0, 0.4);
          animation: bubble-shake 2s ease-in-out infinite;
          min-width: 170px;
          z-index: 10;
          border: 2px solid #ff8800;
        }

        .pumpkin-speech::after {
          content: '';
          position: absolute;
          bottom: 50%;
          right: -15px;
          width: 0;
          height: 0;
          border-left: 15px solid #ffe4b3;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
        }

        @keyframes bubble-shake {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }

        .pumpkin {
          position: relative;
          width: 150px;
          height: 180px;
          animation: pumpkin-glow-pulse 3s ease-in-out infinite;
        }

        @keyframes pumpkin-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 100, 0, 0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(255, 100, 0, 0.9)); }
        }

        .pumpkin-stem {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 25px;
          background: linear-gradient(to bottom, #4a7c59 0%, #2d5a3a 100%);
          border-radius: 8px 8px 0 0;
          box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.3);
        }

        .pumpkin-body {
          position: relative;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #ff8c00 0%, #ff6600 50%, #cc5200 100%);
          border-radius: 50%;
          box-shadow: 
            inset -20px -20px 40px rgba(0, 0, 0, 0.3),
            inset 10px 10px 20px rgba(255, 200, 100, 0.5),
            0 10px 30px rgba(255, 100, 0, 0.4);
        }

        .pumpkin-body::before {
          content: '';
          position: absolute;
          top: 10%;
          left: 15%;
          width: 70%;
          height: 30%;
          background: radial-gradient(ellipse at top, rgba(255, 200, 100, 0.4) 0%, transparent 70%);
          border-radius: 50%;
        }

        .pumpkin-eye {
          position: absolute;
          top: 40px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 25px solid #1a0a00;
        }

        .pumpkin-eye.left {
          left: 25px;
          transform: rotate(-10deg);
        }

        .pumpkin-eye.right {
          right: 25px;
          transform: rotate(10deg);
        }

        .pumpkin-nose {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 15px solid #1a0a00;
        }

        .pumpkin-mouth {
          position: absolute;
          top: 95px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 35px;
          border: 4px solid #1a0a00;
          border-radius: 0 0 50px 50px;
          border-top: none;
          background: #1a0a00;
        }

        .pumpkin-mouth::before,
        .pumpkin-mouth::after {
          content: '';
          position: absolute;
          top: -4px;
          width: 8px;
          height: 20px;
          background: #ff8c00;
        }

        .pumpkin-mouth::before {
          left: 15px;
        }

        .pumpkin-mouth::after {
          right: 15px;
        }

        .pumpkin-glow {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255, 200, 0, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-flicker 2s ease-in-out infinite;
        }

        @keyframes glow-flicker {
          0%, 100% { opacity: 0.8; }
          25% { opacity: 1; }
          50% { opacity: 0.6; }
          75% { opacity: 0.9; }
        }
      `}</style>
    </>
  );
};

export default HalloweenTheme;
