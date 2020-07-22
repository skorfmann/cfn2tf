import { TerraformResource } from "cdktf";
import { KmsKey } from "./.gen/providers/aws/kms-key";
import { S3BucketConfig, S3Bucket, S3BucketWebsite } from "./.gen/providers/aws/s3-bucket";

import { Construct } from "constructs";
import { paramCase } from 'change-case';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type ResourceMapper<T extends TerraformResource> = (scope: Construct, id: string, props: any) => T;
type AttributeMapper<T extends TerraformResource> = (resource: T) => string;

export type Mapping<T extends TerraformResource> = {
  resource: ResourceMapper<T>;
  attributes: {
    [name: string]: AttributeMapper<T>;
  }
};

const mapping: { [type: string]: any } = {};

export function findMapping(resourceType: string): Mapping<TerraformResource> {
  return mapping[resourceType];
}

function map<T extends TerraformResource>(resourceType: string, map: Mapping<T>) {
  mapping[resourceType] = map;
}

// -----------------------------------------------------------------------------------------------------------------------------------------------

map('AWS::KMS::Key', {
  resource: (scope, id, props) => {
    const policy = props.KeyPolicy; delete props.KeyPolicy;
    const desc = props.Description; delete props.Description;

    return new KmsKey(scope, id, {
      policy: JSON.stringify(policy),
      description: desc,
    });
  },
  attributes: {
    Ref: (key: KmsKey) => key.arn,
    Arn: (key: KmsKey) => key.arn
  }
});

map('AWS::S3::Bucket', {
  resource: (scope, id, props) => {
    const config: Writeable<S3BucketConfig> = {};

    // versioninng
    if (props.VersioningConfiguration?.Status === 'Enabled') {
      config.versioning = [ { enabled: true } ];

      delete props.VersioningConfiguration;
    }

    const enc = props.BucketEncryption?.ServerSideEncryptionConfiguration?.[0]?.ServerSideEncryptionByDefault;
    if (enc) {
      config.serverSideEncryptionConfiguration = [{
        rule: [{
          applyServerSideEncryptionByDefault: [{
            sseAlgorithm: enc.SSEAlgorithm,
            kmsMasterKeyId: enc.KMSMasterKeyID,
          }]
        }]
      }];

      delete props.BucketEncryption;
    }

    const acl = props.AccessControl;
    delete props.AccessControl;
    if (acl) {
      config.acl = paramCase(acl);
    }

    const website = props.WebsiteConfiguration;

    if (website) {
      const websiteConfig: Writeable<S3BucketWebsite> = {};
      config.website = [ websiteConfig ];

      config.website = [{
        indexDocument: website.IndexDocument,
        errorDocument: website.ErrorDocument,
        redirectAllRequestsTo: website.RedirectAllRequestsTo
          ? (website.RedirectAllRequestsTo.Protocol ? website.RedirectAllRequestsTo.Protocol + '://' : '') + website.RedirectAllRequestsTo.HostName
          : undefined
      }];
    }

    const bucketName = props.BucketName;
    delete props.BucketName;
    if (bucketName) {
      config.bucket = bucketName;
    }

    return new S3Bucket(scope, id, config);
  },
  attributes: {
  }
});
