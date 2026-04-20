<script lang="ts">
	import { fade, slide, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import Timetable from '$lib/components/Timetable.svelte';
	import {
		Calendar,
		MapPin,
		Clock,
		Plus,
		Trash2,
		AlertTriangle,
		CheckCircle2,
		Info,
		Users,
		Settings,
		ArrowRight,
		Hourglass
	} from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let toggled = $state(data.event.publishStatus === 'published');
	let isRejected = data.event.universityAdministrationApproval === 'rejected';
	let isApprovedForBooking = data.event.isOpenForBookingVenue;

	// Proposal Form State
	let selectedVenueId = $state<number | null>(null);
	let bookingDate = $state(new Date().toISOString().split('T')[0]);
	let startTime = $state('09:00');
	let endTime = $state('10:00');
	let submitting = $state(false);
	let error = $state('');

	async function submitProposal() {
		if (!selectedVenueId) return;
		submitting = true;
		error = '';

		const start = `${bookingDate}T${startTime}`;
		const end = `${bookingDate}T${endTime}`;

		try {
			const res = await fetch(`/student/api/event/${data.event.id}/propose-booking`, {
				method: 'POST',
				body: JSON.stringify({
					proposals: [{ venueId: selectedVenueId, start, end }]
				})
			});
			const result = await res.json();
			if (res.ok) {
				invalidateAll();
				selectedVenueId = null;
			} else {
				error = result.error;
			}
		} catch (e) {
			error = 'Failed to submit proposal';
		} finally {
			submitting = false;
		}
	}

	$effect(() => {
		if ((data.event.publishStatus === 'published') !== toggled) {
			fetch(`/student/api/event/${data.event.id}/publish`, {
				method: 'PATCH',
				body: JSON.stringify({ published: toggled })
			});
		}
	});

	let approvedBooking = $derived(
		data.eventBookings.find((b) => b.bookingApprovalStatus === 'Approved')
	);
</script>

<div class="min-h-screen bg-[#fafbfc] pb-24 font-sans text-slate-900">
	<!-- Minimal Header -->
	<header class="border-b border-slate-200 bg-white px-6 py-8 text-slate-900 lg:px-12">
		<div class="container mx-auto">
			<div
				class="flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-400 uppercase"
			>
				<a href="/student/events" class="hover:text-brand-primary">Dashboard</a>
				<ArrowRight class="h-3 w-3" />
				<span>Event Detail</span>
			</div>
			<div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div class="mb-2 flex items-center gap-2">
						<div
							class="badge border-slate-200 bg-slate-50 text-[9px] font-black tracking-widest text-slate-500 uppercase"
						>
							{data.event.universityAdministrationApproval}
						</div>
					</div>
					<h1 class="font-display text-4xl font-bold tracking-tight text-slate-900">
						{data.event.eventName}
					</h1>
					<p class="mt-2 max-w-2xl text-sm font-medium text-slate-500">
						{data.event.description}
					</p>
				</div>
				<div class="flex gap-3">
					<div
						class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2"
					>
						<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>Published</span
						>
						<input
							type="checkbox"
							bind:checked={toggled}
							class="toggle toggle-primary toggle-sm"
							disabled={!approvedBooking || isRejected}
						/>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="container mx-auto mt-12 px-6 lg:px-12">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Left Column: Context & Stats -->
			<div class="flex flex-col gap-10 lg:col-span-4">
				<div class="flex flex-col gap-2 border-l-2 border-slate-100 pl-6">
					<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>Registrations</span
					>
					<h2 class="font-display text-5xl font-bold text-slate-900">{data.participantsCount}</h2>
					<p class="text-[9px] font-black tracking-widest text-slate-400 uppercase">Total guests</p>
				</div>

				<div class="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6">
					<h3
						class="font-display flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-900 uppercase"
					>
						<Settings class="h-3.5 w-3.5 text-slate-400" />
						Event Control
					</h3>

					<div class="space-y-4">
						{#if !approvedBooking && isApprovedForBooking}
							<div
								class="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4"
							>
								<Info class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
								<p class="text-[11px] leading-relaxed font-semibold text-amber-900">
									Awaiting venue booking. Secure a slot below.
								</p>
							</div>
						{/if}

						{#if isRejected}
							<div class="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
								<AlertTriangle class="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
								<p class="text-[11px] leading-relaxed font-semibold text-red-900">
									This request was rejected.
								</p>
							</div>
						{/if}

						<div class="p-2">
							<div
								class="mb-2 flex justify-between text-[9px] font-black tracking-widest text-slate-400 uppercase"
							>
								<span>Setup</span>
								<span>{approvedBooking ? '100' : '50'}%</span>
							</div>
							<div class="h-1 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									class="bg-brand-primary h-full transition-all duration-500"
									style="width: {approvedBooking ? '100' : '50'}%"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Venue & Proposals -->
			<div class="flex flex-col gap-12 lg:col-span-8">
				{#if approvedBooking}
					<div class="rounded-xl border border-emerald-100 bg-emerald-50/50 p-8">
						<div class="flex flex-col gap-6 md:flex-row md:items-center">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 text-white"
							>
								<MapPin class="h-5 w-5" />
							</div>
							<div class="flex-1">
								<p class="mb-1 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
									Confirmed Venue
								</p>
								<h3 class="font-display text-2xl font-bold text-slate-900">
									{approvedBooking.venue.name}
								</h3>
							</div>
							<div class="flex flex-col gap-1 text-right">
								<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
									>{new Date(approvedBooking.bookingStartDateTime).toLocaleDateString()}</span
								>
								<span class="text-xs font-bold text-slate-900">
									{new Date(approvedBooking.bookingStartDateTime).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</span>
							</div>
						</div>
					</div>
				{:else if isApprovedForBooking}
					<section class="flex flex-col gap-8">
						<div class="flex items-center justify-between">
							<h2 class="font-display text-xl font-bold text-slate-900">Venue Proposals</h2>
							<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
								{data.eventBookings.length} / 4 Slots
							</span>
						</div>

						{#if selectedVenueId}
							<div class="rounded-xl border border-slate-200 bg-white p-8">
								<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
									<div class="flex flex-col gap-6">
										<div class="flex items-center justify-between">
											<h3
												class="font-display text-sm font-bold tracking-widest text-slate-900 uppercase"
											>
												New Proposal
											</h3>
											<button
												onclick={() => (selectedVenueId = null)}
												class="text-[9px] font-black text-slate-400 uppercase hover:text-slate-600"
												>Close</button
											>
										</div>

										<div class="space-y-4">
											<div class="flex flex-col gap-2">
												<label
													class="text-[9px] font-black tracking-widest text-slate-400 uppercase"
													for="venue-select">Select Venue</label
												>
												<select
													id="venue-select"
													class="minimal-input w-full text-xs font-bold"
													bind:value={selectedVenueId}
												>
													{#each data.venues as venue}
														<option value={venue.id}>{venue.name} ({venue.block?.name})</option>
													{/each}
												</select>
											</div>

											<div class="flex flex-col gap-2">
												<label
													class="text-[9px] font-black tracking-widest text-slate-400 uppercase"
													for="booking-date">Date</label
												>
												<input
													id="booking-date"
													type="date"
													class="minimal-input w-full text-xs font-bold"
													bind:value={bookingDate}
												/>
											</div>

											<div class="grid grid-cols-2 gap-4">
												<div class="flex flex-col gap-2">
													<label
														class="text-[9px] font-black tracking-widest text-slate-400 uppercase"
														for="start-time">Start</label
													>
													<input
														id="start-time"
														type="time"
														class="minimal-input w-full text-xs font-bold"
														bind:value={startTime}
													/>
												</div>
												<div class="flex flex-col gap-2">
													<label
														class="text-[9px] font-black tracking-widest text-slate-400 uppercase"
														for="end-time">End</label
													>
													<input
														id="end-time"
														type="time"
														class="minimal-input w-full text-xs font-bold"
														bind:value={endTime}
													/>
												</div>
											</div>
										</div>

										{#if error}
											<p class="text-[9px] font-bold tracking-tight text-red-500 uppercase">
												*{error}
											</p>
										{/if}

										<button
											class="w-full rounded-lg bg-slate-900 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-slate-800 disabled:opacity-50"
											onclick={submitProposal}
											disabled={submitting}
										>
											{submitting ? 'VALIDATING...' : 'SUBMIT PROPOSAL'}
										</button>
									</div>

									<div class="rounded-lg border border-slate-100 bg-slate-50 p-1">
										<Timetable venueId={selectedVenueId} selectedDate={bookingDate} />
									</div>
								</div>
							</div>
						{:else if data.eventBookings.length < 4}
							<button
								class="flex flex-col items-center justify-center gap-3 rounded-xl border-dashed border-slate-200 bg-slate-50/50 py-12 transition-all hover:border-slate-300 hover:bg-slate-50"
								style="border-style: dashed; border-width: 2px;"
								onclick={() => (selectedVenueId = data.venues[0]?.id)}
							>
								<Plus class="h-4 w-4 text-slate-400" />
								<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
									Add Proposal
								</p>
							</button>
						{/if}

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							{#each data.eventBookings as booking}
								<div
									class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-5 transition-colors hover:border-slate-200"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<MapPin class="text-brand-primary h-3.5 w-3.5" />
											<h4 class="text-xs font-bold text-slate-900">{booking.venue.name}</h4>
										</div>
										<span
											class="text-[9px] font-black tracking-widest uppercase {booking.bookingApprovalStatus ===
											'Pending'
												? 'text-amber-600'
												: 'text-slate-300'}"
										>
											{booking.bookingApprovalStatus}
										</span>
									</div>
									<div
										class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-slate-400 uppercase"
									>
										<span class="flex items-center gap-2"
											><Calendar class="h-3 w-3 opacity-30" />
											{new Date(booking.bookingStartDateTime).toLocaleDateString()}</span
										>
										<span class="flex items-center gap-2"
											><Clock class="h-3 w-3 opacity-30" />
											{new Date(booking.bookingStartDateTime).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})}</span
										>
									</div>
								</div>
							{/each}
						</div>
					</section>
				{:else}
					<div class="rounded-xl border border-slate-200 bg-white py-24 text-center">
						<Hourglass class="mx-auto mb-4 h-6 w-6 text-slate-200" />
						<h3 class="font-display text-sm font-bold tracking-widest text-slate-900 uppercase">
							Reviewing Event
						</h3>
						<p class="mt-1 text-xs font-medium text-slate-400">
							Portal unlocks upon admin approval.
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Guest List -->
		<div class="mt-24">
			<div class="mb-8 flex items-center justify-between">
				<h2 class="font-display text-xl font-bold text-slate-900">Guest List</h2>
				<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
					>{data.participants.length} Registrations</span
				>
			</div>

			<div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
				<table class="w-full text-left">
					<thead class="border-b border-slate-100 bg-slate-50/50">
						<tr class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
							<th class="px-6 py-3">Attendee</th>
							<th class="px-6 py-3">Contact</th>
							<th class="px-6 py-3">Details</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-50">
						{#each data.participants as participant}
							<tr class="text-xs font-medium text-slate-600">
								<td class="px-6 py-4 font-bold text-slate-900">{participant.name}</td>
								<td class="px-6 py-4 text-slate-400">{participant.email}</td>
								<td
									class="max-w-xs truncate px-6 py-4 text-[10px] font-bold text-slate-300 uppercase"
									>{participant.address}</td
								>
							</tr>
						{:else}
							<tr>
								<td
									colspan="3"
									class="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-200"
									>No registrations found</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</main>
</div>

<style>
	.font-display {
		font-family: 'Outfit', sans-serif;
	}
	:global(.animate-spin-slow) {
		animation: spin 4s linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
