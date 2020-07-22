import { PropertyMapper } from '../map';

// TODO: this file should be generated
// can probably something smarter with typescript magic here.

export type TerraformResourceType = 'aws_kms_key' | 'aws_s3_bucket';

export interface TfS3Bucket {
  bucket?: string;
  versioning?: { enabled: boolean }[];
  serverSideEncryptionConfiguration?: {rule: { applyServerSideEncryptionByDefault: { sseAlgorithm: string, kmsMasterKeyId: string }[] }[]}[];
  acl?: string;
  website?: { indexDocument?: string, errorDocument?: string, redirectAllRequestsTo?: string }[];
}

export interface CfnS3BucketMapper {
  BucketName: PropertyMapper<string, TfS3Bucket>;
  VersioningConfiguration?: PropertyMapper<{ Status?: string }, TfS3Bucket>;
  BucketEncryption?: PropertyMapper<any, TfS3Bucket>;
  AccessControl?: PropertyMapper<string, TfS3Bucket>;
  WebsiteConfiguration: PropertyMapper<any, TfS3Bucket>;
}

export interface CfnKmsKeyMapper {
  KeyPolicy?: PropertyMapper<any, TfKmsKey>;
  Description?: PropertyMapper<string, TfKmsKey>;
}

export interface TfKmsKey {
  policy?: string;
  description?: string;
}
