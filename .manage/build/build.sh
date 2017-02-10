# Clean the build folder
rm -rf ./build/*;

# Make .logs, .temp and static folders
mkdir -p ./build/.logs ./build/.temp ./build/www/public/static;

# Copy the files
cp -R ./src/bot ./build/;
cp -R ./src/config ./build/config/;
cp -R ./src/data ./build/data/;
cp -R ./src/database ./build/database/;
cp -R ./src/www/backend/* ./build/www/;
cp ./cfg/accounts.js ./build/config/;
cp ./cfg/config.js ./build/config/;

# Copy the statics
cp -R ./src/www/frontend/static/* ./build/www/public/static/;

# Build the frontend part
node ./.manage/build/build.js;