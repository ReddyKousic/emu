<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';

	import type { PageData, PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let isLoading = $state(false);
</script>

<div class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">Blocks</h1>
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
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Name of the block?</legend>
				<input
					type="text"
					class="input w-full"
					name="block_name"
					placeholder="Central Block"
					required
					disabled={isLoading}
				/>
			</fieldset>
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Description</legend>
				<input
					type="text"
					class="input w-full"
					name="block_description"
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

<section class="mt-4 px-2">
	{#if data?.blocks?.length > 0}
		<div class="overflow-x-auto">
			<table class="table">
				<!-- head -->
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{#each data.blocks as block, index}
						<tr in:fly={{ y: 20 }} out:fly={{ y: -20 }}>
							<td class="cursor-pointer">{block.name} </td>
							<td>{block.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="flex h-48 items-center justify-center">
			<p>No blocks available.</p>
		</div>
	{/if}
</section>
