#!/bin/zsh
echo "Changing build permissions to 755"
chmod -R 755 build/
echo "Moving Files to S3 staging"
aws s3 sync build/ s3://staging.briananders.net
echo "Done"

# /bin/zsh deploy.sh
