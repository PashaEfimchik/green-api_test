# Установка зависимостей
Клонируйте репозиторий с проектом на свой компьютер:
```
git clone https://github.com/PashaEfimchik/green-api_test.git
cd green-api_test
```
Установите зависимости для обоих микросервисов М1 и М2, выполнив следующую команду:
```
npm install
```
Также необходимо установить [RabbitMQ](https://www.cherryservers.com/blog/how-to-install-and-start-using-rabbitmq-on-ubuntu-22-04) (в данном случае для Ubuntu) и убедиться, что он работает на порту 5672 (стандартный порт RabbitMQ)
# Настройка окружения
Откройте файлы [microservice_1.js](https://github.com/PashaEfimchik/green-api_test/blob/main/microservice_1.js) и [microservice_2.js](https://github.com/PashaEfimchik/green-api_test/blob/main/microservice_2.js) и найдите строки подключения к RabbitMQ:
```
const url = 'amqp://guest:guest@localhost';
```
Если у вас другие учетные данные для подключения к RabbitMQ, замените их в этой строке. Если учетные данные не используются (например, используется пользователь "guest" с паролем "guest"), оставьте эту строку без изменений.
# Запуск микросервисов
В одном терминале нужно запустить микросервис M1:
```
node microservice_1.js
```
Далее создать другой терминал и запустить микросервис M2:
```
node microservice_2.js
```
Теперь оба микросервиса М1 и М2 должны быть успешно запущены и готовы к обработке входящих HTTP запросов через RabbitMQ.  

[Скриншоты/Запись работы программы](https://drive.google.com/drive/folders/16gTr4NCzL_keUkDahEHPOprVX1h5j99t?usp=sharing)
