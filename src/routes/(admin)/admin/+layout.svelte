<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const isActive = (path: string) => {
		return page.url.pathname === path || page.url.pathname.startsWith(path);
	};
</script>

<div class="flex px-4 py-2">
	<div class="left border-base-300 flex flex-col items-start gap-1">
		<a href="/{data.role}/events">
			<button class="btn btn-ghost w-full {isActive(`/${data.role}/events`) ? 'btn-active' : ''}"
				>All Events</button
			>
		</a>
		<a href="/{data.role}/venues/all">
			<button class="btn btn-ghost {isActive(`/${data.role}/venues`) ? 'btn-active' : ''}"
				>Venues</button
			>
		</a>
		<a href="/{data.role}/calendar">
			<button class="btn btn-ghost {isActive(`/${data.role}/calendar`) ? 'btn-active' : ''}"
				>Timetable</button
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

<style>
	.left {
		padding-right: 10px;
		border-right: 1px solid #eeeeee;
	}
</style>
