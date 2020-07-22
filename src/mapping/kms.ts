import { addMapping } from '../map';
import { CfnKmsKeyMapper } from './gen';

addMapping<CfnKmsKeyMapper>('AWS::KMS::Key', {
  type: 'aws_kms_key',

  attributes: {
    Ref: 'arn',
    Arn: 'arn',
  },

  properties: {

    KeyPolicy: {
      convert: policy => {
        const json = JSON.stringify(policy); Object.keys(policy).forEach(key => delete policy[key]);
        return { policy: json };
      },
      tests: [
        { cfn: { KeyPolicy: { Foo: 'bar' } }, tf: { policy: '{"Foo":"bar"}' } },
        { cfn: { KeyPolicy: undefined },      tf: { } },
      ],
    },

    Description: {
      convert: description => ({ description }),
      tests: [
        { cfn: { Description: 'Hello, world' }, tf: { description: 'Hello, world' } },
        { cfn: { Description: '' },             tf: { description: '' } },
        { cfn: { Description: undefined },      tf: { } },
      ],
    },

  },
});
