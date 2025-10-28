import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface CitySelectorProps {
  selectedCity: string;
  isOpen: boolean;
  searchQuery: string;
  filteredCities: string[];
  onOpenChange: (open: boolean) => void;
  onSearchChange: (query: string) => void;
  onCitySelect: (city: string) => void;
}

export const CitySelector = ({
  selectedCity,
  isOpen,
  searchQuery,
  filteredCities,
  onOpenChange,
  onSearchChange,
  onCitySelect
}: CitySelectorProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Выберите город</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(true)}
          className="w-full justify-start"
        >
          <Icon name="MapPin" size={16} className="mr-2" />
          {selectedCity || 'Выберите город доставки'}
        </Button>
        {selectedCity && (
          <p className="text-xs text-muted-foreground">
            {selectedCity === 'Барнаул' ? '✓ Доступна оплата наличными' : 'Доступна только онлайн-оплата'}
          </p>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите город</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Поиск города..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-2 space-y-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <Button
                      key={city}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onCitySelect(city)}
                    >
                      {city}
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Город не найден
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
