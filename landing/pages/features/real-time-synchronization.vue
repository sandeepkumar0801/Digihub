<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="py-32 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full text-green-400 text-sm font-semibold mb-8 border border-green-400/30">
            <Icon name="heroicons:bolt" class="w-5 h-5 mr-3" />
            Real-time Synchronization
            <Icon name="heroicons:arrow-path" class="w-5 h-5 ml-3 animate-spin" />
          </div>
          
          <h1 class="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Lightning-Fast
            </span>
            <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
              Data Synchronization
            </span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Achieve <span class="text-green-400 font-semibold">99.9% data consistency</span> across all channels with 
            sub-second synchronization and intelligent conflict resolution.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button class="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center justify-center">
                <Icon name="heroicons:play" class="w-6 h-6 mr-3" />
                See It in Action
              </div>
            </button>
            
            <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-green-400/50">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-6 h-6 mr-3 group-hover:text-green-400 transition-colors" />
                Technical Details
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Synchronization Types Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Synchronization Architecture</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Multi-layered synchronization approach ensuring data consistency across all platforms
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12">
          <!-- Event-Driven Sync -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:bolt" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Event-Driven Synchronization</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Real-time event notifications from e-commerce platforms trigger immediate data synchronization with reliable event processing and retry mechanisms.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                <span class="text-gray-700">Webhook Integration</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                <span class="text-gray-700">Event Queue Processing</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                <span class="text-gray-700">Automated Conflict Resolution</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                <span class="text-gray-700">Complete Audit Trail</span>
              </div>
            </div>
          </div>
          
          <!-- Scheduled Sync -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Scheduled Synchronization</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Automated cron job management ensures continuous data consistency with incremental sync and intelligent batch processing for optimal performance.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-500 mr-3" />
                <span class="text-gray-700">Cron Job Management</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-500 mr-3" />
                <span class="text-gray-700">Incremental Data Processing</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-500 mr-3" />
                <span class="text-gray-700">Batch Processing Optimization</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-500 mr-3" />
                <span class="text-gray-700">Error Recovery Mechanisms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Data Flow Architecture -->
    <section class="py-32 bg-gradient-to-br from-gray-900 to-black">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold text-white mb-6">Data Synchronization Flow</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive data pipeline ensuring seamless information flow across all platforms
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Flow Steps -->
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:arrow-down-tray" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Data Ingestion</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Collect data from multiple e-commerce platforms through APIs, webhooks, and scheduled polling
            </p>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Data Validation</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Validate, clean, and transform incoming data to ensure consistency and accuracy
            </p>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Processing</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Apply business rules, resolve conflicts, and normalize data into unified format
            </p>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:arrow-up-tray" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Distribution</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Distribute synchronized data to all connected platforms with real-time updates
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
