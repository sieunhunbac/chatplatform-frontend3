(window as any).global = window;

import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import * as process from 'process';
(window as any).process = process;
