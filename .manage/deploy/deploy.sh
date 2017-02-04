#!/bin/bash

HOST="$1"

ssh $HOST /bin/bash << EOF
  echo 'Turning bots off.. ';
  pm2 delete all &>/dev/null;

  echo -n 'Clearing `vkbot` folder.. ';
  rm -rf ~/vkbot && echo 'Done.';
EOF

echo -n 'Copying files to remote host.. ';
(
  rsync -ar ./build $HOST:~/vkbot/
  rsync -ar ./.manage $HOST:~/vkbot/
  rsync -ar ./package.json $HOST:~/vkbot/
) && echo 'Done.' || (echo 'Failed.' && exit 1);

ssh $HOST /bin/bash << EOF
  cd ./vkbot;

  echo -n 'Installing dependencies.. ';
  npm i --only=prod &>/dev/null && echo 'Done.';

  echo -n 'Starting the application.. ';
  npm start &>/dev/null && echo 'Started.' || echo 'Not started.';
EOF