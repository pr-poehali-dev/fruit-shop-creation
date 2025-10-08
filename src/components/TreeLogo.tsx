interface TreeLogoProps {
  size?: number;
}

const TreeLogo = ({ size = 40 }: TreeLogoProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#2D5016"/>
      
      <rect x="44" y="55" width="12" height="25" rx="2" fill="#5D3A1A"/>
      
      <ellipse cx="50" cy="35" rx="20" ry="18" fill="#4A7C2E"/>
      <ellipse cx="50" cy="42" rx="18" ry="16" fill="#5A9437"/>
      <ellipse cx="50" cy="48" rx="15" ry="13" fill="#6DB043"/>
      
      <ellipse cx="35" cy="40" rx="12" ry="11" fill="#5A9437"/>
      <ellipse cx="65" cy="40" rx="12" ry="11" fill="#5A9437"/>
      
      <ellipse cx="38" cy="48" rx="10" ry="9" fill="#6DB043"/>
      <ellipse cx="62" cy="48" rx="10" ry="9" fill="#6DB043"/>
      
      <circle cx="45" cy="38" r="3" fill="#8BC34A" opacity="0.6"/>
      <circle cx="55" cy="36" r="2.5" fill="#8BC34A" opacity="0.6"/>
      <circle cx="50" cy="44" r="2" fill="#8BC34A" opacity="0.7"/>
      <circle cx="42" cy="46" r="2" fill="#8BC34A" opacity="0.5"/>
      <circle cx="58" cy="45" r="2.5" fill="#8BC34A" opacity="0.6"/>
    </svg>
  );
};

export default TreeLogo;
