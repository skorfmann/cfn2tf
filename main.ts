import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { AwsProvider } from './.gen/providers/aws';

import { aws_s3 } from 'monocdk-experiment';
import { AwsTerraformAdapter } from './aws-adapter';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: 'us-east-1'
    });

    const aws = new AwsTerraformAdapter(this, 'adapter');

    new aws_s3.CfnBucket(aws, 'RawBucket', {
      accessControl: 'PublicRead'
    });

    new aws_s3.Bucket(aws, 'MyBucket', {
      accessControl: aws_s3.BucketAccessControl.BUCKET_OWNER_READ,
      encryption: aws_s3.BucketEncryption.KMS,
      bucketName: 'my-bucket-name'
    });
  }
}

const app = new App();
new MyStack(app, 'tfcdk-awscdk');
app.synth();
