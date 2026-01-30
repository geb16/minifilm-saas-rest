// In-memory store to keep the lab simple.
// In real SaaS → PostgreSQL / DynamoDB.
export const db = {
  films: [] // { id, title, ownerUserId }
};
