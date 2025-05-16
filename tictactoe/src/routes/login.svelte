<script>
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    let username = '', password = '';
    async function login() {
      await pb.collection('users').authWithPassword(username, password);
      goto('/lobby');
    }
  </script>
  <input bind:value={username} placeholder="Username" />
  <input type="password" bind:value={password} placeholder="Passwort" />
  <button on:click={login}>Login</button>