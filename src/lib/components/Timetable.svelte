<script lang="ts">
	import { onMount } from 'svelte';
	import { Calendar, Clock, AlertCircle } from '@lucide/svelte';

	let {
		venueId,
		selectedDate = new Date().toISOString().split('T')[0]
	}: { venueId: number; selectedDate?: string } = $props();

	let availability = $state<any[]>([]);
	let loading = $state(false);
	let error = $state('');

	async function fetchAvailability() {
		if (!venueId) return;
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/venues/${venueId}/availability`);
			const data = await res.json();
			if (res.ok) {
				availability = data.availability;
			} else {
				error = data.error || 'Failed to fetch availability';
			}
		} catch (e) {
			error = 'Connection error';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (venueId) fetchAvailability();
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	let filteredBookings = $derived(
		availability
			.filter((b) => {
				const bDate = new Date(b.bookingStartDateTime).toISOString().split('T')[0];
				return bDate === selectedDate;
			})
			.sort(
				(a, b) =>
					new Date(a.bookingStartDateTime).getTime() - new Date(b.bookingStartDateTime).getTime()
			)
	);
</script>

<div class="flex flex-col gap-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h3 class="font-display flex items-center gap-2 text-lg font-bold text-slate-900">
				<!-- <Calendar class="text-brand-primary h-4 w-4" /> -->
				Venue Availability
			</h3>
			<p class="text-[11px] font-medium text-slate-400">
				Schedule for {venueId ? `Venue #${venueId}` : 'selecting venue...'}
			</p>
		</div>
		<div class="group relative">
			<!-- <Calendar class="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /> -->
			<input
				type="date"
				bind:value={selectedDate}
				class="minimal-input w-full pl-10 text-xs font-semibold"
			/>
		</div>
	</div>

	{#if loading}
		<div class="flex h-32 flex-col items-center justify-center gap-3">
			<div
				class="border-t-brand-primary h-8 w-8 animate-spin rounded-full border-2 border-slate-100"
			></div>
			<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Loading...</p>
		</div>
	{:else if error}
		<div
			class="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-red-600"
		>
			<AlertCircle class="h-5 w-5 opacity-50" />
			<p class="text-xs font-bold">{error}</p>
		</div>
	{:else if filteredBookings.length === 0}
		<div
			class="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-100 bg-slate-50/30"
		>
			<p class="text-xs font-bold tracking-widest text-slate-300 uppercase">No Bookings</p>
		</div>
	{:else}
		<div class="relative">
			<div class="absolute top-2 bottom-2 left-4 w-px bg-slate-100"></div>

			<div class="flex flex-col gap-4">
				{#each filteredBookings as booking}
					<div class="group relative flex gap-6">
						<div
							class="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white bg-slate-200 shadow-sm ring-4 ring-white {booking.bookingApprovalStatus ===
							'Approved'
								? 'bg-emerald-500'
								: 'bg-amber-400'}"
						>
							<Clock class="h-3 w-3 text-white" />
						</div>

						<div class="flex flex-1 flex-col justify-center gap-0.5">
							<div class="flex items-center justify-between">
								<h4 class="text-xs font-bold text-slate-800">
									{booking.event?.eventName || 'Private Event'}
								</h4>
								<span
									class="text-[9px] font-black tracking-widest uppercase {booking.bookingApprovalStatus ===
									'Approved'
										? 'text-emerald-600'
										: 'text-amber-600'}"
								>
									{booking.bookingApprovalStatus}
								</span>
							</div>
							<p class="text-[10px] font-semibold text-slate-400">
								{formatTime(booking.bookingStartDateTime)} — {formatTime(
									booking.bookingEndDateTime
								)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div
		class="mt-2 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-[9px] font-black tracking-widest text-slate-400 uppercase"
	>
		<div class="flex items-center gap-2">
			<div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
			Approved
		</div>
		<div class="flex items-center gap-2">
			<div class="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
			Pending
		</div>
	</div>
</div>
