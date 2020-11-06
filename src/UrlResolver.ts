export interface URL {
    protocol: string,
    domain: string,
    username: string,
    password: string,
    port: number,
    path: string,
    params: { [name: string]: string },
    fragment: string
}

export interface UrlResolverConfig {
    globalDefaults: Partial<URL>
}

export default class UrlResolver {
    config: Partial<UrlResolverConfig>;

    constructor(config: Partial<UrlResolverConfig>) {
        this.config = config;
    }

    parse(url: string, fallback?: Partial<URL>): URL {
        return {
            domain: "",
            fragment: "",
            params: {},
            password: "",
            path: "",
            port: NaN,
            protocol: "",
            username: ""
        }
    }
}
