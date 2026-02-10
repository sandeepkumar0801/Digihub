<template>
  <div class="bg-black min-h-screen">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-black">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
             <div class="inline-flex items-center px-4 py-2 bg-orange-900/30 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold mb-8 backdrop-blur-md">
                <Icon name="heroicons:bolt" class="w-5 h-5 mr-2" />
                <span>Sub-Second Latency</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight">
                Instant <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Data Pulse</span>
            </h1>

            <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                Stop overselling. Our Engine syncs inventory, price, and order status across all channels in <span class="text-orange-400 font-bold">&lt; 500ms</span>.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]">
                    Sync Now
                </button>
                 <button class="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group">
                    <Icon name="heroicons:server" class="w-5 h-5 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />
                    System Status
                </button>
            </div>
        </div>
    </section>

    <!-- Visual Sync Section -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800 relative overflow-hidden">
      <!-- Background Pulse Animation -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div class="w-[800px] h-[800px] bg-orange-500/5 rounded-full animate-pulse-slow"></div>
         <div class="absolute w-[600px] h-[600px] bg-red-500/5 rounded-full animate-pulse-slow" style="animation-delay: 1s;"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">The Nervous System</h2>
          <p class="text-gray-400">Everything stays in perfect harmony.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 items-center">
             <!-- Source -->
             <div class="bg-black border border-slate-800 p-8 rounded-3xl text-center">
                 <Icon name="heroicons:building-storefront" class="w-16 h-16 text-gray-500 mx-auto mb-4" />
                 <h3 class="text-xl font-bold text-white">Warehouse</h3>
                 <p class="text-gray-500 text-sm mt-2">Stock Level: <span class="text-orange-500 font-bold">100</span></p>
             </div>

             <!-- Connection -->
             <div class="hidden md:flex flex-col items-center justify-center">
                 <div class="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent relative overflow-hidden">
                     <div class="absolute top-0 left-0 w-full h-full bg-white opacity-50 animate-shimmer"></div>
                 </div>
                 <div class="mt-4 px-4 py-1 bg-orange-900/50 rounded-full text-orange-400 text-xs font-bold border border-orange-500/50">
                     SYNCING
                 </div>
                 <div class="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mt-4 relative overflow-hidden">
                      <div class="absolute top-0 left-0 w-full h-full bg-white opacity-50 animate-shimmer-reverse"></div>
                 </div>
             </div>

             <!-- Destination -->
             <div class="grid grid-rows-3 gap-4">
                 <div class="bg-black border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                     <div class="flex items-center">
                         <Icon name="logos:shopify" class="w-6 h-6 mr-3" />
                         <span class="text-white text-sm">Shopify</span>
                     </div>
                     <span class="text-orange-500 font-bold text-sm">100</span>
                 </div>
                 <div class="bg-black border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                     <div class="flex items-center">
                         <Icon name="logos:amazon" class="w-6 h-6 mr-3" />
                         <span class="text-white text-sm">Amazon</span>
                     </div>
                     <span class="text-orange-500 font-bold text-sm">100</span>
                 </div>
                 <div class="bg-black border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                     <div class="flex items-center">
                         <Icon name="logos:woocommerce" class="w-6 h-6 mr-3" />
                         <span class="text-white text-sm">WooCommerce</span>
                     </div>
                     <span class="text-orange-500 font-bold text-sm">100</span>
                 </div>
             </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
 <section class="py-24 bg-black relative">
  <div class="container mx-auto px-6">
    <div class="text-center mb-20">
      <h2 class="text-4xl font-bold text-white mb-6">Data Pipeline</h2>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Streamline your data processing with real-time validation and distribution.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Card 1: Data Validation -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Icon name="heroicons:check-badge" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-xl font-bold text-white mb-4">Data Validation</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Validate, clean, and transform incoming data to ensure consistency and accuracy.
        </p>
      </div>

      <!-- Card 2: Processing -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-xl font-bold text-white mb-4">Processing</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Apply business rules, resolve conflicts, and normalize data into a unified format.
        </p>
      </div>

      <!-- Card 3: Distribution -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Icon name="heroicons:arrow-up-tray" class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-xl font-bold text-white mb-4">Distribution</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Distribute synchronized data to all connected platforms with real-time updates.
        </p>
      </div>
    </div>
  </div>
</section>


    <!-- Synchronization Schedule -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Synchronization Schedule</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Optimized cron job scheduling ensures continuous data consistency across all platforms
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Schedule Cards -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:cube" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Product Sync</h3>
            <p class="text-gray-600 text-sm mb-4">Synchronize product data, pricing, and descriptions</p>
            <div class="text-blue-600 font-bold text-lg">Every 12 Minutes</div>
            <div class="text-gray-500 text-xs mt-1">*/12 * * * *</div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Order Sync</h3>
            <p class="text-gray-600 text-sm mb-4">Process new orders and status updates</p>
            <div class="text-green-600 font-bold text-lg">Every 16 Minutes</div>
            <div class="text-gray-500 text-xs mt-1">*/16 * * * *</div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:archive-box" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Inventory Sync</h3>
            <p class="text-gray-600 text-sm mb-4">Update stock levels and availability</p>
            <div class="text-purple-600 font-bold text-lg">Every 14 Minutes</div>
            <div class="text-gray-500 text-xs mt-1">*/14 * * * *</div>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:user-group" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Customer Sync</h3>
            <p class="text-gray-600 text-sm mb-4">Synchronize customer data and profiles</p>
            <div class="text-orange-600 font-bold text-lg">Every 30 Minutes</div>
            <div class="text-gray-500 text-xs mt-1">*/30 * * * *</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading performance with enterprise-grade reliability and accuracy
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-green-600 mb-2">99.9%</div>
            <div class="text-gray-600 font-medium">Data Consistency</div>
            <div class="text-gray-500 text-sm mt-1">Across all platforms</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">&lt;1s</div>
            <div class="text-gray-600 font-medium">Sync Speed</div>
            <div class="text-gray-500 text-sm mt-1">Sub-second propagation</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">95%</div>
            <div class="text-gray-600 font-medium">Error Reduction</div>
            <div class="text-gray-500 text-sm mt-1">In data inconsistencies</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-red-600 mb-2">24/7</div>
            <div class="text-gray-600 font-medium">Monitoring</div>
            <div class="text-gray-500 text-sm mt-1">Continuous oversight</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
// SEO Meta
useHead({
  title: 'Real-time Synchronization - DigiHub Data Sync Platform',
  meta: [
    {
      name: 'description',
      content: 'Achieve 99.9% data consistency with lightning-fast real-time synchronization. Event-driven and scheduled sync with sub-second data propagation across all e-commerce platforms.'
    }
  ]
})
</script>
