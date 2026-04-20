<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import {
		ChevronLeft,
		ChevronRight,
		Calendar as CalendarIcon,
		MapPin,
		Clock,
		LayoutDashboard,
		ArrowRight
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	// Calendar State
	let date = $state(new Date());
	let currentMonth = $derived(date.getMonth());
	let currentYear = $derived(date.getFullYear());

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function nextMonth() {
		date = new Date(currentYear, currentMonth + 1, 1);
	}

	function prevMonth() {
		date = new Date(currentYear, currentMonth - 1, 1);
	}

	function goToToday() {
		date = new Date();
	}

	// Calendar Calculations
	let daysInMonth = $derived(new Date(currentYear, currentMonth + 1, 0).getDate());
	let firstDayOfMonth = $derived(new Date(currentYear, currentMonth, 1).getDay());

	interface Day {
		day: number | null;
		date: Date | null;
		bookings: any[]; // Or more specific if possible
	}

	let calendarDays = $derived.by(() => {
		const days: Day[] = [];
		// Padding for previous month
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push({ day: null, date: null, bookings: [] });
		}
		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			const d = new Date(currentYear, currentMonth, i);
			days.push({
				day: i,
				date: d,
				bookings: data.bookings.filter((b: any) => {
					const bDate = new Date(b.bookingStartDateTime);
					return (
						bDate.getDate() === i &&
						bDate.getMonth() === currentMonth &&
						bDate.getFullYear() === currentYear
					);
				})
			});
		}
		return days;
	});

	function formatTime(dateStr: string | Date) {
		return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="min-h-screen bg-[#fafbfc] pb-24 font-sans text-slate-900">
	<!-- Top Bar -->
	<header class="border-b border-slate-200 bg-white px-6 py-8 lg:px-12">
		<div class="container mx-auto">
			<div
				class="flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-400 uppercase"
			>
				<a href="/admin/events" class="hover:text-brand-primary">Admin Control</a>
				<ArrowRight class="h-3 w-3" />
				<span>Timetable</span>
			</div>
			<div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 class="font-display text-4xl font-bold tracking-tight text-slate-900">
						University Timetable
					</h1>
					<p class="mt-2 text-sm font-medium text-slate-500">
						Visualize and manage all approved venue bookings across the campus.
					</p>
				</div>
				<div class="flex items-center gap-3">
					<button
						onclick={goToToday}
						class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50"
					>
						Today
					</button>
					<div class="flex items-center rounded-lg border border-slate-200 bg-white">
						<button
							onclick={prevMonth}
							class="p-2 text-slate-400 transition-colors hover:text-slate-900"
							aria-label="Previous Month"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>
						<span
							class="min-w-[140px] border-x border-slate-100 px-4 text-center text-xs font-black tracking-widest text-slate-900 uppercase"
						>
							{monthNames[currentMonth]}
							{currentYear}
						</span>
						<button
							onclick={nextMonth}
							class="p-2 text-slate-400 transition-colors hover:text-slate-900"
							aria-label="Next Month"
						>
							<ChevronRight class="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="container mx-auto mt-12 px-6 lg:px-12">
		<!-- Calendar Grid -->
		<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<!-- Weekday Headers -->
			<div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
				{#each daysOfWeek as day}
					<div
						class="px-4 py-3 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase"
					>
						{day}
					</div>
				{/each}
			</div>

			<!-- Days Grid -->
			<div class="grid grid-cols-7 divide-x divide-y divide-slate-100">
				{#each calendarDays as { day, date: d, bookings }, i}
					<div
						class="group relative min-h-[160px] bg-white p-2 transition-colors hover:bg-slate-50/30"
					>
						{#if day}
							<div class="mb-2 flex items-center justify-between">
								<span
									class="text-[10px] font-black tracking-widest {new Date().toDateString() ===
									d?.toDateString()
										? 'bg-brand-primary rounded-full px-2 py-0.5 text-white'
										: 'text-slate-400'}"
								>
									{day}
								</span>
							</div>

							<div class="flex flex-col gap-1.5">
								{#each bookings as booking}
									<a
										href="/admin/events/{booking.event.id}"
										class="hover:border-brand-primary/20 hover:shadow-brand-primary/5 flex flex-col gap-1 rounded-lg border border-slate-100 bg-white p-2 shadow-sm transition-all active:scale-[0.98]"
									>
										<p class="truncate text-[10px] leading-tight font-bold text-slate-900">
											{booking.event.eventName}
										</p>
										<div
											class="flex items-center gap-1.5 text-[8px] font-black tracking-widest text-slate-400 uppercase"
										>
											<MapPin class="h-2.5 w-2.5" />
											<span class="truncate">{booking.venue.name}</span>
										</div>
										<div
											class="flex items-center gap-1.5 text-[8px] font-black tracking-widest text-emerald-500 uppercase"
										>
											<Clock class="h-2.5 w-2.5" />
											<span>{formatTime(booking.bookingStartDateTime)}</span>
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<div class="h-full w-full bg-slate-50/20"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Key / Legend -->
		<div class="mt-8 flex items-center gap-6 border-t border-slate-100 pt-8">
			<div class="flex items-center gap-2">
				<div class="bg-brand-primary h-2 w-2 rounded-full"></div>
				<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase">Today</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-lg border border-slate-200 bg-white"></div>
				<span class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
					>Approved Booking</span
				>
			</div>
		</div>
	</main>
</div>

<style>
	.font-display {
		font-family: 'Outfit', sans-serif;
	}
</style>
