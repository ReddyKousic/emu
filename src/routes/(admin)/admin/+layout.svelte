<script lang="ts">
	import type { Snippet } from 'svelte';
	import CSILogo from '$lib/assets/CSI.png';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
</script>

<div class="navbar bg-base-100 flex items-center justify-between px-4 shadow-sm">
	<div class="flex">
		<a href="/admin" class="flex items-center">
			<!-- <img src={CSILogo} class="w-12" alt="CSI Chapter Logo" /> -->

			<h1 class="raleway text-4xl font-extrabold text-[#37474f]">Emu</h1>
		</a>
	</div>

	<div class="flex flex-col items-end">
		<p class="font-sans text-xl font-medium">{data.name}</p>
		<p class="font-sans text-sm font-medium">{data.role ? capitalize(data.role) : ''}</p>
	</div>
</div>

{@render children()}
