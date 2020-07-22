# cfn2tf

Converts CloudFormation resources to Terraform resources.

> THIS IS A PROTOTYPE.

## Usage

```ts
import { TerraformMapper } from 'cfn2tf';

const bucketMapper = new TerraformMapper('AWS::S3::Bucket');

equal(
  bucketMapper.terraformResourceType, 
  'aws_s3_bucket'
);

const tfprops = bucketMapper.toTerraformProps({
  BucketName: 'my-bucket',
  VersioningConfiguration: { Status: 'Enabled' },
  WebsiteConfiguration: {
    IndexDocument: 'index.html',
  }
});

equal(tfprops, {
  bucket: 'foo',
  versioning: [ { enabled: true } ],
  website: [ { indexDocument: 'index.html' } ],
});

equal(
  bucketMapper.toTerraformAttribute('RegionalDomainName'), 
  'bucket_regional_domain_name'
);
```

## API

### `new TerraformMapper(cfnResourceType)`

Returns the a mapper associated with the specified CFN resource type (e.g. `AWS::S3::Bucket`).

### `mapper.terraformResourceType => string`

Returns the Terraform resource type name (in the AWS provider) (e.g. `aws_s3_bucket`).

### `mapper.toTerraformProps(cfnProps) => tfProps`

Converts an object with CloudFormation resource properties to Terraform semantics.

Throws an error if one of the properties could not be mapped.

### `mapper.toTerraformAttribute(cfnAttr) => string`

Returns the name of the corresponding Terraform resource attribute (e.g. `RegionalDomainName` => `bucket_regional_domain_name`).

## Contributions

This project heavily relies on contributions to succeed. See the
[src/mapping](./src/mapping) directory to add mappings.

## TODO

- [ ] Add "fuzz" testing to ensure property handlers are only picking up their own properties.
- [ ] Allow adding mapping if mapping is missing.
- [ ] Generate types to make it safer to write mappers
  - [ ] Generate input property types from CloudFormation spec (steal from awscdk)
  - [ ] Generate output property types from Terraform specs (steal from cdktf)
  - [ ] Generate input attribute types
  - [ ] Generate output attribute types
- [ ] Generate scaffolding for all CFN resource types with "not implemented"
- [ ] See if we can use heuristics to deduce mapping in certain cases
- [ ] Take a complex CDK L2 example (e.g. ECS) and implement all the mappers for it
- [ ] Create some helpers like `pick(obj, jsonpath)` which return the value at `jsonpath` and
      delete it from the object.

## License

Distributed under the Apache 2.0 License.