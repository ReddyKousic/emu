<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">List of all Venues</h1>
</div>


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