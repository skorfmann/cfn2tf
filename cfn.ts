
export interface CloudFormationResource {
  readonly Type: string;
  readonly Properties: any;
}

export interface CloudFormationTemplate {
  Resources: { [id: string]: CloudFormationResource };
}