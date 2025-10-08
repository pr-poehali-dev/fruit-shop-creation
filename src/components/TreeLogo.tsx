interface TreeLogoProps {
  size?: number;
}

const TreeLogo = ({ size = 40 }: TreeLogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#3D6B2E"/>
      
      <rect x="43" y="52" width="14" height="30" rx="3" fill="#6B4423"/>
      <rect x="45" y="55" width="3" height="25" fill="#8B5A3C" opacity="0.4"/>
      
      <path d="M50 20 L35 45 L65 45 Z" fill="#5C8F3F"/>
      <path d="M50 28 L38 48 L62 48 Z" fill="#6FA84D"/>
      <path d="M50 36 L40 52 L60 52 Z" fill="#7FBF5A"/>
      
      <circle cx="44" cy="35" r="2.5" fill="#90D068" opacity="0.7"/>
      <circle cx="56" cy="33" r="2" fill="#90D068" opacity="0.6"/>
      <circle cx="50" cy="40" r="2.5" fill="#90D068" opacity="0.8"/>
      <circle cx="47" cy="45" r="2" fill="#90D068" opacity="0.5"/>
      <circle cx="53" cy="43" r="2.5" fill="#90D068" opacity="0.6"/>
      
      <ellipse cx="50" cy="82" rx="8" ry="2" fill="#2A5020" opacity="0.3"/>
    </svg>
  );
};

export default TreeLogo;