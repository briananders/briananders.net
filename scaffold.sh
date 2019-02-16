#!/bin/bash

# scaffold.sh - A script to produce a basic wombat template
# sh scaffold.sh name-of-page
# $1 = name-of-page

if [ "$1" == "" ]; then
  echo "Don't forget to add your template name"
  exit 1
fi

##### Constants

TEMPLATE_NAME=$1
STYLES_LOCATION="src/styles/$TEMPLATE_NAME.scss"
SCRIPTS_LOCATION="src/js/$TEMPLATE_NAME.js"
EJS_LOCATION="src/templates/$TEMPLATE_NAME.ejs"

##### Functions


make_scss_file()
{
echo "
.$TEMPLATE_NAME {

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
date:
priority: 0.8
pageClasses:
  - '$TEMPLATE_NAME'
layout: base
styles:
  - 'main'
  - '$TEMPLATE_NAME'
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