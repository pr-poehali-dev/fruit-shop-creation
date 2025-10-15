export const getBackgroundStyle = (holidayTheme?: string) => {
  const theme = holidayTheme || 'none';
  switch (theme) {
    case 'new_year':
      return 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
    case 'halloween':
      return 'bg-gradient-to-br from-purple-900 via-gray-900 to-orange-900';
    case 'summer':
      return 'bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50';
    default:
      return 'bg-background';
  }
};
