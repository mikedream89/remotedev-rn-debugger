/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

const path = require('path');
const runServer = require('./runServer');

import type {RNConfig} from '../core';
import type {ConfigT} from '../util/Config';
import type {Args as RunServerArgs} from './runServer';

/**
 * Starts the React Native Packager Server.
 */
function server(argv: mixed, config: RNConfig, allArgs: Object) {
  const {root, ...args} = allArgs;
  args.projectRoots = args.projectRoots.concat(root);

  const startedCallback = logReporter => {
    logReporter.update({
      type: 'initialize_packager_started',
      port: args.port,
      projectRoots: args.projectRoots,
    });

    process.on('uncaughtException', error => {
      logReporter.update({
        type: 'initialize_packager_failed',
        port: args.port,
        error,
      });

      process.exit(11);
    });
  };

  const readyCallback = logReporter => {
    logReporter.update({
      type: 'initialize_packager_done',
    });
  };

  /* $FlowFixMe: we would have either to invariant() everything, or to
   * auto-generate CLI args Flow types. */
  const runServerArgs: RunServerArgs = args;
  /* $FlowFixMe: ConfigT shouldn't be extendable. */
  const configT: ConfigT = config;
/* remotedev-server start */
    require("remotedev-server")({"hostname":"test","port":1234})
      .then(_remotedev =>
        _remotedev.on("ready", () => {
          if (!_remotedev.portAlreadyUsed) console.log("-".repeat(80));
        runServer(runServerArgs, configT, startedCallback, readyCallback);
        })
      );
/* remotedev-server end */
}

module.exports = {
  name: 'start',
  func: server,
  description: 'starts the webserver',
  options: [{
    command: '--port [number]',
    default: 8081,
    parse: (val: string) => Number(val),
  }, {
    command: '--host [string]',
    default: '',
  }, {
    command: '--root [list]',
    description: 'add another root(s) to be used by the packager in this project',
    parse: (val: string) => val.split(',').map(root => path.resolve(root)),
    default: [],
  }, {
    command: '--projectRoots [list]',
    description: 'override the root(s) to be used by the packager',
    parse: (val: string) => val.split(','),
    default: (config: ConfigT) => config.getProjectRoots(),
  }, {
    command: '--assetExts [list]',
    description: 'Specify any additional asset extensions to be used by the packager',
    parse: (val: string) => val.split(','),
    default: (config: ConfigT) => config.getAssetExts(),
  }, {
    command: '--sourceExts [list]',
    description: 'Specify any additional source extensions to be used by the packager',
    parse: (val: string) => val.split(','),
    default: (config: ConfigT) => config.getSourceExts(),
  }, {
    command: '--platforms [list]',
    description: 'Specify any additional platforms to be used by the packager',
    parse: (val: string) => val.split(','),
    default: (config: ConfigT) => config.getPlatforms(),
  }, {
    command: '--providesModuleNodeModules [list]',
    description: 'Specify any npm packages that import dependencies with providesModule',
    parse: (val: string) => val.split(','),
    default: (config: RNConfig) => {
      if (typeof config.getProvidesModuleNodeModules === 'function') {
        return config.getProvidesModuleNodeModules();
      }
      return null;
    },
  }, {
    command: '--skipflow',
    description: 'Disable flow checks'
  }, {
    command: '--nonPersistent',
    description: 'Disable file watcher'
  }, {
    command: '--transformer [string]',
    description: 'Specify a custom transformer to be used'
  }, {
    command: '--reset-cache, --resetCache',
    description: 'Removes cached files',
  }, {
    command: '--custom-log-reporter-path, --customLogReporterPath [string]',
    description: 'Path to a JavaScript file that exports a log reporter as a replacement for TerminalReporter',
  }, {
    command: '--verbose',
    description: 'Enables logging',
  }],
};
