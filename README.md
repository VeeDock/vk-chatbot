> Подписывайтесь на паблик во ВКонтакте →
> [Чат-боты](https://vk.com/botsforchats)

## Содержание
0. [Требования](#Требования)
1. [Установка](#Установка)
2. [Настройка](#Настройка)
3. [Запуск](#Запуск)
4. [Добавление команд](#Добавление-команд)

## Требования
Бот работает на виртуальном выделенном сервере с установленной операционной системой Ubuntu 16.04, поэтому дальнейшие инструкции будут применимы именно к ней.  

##### Конфигурация сервера
* __OS__: Ubuntu 16.04
* __CPU__: 1x2.2 GHz
* __RAM__: 512 Mb

## Установка
##### Настройка сервера
* [Initial Server Setup with Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04)

##### Установка Node.js & npm
* [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

##### Установка менеджера процессов PM2
```
sudo npm i -g pm2
```

А также его настройка  
* [Manage Application with PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#manage-application-with-pm2)

##### Установка и настройка Redis
* [How To Install and Configure Redis on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-redis-on-ubuntu-16-04)

Для сервера Redis использую также следующие параметры:  
```
maxmemory 10mb
maxmemory-policy allkeys-lru
```

##### Установка MongoDB
* [How to Install MongoDB on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04)

##### Установка и настройка Nginx
* [How To Install Nginx on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)
* [How To Secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
* [Set Up Nginx as a Reverse Proxy Server](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server)

HTTP заголовок `X-Frame-Options` выставляется в самом приложении, поэтому из конфига Nginx его можно удалить, чтобы не возникало конфликтов.

##### Клонирование прокета и установка зависимостей
```
git clone https://github.com/olnaz/node-vkbot.git
cd node-vkbot
npm i
```

## Настройка
#### Редактирование файлов
* _cfg/accounts.default.js_  
Здесь находится информация об аккаунтах ботов. Ботов может быть несколько.

* _cfg/config.default.js_  
Основной конфиг приложения.

Необходимо заполнить все поля, заменив строки вида _"&lt;string&gt;"_ на свои данные.  
После завершения редактирования данных файлов, необходимо убрать у них постфиксы _".default"_.

## Запуск
Все команды выполняются в корневой директории проекта.  

##### Сброка продакшн-версии
```
npm run build
```

##### Запуск приложения
```
npm start
```

##### Запуск локального live-reload сервера
```
npm run dev
```

## Добавление команд
Все команды, которые выполняет бот, находятся в папке **src/bot/commands**. Имя файла является основным названием команды.  

Модуль каждой команды должен экспортировать объект следующего вида:  
```javascript
{
  /**
   * Алиасы команды.
   * @type {Array of String}
   * @optional
   */
  aliases, 

  /**
   * Описание команды (доступно по команде: /команда /?).
   * @type {String}
   * @optional
   */
  help_text, 

  /**
   * Цена использования команды (кол-во поинтов).
   * @type {Number}
   * @optional
   */
  price, 

  /**
   * Приватность команды:
   *   true:  доступна только админам;
   *   false: доступна всем.
   * @type {Boolean}
   * @optional
   */
  private, 

  /**
   * Функция, которая выполняется при вызове команды.
   * На вход первым аргументом принимает объект:
   *   {
   *     id:      Number,           // ID текущего бота
   *     app:     Reference,        // Ссылка на экземпляр Application
   *     args:    CommandArguments, // Экземпляр класса CommandArguments
   *     options: Object,           // Настройки команды (config.js#commands.<command_name>)
   *     user:    Object            // Объект текущего пользователя (database/models/user.js)
   *   }
   * @type {Function}
   * @required
   * @async
   */
  run, 

  /**
   * Уникальность команды:
   *   'mchat': доступна только в беседах;
   *   'pm':    доступна только в личных сообщениях;
   *   '':      доступна везде.
   * @type {String}
   * @optional
   */
  uniqueness
}
```

#### TODO
- [ ] **Add**: /кинопоиск <sup>[[1]](http://getmovie.cc/api-kinopoisk.html) [[2]](http://kparser.pp.ua/)</sup>
- [ ] **Add**: /перевод <sup>[[1]](http://www.transltr.org/) [[2]](https://tech.yandex.ru/translate/doc/dg/reference/translate-docpage/)</sup>
- [ ] **Fix**: Юзер может пригласить второго бота в беседу, избежав выхода первого, когда используется кастомный парсер (chat-mode != default).
- [ ] **Fix**: Условие "followed" работает не так, как должно.
- [ ] Решить что-то с капчей при загрузке медиа в ВК. (/tts, /klass, /unsplash)
- [ ] Придумать что-нибудь с растущей очередью сообщений, когда юзеры долго не вводят капчу.
- [ ] Переработать и вернуть команды: /img, /g, /wiki (Google постоянно отвечает капчей.)
- [ ] Доработать **/me**.
