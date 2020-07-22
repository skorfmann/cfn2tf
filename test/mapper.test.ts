import { TerraformMapper } from '../src'

test('happy flow', () => {
  const bucket = new TerraformMapper('AWS::S3::Bucket');
  expect(bucket.terraformResourceType).toBe('aws_s3_bucket');
  expect(bucket.cfnResourceType).toBe('AWS::S3::Bucket');

  const props = {
    BucketName: 'foo',
    VersioningConfiguration: { Status: 'Enabled' },
    WebsiteConfiguration: {
      IndexDocument: 'index.html',
    },
  };

  expect(bucket.toTerraformProps(props)).toStrictEqual({
    bucket: 'foo',
    versioning: [ { enabled: true } ],
    website: [{
      indexDocument: 'index.html',
    }],
  });

  expect(bucket.toTerraformAttribute('DomainName')).toStrictEqual('bucket_domain_name');
  expect(bucket.toTerraformAttribute('RegionalDomainName')).toStrictEqual('bucket_regional_domain_name');
});

test('throws if a property cannot be mapped', () => {
  const bucket = new TerraformMapper('AWS::S3::Bucket');

  expect(() => bucket.toTerraformProps({
    BucketName: 'foo-bar',
    WebsiteConfiguration: {
      IndexDocument: 'mappable.html',
      UnrecognizedSubProp: 'not-mappable',
    },
    SomethingBlue: true,
    SomethingNew: {
      Foo: 123,
    },
  })).toThrow(`unable to map the following properties: ${JSON.stringify({
    WebsiteConfiguration: {
      UnrecognizedSubProp: 'not-mappable',
    },
    SomethingBlue: true,
    SomethingNew: { Foo: 123 },
  })}`);
});

test('throws if mapper cannot be located', () => {
  expect(() => new TerraformMapper('Foo::Bar')).toThrow(/unable to find terraform mapping for resource type Foo::Bar/);
});


test('throws if an attribute mapping is missing', () => {
  const bucket = new TerraformMapper('AWS::S3::Bucket');
  expect(() => bucket.toTerraformAttribute('NotFound')).toThrow(/no terraform mapping for cloudformation attribute/);
});