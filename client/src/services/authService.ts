import { 
  PublicClientApplication, 
  Configuration, 
  AuthenticationResult, 
  SilentRequest, 
  InteractionRequiredAuthError,
  PopupRequest
} from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
        }
      },
      piiLoggingEnabled: false
    }
  }
};

if (!msalConfig.auth.clientId) {
  console.warn("No client ID provided. Microsoft Authentication will not work correctly.");
}

export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().catch(error => {
  console.error("MSAL Initialization Error:", error);
});

const loginRequest: PopupRequest = {
  scopes: ["User.Read"]
};

const tokenRequest: SilentRequest = {
  scopes: ["email", "profile", "User.Read"],
  account: undefined 
};

export const login = async (): Promise<AuthenticationResult | null> => {
  try {
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.error("Login failed", error);
    return null;
  }
};

export const logout = (): void => {
  const account = msalInstance.getActiveAccount();
  if (account) {
    msalInstance.logoutPopup({
      account
    });
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return null;
  }

  const request: SilentRequest = {
    ...tokenRequest,
    account: accounts[0]
  };

  try {
    const response: AuthenticationResult = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
      } catch (interactiveError) {
        console.error("Interactive token acquisition failed", interactiveError);
        return null;
      }
    }
    console.error("Token acquisition failed", error);
    return null;
  }
};

export const handleRedirectCallback = async (): Promise<void> => {
  try {
    await msalInstance.handleRedirectPromise();
  } catch (error) {
    console.error("Error handling redirect:", error);
  }
};
