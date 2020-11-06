import * as http from 'http';
import {IncomingMessage} from 'http';
import * as https from 'https';

import DataResource, {Encoding, permissions} from "./DataResource";
import UrlResolver, {URL} from "./UrlResolver";

export enum method {
    GET,
    HEAD,
    POST,
    PUT,
    PATCH,
    DELETE,
    CONNECT,
    OPTIONS,
    TRACE
}

export default class Http extends DataResource {

    static urlResolver: UrlResolver = new UrlResolver({
        globalDefaults: {
            protocol: "http",
            port: 80
        }
    });
    method: method;

    constructor(path: string, permissions: [permissions.READ?, permissions.WRITE?], writeMethod: method.PUT | method.POST | method.PATCH = method.PUT) {
        super(path, permissions);

        this.method = writeMethod;
    }

    async read(encoding: Encoding = Encoding.UTF8): Promise<string> {
        const protocols = {
            http,
            https
        }

        const url: URL = Http.urlResolver.parse(this.path);

        if (url.protocol in protocols) {
            return new Promise(function (resolve) {
                const body: string[] = [];

                // if (Object.keys(url.params).length > 0)
                //     Logger.info("Http", "Ignoring all URL Parameters");

                http.request({
                    path: url.path,
                    port: url.port
                }, function (res: IncomingMessage) {
                    res.on('data', data => body.push(data));
                    res.on('end', () => resolve(body.join('')));
                });
            })
        }
    }

    async write(content: string, encoding: Encoding = Encoding.UTF8): Promise<void> {
        throw "Http.Write is not implemented yet";
    }

    async append(content: string, encoding: Encoding = Encoding.UTF8): Promise<void> {
        throw "Http.Write is not implemented yet";
    }

}
