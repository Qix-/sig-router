import 'surplus';
import S, { DataSignal } from 's-js';

export declare function add(path: string, renderer: ((object?) => JSX.Element) | ((object?) => undefined)): void;

export declare const unknownComponent: DataSignal<() => JSX.Element>;

export declare const middleware: DataSignal<() => JSX.Element>;

export declare const component: DataSignal<JSX.Element>;

export declare function go(string): DataSignal<string>;

export declare const leafs: DataSignal<string[]>;
