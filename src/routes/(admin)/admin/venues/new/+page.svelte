<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';

	import type { PageData, PageProps } from './$types';
	import { onMount } from 'svelte';

	let { data, form }: PageProps = $props();

	let isLoading = $state(false);

	onMount(() => {
		console.log('Page mounted:', data);
	});
</script>

<div class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">Venues</h1>
</div>

{#if form?.message}
	<div role="alert" class="alert alert-success" in:slide>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{@html form.message}</span>
	</div>
{/if}

{#if form?.error}
	<div role="alert" class="alert alert-error" in:slide>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{@html form.error}</span>
	</div>
{/if}

<section class="px-2">
	<form
		method="POST"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				await update();
				isLoading = false;
			};
		}}
	>
		<div class="flex gap-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Name/Number of the Venue?</legend>
				<input
					type="text"
					class="input w-full"
					name="venue_name"
					placeholder="Eg. 303"
					required
					disabled={isLoading}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">Capacity</legend>
				<input
					type="number"
					class="input w-full"
					name="venue_capacity"
					placeholder="405"
					required
					disabled={isLoading}
				/>
			</fieldset>
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Block</legend>
				<select class="select w-full" name="venue_block" required disabled={isLoading}>
					<option value="">Independent Venue</option>
					{#each data?.blocksWithVenues as block}
						<option value={block.id}>
							{block.name}
						</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Description</legend>
				<input
					type="text"
					class="input w-full"
					name="venue_description"
					placeholder=""
					required
					disabled={isLoading}
				/>
				<span class="fieldset-label"> Press enter to submit. </span>
			</fieldset>

			{#if isLoading}
				<span class="loading loading-ball loading-xl"></span>
			{/if}
		</div>
		<button class="btn" type="submit" hidden> Submit </button>
	</form>
</section>

<div class="container mx-auto px-4 py-8">


	{#each data.blocksWithVenues as block}
		<div class="mb-12">
			<div class="mb-4 flex items-center gap-4">
				<h2 class="text-2xl font-semibold">{block.name}</h2>
				<span class="badge badge-md badge-neutral">
					{block.venues.length}
					{block.venues.length === 1 ? 'Venue' : 'Venues'}
				</span>
			</div>

			{#if block.venues.length > 0}
				<div class="overflow-x-auto">
					<table class="table-zebra table w-full">
						<colgroup>
							<col class="w-64" />
							<col />
							<col class="w-32" />
						</colgroup>
						<thead>
							<tr>
								<th class="w-64">Name</th>
								<th>Description</th>
								<th class="w-32 text-right">Capacity</th>
							</tr>
						</thead>
						<tbody>
							{#each block.venues as venue}
								<tr>
									<td class="w-64 truncate font-medium" title={venue.name}>{venue.name}</td>
									<td class="truncate" title={venue.description}>{venue.description}</td>
									<td class="w-32 text-right">{venue.capacity}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="alert alert-info">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>No venues found in this block</span>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	/* Ensure table cells respect the fixed widths */
	table {
		table-layout: fixed;
	}
	/* Add ellipsis for truncated text */
	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
