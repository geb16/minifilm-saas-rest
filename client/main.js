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

$("signUp").addEventListener("click", async () => {
  // Hosted UI sign-up (Cognito)
  await userManager.signinRedirect({ prompt: "login", screen_hint: "signup" });
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

$("createFilm").addEventListener("click", async () => {
  const user = await userManager.getUser();
  if (!user) return ($("api-output").textContent = "Not signed in.");

  const title = $("filmTitle").value.trim();
  if (!title) return ($("api-output").textContent = "Enter a film title first.");

  const r = await fetch("/api/films", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.access_token}`,
    },
    body: JSON.stringify({ title }),
  });
  $("api-output").textContent = await r.text();
});

$("healthCheck").addEventListener("click", async () => {
  const r = await fetch("/api/healthz");
  $("api-output").textContent = await r.text();
});

render();
