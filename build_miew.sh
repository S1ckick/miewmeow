#!/bin/bash
pip install nodeenv
nodeenv -p
deactivate
source env/bin/activate
npm install -g yarn
cd miew 
yarn
cd packages/lib && yarn run ci
cd ../../../
cp miew/packages/lib/build/dist/Miew.js meow/static/
cp miew/packages/lib/build/dist/Miew.min.css meow/static/