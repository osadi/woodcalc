<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme, setTheme } from '$lib/stores/theme';
	import { groups } from '$lib/stores/groups';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import SidebarGroup from '$lib/components/SidebarGroup.svelte';
	import GroupCreator from '$lib/components/GroupCreator.svelte';
	import GroupList from '$lib/components/GroupList.svelte';
	import BomList from '$lib/components/BomList.svelte';
	import StockSettings from '$lib/components/StockSettings.svelte';
	import PieceInput from '$lib/components/PieceInput.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	
	let { children } = $props();
	let sidebarOpen = $state(false);
	
	// Toggle mobile sidebar
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
	
	// Initialize theme
	onMount(() => {
		setTheme($theme);
	});
</script>

<div class="app-container min-h-screen bg-base-100 flex flex-col">
	<!-- Top navbar - visible only on mobile -->
	<header class="navbar bg-base-300 lg:hidden">
		<div class="navbar-start">
			<button 
				class="btn btn-ghost btn-circle"
				aria-label="Open menu"
				onclick={toggleSidebar}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</div>
		<div class="navbar-center">
			<a href="/" class="btn btn-ghost normal-case text-xl">WoodCalc</a>
		</div>
		<div class="navbar-end">
			<ShareButton />
			<div class="w-24 lg:hidden ml-2">
				<ThemeSwitcher />
			</div>
		</div>
	</header>

	<!-- Main content area with sidebar and content -->
	<div class="flex flex-1">
		<!-- Sidebar - fixed on the left side with independent scrolling -->
		<aside class={`
			bg-base-200 w-96 flex-shrink-0 border-r border-base-300
			${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
			transition-transform duration-300
			fixed inset-y-0 left-0 z-40 
			overflow-y-auto max-h-screen pt-16
			lg:pt-0 lg:translate-x-0
		`}>
			<!-- Sidebar header - fixed at the top -->
			<div class="sticky top-0 p-4 border-b border-base-300 flex items-center justify-between bg-base-200 z-10">
				<h1 class="text-xl font-bold">WoodCalc</h1>
				<div class="flex items-center gap-2">
					<div class="hidden lg:block">
						<ShareButton />
					</div>
					<div class="lg:hidden">
						<button
							class="btn btn-ghost btn-circle"
							aria-label="Close menu"
							onclick={toggleSidebar}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
			
			<!-- Sidebar content -->
			<div class="w-full">
					<!-- Pieces Input section -->
				<SidebarGroup title="Add Pieces" collapsible={true} initiallyOpen={true}>
					<div class="px-2 pt-2 w-full">
						<PieceInput />
					</div>
				</SidebarGroup>
				
				<!-- Groups section with count in the title -->
				<SidebarGroup 
					title="Groups {$groups.length > 0 ? `(${$groups.length})` : ''}" 
					collapsible={true} 
					initiallyOpen={true}
				>
					<div class="px-2 pt-2 w-full space-y-4">
						<GroupCreator />
						<GroupList />
					</div>
				</SidebarGroup>
				
					<!-- Bill of Materials section -->
				<SidebarGroup title="Bill of Materials" collapsible={true} initiallyOpen={true}>
					<div class="px-2 pt-2 w-full">
						<BomList />
					</div>
				</SidebarGroup>
				
				<!-- Settings section - moved to the bottom -->
				<SidebarGroup title="Settings" collapsible={true} initiallyOpen={false}>
					<div class="px-2 pt-2 w-full">
						<!-- Theme selection -->
						<label class="form-control w-full mb-4">
							<div class="label px-0 py-1">
								<span class="label-text">Theme</span>
							</div>
							<ThemeSwitcher />
						</label>
						
						<!-- Stock settings -->
						<div class="mb-4">
							<div class="label px-0 py-1">
								<span class="label-text">Stock Settings</span>
							</div>
							<StockSettings />
						</div>
						
							<!-- Remove the Stock Types section -->
					</div>
				</SidebarGroup>
				
					<!-- Footer padding -->
				<div class="h-24"></div>
			</div>
		</aside>

		<!-- Main content - with left padding to accommodate the fixed sidebar on large screens -->
		<main class="flex-1 overflow-y-auto w-full lg:pl-96">
			<!-- Max width container for large screens -->
			<div class="mx-auto w-full max-w-7xl h-full flex flex-col">
				<!-- Content area with prose styling -->
				<div class="flex-1 p-6 prose prose-sm md:prose-base max-w-none">
					{@render children()}
				</div>
				
				<!-- Footer -->
				<footer class="footer p-4 bg-base-200 text-base-content mt-auto">
					<div>
						<p>WoodCalc © {new Date().getFullYear()} - All rights reserved</p>
					</div>
				</footer>
			</div>
		</main>
	</div>
</div>

<!-- Overlay for mobile menu backdrop -->
{#if sidebarOpen}
	<button 
		type="button"
		class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
		onclick={toggleSidebar}
		aria-label="Close menu"
	></button>
{/if}
