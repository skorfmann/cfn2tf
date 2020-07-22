import { addMapping } from '../map';
import { paramCase } from 'change-case';
import { CfnS3BucketMapper } from './gen';

addMapping<CfnS3BucketMapper>('AWS::S3::Bucket', {
  type: 'aws_s3_bucket',
  attributes: {
    Ref: 'id',
    Arn: 'arn',
    WebsiteURL: 'website_endpoint',
    DomainName: 'bucket_domain_name',
    RegionalDomainName: 'bucket_regional_domain_name',
    // DualStackDomainName: '??',
  },
  properties: {

    BucketName: {
      convert: bucketName => ({ bucket: bucketName }),
      tests: [
        { cfn: { BucketName: 'foo-bar' }, tf: { bucket: 'foo-bar' } },
      ],
    },

    VersioningConfiguration: {
      convert: vers => {
        const status = vers.Status; delete vers.Status;
        return {
          versioning: status === 'Enabled' ? [ { enabled: true } ] : undefined,
        }
      },
      tests: [
        { cfn: { VersioningConfiguration: { Status: 'Enabled' } },  tf: { versioning: [ { enabled: true } ] } },
        { cfn: { VersioningConfiguration: { Status: 'Disabled' } }, tf: { } },
        { cfn: { VersioningConfiguration: { } },                    tf: { } },
        { cfn: { VersioningConfiguration: undefined },              tf: { } },
      ],
    },

    BucketEncryption: {
      convert: config => {
        const enc = config.ServerSideEncryptionConfiguration?.[0]?.ServerSideEncryptionByDefault;
        if (!enc) { return undefined; }

        const sseAlgorithm = enc.SSEAlgorithm; delete enc.SSEAlgorithm;
        const kmsMasterKeyId = enc.KMSMasterKeyID; delete enc.KMSMasterKeyID;

        return {
          serverSideEncryptionConfiguration: [
            { rule: [ { applyServerSideEncryptionByDefault: [ { sseAlgorithm, kmsMasterKeyId } ] } ] },
          ],
        };
      },
      tests: [
        {
          cfn: {
            BucketEncryption: {
              ServerSideEncryptionConfiguration: [
                { ServerSideEncryptionByDefault: { SSEAlgorithm: '<SSE>', KMSMasterKeyID: '<KMS-ID>' } },
              ],
            },
          },
          tf: {
            serverSideEncryptionConfiguration: [
              {
                rule: [
                  { applyServerSideEncryptionByDefault: [ { sseAlgorithm: '<SSE>', kmsMasterKeyId: '<KMS-ID>' } ] },
                ],
              },
            ],
          },
        },
      ],
    },

    AccessControl: {
      convert: acl => ({ acl: paramCase(acl) }),
      tests: [
        { cfn: { AccessControl: 'PublicRead' },        tf: { acl: 'public-read' } },
        { cfn: { AccessControl: '' },                  tf: { acl: '' } },
        { cfn: { AccessControl: 'ReadWriteExecute' },  tf: { acl: 'read-write-execute' } },
      ],
    },

    WebsiteConfiguration: {
      convert: website => {
        const indexDocument = website.IndexDocument; delete website.IndexDocument;
        const errorDocument = website.ErrorDocument; delete website.ErrorDocument;

        const redirectHost = website.RedirectAllRequestsTo?.HostName; delete website.RedirectAllRequestsTo?.HostName;
        const redirectProto = website.RedirectAllRequestsTo?.Protocol; delete website.RedirectAllRequestsTo?.Protocol;

        let redirectAllRequestsTo;
        if (redirectHost) {
          redirectAllRequestsTo = (redirectProto ? `${redirectProto}://` : '') + redirectHost;
        }

        return { website: [ { indexDocument, errorDocument, redirectAllRequestsTo } ] };
      },
      tests: [
        {
          cfn: { WebsiteConfiguration: { IndexDocument: 'index.html' } },
          tf: { website: [ { indexDocument: 'index.html' } ] },
        },
        {
          cfn: { WebsiteConfiguration: { ErrorDocument: 'error.html' } },
          tf: { website: [ { errorDocument: 'error.html' } ] },
        },
        {
          cfn: { WebsiteConfiguration: { IndexDocument: 'index.html', ErrorDocument: 'error.html' } },
          tf: { website: [ { indexDocument: 'index.html', errorDocument: 'error.html' } ] },
        },
        {
          cfn: { WebsiteConfiguration: { RedirectAllRequestsTo: { HostName: 'hostname' } } },
          tf: { website: [ { redirectAllRequestsTo: 'hostname' } ] },
        },
        {
          cfn: { WebsiteConfiguration: { RedirectAllRequestsTo: { HostName: 'hostname', Protocol: 'https' } } },
          tf: { website: [ { redirectAllRequestsTo: 'https://hostname' } ] },
        },
      ],
    },
  },
});
