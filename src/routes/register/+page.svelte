<script lang="ts">
	// import type { PageProps } from './$types';

	import { AtSign, RectangleEllipsis, User, Phone } from '@lucide/svelte';
	import Illustration from '$lib/assets/left.svelte';
	import { enhance } from '$app/forms';
	type PageProps = {
		data: any;
		form: {
			message: string;
			email?: string;
			name?: string;
			phone?: string;
		};
	};
	let { data, form }: PageProps = $props();

	let signup_start = $state(false);
</script>

<section class="flex h-screen w-screen items-center justify-center">
	<div class="left flex h-full w-full items-center justify-center">
		<Illustration />
	</div>
	<div class="left flex h-full w-full items-center justify-center">
		<div class="flex flex-col items-center">
			<p class="poppins-regular">Sign Up to</p>
			<h1 class="raleway pb-6 text-7xl font-extrabold text-[#37474f]">Emu</h1>

			{#if form?.message}
				<p class="mb-4 text-center text-red-700">{@html form.message}</p>
			{/if}
			<form
				method="POST"
				use:enhance={() => {
					signup_start = true;
					return async ({ update }) => {
						await update();
						signup_start = false;
					};
				}}
			>
				<input type="text" name="rmsuser" id="fakeuser" style="display: none;" />
				<!-- Hidden dummy input -->

				<label
					class="input input-bordered poppins-regular mb-4 flex h-12 w-80 items-center gap-2 rounded-xl focus:outline-none"
				>
					<User size="24" />
					<input
						type="text"
						class="w-full grow focus:outline-none"
						placeholder="Your Name"
						minlength="3"
						maxlength="50"
						autocomplete="off"
						name="name"
						value={form?.name}
						required
					/>
				</label>

				<label
					class="input input-bordered poppins-regular mb-4 flex h-12 w-80 items-center gap-2 rounded-xl focus:outline-none"
				>
					<AtSign size="24" />
					<input
						type="email"
						class="w-full grow focus:outline-none"
						placeholder="Your Email"
						minlength="5"
						maxlength="128"
						autocomplete="off"
						name="email"
						value={form?.email}
						required
					/>
				</label>

				<label
					class="input input-bordered poppins-regular mb-4 flex h-12 w-80 items-center gap-2 rounded-xl focus:outline-none"
				>
					<Phone size="24" />
					<input
						type="phone"
						class="w-full grow focus:outline-none"
						placeholder="Your Phone"
						minlength="10"
						maxlength="10"
						autocomplete="off"
						name="phone"
						value={form?.phone}
						required
					/>
				</label>

				<label
					class="input input-bordered poppins-regular mb-4 flex h-12 w-80 items-center gap-2 rounded-xl focus:outline-none"
				>
					<RectangleEllipsis size="24" />
					<input
						type="password"
						class="w-full grow focus:outline-none"
						placeholder="Password"
						autocomplete="new-password"
						minlength="8"
						maxlength="16"
						name="password"
						required
					/>
				</label>

				<button
					type="submit"
					class="btn h-12 w-full rounded-2xl border-2"
					class:btn-disabled={signup_start}
					disabled={signup_start}
				>
					{#if signup_start}
						<span class="loading loading-spinner"></span> Signing Up...
					{:else}
						Sign Up
					{/if}
				</button>
			</form>

			<div class="help py-4">
				<p class="open-sans text-sm">
					Already have an account? <span
						class="cursor-pointer underline underline-offset-2 hover:font-medium"
						><a href="/">Log in</a></span
					>.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.input:focus {
		outline: none;
	}
</style>
