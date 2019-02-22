#/bin/bash

# https://github.com/aws/aws-sdk-js/issues/1977
find ./node_modules -mtime +10950 -exec touch {} \;