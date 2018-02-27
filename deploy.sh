#!/bin/zsh
echo "Changing build permissions to 755"
chmod -R 755 package/
echo "Moving Files to S3"
aws s3 sync package/ s3://www.briananders.net
echo "Invalidating cloudfront distribution"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
echo "Done"

# /bin/zsh deploy.sh