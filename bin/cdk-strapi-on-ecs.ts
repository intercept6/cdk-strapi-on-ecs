#!/usr/bin/env node

import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {CdkStrapiOnEcsStack} from '../lib/cdk-strapi-on-ecs-stack';

const app = new App();
new CdkStrapiOnEcsStack(app, 'CdkStrapiOnEcsStack');
