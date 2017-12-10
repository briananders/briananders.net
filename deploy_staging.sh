#!/bin/zsh
echo "Changing build permissions to 755"
chmod -R 755 package/
echo "Moving Files to S3 staging"
aws s3 sync package/ s3://staging.briananders.net
echo "Done"

# /bin/zsh deploy_staging.sh
