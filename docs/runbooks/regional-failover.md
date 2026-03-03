# Runbook: Regional Failover (Primary → Secondary)

## Trigger
Route 53 health check fails 3 consecutive checks on us-east-1.

## Steps
1. Confirm primary region degradation via CloudWatch dashboard
2. Verify Aurora Global Database replication lag < 1 second
3. Promote Aurora secondary in us-west-2
4. Scale up EKS deployments in us-west-2
5. Validate smoke tests in secondary
6. Update Route 53 if not auto-failed

## Rollback
_TBD_
