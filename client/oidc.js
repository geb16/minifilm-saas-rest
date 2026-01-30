import { UserManager } from "oidc-client-ts";

// ✅ Authority = Cognito User Pool issuer (it serves OIDC metadata)
export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_2s17PBaHM",
  client_id: "m0n4l2e3kop1092sm28c8hdgh",
  redirect_uri: "http://localhost:5173/callback.html",
  response_type: "code",
  scope: "openid email profile", // keep minimal; avoids invalid_scope
};

export const userManager = new UserManager({
  ...cognitoAuthConfig,
});

// Cognito logout endpoint is on the Hosted UI domain
export function signOutRedirect() {
  const logoutUri = "http://localhost:5173/";
  const cognitoDomain = "https://eu-west-22s17pbahm.auth.eu-west-2.amazoncognito.com";
  window.location.href =
    `${cognitoDomain}/logout?client_id=${cognitoAuthConfig.client_id}` +
    `&logout_uri=${encodeURIComponent(logoutUri)}`;
}
