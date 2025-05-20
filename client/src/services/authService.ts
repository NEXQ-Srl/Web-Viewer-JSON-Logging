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

// Ensure client ID is provided
if (!msalConfig.auth.clientId) {
  console.warn("No client ID provided. Microsoft Authentication will not work correctly.");
}

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize().catch(error => {
  console.error("MSAL Initialization Error:", error);
});

// Login scopes
const loginRequest: PopupRequest = {
  scopes: ["User.Read"]
};

// Token request scopes (update with your actual API scope)
const tokenRequest: SilentRequest = {
  scopes: ["email", "profile", "User.Read"],
  account: undefined 
};

// Login function
export const login = async (): Promise<AuthenticationResult | null> => {
  try {
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.error("Login failed", error);
    return null;
  }
};

// Logout function
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

  // Use the first account
  const request: SilentRequest = {
    ...tokenRequest,
    account: accounts[0]
  };

  try {
    // Try silent token acquisition first
    const response: AuthenticationResult = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    // Handle interaction required errors
    if (error instanceof InteractionRequiredAuthError) {
      try {
        // Fallback to interactive method if silent fails
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

// Handle redirect after login if using redirect method
export const handleRedirectCallback = async (): Promise<void> => {
  try {
    await msalInstance.handleRedirectPromise();
  } catch (error) {
    console.error("Error handling redirect:", error);
  }
};
