import { log } from '@atxm/developer-console';
import { mac } from 'address';
import { promisify } from 'util';
import { sep as pathSeparator } from 'path';
import { v4 as uuidv4, v5 as uuidv5} from 'uuid';
import callerCallsite from 'caller-callsite';
import hasha from 'hasha';
import ipRegex from 'ip-regex';
import queryString from 'query-string';

const getMAC = promisify(mac);
const title = '@atxm/metrics';

async function addCommandListener(eventName: string, options: MetricsOptions): Promise<void> {
  const filteredCommands: string[] = await getCommands();

  atom.commands.onDidDispatch(event => {
    const command = event.type;

    if (filteredCommands.includes(command)) {
      dispatchEvent(eventName, {
        category: options.commandCategory,
        action: command
      });
    }
  });
}

function dispatchEvent(eventName: string, payload: MetricsEvent): void {
  const customEvent = new CustomEvent(
    eventName,
    {
      detail: payload
    }
  );

  log(`${title}: Dispatching event`, payload);

  window.dispatchEvent(customEvent);
}

async function getClientID(): Promise<string> {
  const macAddress = await getMAC() || null;

  const clientID: string = macAddress
    ? uuidv5(macAddress, getNamespace())
    : uuidv4();

  if (macAddress) {
    log(`${title}: Created client ID '${clientID}' from MAC address`);
  } else {
    log(`${title}: Created client ID '${clientID}' from UUID`);
  }

  return clientID;
}

async function getCommands(): Promise<string[]> {
  const packageName = await getPackageName();
  // @ts-ignore
  const registeredCommands: string[] = Object.keys(atom.commands.registeredCommands);

  return registeredCommands.filter(registeredCommand => packageName && registeredCommand.startsWith(`${packageName}:`));
}

function getIP(options: MetricsOptions): string {
  {
    const ipRegexOptions = {
      exact: true
    };

    return ipRegex(ipRegexOptions).test(options.ipOverride) || ipRegex.v6(ipRegexOptions).test(options.ipOverride)
      ? options.ipOverride
      : '127.0.0.1';
  }
}

function getNamespace(): string {
  return uuidv5('https://www.npmjs.com/package/@atxm/metrics', uuidv5.URL);
}

async function getPackageName(): Promise<string> {
  const callerPath: string = callerCallsite().getFileName();
  const packageDirPaths: string[] = atom.packages.getPackageDirPaths();

  const intersection: string[] = packageDirPaths.filter(packageDirPath => {
    return callerPath.startsWith(packageDirPath);
  });

  if (intersection?.length) {
    return callerPath
      .replace(intersection[0], '')
      .split(pathSeparator)
      .filter(fragment => fragment)[0] || 'pkg.' + await getShortHash(__filename, { length: 8 });
  }

  return 'pkg.' + await getShortHash(__filename, { length: 8 });
}

async function getShortHash(inputString: string, userOptions: ShortHashOptions = {}): Promise<string> {
  const options = {
    algorithm: 'sha256',
    length: 16,
    ...userOptions
  };

  return (await hasha.async(inputString, {
    algorithm: options.algorithm
  })).substring(0, options.length);
}

function getUserAgent(): string {
  return `${atom.getAppName()} v${atom.getVersion()} (${atom.getReleaseChannel()})`;
}

function getWindowDimensions(): string {
  return `${atom.getWindowDimensions().width}x${atom.getWindowDimensions().height}`;
}

function isValidConfig(options: MetricsOptions): boolean {
  if (options.consentSetting?.length && atom.config.get(options.consentSetting) !== true) {
    log(`${title}: No consent given by the user, aborting tracking`);
    return false;
  }

  if (atom.inDevMode() && options.trackDevMode !== true) {
    log(`${title}: Tracking has not been enabled for Developer Mode, aborting`);
    return false;
  }

  if (atom.inSpecMode() && !options.trackSpecMode !== true) {
    log(`${title}: Tracking has not been enabled for Spec Mode, aborting`);
    return false;
  }

  return true;
}

async function post(baseURL: string, urlParams: GoogleUrlParams | MatomoUrlParams, dryRun = false): Promise<void> {
  const urlParamsEncoded = queryString.stringify(urlParams);
  const requestURL = `${baseURL}?${urlParamsEncoded}`;

  log(`${title}: Sending post request to ${requestURL}`);

  if (dryRun !== true) {
    const response = await window.fetch(requestURL, {
      method: 'POST'
    });

    log(`${title}: Fetch response`, response);
  }
}

export {
  addCommandListener,
  dispatchEvent,
  getClientID,
  getCommands,
  getIP,
  getNamespace,
  getPackageName,
  getShortHash,
  getUserAgent,
  getWindowDimensions,
  isValidConfig,
  post,
  title
};
