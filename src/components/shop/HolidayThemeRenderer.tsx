import NewYearBackground from '@/components/NewYearBackground';
import HalloweenTheme from '@/components/HalloweenTheme';
import SummerTheme from '@/components/SummerTheme';

interface HolidayThemeRendererProps {
  theme?: string;
}

const HolidayThemeRenderer = ({ theme }: HolidayThemeRendererProps) => {
  const currentTheme = theme || 'none';
  
  switch (currentTheme) {
    case 'new_year':
      return <NewYearBackground />;
    case 'halloween':
      return <HalloweenTheme />;
    case 'summer':
      return <SummerTheme />;
    default:
      return null;
  }
};

export default HolidayThemeRenderer;
