export default {
  welcome: {
    title: 'Welcome to {{name}}',
    subtitle: 'Choose your preferred way to continue',
  },
  form: {
    title: 'Sign in to your account',
    subtitle: 'Access your dashboard and manage your account',
  },
  tabs: {
    sso: 'SSO Providers',
    email: 'Magic Link',
  },
  providers: {
    auth0: {
      name: 'Continue with Auth0',
      description: 'Universal identity platform',
    },
    authentik: {
      name: 'Continue with Authentik',
      description: 'Self-hosted identity provider',
    },
    azureAd: {
      name: 'Continue with Azure AD',
      description: 'Microsoft enterprise identity',
    },
    genericOidc: {
      name: 'Continue with OIDC',
      description: 'OpenID Connect provider',
    },
    github: {
      name: 'Continue with GitHub',
      description: 'For developers and teams',
    },
    google: {
      name: 'Continue with Google',
      description: 'Quick and secure sign-in',
    },
    zitadel: {
      name: 'Continue with Zitadel',
      description: 'Cloud-native identity platform',
    },
    authelia: {
      name: 'Continue with Authelia',
      description: 'Authentication & authorization server',
    },
    logto: {
      name: 'Continue with Logto',
      description: 'Modern identity infrastructure',
    },
    cloudflareZeroTrust: {
      name: 'Continue with Cloudflare',
      description: 'Zero trust network access',
    },
    casdoor: {
      name: 'Continue with Casdoor',
      description: 'Web-based identity management',
    },
    microsoftEntraId: {
      name: 'Continue with Entra ID',
      description: 'Microsoft identity platform',
    },
    wechat: {
      name: 'Continue with WeChat',
      description: 'Chinese social platform',
    },
    keycloak: {
      name: 'Continue with Keycloak',
      description: 'Open source identity solution',
    },
    default: {
      name: 'Continue with {{provider}}',
      description: 'Secure authentication',
    },
  },
  magicLink: {
    title: 'Sign in with Email',
    description: "We'll send you a magic link to sign in instantly",
    form: {
      email: {
        label: 'Email Address',
        placeholder: 'Enter your email address',
      },
      button: {
        default: 'Send Magic Link',
        loading: 'Sending...',
        sent: 'Link Sent',
      },
    },
    success: {
      title: 'Magic link sent!',
      description: 'Check your email and click the link to sign in',
    },
    features: {
      fast: 'Instant',
      secure: 'Secure',
      mobile: 'Mobile-friendly',
    },
    help: {
      description: "Don't see the email? Check your spam folder or",
      link: 'learn more',
    },
  },
  security: {
    secure: 'Secure',
    fast: 'Fast',
    private: 'Private',
  },
  footer: {
    terms: {
      prefix: 'By continuing, you agree to our',
      link: 'Terms of Service',
      and: 'and',
    },
    privacy: {
      link: 'Privacy Policy',
    },
  },
  help: {
    prefix: 'Need help?',
    link: 'Contact support',
  },
  noMethods: {
    title: 'No sign-in methods are currently available',
    description: 'Please contact your administrator for assistance',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    authentication: 'Authentication failed. Please try again.',
    OAuthSignin: 'Error signing in with OAuth provider',
    OAuthCallback: 'Error in OAuth callback',
    OAuthCreateAccount: 'Could not create OAuth account',
    EmailCreateAccount: 'Could not create email account',
    Callback: 'Error in callback',
    OAuthAccountNotLinked: 'Account not linked to OAuth provider',
    EmailSignin: 'Error signing in with email',
    CredentialsSignin: 'Invalid credentials',
    SessionRequired: 'Please sign in to access this page',
    AccessDenied: 'Access denied',
    AccountNotFound:
      'Account not found. Please check your credentials or contact support.',
  },
};
