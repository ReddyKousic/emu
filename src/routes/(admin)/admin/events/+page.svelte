<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	import { Ban, CircleCheck } from '@lucide/svelte';
	import { invalidate, invalidateAll } from '$app/navigation';

	function formatDate(date: Date): string {
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}

		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		};

		return date.toLocaleDateString(undefined, options);
	}

	async function updateApprovalStatus(
		eventId: number,
		status: 'approved' | 'rejected',
		remarks: string = ''
	) {
		try {
			const response = await fetch(`/admin/api/event/${eventId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					status,
					rejectionRemarks: remarks
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update status');
			}

			await invalidateAll(); // Invalidate all data to refresh the page
		} catch (error) {
			console.error('Error updating approval status:', error);
			alert('Failed to update status');
		}
	}

	function handleApprove(eventId: number) {
		if (confirm('Are you sure you want to approve this event?')) {
			updateApprovalStatus(eventId, 'approved');
		}
	}

	let rejectionRemarks = $state('');
	let selectedEventId: number | null = null;

	function handleReject(eventId: number) {
		selectedEventId = eventId;
		(document.getElementById('reject_modal') as HTMLDialogElement)?.showModal();
	}

	function submitReject() {
		if (selectedEventId && rejectionRemarks.trim()) {
			updateApprovalStatus(selectedEventId, 'rejected', rejectionRemarks);
			rejectionRemarks = '';
			(document.getElementById('reject_modal') as HTMLDialogElement)?.close();
		} else {
			alert('Please provide rejection remarks');
		}
	}
</script>

<div class="overflow-x-auto p-4">
	<table class="table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Date & Time</th>
				<th>Venue</th>
				<th>Student Manager</th>
				<th>Status</th>
				<!-- <th>Participants</th> -->
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.allEventsAndStudents as event}
				<tr class="">
					<td>{event.id} - {event.name}</td>
					<td>{formatDate(event.startDateTime)}</td>
					<td>{event.venue}</td>
					<td>{event.studentId} - {event.studentName}</td>
					<td>
						<span
							class="badge {event.approval === 'approved'
								? 'badge-success'
								: event.approval === 'rejected'
									? 'badge-error'
									: 'badge-warning'}"
						>
							{event.approval}
						</span>
					</td>
					<!-- <td>
						{#if event.approval === 'pending'}
							-
						{:else}
							0
						{/if}
					</td> -->
					<td>
						{#if event.approval === 'pending'}
							<div class="flex gap-2">
								<button
									onclick={() => handleApprove(event.id)}
									class="btn btn-circle border-success border-1 hover:bg-green-600 hover:text-white"
								>
									<CircleCheck size={20} />
								</button>
								<button
									onclick={() => handleReject(event.id)}
									class="btn btn-circle border-error border-1 hover:bg-red-600 hover:text-white"
								>
									<Ban size={20} />
								</button>
							</div>
						{:else}
							<button class="btn btn-sm btn-disabled" disabled> Action Taken </button>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Rejection Remarks Modal -->
<dialog id="reject_modal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Reject Event</h3>
		<p class="py-4">Please provide a reason for rejecting this event:</p>
		<textarea
			bind:value={rejectionRemarks}
			class="textarea textarea-bordered w-full"
			placeholder="Enter rejection remarks..."
		></textarea>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Cancel</button>
				<button onclick={submitReject} class="btn btn-error ml-2">Submit Rejection</button>
			</form>
		</div>
	</div>
</dialog>
