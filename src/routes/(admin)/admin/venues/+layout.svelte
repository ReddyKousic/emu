<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const isActive = (path: string) => {
		return page.url.pathname.startsWith(path);
	};
</script>

<section class="flex flex-col px-4">
	<div class="left border-base-300 flex items-start gap-1 border-r-1">
		<a href="/{data.role}/venues/all">
			<button class="btn rounded-full {isActive(`/${data.role}/venues/all`) ? 'btn-active' : ''}"
				>All Venues</button
			>
		</a>
		<a href="/{data.role}/venues/new">
			<button class="btn rounded-full {isActive(`/${data.role}/venues/new`) ? 'btn-active' : ''}"
				>Venues</button
			>
		</a>
		<a href="/{data.role}/venues/blocks/new">
			<button class="btn rounded-full {isActive(`/${data.role}/venues/blocks/new`) ? 'btn-active' : ''}"
				>Blocks</button
			>
		</a>
	</div>

	{@render children()}
</section>
