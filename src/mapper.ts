import { Mapping, findMapping } from './map';
import * as merge from 'deepmerge';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cleanDeep = require('clean-deep');

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./mapping');

/**
 * A mapper from CloudFormation resource to Terraform resource.
 */
export class TerraformMapper {
  /**
   * The CloudFormation resource type this mapper is associated with.
   */
  public readonly cfnResourceType: string;

  /**
   * The Terraform resource type which maps to the CloudFormation resource type.
   */
  public readonly terraformResourceType: string;

  private readonly mapping: Mapping<any, any>;

  constructor(cfnResourceType: string) {
    const mapping = findMapping(cfnResourceType);
    if (!mapping) {
      throw new Error(`unable to find terraform mapping for resource type ${cfnResourceType}`);
    }

    this.mapping = mapping;
    this.cfnResourceType = cfnResourceType;
    this.terraformResourceType = mapping.type;
  }

  /**
   * Converts a set of CloudFormation resource properties to the properties for
   * the Terraform resource.
   * @param cfnProps Cloudformation properties
   */
  public toTerraformProps(cfnProps: any): any {
    let result: any = { };
    const propMapping = this.mapping.properties ?? {};

    for (const [name, value] of Object.entries(cfnProps)) {
      if (value == null) {
        continue; // skip null/undefined values
      }

      const propMapper = propMapping[name];
      if (propMapper) {
        result = merge(result, propMapper.convert(value));

        // if the value if an object, then assign it back to cfnProps to track sub-properties
        // if the value is a primitive, just delete the key from cfnProps to denote that it was handled.
        if (typeof(value) === 'object') {
          cfnProps[name] = value;
        } else {
          delete cfnProps[name];
        }
      }
    }

    cfnProps = cleanDeep(cfnProps);

    if (Object.keys(cfnProps).length > 0) {
      throw new Error(`unable to map the following properties: ${JSON.stringify(cfnProps)}`);
    }

    return cleanDeep(result, {
      emptyStrings: false,
    });
  }

  /**
   * Returns the name of the terraform attribute which corresponds to the
   * specified cloudformation attribute of a specified resource type (case
   * sensitive).
   *
   * @param cfnAttribute The CloudFormation attribute name (e.g. `Arn`).
   * Use `Ref` to represent the intrinsic reference.
   */
  public toTerraformAttribute(cfnAttr: string): string {
    const attrs = this.mapping.attributes ?? {};
    const tf = attrs[cfnAttr];
    if (!tf) {
      throw new Error(`no terraform mapping for cloudformation attribute "${cfnAttr}" in resource ${this.cfnResourceType}`);
    }

    return tf;
  }
}
