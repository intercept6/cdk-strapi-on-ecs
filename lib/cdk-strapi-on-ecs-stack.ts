import {Stack, StackProps} from 'aws-cdk-lib';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {
  ContainerImage,
  FargateTaskDefinition,
  Secret,
} from 'aws-cdk-lib/aws-ecs';
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns';
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import {Bucket, BucketAccessControl} from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';
import {resolve} from 'path';

export class CdkStrapiOnEcsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc');

    const db = new DatabaseInstance(this, 'Database', {
      vpc,
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13_4,
      }),
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      databaseName: 'strapi',
      multiAz: false,
    });
    if (db.secret === undefined) {
      throw new Error('DatabaseInstance.secret is undefined');
    }

    const bucket = new Bucket(this, 'Bucket', {
      accessControl: BucketAccessControl.PUBLIC_READ,
    });

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDef');
    bucket.grantReadWrite(taskDefinition.taskRole);
    bucket.grantPutAcl(taskDefinition.taskRole);

    const container = taskDefinition.addContainer('Strapi', {
      image: ContainerImage.fromAsset(resolve(__dirname, '../strapi')),
      environment: {
        DATABASE_NAME: 'strapi',
        AWS_REGION: this.region,
        AWS_BUCKET_NAME: bucket.bucketName,
      },
      secrets: {
        DATABASE_HOST: Secret.fromSecretsManager(db.secret, 'host'),
        DATABASE_PORT: Secret.fromSecretsManager(db.secret, 'port'),
        DATABASE_USERNAME: Secret.fromSecretsManager(db.secret, 'username'),
        DATABASE_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
      },
    });
    container.addPortMappings({containerPort: 1337});

    const {service} = new ApplicationLoadBalancedFargateService(
      this,
      'Service',
      {vpc, taskDefinition}
    );
    db.connections.allowDefaultPortFrom(service);
  }
}
