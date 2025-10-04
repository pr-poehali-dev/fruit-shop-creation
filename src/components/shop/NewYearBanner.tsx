import { useEffect, useRef, useState } from 'react';

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

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const NewYearBanner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const newYear = new Date('2026-01-01T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = newYear - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

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
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl animate-bounce">🎄</span>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              С Новым 2026 Годом!
            </h2>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎁</span>
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Пусть этот год принесёт вам радость, процветание и множество прекрасных моментов! 
          </p>

          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-300">⏰ До Нового 2026 года осталось:</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 min-w-[100px]">
                <div className="text-4xl md:text-5xl font-bold text-yellow-300">{timeLeft.days}</div>
                <div className="text-sm md:text-base text-blue-200 mt-1">дней</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 min-w-[100px]">
                <div className="text-4xl md:text-5xl font-bold text-pink-300">{timeLeft.hours}</div>
                <div className="text-sm md:text-base text-blue-200 mt-1">часов</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 min-w-[100px]">
                <div className="text-4xl md:text-5xl font-bold text-purple-300">{timeLeft.minutes}</div>
                <div className="text-sm md:text-base text-blue-200 mt-1">минут</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-white/30 min-w-[100px]">
                <div className="text-4xl md:text-5xl font-bold text-green-300">{timeLeft.seconds}</div>
                <div className="text-sm md:text-base text-blue-200 mt-1">секунд</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
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
      `}</style>
    </div>
  );
};

export default NewYearBanner;
