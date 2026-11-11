import { UserManager, UserManagerSettings } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_AUTHORITY || "https://login.microsoftonline.com/common/v2.0";
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || "REPLACE_WITH_ENTRA_ID_CLIENT_ID";
const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI || "http://localhost:5173/callback";

const settings: UserManagerSettings = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
};

export const userManager = new UserManager(settings);

export async function signIn(): Promise<void> {
  await userManager.signinRedirect();
}

export async function signOut(): Promise<void> {
  await userManager.signoutRedirect();
}

export async function signInRedirectCallback(): Promise<string> {
  const user = await userManager.signinRedirectCallback();
  return user.access_token;
}