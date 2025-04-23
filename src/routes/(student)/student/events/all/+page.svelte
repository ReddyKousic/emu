<script lang="ts">
	import type { PageData } from './$types';
	import { Check, ChevronRight, Copy, Globe, Ticket } from '@lucide/svelte';
	let { data }: { data: PageData } = $props();

	function getEventDuration(start: Date, end: Date): string {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const diffMs = endDate.getTime() - startDate.getTime();

		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

		if (days > 0) return `${days}d ${hours}h`;
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}
	let copiedSlug: string | null = $state(null);

	function copyLink(slug: string) {
		const url = `${window.location.origin}/participate/${slug}`;
		navigator.clipboard.writeText(url).then(() => {
			copiedSlug = slug;
			setTimeout(() => (copiedSlug = null), 800);
		});
	}
</script>

<div class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">List of Events</h1>
</div>

{#if data.allEventsByStudent.length === 0}
	<div class="alert alert-info">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path></svg
		>
		<span>No events found.</span>
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>Event Name</th>
					<th>Type</th>
					<th>Venue</th>
					<th>Date & Time</th>
					<th>Duration</th>
					<th>Status</th>
					<th>Approval</th>
					<th>Registratin Link</th>
					<!-- <th>Actions</th> -->
				</tr>
			</thead>
			<tbody>
				{#each data.allEventsByStudent as event (event.id)}
					<tr >
						<td>{event.eventName}</td>
						<td>
							{#if event.eventType === 'open'}
								<Globe size={24} strokeWidth={1.5} />
							{:else}
								<Ticket size={24} strokeWidth={1.5} />
							{/if}
						</td>
						<td>{event.eventVenue}</td>
						<td>
							{new Date(event.eventStartDateTime).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</td>

						<td>
							{getEventDuration(event.eventStartDateTime, event.eventEndDateTime)}
						</td>

						<td>
							{#if event.publishStatus === 'published'}
								<span>Active</span>
							{:else if event.publishStatus === 'pending_publish'}
								<span>Inactive</span>
							{/if}
						</td>
						<td>
							{#if event.universityAdministrationApproval === 'approved'}
								<span>Approved</span>
							{:else if event.universityAdministrationApproval === 'pending'}
								<span>Pending</span>
							{:else if event.universityAdministrationApproval === 'rejected'}
								<span>Rejected</span>
							{/if}
						</td>

						<td>
							{#if event.universityAdministrationApproval === 'approved'}
								<div class="relative flex items-center gap-2">
									<span class="truncate-fade">{event.slug}</span>
									<button onclick={() => copyLink(event.slug)}>
										{#if copiedSlug === event.slug}
											<Check size={18} />
										{:else}
											<Copy size={15} class="cursor-pointer" />
										{/if}
									</button>
								</div>
							{:else if event.universityAdministrationApproval === 'pending'}
								<span>Pending Approval</span>
							{:else if event.universityAdministrationApproval === 'rejected'}
								<div class="tooltip tooltip-right cursor-pointer" data-tip={event.rejectionRemarks}>
									<span class="badge badge-error">Rejected</span>
								</div>
							{/if}
						</td>

						<td>
							<div class="flex gap-2">
								{#if event.universityAdministrationApproval === 'approved'}
									<a href="/student/events/{event.id}">
										<button class="btn btn-xs btn-ghost"><ChevronRight /></button>
									</a>
								{:else}
									<button class="btn btn-xs btn-ghost" disabled><ChevronRight /></button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.truncate-fade {
		position: relative;
		max-width: 200px; /* Adjust based on your layout */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.truncate-fade::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		width: 2rem;
		height: 100%;
		background: linear-gradient(to left, white 0%, transparent 100%);
	}
</style>
