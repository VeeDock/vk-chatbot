export default () => {
  let search = location.search.slice(1);

  if (!search) 
    return;

  let user = {};
  let bots = [];

  for (let keyValue of search.split('&')) {
    let keyValueArray = keyValue.split('=');

    let key   = keyValueArray[0];
    let value = keyValueArray[1];

    if (key === 'viewer_id') {
      user.id = parseInt(value);

      continue;
    }

    if (key === 'viewer_type') {
      user.type = parseInt(value);

      continue;
    }

    if (key === 'auth_key') {
      user.auth_key = value;

      continue;
    }

    if (key === 'api_result') {
      try {
        let result = JSON.parse(decodeURIComponent(value)).response;

        for (let bot of result) {
          bots.push({
            id:         bot.uid, 
            name:       bot.first_name + ' ' + bot.last_name, 
            avatar_url: bot.photo_50, 
            status:     bot.status
          });
        }
      } catch (e) {
        continue;
      }
    }
  }

  return { user, bots };
}