import { TerraformResourceType } from './mapping/gen';

export type PropertyMapper<CFN, TF> = {
  readonly convert: (value: CFN) => TF | undefined;
  readonly tests: PropertyTest<TF>[];
};

type PropertyTest<TF> = {
  readonly cfn: any;
  readonly tf: TF;
}

type TerraformAttribute = string;

export type Mapping<CfnMapper> = {
  readonly type: TerraformResourceType;
  readonly properties?: CfnMapper;
  readonly attributes?: Record<string, TerraformAttribute>;
};

export interface AnyMapping {
  [prop: string]: PropertyMapper<any, any>;
}

const all: { [type: string]: Mapping<AnyMapping> } = { };

export function addMapping<CfnMapper>(type: string, mapping: Mapping<CfnMapper>) {
  all[type] = mapping as any; // TODO: fix typescript shit
}

export function findMapping(type: string): Mapping<AnyMapping> {
  return all[type];
}

export function getAllTypes() {
  return Object.keys(all);
}