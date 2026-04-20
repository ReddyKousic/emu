<script lang="ts">
	import { fade, slide, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { 
		ArrowLeft, 
		CheckCircle2, 
		XCircle, 
		Clock, 
		User, 
		Mail, 
		Phone, 
		Info, 
		Calendar, 
		MapPin, 
		ArrowRight,
		ShieldCheck,
		AlertCircle,
		LayoutDashboard,
		History
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
	const { eventDetails } = data;

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

			window.location.reload();
		} catch (error) {
			console.error('Error updating approval status:', error);
			alert('Failed to update status');
		}
	}

	async function handleApprove(eventId: number) {
		loading_approve = true;
		if (confirm('Are you sure you want to approve this event? This will allow the student to propose venue slots.')) {
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

	async function handleApproveBooking(bookingId: string) {
		if (
			!confirm(
				'Are you sure you want to approve this specific venue booking? All other proposals will be rejected and the event will be published.'
			)
		) {
			return;
		}

		if (!eventDetails?.id) return;

		try {
			const res = await fetch(`/admin/api/event/${eventDetails.id}/approve-booking`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bookingId })
			});

			if (res.ok) {
				window.location.reload();
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to approve booking');
			}
		} catch (e) {
			alert('Connection error');
		}
	}

	const steps = [
		{ name: 'Creation', done: true, current: false },
		{ 
			name: 'Admin Review', 
			done: eventDetails?.universityAdministrationApproval === 'approved' || eventDetails?.universityAdministrationApproval === 'rejected', 
			current: eventDetails?.universityAdministrationApproval === 'pending',
			failed: eventDetails?.universityAdministrationApproval === 'rejected'
		},
		{ 
			name: 'Venue Booking', 
			done: eventDetails?.bookings.some(b => b.bookingApprovalStatus === 'Approved'), 
			current: eventDetails?.universityAdministrationApproval === 'approved' && !eventDetails?.bookings.some(b => b.bookingApprovalStatus === 'Approved'),
			disabled: eventDetails?.universityAdministrationApproval === 'pending' || eventDetails?.universityAdministrationApproval === 'rejected'
		},
		{ 
			name: 'Published', 
			done: eventDetails?.publishStatus === 'published', 
			current: eventDetails?.bookings.some(b => b.bookingApprovalStatus === 'Approved') && eventDetails?.publishStatus !== 'published',
			disabled: !eventDetails?.bookings.some(b => b.bookingApprovalStatus === 'Approved')
		}
	];
</script>

<svelte:head>
	<title>Curator | {eventDetails?.eventName || 'Event Details'}</title>
</svelte:head>

