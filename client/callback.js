import { userManager } from "./oidc.js";

await userManager.signinCallback(); // exchanges code -> tokens internally
window.location.href = "/";         // go back to homepage
