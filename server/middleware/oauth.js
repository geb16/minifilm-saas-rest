import { CognitoJwtVerifier } from "aws-jwt-verify";

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

// Verifies signature via JWKS + checks issuer/claims
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "access",
  clientId: CLIENT_ID,
});

export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const token = auth.slice("Bearer ".length);
    const payload = await verifier.verify(token);
    req.user = payload; // payload.sub is your user id
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
