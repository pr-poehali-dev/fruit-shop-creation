import NewYearBackground from '@/components/NewYearBackground';
import HalloweenTheme from '@/components/HalloweenTheme';
import SummerTheme from '@/components/SummerTheme';

interface HolidayThemeRendererProps {
  theme?: string;
  snowEnabled?: boolean;
}

const HolidayThemeRenderer = ({ theme, snowEnabled = true }: HolidayThemeRendererProps) => {
  const currentTheme = theme || 'none';
  
  switch (currentTheme) {
    case 'new_year':
      return <NewYearBackground enabled={snowEnabled} />;
    case 'halloween':
      return <HalloweenTheme />;
    case 'summer':
      return <SummerTheme />;
    default:
      return null;
  }
};

export default HolidayThemeRenderer;