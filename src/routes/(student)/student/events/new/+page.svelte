<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let event_type = $state('open');
</script>

<section class="flex flex-col px-2 py-4">
	<h1 class="raleway text-xl font-bold text-[#37474f]">Create New Event</h1>
</section>

<section class="px-2">
	<form action="POST">
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
				<select class="select w-full" bind:value={event_type}>
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

		{#if event_type === 'limited'}
			<div class="flex gap-2">
				<fieldset class="fieldset w-1/3">
					<legend class="fieldset-legend">Number of people allowed?</legend>
					<input
						type="number"
						class="input w-full"
						name="event_name"
						placeholder="Eg. 256"
						required
					/>
				</fieldset>
			</div>
		{/if}

		<div class="flex gap-2">
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Venue of the event?</legend>
				<input
					type="text"
					class="input w-full"
					name="event_name"
					placeholder="Eg. GDG Hackathon"
					required
				/>
			</fieldset>
			<fieldset class="fieldset w-1/3">
				<legend class="fieldset-legend">Date of the event?</legend>
				<input
					type="datetime-local"
					class="input w-full"
					name="event_name"
					placeholder="Eg. GDG Hackathon"
					min={new Date().toISOString().slice(0, 16)}
					required
				/>
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
				<button class="btn" type="submit"> Submit </button>
			</div>
		</div>
	</form>
</section>
