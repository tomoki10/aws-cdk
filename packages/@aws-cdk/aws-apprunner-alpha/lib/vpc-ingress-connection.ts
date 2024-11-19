import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { IService } from './service';
import { CfnVpcIngressConnection } from 'aws-cdk-lib/aws-apprunner';

/**
 * Properties of the AppRunner VPC Ingress Connection
 */
export interface VpcIngressConnectionProps {
  /**
   * The name for the VPC Ingress Connection.
   *
   * @default - a name generated by CloudFormation
   */
  readonly vpcIngressConnectionName?: string;

  /**
   * The service to connect.
   */
  readonly service: IService;

  /**
   * The VPC for the VPC Ingress Connection.
   */
  readonly vpc: ec2.IVpc;

  /**
   * The VPC Interface Endpoint for the VPC Ingress Connection.
   */
  readonly interfaceVpcEndpoint: ec2.IInterfaceVpcEndpoint;
}

/**
 * Attributes for the App Runner VPC Ingress Connection
 */
export interface VpcIngressConnectionAttributes {
  /**
   * The Amazon Resource Name (ARN) of the VPC Ingress Connection.
   */
  readonly vpcIngressConnectionArn: string;

  /**
   * The name of the VPC Ingress Connection.
   */
  readonly vpcIngressConnectionName: string;

  /**
   * The domain name associated with the VPC Ingress Connection resource.
   */
  readonly domainName: string;

  /**
   * The current status of the VPC Ingress Connection.
   */
  readonly status: string;
}

/**
 * Represents the App Runner VPC Ingress Connection.
 */
export interface IVpcIngressConnection extends cdk.IResource {
  /**
   * The Amazon Resource Name (ARN) of the VPC Ingress Connection.
   * @attribute
   */
  readonly vpcIngressConnectionArn: string;

  /**
    * The name of the VPC Ingress Connection.
    * @attribute
    */
  readonly vpcIngressConnectionName: string;
}

/**
 * The App Runner VPC Ingress Connection
 *
 * @resource AWS::AppRunner::VpcIngressConnection
 */
export class VpcIngressConnection extends cdk.Resource implements IVpcIngressConnection {
  /**
   * Import from VPC Ingress Connection from attributes.
   */
  public static fromVpcIngressConnectionAttributes(scope: Construct, id: string, attrs: VpcIngressConnectionAttributes): IVpcIngressConnection {
    const vpcIngressConnectionArn = attrs.vpcIngressConnectionArn;
    const domainName = attrs.domainName;
    const status = attrs.status;
    const vpcIngressConnectionName = attrs.vpcIngressConnectionName;

    class Import extends cdk.Resource implements IVpcIngressConnection {
      public readonly vpcIngressConnectionArn = vpcIngressConnectionArn;
      public readonly domainName = domainName;
      public readonly status = status;
      public readonly vpcIngressConnectionName = vpcIngressConnectionName;
    }

    return new Import(scope, id);
  }

  /**
   * Imports an App Runner VPC Ingress Connection from its ARN
   */
  public static fromArn(scope: Construct, id: string, vpcIngressConnectionArn: string): IVpcIngressConnection {
    const resourceParts = cdk.Fn.split('/', vpcIngressConnectionArn);

    const vpcIngressConnectionName = cdk.Fn.select(0, resourceParts);

    class Import extends cdk.Resource implements IVpcIngressConnection {
      public readonly vpcIngressConnectionName = vpcIngressConnectionName;
      public readonly vpcIngressConnectionArn = vpcIngressConnectionArn;
    }

    return new Import(scope, id);
  }

  /**
   * The ARN of the VPC Ingress Connection.
   * @attribute
   */
  readonly vpcIngressConnectionArn: string;

  /**
   * The domain name associated with the VPC Ingress Connection resource.
   * @attribute
   */
  readonly domainName: string;

  /**
   * The current status of the VPC Ingress Connection.
   * @attribute
   */
  readonly status: string;

  /**
   * The name of the VPC Ingress Connection.
   * @attribute
   */
  readonly vpcIngressConnectionName: string;

  public constructor(scope: Construct, id: string, props: VpcIngressConnectionProps) {
    super(scope, id, {
      physicalName: props.vpcIngressConnectionName,
    });

    if (props.vpcIngressConnectionName !== undefined && !cdk.Token.isUnresolved(props.vpcIngressConnectionName)) {

      if (props.vpcIngressConnectionName.length < 4 || props.vpcIngressConnectionName.length > 40) {
        throw new Error(
          `\`vpcIngressConnectionName\` must be between 4 and 40 characters, got: ${props.vpcIngressConnectionName.length} characters.`,
        );
      }

      if (!/^[A-Za-z0-9][A-Za-z0-9\-_]*$/.test(props.vpcIngressConnectionName)) {
        throw new Error(
          `\`vpcIngressConnectionName\` must start with an alphanumeric character and contain only alphanumeric characters, hyphens, or underscores after that, got: ${props.vpcIngressConnectionName}.`,
        );
      }
    }

    const resource = new CfnVpcIngressConnection(this, 'Resource', {
      ingressVpcConfiguration: {
        vpcEndpointId: props.interfaceVpcEndpoint.vpcEndpointId,
        vpcId: props.vpc.vpcId,
      },
      serviceArn: props.service.serviceArn,
      vpcIngressConnectionName: this.physicalName,
    });

    this.vpcIngressConnectionArn = resource.attrVpcIngressConnectionArn;
    this.vpcIngressConnectionName = resource.ref;
    this.domainName = resource.attrDomainName;
    this.status = resource.attrStatus;
  }
}