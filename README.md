# @atxm/metrics

[![npm](https://flat.badgen.net/npm/license/@atxm/metrics)](https://www.npmjs.org/package/@atxm/metrics)
[![npm](https://flat.badgen.net/npm/v/@atxm/metrics)](https://www.npmjs.org/package/@atxm/metrics)
[![CircleCI](https://flat.badgen.net/circleci/github/a-t-x-m/metrics)](https://circleci.com/gh/a-t-x-m/metrics)
[![David](https://flat.badgen.net/david/dep/a-t-x-m/metrics)](https://david-dm.org/a-t-x-m/metrics)

Event tracking for your Atom packages made easy. Supports Google Analytics and Matomo.

## Installation

`npm install @atxm/metrics -S`

## Usage

Tracking of commands provided by your package is enabled by default. Additionally, custom events can be fired from anywhere in your package.

Keep in mind that you need to initialize the metrics provider *after* adding your Atom commands!

**Example:**

```js
import { GA } from '@atxm/metrics';

export async function activate() {
    await GA.init('UA-XXXX-Y');

    GA.dispatchEvent({
      category: 'Demo',
      action: 'Package activated!'
    });
};
```

**Note:** In order to make your Atom package compliant with the [GDPR][gdpr] or the [CCPA][ccpa], you need to provide a privacy policy and a [consent setting](#consentSetting)!

### Methods

#### init

Usage: `init(trackingID: string, options: object)`

Initializes module, unless [`option.muted`](#muted) is used

#### listen

Usage: `listen()`

Manually add event listener, e.g. for when [`option.muted`](#muted) is `true`

#### mute

Usage: `mute()`

Removes event listener

#### dispatchEvent

Usage: `dispatchEvent({ category: string, action: string, label?: string, value?: number})`

Dispatches an event to Google Analystics

### Options

#### cacheBuster

Type: `boolean`  
Default: `false`  

Used to send a random number in GET requests to ensure browsers and proxies don't cache hits.

#### commandCategory

Type: `string`  
Default: `Package Command`  

Default event category for package commands.

#### commandTracking

Type: `boolean`  
Default: `true`  

Dispatches an event to Google Analystics whenever a command provided by your package is invoked. Requires the metrics provider to initialize after your commands were added!

#### consentSetting

Type: `string`  

Specifies a package setting in which the user can deny tracking, e.g. in compliance with the [GDPR][gdpr] or the [CCPA][ccpa].

#### dryRun

Type: `boolean`  
Default: `false`  

Skips sending the actual request to Google Analytics.

#### ipOverride

Type: `boolean|string`  
Default: `false`  

Allows overriding the user IP address. Uses `127.0.0.1` when `true`.

#### muted

Type: `boolean`  
Default: `false`  

Skips adding event listeners when the module is initialized.

#### trackDevMode

Type: `boolean`  
Default: `false`  

Enables tracking if the current window is in development mode.

#### trackSpecMode

Type: `boolean`  
Default: `false`  

Enables tracking if current window is running specs.

### Debugging

Running Atom in developer mode will log useful message to the console.

## License

This work is dual-licensed under [The MIT License](https://opensource.org/licenses/MIT) and the [GNU General Public License, version 2.0](https://opensource.org/licenses/GPL-2.0)

[gdpr]: https://www.wikiwand.com/en/General_Data_Protection_Regulation
[ccpa]: https://www.wikiwand.com/en/California_Consumer_Privacy_Act
