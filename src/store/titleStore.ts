import { writable, type Writable } from 'svelte/store';

export const pageTitle: Writable<string> = writable('');
