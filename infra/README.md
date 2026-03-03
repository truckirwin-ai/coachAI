# Infrastructure

AWS CDK definitions. See SPEC.md §7.

## Structure
- vpc/ — VPC, subnets, security groups, NACLs
- eks/ — EKS cluster, node groups, Karpenter, HPA
- database/ — Aurora PostgreSQL, DynamoDB, ElastiCache, OpenSearch
- storage/ — S3 buckets, lifecycle policies
- messaging/ — SQS queues, SNS topics, EventBridge rules
- security/ — WAF, Shield, GuardDuty, Macie, KMS, Secrets Manager
- cdn/ — CloudFront distributions, Route 53
- monitoring/ — CloudWatch dashboards, alarms, X-Ray
