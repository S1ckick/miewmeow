#!/bin/bash
cd miew 
yarn
cd packages/lib && yarn run ci
cd ../../../
cp miew/packages/lib/build/dist/Miew.js $PWD/meow/static/
cp miew/packages/lib/build/dist/Miew.min.css $PWD/meow/static/