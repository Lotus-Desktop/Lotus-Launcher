#!/usr/bin/env node

import * as sm from 'source-map-support'

import * as path from 'path';
import * as os from "os";

import * as fs from "fs";
import * as JSON5 from 'json5';

import {Application} from "./ManifestShape";
import PathResolver, {Type} from "./PathResolver";
import File from "./File";
import libraryLoader from './LibraryLoader';

sm.install();

const pathUtil: PathResolver = new PathResolver({
    root: os.homedir(),
    pathType: Type.Unix
});

const argv = process.argv.slice(2);
const manifest = argv.findIndex(i => pathUtil.isPath(i));
const executionArgs = argv.slice(0, manifest + 1);
const programArgs = argv.slice(manifest + 1);

let manifestFile = path.resolve(argv[manifest] || "./");

if (!manifestFile.endsWith("manifest.json"))
    if (fs.statSync(manifestFile).isDirectory()) {
        if (fs.existsSync(pathUtil.join(manifestFile, 'manifest.json')))
            manifestFile = pathUtil.join(manifestFile, 'manifest.json');
    } else if (fs.existsSync(pathUtil.join(pathUtil.up(manifestFile), 'manifest.json')))
        manifestFile = pathUtil.join(pathUtil.up(manifestFile), 'manifest.json');

export let manifestLocation: string;

if (fs.existsSync(manifestFile))
    new File(manifestFile, false).read().then(function (text: string) {
        const application = JSON5.parse(text) as Application;

        const entryPoint = pathUtil.join(pathUtil.up(manifestFile), application.entryPoint);

        manifestLocation = pathUtil.up(manifestFile);

        libraryLoader.run(entryPoint, entryPoint);
    });
else
    console.error("Manifest wasn't found");
