#!/bin/bash

# scaffold.sh - Auto-generate files for a new page
# sh scaffold.sh name-of-page
# $1 = name-of-page

if [ "$1" == "" ]; then
  echo "Add page name name: sh scaffold.sh home-page"
  exit 1
fi

##### Constants

PAGE_NAME=$1
STYLES_LOCATION="src/styles/$PAGE_NAME.scss"
SCRIPTS_LOCATION="src/js/$PAGE_NAME.js"
EJS_LOCATION="src/templates/$PAGE_NAME.ejs"
NOW=$(date +'%Y-%m-%d')

##### Functions


make_scss_file()
{
echo "
.$PAGE_NAME {

}
" >> $STYLES_LOCATION
echo "created $STYLES_LOCATION"
}


make_js_file()
{
echo "
module.exports = {
  init() {

  },
};
" >> $SCRIPTS_LOCATION
echo "created $SCRIPTS_LOCATION"
}



make_ejs_file() {
echo "---
title: ''
description: ''
date: $NOW
priority: 0.8
pageClasses:
  - '$PAGE_NAME'
layout: base
styles:
  - 'main'
  - '$PAGE_NAME'
---
" >> $EJS_LOCATION
echo "created $EJS_LOCATION"
}

##### Main

make_js_file &
make_scss_file &
make_ejs_file &
wait

echo "DONE"