<div class="min-h-screen bg-[#fafbfc] pb-24 font-sans text-slate-900">
	<!-- Top Bar -->
	<header class="sticky top-0 z-50 border-b border-slate-200 bg-white">
		<div class="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
			<div class="flex items-center gap-4">
				<button 
					onclick={() => history.back()} 
					class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
				>
					<ArrowLeft class="h-4 w-4" />
				</button>
				<div>
					<h2 class="font-display text-base font-bold text-slate-900">Admin Control</h2>
					<p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Panel</p>
				</div>
			</div>
			
			<div class="flex items-center gap-3">
				<span class="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500">ID: #{eventDetails?.id}</span>
			</div>
		</div>
	</header>

	<main class="container mx-auto mt-8 px-6 lg:px-12">
		{#if eventDetails?.status === 404}
			<div class="flex flex-col items-center justify-center gap-6 py-24 text-center">
				<div class="rounded-xl border border-red-100 bg-red-50 p-6">
					<AlertCircle class="h-12 w-12 text-red-500" />
				</div>
				<h1 class="font-display text-3xl font-bold text-slate-900">Event Not Found</h1>
				<button onclick={() => history.back()} class="btn btn-primary rounded-xl px-8">Return</button>
			</div>
		{:else if eventDetails}
			<!-- Multi-stage Timeline -->
			<div class="mb-8 rounded-xl border border-slate-200 bg-white p-6">
				<div class="flex flex-col gap-8 md:flex-row md:items-center">
					{#each steps as step, i}
						<div class="flex flex-1 items-center gap-3">
							<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold {step.done ? 'bg-emerald-500 text-white' : step.failed ? 'bg-red-500 text-white' : step.current ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}">
								{#if step.done}
									<CheckCircle2 class="h-5 w-5" />
								{:else if step.failed}
									<XCircle class="h-5 w-5" />
								{:else}
									<span class="text-xs">{i + 1}</span>
								{/if}
							</div>
							<div class="flex flex-col">
								<p class="text-[9px] font-black uppercase tracking-widest {step.disabled ? 'text-slate-300' : 'text-slate-400'}">{step.name}</p>
							</div>
							{#if i < steps.length - 1}
								<div class="hidden h-px flex-1 bg-slate-100 md:block lg:ml-2"></div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
				<!-- Left Column: Details & Manager -->
				<div class="flex flex-col gap-8 lg:col-span-8">
					<section class="rounded-xl border border-slate-200 bg-white p-8">
						<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex items-center gap-3">
								<h1 class="font-display text-2xl font-bold tracking-tight text-slate-900">{eventDetails.eventName}</h1>
								<div class="badge badge-sm border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">{eventDetails.eventType}</div>
							</div>
						</div>
						
						<p class="mb-8 text-sm font-medium leading-relaxed text-slate-600">
							{eventDetails.description}
						</p>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="rounded-xl border border-slate-100 bg-slate-50 p-5">
								<h3 class="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
									<User class="h-3 w-3" />
									Manager
								</h3>
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-400">
										{eventDetails.managedBy.name.charAt(0)}
									</div>
									<div>
										<p class="text-sm font-bold text-slate-900">{eventDetails.managedBy.name}</p>
										<p class="text-[10px] font-semibold text-slate-400">{eventDetails.managedBy.email}</p>
									</div>
								</div>
							</div>

							<div class="rounded-xl border border-slate-100 bg-slate-50 p-5">
								<h3 class="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
									<ShieldCheck class="h-3 w-3" />
									Status
								</h3>
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg font-bold {eventDetails.universityAdministrationApproval === 'approved' ? 'bg-emerald-500 text-white' : eventDetails.universityAdministrationApproval === 'rejected' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}">
										<Clock class="h-5 w-5" />
									</div>
									<p class="text-[10px] font-black uppercase tracking-widest text-slate-900">
										{eventDetails.universityAdministrationApproval}
									</p>
								</div>
							</div>
						</div>

						{#if eventDetails.rejectionRemarks}
							<div class="mt-6 rounded-lg border border-red-100 bg-red-50 p-4">
								<p class="text-[9px] font-black uppercase tracking-widest text-red-900">Rejection Reason</p>
								<p class="mt-1 text-xs font-medium italic text-red-700">"{eventDetails.rejectionRemarks}"</p>
							</div>
						{/if}
					</section>

					<!-- Bookings / Proposals Section -->
					<section class="rounded-xl border border-slate-200 bg-white p-8">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<h2 class="font-display text-lg font-bold text-slate-900">Booking Proposals</h2>
								<span class="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"> {eventDetails.bookings.length} Proposals</span>
							</div>
						</div>

						{#if eventDetails.universityAdministrationApproval === 'pending'}
							<div class="flex py-12 text-center items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
								<p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Awaiting Initial Approval</p>
							</div>
						{:else if eventDetails.bookings.length === 0}
							<div class="flex py-12 text-center items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
								<p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Waiting for Proposals</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{#each eventDetails.bookings as booking}
									<div class="group relative rounded-xl border border-slate-100 bg-white p-5 transition-colors hover:border-slate-200">
										<div class="mb-3 flex items-center justify-between">
											<div class="flex items-center gap-2">
												<MapPin class="h-3.5 w-3.5 text-brand-primary" />
												<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{booking.venue.block?.name || 'Main'}</span>
											</div>
											<div class="badge badge-xs border-none font-black uppercase tracking-widest text-[8px] {booking.bookingApprovalStatus === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}">
												{booking.bookingApprovalStatus}
											</div>
										</div>

										<h4 class="text-sm font-bold text-slate-800">{booking.venue.name}</h4>
										<div class="mt-3 flex flex-col gap-1.5 text-[10px] font-bold text-slate-500">
											<span class="flex items-center gap-2"><Calendar class="h-3 w-3" /> {new Date(booking.bookingStartDateTime).toLocaleDateString()}</span>
											<span class="flex items-center gap-2"><Clock class="h-3 w-3" /> {new Date(booking.bookingStartDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.bookingEndDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
										</div>

										{#if booking.bookingApprovalStatus === 'Pending'}
											<button 
												class="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-[10px] font-black text-white transition-colors hover:bg-emerald-600"
												onclick={() => handleApproveBooking(booking.id)}
											>
												Approve Proposal
											</button>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</section>
				</div>

				<!-- Right Column: Actions -->
				<div class="flex flex-col gap-8 lg:col-span-4">
					{#if eventDetails.universityAdministrationApproval === 'pending'}
						<div class="rounded-xl border border-slate-200 bg-white p-6 sticky top-28">
							<h3 class="font-display mb-4 text-sm font-bold text-slate-900">Review Actions</h3>
							
							<div class="flex flex-col gap-2">
								<button 
									class="flex items-center justify-center gap-3 rounded-lg bg-brand-primary py-3 text-xs font-black text-white transition-colors hover:bg-brand-primary/90" 
									onclick={() => handleApprove(eventDetails.id)}
									disabled={loading_approve || loading_reject}
								>
									{#if loading_approve}
										<div class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
									{:else}
										Approve Request
									{/if}
								</button>
								
								<button 
									class="flex items-center justify-center gap-3 rounded-lg border border-red-100 bg-red-50 py-3 text-xs font-black text-red-600 transition-colors hover:bg-red-100"
									onclick={() => handleReject(eventDetails.id)}
									disabled={loading_approve || loading_reject}
								>
									Reject Request
								</button>
							</div>
						</div>
					{:else}
						<div class="rounded-xl border border-slate-200 bg-white p-6 text-center sticky top-28">
							<History class="h-5 w-5 text-slate-200 mx-auto mb-3" />
							<h3 class="font-display mb-1 text-sm font-bold text-slate-900">Interaction Log</h3>
							<p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Activity stored</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Rejection Modal -->
<dialog id="reject_modal" class="modal backdrop-blur-none">
	<div class="modal-box rounded-xl border border-slate-200 bg-white p-8 shadow-none">
		<h3 class="font-display text-lg font-bold text-slate-900">Reject Event</h3>
		<textarea
			id="rejection-remarks"
			bind:value={rejectionRemarks}
			class="mt-4 w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-red-500 focus:ring-0"
			placeholder="State reason..."
			rows="3"
		></textarea>

		<div class="modal-action mt-6 gap-3">
			<form method="dialog" class="flex w-full gap-2">
				<button class="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-[10px] font-black text-slate-500">Cancel</button>
				<button 
					onclick={submitReject} 
					class="flex-1 rounded-lg bg-red-500 py-2.5 text-[10px] font-black text-white hover:bg-red-600"
				>
					Confirm Rejection
				</button>
			</form>
		</div>
	</div>
</dialog>

<style>
	.font-display { font-family: 'Outfit', sans-serif; }
</style>


