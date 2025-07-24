<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { eventDetails } = data;
	console.log(eventDetails);

	let loading_approve = $state(false);
	let loading_reject = $state(false);

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

			// await goto($page.url, { invalidateAll: true });
			window.location.reload();
		} catch (error) {
			console.error('Error updating approval status:', error);
			alert('Failed to update status');
		}
	}
	async function handleApprove(eventId: number) {
		loading_approve = true;
		if (confirm('Are you sure you want to approve this event?')) {
			await updateApprovalStatus(eventId, 'approved');
		}
		loading_approve = false;
	}

	let rejectionRemarks = $state('');
	let selectedEventId: number | null = null;

	function handleReject(eventId: number) {
		selectedEventId = eventId;
		(document.getElementById('reject_modal') as HTMLDialogElement)?.showModal();
	}

	async function submitReject() {
		loading_reject = true;
		if (selectedEventId && rejectionRemarks.trim()) {
			await updateApprovalStatus(selectedEventId, 'rejected', rejectionRemarks);
			rejectionRemarks = '';
			(document.getElementById('reject_modal') as HTMLDialogElement)?.close();
		} else {
			alert('Please provide rejection remarks');
		}
		loading_reject = false;
	}
</script>

<svelte:head>
	<title>Event Details - {eventDetails?.eventName || 'Loading...'}</title>
	<meta name="description" content="View details of the event." />
</svelte:head>

<div class="container mx-auto px-16 py-8">
	<!-- Add this back button at the top -->
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<!-- svelte-ignore event_directive_deprecated -->
	<button onclick={() => history.back()} class="btn btn-ghost btn-circle mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 19l-7-7m0 0l7-7m-7 7h18"
			/>
		</svg>
	</button>

	{#if eventDetails?.status === 404}
		<div class="alert alert-error shadow-lg">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 flex-shrink-0 stroke-current"
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
				<span>{eventDetails.error}</span>
			</div>
		</div>
	{:else if eventDetails}
		<!-- Event Header -->
		<div class="mb-8 flex flex-col gap-6 md:flex-row">
			<div class="flex-1">
				<h1 class="mb-2 text-4xl font-bold">{eventDetails.eventName}</h1>

				<p class="mb-4 text-lg">{eventDetails.description}</p>

				<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="card bg-base-100 border">
						<div class="card-body p-4">
							<h2 class="card-title text-sm">Managed By</h2>
							<div class="flex items-center gap-3">
								<div class="avatar placeholder">
									<div class="bg-neutral-focus text-neutral-content w-10 rounded-full">
										<!-- svelte-ignore a11y_missing_attribute -->
										<img
											src="https://avatar.iran.liara.run/username?username={eventDetails.managedBy
												.name}"
										/>
									</div>
								</div>
								<div>
									<p class="font-semibold">{eventDetails.managedBy.name}</p>
									<p class="text-sm text-gray-500">{eventDetails.managedBy.email}</p>
									<p class="text-sm text-gray-500">{eventDetails.managedBy.phone}</p>
								</div>
							</div>
						</div>
					</div>

					<div class="card bg-base-100 border">
						<div class="card-body p-4">
							<h2 class="card-title text-sm">Status</h2>
							<div class="flex flex-wrap items-center gap-2">
								{#if eventDetails.universityAdministrationApproval === 'pending'}
									<span class="">Awaiting your approval to proceed with the event.</span>
								{:else if eventDetails.universityAdministrationApproval === 'approved' && eventDetails.bookings.length === 0}
									<span class="">
										Event approved by {eventDetails.eventApprovedBy?.name}. Awaiting venue booking
										from the student manager.
									</span>
								{:else if eventDetails.universityAdministrationApproval === 'approved' && eventDetails.bookings.length > 0}
									<span class="">
										Event approved by {eventDetails.eventApprovedBy?.name}. Awaiting your
										confirmation for the venue booking.
									</span>
								{:else if eventDetails.universityAdministrationApproval === 'rejected'}
									<span class="">Event was rejected by {eventDetails.eventRejectedBy?.name}.</span>
								{/if}
							</div>
							{#if eventDetails.rejectionRemarks}
								<p class="text-error mt-2 text-sm">Reason: {eventDetails.rejectionRemarks}</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Admin Actions -->
		{#if eventDetails.universityAdministrationApproval === 'pending'}
			<div class="mt-8 flex justify-end gap-4">
				<button
					class="btn bg-[#37474f] text-white"
					onclick={() => handleApprove(data.eventDetails.id)}
					disabled={loading_approve || loading_reject}
				>
					{#if loading_approve}
						<span class="loading loading-spinner loading-md"></span>
					{:else}
						Approve Event & Enable Venue Bookings
					{/if}
				</button>
				<button
					class="btn hover:btn-error"
					onclick={() => handleReject(data.eventDetails.id)}
					disabled={loading_approve || loading_reject}
					>{#if loading_reject}
						<span class="loading loading-spinner loading-md"></span>
					{:else}
						Reject Event Request
					{/if}</button
				>
			</div>
		{/if}

		<!-- Bookings Section -->
		<div class="mb-12">
			<h2 class="mb-4 text-2xl font-bold">Bookings</h2>

			{#if eventDetails.universityAdministrationApproval === 'pending'}
				<div class="font-serif text-lg">
					<span>Venue bookings will open once the event is approved.</span>
				</div>
			{:else if eventDetails.bookings.length === 0 && eventDetails.universityAdministrationApproval === 'approved'}
				<div class="font-serif text-lg">
					<span
						>Venue bookings are now open. Waiting for the student manager to create a booking.</span
					>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Venue</th>
								<th>Block</th>
								<th>Date & Time</th>
								<th>Booked By</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each eventDetails.bookings as booking}
								<tr class="hover">
									<td>{booking.venue.name}</td>
									<td>{booking.venue.block?.name}</td>
									<td>
										{new Date(booking.bookingStartDateTime).toLocaleString()} -<br />
										{new Date(booking.bookingEndDateTime).toLocaleString()}
									</td>
									<td>
										<div class="flex items-center gap-2">
											<div class="avatar placeholder">
												<div class="bg-neutral-focus text-neutral-content w-8 rounded-full">
													<span class="text-xs">{booking.bookedByStudent.name.charAt(0)}</span>
												</div>
											</div>
											{booking.bookedByStudent.name}
										</div>
									</td>
									<td>
										<div
											class="badge {booking.bookingApprovalStatus === 'Approved'
												? 'badge-success'
												: booking.bookingApprovalStatus === 'Rejected'
													? 'badge-error'
													: 'badge-warning'}"
										>
											{booking.bookingApprovalStatus}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex h-64 items-center justify-center">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{/if}
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
