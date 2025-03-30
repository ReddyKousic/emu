<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const isActive = (path: string) => {
		return page.url.pathname.startsWith(path);
	};
</script>

<div class="flex px-4 py-2">
	<div class="left border-base-300 flex flex-col items-start gap-1 border-r-1">
		<a href="/{data.role}/events/all">
			<button class="btn btn-ghost {isActive(`/${data.role}/events`) ? 'btn-active' : ''}"
				>Events</button
			>
		</a>
		<a href="/{data.role}/profile">
			<button class="btn btn-ghost {isActive(`/${data.role}/profile`) ? 'btn-active' : ''}"
				>Profile</button
			>
		</a>
		<a href="/logout">
			<button class="btn btn-ghost {isActive(`/logout`) ? 'btn-active' : ''}">Logout</button>
		</a>
	</div>

	<div class="right flex-1">
		{@render children()}
	</div>
</div>
