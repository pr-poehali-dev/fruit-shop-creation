interface LeafyTitleProps {
  text: string;
  className?: string;
}

const LeafyTitle = ({ text, className = '' }: LeafyTitleProps) => {
  return (
    <div className={`relative ${className}`}>
      <style>{`
        @keyframes leafSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        .leafy-text {
          position: relative;
          display: inline-block;
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          color: #1a3a0d;
          text-shadow: 
            0 0 3px rgba(255, 255, 255, 0.8),
            0 0 8px rgba(255, 255, 255, 0.6),
            2px 2px 0px rgba(139, 195, 74, 0.6),
            -1px -1px 0px rgba(255, 255, 255, 0.4),
            3px 3px 6px rgba(0, 0, 0, 0.5);
          letter-spacing: 0.08em;
          background: linear-gradient(180deg, #5a9c3c 0%, #2d5a18 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.4)) contrast(1.3) brightness(1.2);
        }
        
        .leaf-decoration {
          position: absolute;
          font-size: 0.6em;
          opacity: 0.8;
          animation: leafSway 3s ease-in-out infinite;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));
        }
        
        .leaf-1 { top: -0.3em; left: 0.2em; animation-delay: 0s; }
        .leaf-2 { top: -0.2em; right: 0.1em; animation-delay: 0.5s; }
        .leaf-3 { bottom: -0.3em; left: 30%; animation-delay: 1s; }
        .leaf-4 { top: 0.1em; left: 50%; animation-delay: 1.5s; transform: rotate(45deg); }
      `}</style>
      
      <span className="leafy-text">
        {text}
        <span className="leaf-decoration leaf-1">🍃</span>
        <span className="leaf-decoration leaf-2">🌿</span>
        <span className="leaf-decoration leaf-3">🍂</span>
        <span className="leaf-decoration leaf-4">🌱</span>
      </span>
    </div>
  );
};

export default LeafyTitle;