<script lang="ts">
	import {
		Send,
		ArrowLeft,
		Calendar,
		Clock,
		MapPin,
		User,
		Ticket,
		ShieldAlert,
		Globe,
		Hourglass
	} from '@lucide/svelte';

	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let formData = $state({
		name: '',
		email: '',
		phone: '',
		address: ''
	});

	let isSubmitting = $state(false);
	let registrationSuccess = $state(false);
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
	<h1 class="raleway pb-6 text-center text-7xl font-extrabold text-[#37474f]">Emu</h1>

	<div class="mx-auto max-w-3xl">
		<!-- Back button -->
		<!-- <a href="/events" class="btn btn-ghost mb-6">
			<ArrowLeft class="h-5 w-5" />
			<span>Back to Events</span>
		</a> -->

		<!-- Event Card -->
		<div class="card mb-8 overflow-hidden border-1 border-gray-200 bg-white">
			<div class="card-body">
				<div class="flex flex-col gap-6 md:flex-row">
					<!-- Event Image Placeholder -->
					<div
						class="flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white md:w-1/3"
					>
						{#if data.eventDetails.eventType === 'limited'}
							<Ticket class="h-16 w-16" />
						{:else}
							<Globe class="h-16 w-16" />
						{/if}
					</div>

					<!-- Event Details -->
					<div class="w-full md:w-2/3">
						<div class="mb-1 flex items-center gap-2">
							{#if data.eventDetails.eventType === 'limited'}
								<span class="badge badge-warning gap-1">
									<ShieldAlert class="h-4 w-4" />
									Limited Seats
								</span>
							{:else}
								<span class="badge badge-success gap-1"> Open Event </span>
							{/if}

							{#if data.eventDetails.universityAdministrationApproval === 'pending'}
								<span class="badge badge-info"> Approval Pending </span>
							{:else if data.eventDetails.universityAdministrationApproval === 'rejected'}
								<span class="badge badge-error"> Rejected </span>
							{/if}
						</div>

						<h1 class="mb-2 text-3xl font-bold text-gray-900">{data.eventDetails.eventName}</h1>

						<div class="mb-4 space-y-3 text-gray-700">
							<div class="flex items-center gap-2">
								<Calendar class="h-5 w-5 text-blue-500" />
								<span>
									{new Date(data.eventDetails.eventStartDateTime).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</span>
							</div>

							<div class="flex items-center gap-2">
								<Clock class="h-5 w-5 text-blue-500" />
								<span>
									{new Date(data.eventDetails.eventStartDateTime).toLocaleTimeString()} -
									{new Date(data.eventDetails.eventEndDateTime).toLocaleTimeString()}
								</span>
							</div>

							<div class="flex items-center gap-2">
								<MapPin class="h-5 w-5 text-blue-500" />
								<span>{data.eventDetails.eventVenue}</span>
							</div>

							{#if data.eventDetails.eventType === 'limited'}
								<div class="flex items-center gap-2">
									<User class="h-5 w-5 text-blue-500" />
									<span>{data.eventDetails.limit} seats available</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if data.eventDetails.publishStatus === 'pending_publish'}
			<div class="card border-1 border-gray-200 bg-white">
				<div class="card-body py-12 text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
						<Hourglass />
					</div>
					<h3 class="mt-3 text-lg font-medium text-gray-900">
						Registration is not open at the moment. Please check again soon.
					</h3>
				</div>
			</div>
		{:else}
			<!-- Registration Form -->
			{#if registrationSuccess}
				<div class="card border-1 border-gray-200 bg-white">
					<div class="card-body py-12 text-center">
						<div
							class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
						>
							<svg
								class="h-6 w-6 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h3 class="mt-3 text-lg font-medium text-gray-900">Registration Successful!</h3>
						<div class="mt-2 text-sm text-gray-500">
							<p>Thank you for registering for {data.eventDetails.eventName}.</p>
							<p>We've sent a confirmation email to {formData.email}.</p>
						</div>
						<div class="mt-6">
							<button onclick={() => window.location.reload()} class="btn btn-primary">
								Register Another Person
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="card border-1 border-gray-200 bg-white">
					<div class="card-body">
						<h2 class="card-title mb-6 text-2xl">Register for this event</h2>

						<form
							method="POST"
							class="space-y-4"
							use:enhance={() => {
								isSubmitting = true;
								return async () => {
									isSubmitting = false;
									registrationSuccess = true;
									formData = {
										name: '',
										email: '',
										phone: '',
										address: ''
									};
								};
							}}
						>
							<input type="text" name="event_id" value={data.eventDetails.id} hidden />
							{#if data.eventDetails.eventType === 'limited'}
								<div class="alert alert-warning mb-4 flex items-center gap-2">
									<ShieldAlert class="h-5 w-5" />
									<span>Limited seats available. Please register early.</span>
								</div>
							{/if}
							<div class="form-control">
								<label class="label" for="full_name">
									<span class="label-text">Full Name</span>
								</label>
								<input
									type="text"
									bind:value={formData.name}
									name="full_name"
									placeholder="John Doe"
									class="input input-bordered w-full"
									required
								/>
							</div>

							<div class="form-control">
								<label class="label" for="email">
									<span class="label-text">Email Address</span>
								</label>
								<input
									type="email"
									bind:value={formData.email}
									placeholder="john@example.com"
									name="email"
									class="input input-bordered w-full"
									required
								/>
							</div>

							<div class="form-control">
								<label class="label" for="phone">
									<span class="label-text">Phone Number</span>
								</label>
								<input
									type="tel"
									bind:value={formData.phone}
									placeholder="Eg. 9090990890"
									name="phone"
									class="input input-bordered w-full"
									required
								/>
							</div>

							<div class="form-control">
								<label class="label" for="address">
									<span class="label-text">Address</span>
								</label>
								<textarea
									bind:value={formData.address}
									placeholder="123 Main St, City, Country"
									name="address"
									class="textarea textarea-bordered w-full"
									rows="3"
									required
								></textarea>
							</div>

							<div class="form-control mt-8">
								<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
									{#if isSubmitting}
										<span class="loading loading-spinner"></span>
										Processing...
									{:else}
										<Send class="h-5 w-5" />
										Register Now
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
