<script lang="ts">
	import type { PageProps } from './$types';

	import { AtSign, RectangleEllipsis } from '@lucide/svelte';
	import Illustration from '../lib/assets/right.svelte';
	import { enhance } from '$app/forms';
	let { data, form }: PageProps = $props();

	let login_start = $state(false);
</script>

<section class="flex h-screen w-screen items-center justify-center">
	<div class="left flex h-full w-full items-center justify-center">
		<div class="flex flex-col items-center">
			<p class="poppins-regular">Log in to</p>
			<h1 class="raleway pb-6 text-7xl font-extrabold text-[#37474f]">Emu</h1>

			{#if form?.message}
				<p class="mb-4 text-center text-red-700">{@html form.message}</p>
			{/if}
			<form
				method="POST"
				use:enhance={() => {
					login_start = true;
					return async ({ update }) => {
						await update();
						login_start = false;
					};
				}}
			>
				<input type="text" name="rmsuser" id="fakeuser" style="display: none;" />
				<!-- Hidden dummy input -->

				<label
					class="input input-bordered poppins-regular mb-4 flex h-12 w-80 items-center gap-2 rounded-xl focus:outline-none"
				>
					<AtSign size="24" />
					<input
						type="email"
						class="w-full grow focus:outline-none"
						placeholder="Your Email"
						autocomplete="off"
						name="email"
						minlength="5"
						maxlength="128"
						value={form?.email || 'kousicreddy39@gmail.com'}
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
						name="password"
						minlength="8"
						maxlength="16"
						value="kkkkkkkkkk"
						required
					/>
				</label>

				<button
					type="submit"
					class="btn h-12 w-full rounded-2xl border-2"
					class:btn-disabled={login_start}
					disabled={login_start}
				>
					{#if login_start}
						<span class="loading loading-spinner"></span> Logging in...
					{:else}
						Log in
					{/if}
				</button>
			</form>
			<!-- YELLOW : #ffc727 -->
			<!-- BLUE: #37474f -->
			<div class="divider">or</div>

			<button type="button" class="btn h-10 w-full rounded-2xl border-2 bg-[#37474f] text-white">
				Login using VTOP
			</button>

			<div class="help py-4">
				<p class="open-sans text-sm">
					Don't have an account? <span
						class="cursor-pointer underline underline-offset-2 hover:font-medium"
						><a href="/register">Sign Up</a></span
					>.
				</p>
			</div>
		</div>
	</div>

	<div class="right flex h-full w-full items-center justify-center">
		<Illustration />
	</div>
</section>

<style>
	.input:focus {
		outline: none;
	}
</style>
