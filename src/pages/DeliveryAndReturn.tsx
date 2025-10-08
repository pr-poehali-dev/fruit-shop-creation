import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Footer from '@/components/shop/Footer';

const DeliveryAndReturn = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition">
            <Icon name="ArrowLeft" size={20} />
            <span>Вернуться на главную</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Доставка и возврат</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Truck" size={24} className="text-primary" />
              Способы доставки
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Store" size={20} className="text-primary" />
                  Самовывоз из питомника
                </h3>
                <p className="mb-2"><strong className="text-foreground">Стоимость:</strong> Бесплатно</p>
                <p className="mb-2"><strong className="text-foreground">Срок:</strong> В день заказа или на следующий день</p>
                <p>
                  Вы можете забрать заказ самостоятельно из нашего питомника. Адрес и график работы 
                  указаны в разделе «Контакты». При получении обязательно проверьте комплектность 
                  и состояние растений.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Car" size={20} className="text-primary" />
                  Курьерская доставка по городу
                </h3>
                <p className="mb-2"><strong className="text-foreground">Стоимость:</strong> От 300 рублей (зависит от района и веса заказа)</p>
                <p className="mb-2"><strong className="text-foreground">Срок:</strong> 1-2 рабочих дня</p>
                <p className="mb-3">
                  Курьер доставит заказ по указанному адресу в удобное для вас время. 
                  Мы согласуем время доставки заранее по телефону.
                </p>
                <p className="text-sm">
                  <strong className="text-foreground">Бесплатная доставка</strong> при заказе от 3000 рублей
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Package" size={20} className="text-primary" />
                  Доставка в другие города
                </h3>
                <p className="mb-2"><strong className="text-foreground">Способ:</strong> Транспортные компании (СДЭК, Boxberry, Почта России)</p>
                <p className="mb-2"><strong className="text-foreground">Стоимость:</strong> Рассчитывается индивидуально</p>
                <p className="mb-2"><strong className="text-foreground">Срок:</strong> От 3 до 14 дней (зависит от региона)</p>
                <p>
                  Мы тщательно упаковываем растения для транспортировки. Стоимость доставки 
                  рассчитывается по тарифам выбранной транспортной компании.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-primary" />
                  Для юридических лиц
                </h3>
                <p className="mb-2"><strong className="text-foreground">Доставка:</strong> Индивидуальные условия</p>
                <p className="mb-2"><strong className="text-foreground">Оплата:</strong> По безналичному расчету с НДС</p>
                <p>
                  Для оптовых покупателей и юридических лиц предоставляем специальные условия 
                  доставки и оплаты. Свяжитесь с нами для обсуждения деталей.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="CreditCard" size={24} className="text-primary" />
              Способы оплаты
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">💰 Наличными при получении</h3>
                <p className="text-sm">Оплата курьеру или в питомнике при самовывозе</p>
              </div>
              
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">💳 Банковской картой онлайн</h3>
                <p className="text-sm">Безопасная оплата через платежную систему</p>
              </div>
              
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">🎁 Бонусами</h3>
                <p className="text-sm">Используйте бонусы программы лояльности</p>
              </div>
              
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">🏢 Безналичный расчет</h3>
                <p className="text-sm">Для юридических лиц по счету</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="RefreshCw" size={24} className="text-primary" />
              Возврат и обмен
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Sprout" size={20} className="text-primary" />
                  Живые растения
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Осмотр обязателен при получении в присутствии курьера или сотрудника питомника</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Возврат возможен при явных дефектах: болезни, повреждения, несоответствие описанию</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="XCircle" size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Возврат по причине «не понравилось» или неприживаемости невозможен</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="Camera" size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>При обнаружении дефектов сфотографируйте растение и свяжитесь с нами в течение 24 часов</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Box" size={20} className="text-primary" />
                  Семена и товары для сада
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Возврат в течение 14 дней с момента получения</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Товар должен быть в оригинальной упаковке с сохранением товарного вида</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Обмен на аналогичный товар или возврат денежных средств</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="FileText" size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Необходимо предъявить чек или подтверждение заказа</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Icon name="AlertCircle" size={20} className="text-amber-600" />
                  Важная информация
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Возврат денежных средств производится тем же способом, которым была произведена оплата</li>
                  <li>• Срок возврата денег — до 10 рабочих дней с момента получения товара обратно</li>
                  <li>• Стоимость обратной доставки при возврате по вине Покупателя оплачивается Покупателем</li>
                  <li>• При возврате по вине Продавца все расходы на доставку компенсируются</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Headphones" size={24} className="text-primary" />
              Остались вопросы?
            </h2>
            <p>
              Если у вас возникли вопросы по доставке или возврату, свяжитесь с нами любым удобным способом:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2">
                <Icon name="MessageCircle" size={18} className="text-primary" />
                <span>Форма обратной связи на сайте (раздел «Контакты»)</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Phone" size={18} className="text-primary" />
                <span>Телефон службы поддержки</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Mail" size={18} className="text-primary" />
                <span>Электронная почта</span>
              </li>
            </ul>
          </section>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeliveryAndReturn;
