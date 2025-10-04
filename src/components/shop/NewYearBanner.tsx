import { useEffect, useRef } from 'react';

interface Firework {
  x: number;
  y: number;
  particles: Particle[];
  exploded: boolean;
  age: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const NewYearBanner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fireworks: Firework[] = [];
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a78bfa', '#fb7185'];

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      
      fireworks.push({
        x,
        y,
        particles: [],
        exploded: false,
        age: 0
      });
    };

    const explodeFirework = (firework: Firework) => {
      const particleCount = 30;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 3 + 2;
        
        firework.particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          life: 1
        });
      }
      
      firework.exploded = true;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.02) {
        createFirework();
      }

      fireworks.forEach((firework, index) => {
        firework.age++;
        
        if (!firework.exploded && firework.age > 30) {
          explodeFirework(firework);
        }

        firework.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.1;
          particle.life -= 0.015;

          if (particle.life > 0) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });

        firework.particles = firework.particles.filter(p => p.life > 0);

        if (firework.exploded && firework.particles.length === 0) {
          fireworks.splice(index, 1);
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
    <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-16 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="snowflake" style={{ left: '10%', animationDelay: '0s' }}>❄️</div>
        <div className="snowflake" style={{ left: '20%', animationDelay: '1s' }}>❄️</div>
        <div className="snowflake" style={{ left: '30%', animationDelay: '2s' }}>❄️</div>
        <div className="snowflake" style={{ left: '40%', animationDelay: '0.5s' }}>❄️</div>
        <div className="snowflake" style={{ left: '50%', animationDelay: '1.5s' }}>❄️</div>
        <div className="snowflake" style={{ left: '60%', animationDelay: '2.5s' }}>❄️</div>
        <div className="snowflake" style={{ left: '70%', animationDelay: '0.8s' }}>❄️</div>
        <div className="snowflake" style={{ left: '80%', animationDelay: '1.8s' }}>❄️</div>
        <div className="snowflake" style={{ left: '90%', animationDelay: '2.2s' }}>❄️</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="text-5xl animate-bounce">🎄</span>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                С Новым 2025 Годом!
              </h2>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎁</span>
            </div>
            
            <p className="text-xl md:text-2xl mb-6 text-blue-100">
              Пусть этот год принесёт вам радость, процветание и множество прекрасных моментов! 
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-2xl mr-2">🌟</span>
                <span className="text-lg">Волшебства</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-2xl mr-2">💚</span>
                <span className="text-lg">Здоровья</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-2xl mr-2">🎉</span>
                <span className="text-lg">Счастья</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="snowman-container">
              <div className="speech-bubble">
                <p className="text-lg font-semibold text-gray-800">
                  🎅 С наступающим!<br/>
                  Желаю уюта и тепла! ❄️
                </p>
              </div>
              
              <div className="snowman">
                <div className="snowman-head">
                  <div className="eyes">
                    <div className="eye left"></div>
                    <div className="eye right"></div>
                  </div>
                  <div className="carrot-nose"></div>
                  <div className="smile"></div>
                </div>
                <div className="snowman-body">
                  <div className="button"></div>
                  <div className="button"></div>
                  <div className="button"></div>
                </div>
                <div className="snowman-base"></div>
                <div className="scarf"></div>
                <div className="hat">
                  <div className="hat-top"></div>
                  <div className="hat-brim"></div>
                </div>
                <div className="arm left-arm">
                  <div className="branch"></div>
                  <div className="branch"></div>
                </div>
                <div className="arm right-arm">
                  <div className="branch"></div>
                  <div className="branch"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .snowflake {
          position: absolute;
          top: -20px;
          font-size: 1.5rem;
          animation: fall 8s linear infinite;
          opacity: 0.8;
        }

        @keyframes fall {
          0% {
            top: -20px;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            top: 100%;
            transform: translateX(100px) rotate(360deg);
          }
        }

        .snowman-container {
          position: relative;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .speech-bubble {
          position: absolute;
          top: -80px;
          right: -20px;
          background: white;
          padding: 12px 20px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: pulse 2s ease-in-out infinite;
          min-width: 200px;
        }

        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 30px;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid white;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .snowman {
          position: relative;
          width: 120px;
          height: 200px;
        }

        .snowman-head {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .eyes {
          position: absolute;
          top: 15px;
          width: 100%;
        }

        .eye {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #333;
          border-radius: 50%;
        }

        .eye.left { left: 12px; }
        .eye.right { right: 12px; }

        .carrot-nose {
          position: absolute;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 12px solid #ff8c42;
        }

        .smile {
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 10px;
          border: 2px solid #333;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }

        .snowman-body {
          position: absolute;
          top: 55px;
          left: 50%;
          transform: translateX(-50%);
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .button {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #333;
          border-radius: 50%;
        }

        .button:nth-child(1) { top: 15px; }
        .button:nth-child(2) { top: 32px; }
        .button:nth-child(3) { top: 49px; }

        .snowman-base {
          position: absolute;
          top: 130px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 90px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .scarf {
          position: absolute;
          top: 48px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 12px;
          background: #e74c3c;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .scarf::after {
          content: '';
          position: absolute;
          top: 6px;
          right: -8px;
          width: 20px;
          height: 25px;
          background: #c0392b;
          border-radius: 3px;
        }

        .hat {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
        }

        .hat-top {
          width: 35px;
          height: 30px;
          background: #2c3e50;
          border-radius: 8px 8px 0 0;
          margin: 0 auto;
        }

        .hat-brim {
          width: 50px;
          height: 8px;
          background: #2c3e50;
          border-radius: 4px;
          margin-top: -2px;
        }

        .arm {
          position: absolute;
          top: 70px;
          width: 40px;
          height: 3px;
          background: #8b4513;
        }

        .left-arm {
          left: -20px;
          transform: rotate(-30deg);
        }

        .right-arm {
          right: -20px;
          transform: rotate(30deg);
        }

        .branch {
          position: absolute;
          width: 15px;
          height: 2px;
          background: #8b4513;
        }

        .left-arm .branch:nth-child(1) {
          top: -5px;
          right: 5px;
          transform: rotate(-45deg);
        }

        .left-arm .branch:nth-child(2) {
          top: 3px;
          right: 5px;
          transform: rotate(45deg);
        }

        .right-arm .branch:nth-child(1) {
          top: -5px;
          left: 5px;
          transform: rotate(45deg);
        }

        .right-arm .branch:nth-child(2) {
          top: 3px;
          left: 5px;
          transform: rotate(-45deg);
        }
      `}</style>
    </div>
  );
};

export default NewYearBanner;
