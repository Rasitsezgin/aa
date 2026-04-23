// Single Sign-On (SSO) Manager
// SAML, OIDC, OAuth2 integrations

import { EventEmitter } from 'events';

type SSOProtocol = 'saml' | 'oidc' | 'oauth2';
type SSOProvider = 'google' | 'microsoft' | 'okta' | 'auth0' | 'onelogin' | 'custom';

interface SSOConfig {
  id: string;
  tenantId: string;
  name: string;
  protocol: SSOProtocol;
  provider: SSOProvider;
  enabled: boolean;
  config: {
    // SAML
    saml?: {
      metadataUrl?: string;
      certificate: string;
      entryPoint: string;
      issuer: string;
      callbackUrl: string;
      wantAssertionsSigned: boolean;
      signatureAlgorithm: string;
    };
    // OIDC
    oidc?: {
      issuer: string;
      authorizationEndpoint: string;
      tokenEndpoint: string;
      userInfoEndpoint: string;
      clientId: string;
      clientSecret: string;
      scopes: string[];
      pkce: boolean;
    };
    // OAuth2
    oauth2?: {
      authorizeUrl: string;
      tokenUrl: string;
      profileUrl: string;
      clientId: string;
      clientSecret: string;
      scopes: string[];
    };
  };
  attributeMapping: {
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    groups?: string;
  };
  jitProvisioning: boolean;
  defaultRole: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SSOUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  attributes: Record<string, unknown>;
  groups?: string[];
  sessionIndex?: string;
  nameId?: string;
}

interface SSOSession {
  id: string;
  configId: string;
  userId: string;
  tenantId: string;
  externalId: string;
  protocol: SSOProtocol;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
}

// SSO Manager
export class SSOManager extends EventEmitter {
  private configs: Map<string, SSOConfig> = new Map();
  private sessions: Map<string, SSOSession> = new Map();

  // Register SSO provider
  registerConfig(config: Omit<SSOConfig, 'id' | 'createdAt' | 'updatedAt'>): SSOConfig {
    const ssoConfig: SSOConfig = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configs.set(ssoConfig.id, ssoConfig);
    this.emit('configRegistered', ssoConfig);
    return ssoConfig;
  }

  // Initiate SSO login
  initiateLogin(configId: string, relayState?: string): {
    redirectUrl: string;
    state: string;
    nonce: string;
  } {
    const config = this.configs.get(configId);
    if (!config) throw new Error('SSO config not found');

    const state = this.generateToken();
    const nonce = this.generateToken();

    let redirectUrl = '';

    if (config.protocol === 'oidc' && config.config.oidc) {
      const params = new URLSearchParams({
        client_id: config.config.oidc.clientId,
        response_type: 'code',
        scope: config.config.oidc.scopes.join(' '),
        redirect_uri: config.config.oidc.issuer + '/callback',
        state,
        nonce,
      });
      redirectUrl = `${config.config.oidc.authorizationEndpoint}?${params}`;
    } else if (config.protocol === 'saml' && config.config.saml) {
      // Generate SAML request
      redirectUrl = config.config.saml.entryPoint;
    }

    return { redirectUrl, state, nonce };
  }

  // Handle SSO callback
  async handleCallback(
    configId: string,
    callbackData: {
      code?: string;
      state?: string;
      id_token?: string;
      SAMLResponse?: string;
    }
  ): Promise<{
    user: SSOUser;
    session: SSOSession;
    redirectUrl: string;
  }> {
    const config = this.configs.get(configId);
    if (!config) throw new Error('SSO config not found');

    let ssoUser: SSOUser;

    if (config.protocol === 'oidc' && callbackData.code) {
      ssoUser = await this.handleOIDCCallback(config, callbackData.code);
    } else if (config.protocol === 'saml' && callbackData.SAMLResponse) {
      ssoUser = await this.handleSAMLCallback(config, callbackData.SAMLResponse);
    } else {
      throw new Error('Invalid callback data');
    }

    // Create session
    const session: SSOSession = {
      id: crypto.randomUUID(),
      configId,
      userId: ssoUser.id,
      tenantId: config.tenantId,
      externalId: ssoUser.id,
      protocol: config.protocol,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    };

    this.sessions.set(session.id, session);

    this.emit('loginSuccess', { user: ssoUser, session, config });

    return {
      user: ssoUser,
      session,
      redirectUrl: '/dashboard',
    };
  }

  // Initiate logout (SLO - Single Logout)
  initiateLogout(sessionId: string): {
    redirectUrl?: string;
    sloSupported: boolean;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) return { sloSupported: false };

    const config = this.configs.get(session.configId);
    if (!config) return { sloSupported: false };

    this.sessions.delete(sessionId);
    this.emit('logout', { session, config });

    if (config.protocol === 'saml' && config.config.saml) {
      return {
        redirectUrl: config.config.saml.entryPoint + '?SLO=true',
        sloSupported: true,
      };
    }

    return { sloSupported: false };
  }

  // Validate session
  validateSession(sessionId: string): SSOSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  // Get user from session
  async getUser(sessionId: string): Promise<SSOUser | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // In production, fetch user details from provider or local DB
    return {
      id: session.userId,
      email: 'user@example.com',
      attributes: {},
    };
  }

  // List configs for tenant
  listConfigs(tenantId: string): SSOConfig[] {
    return Array.from(this.configs.values()).filter(c => c.tenantId === tenantId);
  }

  // Get login URL for provider
  getProviderLoginUrl(provider: SSOProvider): string {
    const providers: Record<SSOProvider, string> = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      okta: '', // Tenant-specific
      auth0: '', // Tenant-specific
      onelogin: '', // Tenant-specific
      custom: '',
    };
    return providers[provider];
  }

  // Private methods
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async handleOIDCCallback(config: SSOConfig, code: string): Promise<SSOUser> {
    // Exchange code for tokens
    // Call userinfo endpoint
    // Map attributes

    return {
      id: 'oidc-user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      attributes: { source: 'oidc' },
    };
  }

  private async handleSAMLCallback(config: SSOConfig, samlResponse: string): Promise<SSOUser> {
    // Parse and validate SAML response
    // Verify signature
    // Extract attributes

    return {
      id: 'saml-user-1',
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      attributes: { source: 'saml' },
      sessionIndex: 'session-123',
      nameId: 'user@example.com',
    };
  }
}

// Predefined SAML metadata template
export const SAML_METADATA_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="{{entityId}}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="{{acsUrl}}"
      index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>`;

// Export singleton
export const ssoManager = new SSOManager();

export { SSOConfig, SSOUser, SSOSession, SSOProtocol, SSOProvider };
