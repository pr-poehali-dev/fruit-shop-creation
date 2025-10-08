import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Footer from '@/components/shop/Footer';

const Terms = () => {
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
        <h1 className="text-3xl font-bold mb-6">Пользовательское соглашение</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между 
              интернет-магазином «Питомник растений» (далее — Продавец) и физическим лицом, 
              оформляющим заказ через интернет-магазин (далее — Покупатель).
            </p>
            <p className="mt-2">
              Оформляя заказ на сайте, Покупатель соглашается с условиями настоящего Соглашения.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Предмет соглашения</h2>
            <p>
              Продавец обязуется передать Покупателю товар (растения, семена, товары для сада), 
              а Покупатель обязуется принять и оплатить товар на условиях настоящего Соглашения.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Оформление заказа</h2>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Покупатель оформляет заказ через корзину на сайте</li>
              <li>После оформления заказа Покупатель получает подтверждение на указанный номер телефона или email</li>
              <li>Продавец вправе отказать в выполнении заказа при отсутствии товара или недостоверности данных Покупателя</li>
              <li>Цены на товары указаны на сайте и могут быть изменены Продавцом в одностороннем порядке</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Доставка и оплата</h2>
            <p className="mb-2">
              <strong>Способы доставки:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Самовывоз из питомника (бесплатно)</li>
              <li>Курьерская доставка по городу</li>
              <li>Доставка в другие регионы через транспортные компании</li>
            </ul>
            
            <p className="mt-4 mb-2">
              <strong>Способы оплаты:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Наличными при получении</li>
              <li>Банковской картой онлайн</li>
              <li>Бонусами программы лояльности</li>
              <li>Безналичный расчет для юридических лиц</li>
            </ul>
            
            <p className="mt-4">
              Подробные условия доставки указаны в разделе «Доставка и возврат» на сайте.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Возврат и обмен товара</h2>
            <p className="mb-2">
              <strong>Живые растения:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Возврат возможен только при наличии явных дефектов, обнаруженных при получении</li>
              <li>Покупатель обязан осмотреть растение при получении и зафиксировать дефекты</li>
              <li>Возврат по причине неприживаемости растения не производится</li>
            </ul>
            
            <p className="mb-2">
              <strong>Семена и товары для сада:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Возврат возможен в течение 14 дней с момента получения</li>
              <li>Товар должен сохранять товарный вид, упаковку и все ярлыки</li>
              <li>Возврат производится при предъявлении чека или подтверждения заказа</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Гарантии и ответственность</h2>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Продавец гарантирует качество поставляемых растений на момент передачи Покупателю</li>
              <li>Продавец не несет ответственности за ненадлежащий уход за растениями после передачи Покупателю</li>
              <li>Покупатель несет ответственность за достоверность предоставленных при оформлении заказа данных</li>
              <li>Продавец не несет ответственности за задержки доставки по вине транспортной компании</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Программа лояльности</h2>
            <p>
              Покупатели могут участвовать в программе лояльности и получать бонусы за покупки. 
              Условия начисления и использования бонусов определяются правилами программы лояльности.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Конфиденциальность</h2>
            <p>
              Продавец обязуется не разглашать персональные данные Покупателя третьим лицам, 
              за исключением случаев, предусмотренных законодательством РФ и Политикой обработки 
              персональных данных.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Разрешение споров</h2>
            <p>
              Все споры и разногласия разрешаются путем переговоров. При невозможности достижения 
              соглашения споры разрешаются в судебном порядке в соответствии с законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Изменение условий</h2>
            <p>
              Продавец вправе изменять условия настоящего Соглашения в одностороннем порядке. 
              Новая редакция вступает в силу с момента размещения на сайте.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Контактная информация</h2>
            <p>
              По всем вопросам вы можете обратиться к нам через форму обратной связи на сайте 
              или по контактным данным, указанным в разделе «Контакты».
            </p>
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

export default Terms;
