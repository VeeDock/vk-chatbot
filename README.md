
> Подписывайтесь на паблик во ВКонтакте →
> [Чат-боты](https://vk.com/botsforchats)

## Установка
#### Требования
* Ubuntu 16.04
* Node.js >=6.0.0

##### Node.js & npm
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
```

##### PM2
```
sudo npm i -g pm2
```

##### Клонируем проект и устанавливаем зависимости
```
git clone https://github.com/olnaz/node-vkbot.git
cd node-vkbot
npm i
```

## Настройка
#### Создание приложения
Перейдите по ссылке [vk.com/apps](https://vk.com/apps?act=manage) и создайте собственное Standalone-приложение.  
Добавьте в ваше приложение execute-методы из папки **_/execute**. (имя файла = название метода)  

#### Редактирование файлов
* _src/accounts.default.js_  
Здесь находится информация об аккаунтах ботов. Ботов может быть несколько.

* _src/config.default.js_  
Основной конфиг приложения.

После завершения редактирования данных файлов, необходимо убрать у них постфиксы ".default".

## Запуск
Все команды выполняются в корневой директории проекта.  

##### Запуск ботов
```
node ./src/main
```
