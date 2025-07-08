import { lambdaClient } from '@/lib/trpc/clients';

export default async function HealthzPage() {
  const health = await lambdaClient.health.check.query();
  return (
    <div>
      <h1>Health Check</h1>
      <p>{health}</p>
    </div>
  );
}
