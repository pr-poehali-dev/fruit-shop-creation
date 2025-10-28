import Icon from '@/components/ui/icon';

interface PreorderBannerProps {
  preorderMessage: string;
  preorderStartDate?: string;
  preorderEndDate?: string;
}

export const PreorderBanner = ({ preorderMessage, preorderStartDate, preorderEndDate }: PreorderBannerProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Icon name="Calendar" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Режим предзаказа</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{preorderMessage}</p>
          {(preorderStartDate || preorderEndDate) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {preorderStartDate && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  С {new Date(preorderStartDate).toLocaleDateString('ru-RU')}
                </span>
              )}
              {preorderEndDate && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  До {new Date(preorderEndDate).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
