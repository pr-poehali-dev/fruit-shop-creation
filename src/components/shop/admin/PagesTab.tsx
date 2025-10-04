import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface PagesTabProps {
  siteSettings: any;
  onSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PagesTab = ({ siteSettings, onSaveSettings }: PagesTabProps) => {
  return (
    <Tabs defaultValue="about" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="about">
          <Icon name="Info" size={16} className="mr-2" />
          О нас
        </TabsTrigger>
        <TabsTrigger value="care">
          <Icon name="Leaf" size={16} className="mr-2" />
          Уход за растениями
        </TabsTrigger>
        <TabsTrigger value="delivery">
          <Icon name="Truck" size={16} className="mr-2" />
          Доставка
        </TabsTrigger>
      </TabsList>

      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>Страница "О нас"</CardTitle>
            <CardDescription>Редактирование содержимого страницы о компании</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about_title">Заголовок</Label>
                <Input
                  id="about_title"
                  name="about_title"
                  defaultValue={siteSettings?.about_title || 'О нас'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about_text">Текст</Label>
                <Textarea
                  id="about_text"
                  name="about_text"
                  rows={6}
                  defaultValue={siteSettings?.about_text || ''}
                />
              </div>
              <Button type="submit">
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить изменения
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="care">
        <Card>
          <CardHeader>
            <CardTitle>Страница "Уход за растениями"</CardTitle>
            <CardDescription>Редактирование советов по уходу</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="care_title">Заголовок страницы</Label>
                <Input
                  id="care_title"
                  name="care_title"
                  defaultValue={siteSettings?.care_title || 'Уход за растениями'}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="Droplets" size={18} />
                  Раздел 1: Полив
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="care_watering_title">Заголовок</Label>
                  <Input
                    id="care_watering_title"
                    name="care_watering_title"
                    defaultValue={siteSettings?.care_watering_title || 'Полив'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="care_watering_text">Текст</Label>
                  <Textarea
                    id="care_watering_text"
                    name="care_watering_text"
                    rows={3}
                    defaultValue={siteSettings?.care_watering_text || ''}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="Sun" size={18} />
                  Раздел 2: Освещение
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="care_lighting_title">Заголовок</Label>
                  <Input
                    id="care_lighting_title"
                    name="care_lighting_title"
                    defaultValue={siteSettings?.care_lighting_title || 'Освещение'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="care_lighting_text">Текст</Label>
                  <Textarea
                    id="care_lighting_text"
                    name="care_lighting_text"
                    rows={3}
                    defaultValue={siteSettings?.care_lighting_text || ''}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="Scissors" size={18} />
                  Раздел 3: Обрезка
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="care_pruning_title">Заголовок</Label>
                  <Input
                    id="care_pruning_title"
                    name="care_pruning_title"
                    defaultValue={siteSettings?.care_pruning_title || 'Обрезка'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="care_pruning_text">Текст</Label>
                  <Textarea
                    id="care_pruning_text"
                    name="care_pruning_text"
                    rows={3}
                    defaultValue={siteSettings?.care_pruning_text || ''}
                  />
                </div>
              </div>

              <Button type="submit">
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить изменения
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="delivery">
        <Card>
          <CardHeader>
            <CardTitle>Страница "Доставка и оплата"</CardTitle>
            <CardDescription>Редактирование информации о доставке и оплате</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delivery_title">Заголовок страницы</Label>
                <Input
                  id="delivery_title"
                  name="delivery_title"
                  defaultValue={siteSettings?.delivery_title || 'Доставка и оплата'}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Способы доставки</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_courier_title">Заголовок 1</Label>
                  <Input
                    id="delivery_courier_title"
                    name="delivery_courier_title"
                    defaultValue={siteSettings?.delivery_courier_title || 'Курьерская доставка'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_courier_text">Описание 1</Label>
                  <Input
                    id="delivery_courier_text"
                    name="delivery_courier_text"
                    defaultValue={siteSettings?.delivery_courier_text || 'По Москве и области — 500 ₽'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_transport_title">Заголовок 2</Label>
                  <Input
                    id="delivery_transport_title"
                    name="delivery_transport_title"
                    defaultValue={siteSettings?.delivery_transport_title || 'Транспортная компания'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_transport_text">Описание 2</Label>
                  <Input
                    id="delivery_transport_text"
                    name="delivery_transport_text"
                    defaultValue={siteSettings?.delivery_transport_text || 'По России — рассчитывается индивидуально'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_pickup_title">Заголовок 3</Label>
                  <Input
                    id="delivery_pickup_title"
                    name="delivery_pickup_title"
                    defaultValue={siteSettings?.delivery_pickup_title || 'Самовывоз'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_pickup_text">Описание 3</Label>
                  <Input
                    id="delivery_pickup_text"
                    name="delivery_pickup_text"
                    defaultValue={siteSettings?.delivery_pickup_text || 'Бесплатно из питомника'}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Способы оплаты</h4>
                <div className="space-y-2">
                  <Label htmlFor="payment_title">Заголовок секции</Label>
                  <Input
                    id="payment_title"
                    name="payment_title"
                    defaultValue={siteSettings?.payment_title || 'Способы оплаты'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_methods">Методы оплаты (каждый с новой строки)</Label>
                  <Textarea
                    id="payment_methods"
                    name="payment_methods"
                    rows={4}
                    defaultValue={
                      siteSettings?.payment_methods 
                        ? (Array.isArray(siteSettings.payment_methods) 
                            ? siteSettings.payment_methods.join('\n') 
                            : siteSettings.payment_methods)
                        : 'Банковская карта онлайн\nНаличные при получении\nБанковский перевод'
                    }
                  />
                </div>
              </div>

              <Button type="submit">
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить изменения
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PagesTab;
