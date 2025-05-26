import { writable } from 'svelte/store';
import { pb } from '$lib/pocketbase';
 
export const currentUser = writable(pb.authStore.model);
 
pb.authStore.onChange(() => {
  currentUser.set(pb.authStore.model);
});