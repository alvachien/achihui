﻿

declare namespace Oidc {

    interface AccessTokenEvents {

        load(container);

        unload();

        addAccessTokenExpiring(callback: (ev) => void);
        removeAccessTokenExpiring(callback: (ev) => void);

        addAccessTokenExpired(callback: (ev) => void);
        removeAccessTokenExpired(callback: (ev) => void);
    }
    interface InMemoryWebStorage {
        getItem(key: string);

        setItem(key: string, value: any);

        removeItem(key: string);

        key(index: number);

        length?: number;
    }
    interface Log {
        NONE();
        ERROR();
        WARN();
        INFO();

        reset();

        level(value);

        logger(value);

        info(...args);
        warn(...args);
        error(...args);
    }

    interface MetadataService {
        new (settings: any);
        getMetadata();

        getIssuer();

        getAuthorizationEndpoint();

        getUserInfoEndpoint();

        getCheckSessionIframe();

        getEndSessionEndpoint();

        getSigningKeys();
    }

    interface OidcClient {
        new (settings: OidcClientCtor);

        createSigninRequest(args?: any): Promise<any>;
        processSigninResponse(): Promise<any>;

        createSignoutRequest(args?: any): Promise<any>;
        processSignoutResponse(): Promise<any>;

        clearStaleState(stateStore: any): Promise<any>;
    }

    interface OidcClientCtor {
        authority?: string;
        metadataUrl?: string;
        metadata?: any;
        signingKeys?: string;
        client_id?: string;
        response_type?: string;
        scope?: string;
        redirect_uri?: string;
        post_logout_redirect_uri?: string;
        prompt?: string;
        display?: string;
        max_age?: number;
        ui_locales?: string;
        acr_values?: string;
        filterProtocolClaims?: boolean;
        loadUserInfo?: boolean;
        staleStateAge?: number;
        clockSkew?: number;
        stateStore?: any;
        ResponseValidatorCtor?: any;
        MetadataServiceCtor?: any;
    }

    interface UserManager extends OidcClient {
        new (settings: UserManagerCtor);

        clearStaleState(): Promise<void>;

        getUser(): Promise<User>;
        removeUser(): Promise<void>;

        signinPopup(args?: any): Promise<User>;
        signinPopupCallback(url?: string): Promise<any>;

        signinSilent(args?: any): Promise<User>;
        signinSilentCallback(url?: string): Promise<any>;

        signinRedirect(args?: any): Promise<any>;
        signinRedirectCallback(url?: string): Promise<User>;

        signoutRedirect(args?: any): Promise<any>;
        signoutRedirectCallback(url?: string): Promise<any>;

        querySessionStatus(args?: {}): Promise<any>;

        events: UserManagerEvents;
    }

    interface UserManagerEvents extends AccessTokenEvents {
        load(user: User);
        unload();

        addUserLoaded(callback: (ev: void) => void);
        removeUserLoaded(callback: (ev: void) => void);

        addUserUnloaded(callback: (ev: void) => void);
        removeUserUnloaded(callback: (ev: void) => void);

        addSilentRenewError(callback: (ev: void) => void);
        removeSilentRenewError(callback: (ev: void) => void);
    }

    interface UserManagerCtor extends OidcClientCtor {
        popup_redirect_uri?: string;
        popupWindowFeatures?: string;
        popupWindowTarget?: any;
        silent_redirect_uri?: any;
        automaticSilentRenew?: any;
        accessTokenExpiringNotificationTime?: string;
        redirectNavigator?: any;
        popupNavigator?: any;
        iframeNavigator?: any;
        userStore?: any;
    }

    interface WebStorageStateStore {
        set(key: string, value: any);

        get(key: string);

        remove(key: string);

        getAllKeys();
    }

    interface User {
        id_token: string;
        session_state: any;
        access_token: string;
        token_type: string;
        scope: string;
        profile: any;
        expires_at: any;
        state: any;
        toStorageString(storageString?: any);
    }
}

declare module "oidc-client" {
    var OidcClientCtor: Oidc.OidcClientCtor;
    var OidcClient: Oidc.OidcClient;
    var UserManager: Oidc.UserManager;
}

