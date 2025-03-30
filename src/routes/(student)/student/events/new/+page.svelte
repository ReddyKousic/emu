<script lang="ts">
	import type { PageData, PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let event_type = $state('open');
	let event_start_date_time = $state('');
	let event_end_date_time = $state('');

	// Function to get current datetime in IST (UTC+5:30)
	function getCurrentISTDateTime() {
		const now = new Date();
		// Convert to IST (UTC+5:30)
		const istOffset = 330; // 5 hours 30 minutes in minutes
		const istTime = new Date(now.getTime() + istOffset * 60000);
		// Return in format for datetime-local input (YYYY-MM-DDTHH:MM)
		return istTime.toISOString().slice(0, 16);
	}

	// Function to validate end date is after start date
	function validateDates() {
		if (event_start_date_time && event_end_date_time) {
			const start = new Date(event_start_date_time);
			const end = new Date(event_end_date_time);
			return end > start;
		}
		return true;
	}
</script>

<section class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">Create New Event</h1>
</section>

{#if form?.message}
	<p class="mb-4 text-center text-red-700">{@html form.message}</p>
{/if}
<section class="px-2">
	<form method="POST">
		<div class="flex gap-2">
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Name of the event?</legend>
				<input
					type="text"
					class="input w-full"
					name="event_name"
					placeholder="Eg. GDG Hackathon"
					required
				/>
			</fieldset>

			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Event Type</legend>
				<select class="select w-full" bind:value={event_type} name="event_type" required>
					<option value="open">Open Event</option>
					<option value="limited">Limited Event</option>
				</select>
				<span class="fieldset-label">
					{#if event_type === 'open'}
						Any number of people can register for this event.
					{:else}
						Only a limited number of people can register for this event.
					{/if}
				</span>
			</fieldset>
		</div>

		<div class="flex gap-2">
			{#if event_type === 'limited'}
				<fieldset class="fieldset w-1/3">
					<legend class="fieldset-legend">Number of people allowed?</legend>
					<input
						type="number"
						class="input w-full"
						name="event_limit"
						placeholder="Eg. 256"
						required
					/>
				</fieldset>
			{/if}

			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Venue of the event?</legend>
				<input
					type="text"
					class="input w-full"
					name="event_venue"
					placeholder="Eg. GDG Hackathon"
					required
				/>
			</fieldset>
		</div>

		<div class="flex gap-2">
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Event starts at?</legend>
				<input
					type="datetime-local"
					class="input w-full"
					name="event_start_date_time"
					placeholder="Eg. GDG Hackathon"
					bind:value={event_start_date_time}
					min={getCurrentISTDateTime()}
					required
				/>
			</fieldset>

			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Event ends at?</legend>
				<input
					type="datetime-local"
					class="input w-full"
					name="event_end_date_time"
					placeholder="Eg. GDG Hackathon"
					bind:value={event_end_date_time}
					min={event_start_date_time || getCurrentISTDateTime()}
					required
				/>
				{#if !validateDates()}
					<p class="mt-1 text-sm text-red-500">End date and time must be later than the start.</p>
				{/if}
			</fieldset>
		</div>

		<div class="flex gap-2">
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Event Manager Name?</legend>
				<input
					type="text"
					class="input w-full"
					name="event_manager_name"
					value="{data.name} (You)"
					required
					disabled
				/>
			</fieldset>
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Event Manager Email?</legend>
				<input
					type="text"
					class="input w-full"
					name="event_manager_email"
					value="{data.email} (You)"
					required
					disabled
				/>
			</fieldset>
		</div>

		<div class="flex gap-2 py-4">
			<div class="fieldset w-1/3"></div>
			<div class="fieldset w-1/3">
				<button class="btn" type="submit" disabled={!validateDates()}> Submit </button>
			</div>
		</div>
	</form>
</section>
