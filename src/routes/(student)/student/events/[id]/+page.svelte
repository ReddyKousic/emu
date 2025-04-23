<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	console.log(data);

	let toggled = $state(data.event.publishStatus === 'published');
	let isRejected = data.event.universityAdministrationApproval === 'rejected';
	$effect(() => {
		// This runs whenever toggled changes
		fetch(`/student/api/event/${data.event.id}`, {
			method: 'PATCH',
			body: JSON.stringify({ published: toggled })
		});
	});
</script>

<div class="flex flex-col px-2 py-4">
	<h1 class="raleway text-2xl font-bold text-[#37474f]">Event - {data.event.eventName}</h1>
</div>

<div class="flex gap-4 p-4">
	<div
		class="left flex w-1/2 flex-col items-center justify-center rounded-2xl border-1 border-neutral-200 py-9"
	>
		<h1 class="raleway text-9xl font-black text-[#37474f]">{data.participantsCount}</h1>
		<p>participants</p>
	</div>

	<div
		class="right flex w-1/2 items-center justify-center gap-4 rounded-2xl border-1 border-neutral-200 py-9"
	>
		<p class="text-xl">Inactive</p>
		<input type="checkbox" bind:checked={toggled} class="toggle toggle-lg" disabled={isRejected}/>
		<p class="text-xl">Active</p>
	</div>
</div>

<div class="p-6">
	<h1 class="raleway text-xl font-semibold text-[#37474f]">Registered Participants</h1>

	{#if data.participants.length === 0}
		<div class="alert alert-info my-4">
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
			<span>No participants found.</span>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="table-zebra table w-full">
				<!-- head -->
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Phone</th>
						<th>Address</th>
					</tr>
				</thead>
				<!-- body -->
				<tbody>
					{#each data.participants as participant}
						<tr>
							<td>{participant.name}</td>
							<td>{participant.email}</td>
							<td>{participant.phone}</td>
							<td>{participant.address}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
