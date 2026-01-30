import { userManager, signOutRedirect } from "./oidc.js";

const $ = (id) => document.getElementById(id);

$("signIn").addEventListener("click", async () => {
  // Redirects to Cognito Hosted UI (Authorization Code + PKCE)
  try {
    await userManager.signinRedirect();
  } catch (err) {
    console.error("Sign-in init failed", err);
    $("api-output").textContent =
      "Sign-in init failed. Open the console for details.";
  }
});

$("signOut").addEventListener("click", async () => {
  // Clears local OIDC session + redirects to Cognito logout
  await userManager.removeUser();
  signOutRedirect();
});

async function render() {
  const user = await userManager.getUser();

  if (!user) {
    $("email").textContent = "(not signed in)";
    $("access-token").textContent = "";
    return;
  }

  $("email").textContent = user.profile?.email ?? "(no email claim)";
  $("access-token").textContent = user.access_token;
}

$("callApi").addEventListener("click", async () => {
  const user = await userManager.getUser();
  if (!user) return ($("api-output").textContent = "Not signed in.");

  const r = await fetch("/api/films", {
    headers: { Authorization: `Bearer ${user.access_token}` },
  });
  $("api-output").textContent = await r.text();
});

$("healthCheck").addEventListener("click", async () => {
  const r = await fetch("/api/healthz");
  $("api-output").textContent = await r.text();
});

render();
