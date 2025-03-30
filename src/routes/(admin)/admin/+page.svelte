<script lang="ts">
	import type { LayoutData, PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
</script>

{data.eventCount[0].count}

<div class="overflow-x-auto p-4">
	<table class="table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Date & Time</th>
				<th>Venue</th>
				<th>Student Manager</th>
				<th>Status</th>
				<th>Participants</th>
			</tr>
		</thead>
		<tbody>
			{#each data.allEventsAndStudents as event}
				<tr class="">
					<td>{event.id} - {event.name}</td>
					<td>{formatDate(event.startDateTime)}</td>
					<td>{event.venue}</td>
					<td>{event.studentId} - {event.studentName}</td>
					<td>{event.approval}</td>
					<td>
						{#if event.approval === 'pending'}
							-
						{:else}
							0
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
