import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Footer from '@/components/shop/Footer';

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-bold mb-6">Политика обработки персональных данных</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика обработки персональных данных (далее — Политика) разработана в соответствии 
              с Федеральным законом от 27.07.2006 №152-ФЗ «О персональных данных».
            </p>
            <p className="mt-2">
              Политика определяет порядок обработки персональных данных и меры по обеспечению безопасности 
              персональных данных в интернет-магазине «Питомник растений» (далее — Оператор).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Персональные данные, которые обрабатываются</h2>
            <p>Оператор обрабатывает следующие персональные данные:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>ФИО (имя, фамилия, отчество)</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Адрес доставки</li>
              <li>История заказов</li>
              <li>Данные о предпочтениях и избранных товарах</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Цели обработки персональных данных</h2>
            <p>Персональные данные обрабатываются в следующих целях:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Регистрация пользователя на сайте</li>
              <li>Обработка и выполнение заказов</li>
              <li>Доставка товаров</li>
              <li>Информирование о статусе заказа</li>
              <li>Предоставление программы лояльности и бонусов</li>
              <li>Улучшение качества обслуживания</li>
              <li>Обратная связь и техническая поддержка</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Правовые основания обработки</h2>
            <p>
              Оператор обрабатывает персональные данные на основании:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Согласия субъекта персональных данных</li>
              <li>Заключения и исполнения договора купли-продажи</li>
              <li>Федерального закона №152-ФЗ «О персональных данных»</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Порядок и условия обработки</h2>
            <p>
              Обработка персональных данных осуществляется с использованием средств автоматизации 
              и без использования таких средств. Оператор принимает необходимые правовые, организационные 
              и технические меры для защиты персональных данных от неправомерного доступа, уничтожения, 
              изменения, блокирования, копирования, распространения.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Передача персональных данных третьим лицам</h2>
            <p>
              Персональные данные могут быть переданы третьим лицам только в следующих случаях:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Службам доставки (для выполнения доставки заказа)</li>
              <li>Платежным системам (для обработки платежей)</li>
              <li>По требованию уполномоченных государственных органов</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Права субъектов персональных данных</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Получать информацию о наличии и содержании своих персональных данных</li>
              <li>Требовать уточнения, обновления или удаления персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Обжаловать действия Оператора в уполномоченный орган по защите прав субъектов персональных данных</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Сроки обработки</h2>
            <p>
              Персональные данные обрабатываются в течение срока действия согласия субъекта персональных данных 
              или до момента достижения целей обработки. Персональные данные могут храниться дольше в случаях, 
              предусмотренных законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Изменение Политики</h2>
            <p>
              Оператор имеет право вносить изменения в настоящую Политику. Новая редакция Политики вступает 
              в силу с момента ее размещения на сайте.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Контактная информация</h2>
            <p>
              По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам 
              через форму обратной связи на сайте или по контактным данным, указанным в разделе «Контакты».
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

export default PrivacyPolicy;
