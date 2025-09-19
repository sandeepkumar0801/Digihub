<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full text-blue-400 text-sm font-semibold mb-8 border border-blue-400/30">
            <Icon name="heroicons:link" class="w-5 h-5 mr-3" />
            Multi-Channel Integration
            <Icon name="heroicons:sparkles" class="w-5 h-5 ml-3" />
          </div>
          
          <h1 class="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Unified E-commerce
            </span>
            <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
              Channel Management
            </span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Connect and manage <span class="text-blue-400 font-semibold">8+ e-commerce platforms</span> from a single, 
            powerful dashboard with real-time bidirectional synchronization.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button class="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center justify-center">
                <Icon name="heroicons:rocket-launch" class="w-6 h-6 mr-3" />
                Start Integration
              </div>
            </button>
            
            <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-blue-400/50">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-6 h-6 mr-3 group-hover:text-blue-400 transition-colors" />
                View Documentation
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Supported Platforms Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Supported E-commerce Platforms</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            DigiHub seamlessly integrates with all major e-commerce platforms and marketplaces
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Platform Cards -->
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:shopify" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Shopify</h3>
            <p class="text-gray-600 text-sm mb-4">Complete integration with Admin API 2023-04 for products, orders, and inventory</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:woocommerce" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">WooCommerce</h3>
            <p class="text-gray-600 text-sm mb-4">REST API v3 integration with automated cron synchronization</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:amazon" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Amazon</h3>
            <p class="text-gray-600 text-sm mb-4">SP-API integration with FBA/FBM support and marketplace analytics</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:ebay" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">eBay</h3>
            <p class="text-gray-600 text-sm mb-4">Trading API integration for listings, orders, and inventory management</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:magento" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Magento</h3>
            <p class="text-gray-600 text-sm mb-4">REST API v1 integration with enterprise e-commerce features</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="logos:prestashop" class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">PrestaShop</h3>
            <p class="text-gray-600 text-sm mb-4">Web Service integration for European e-commerce operations</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:building-storefront" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Mirakl</h3>
            <p class="text-gray-600 text-sm mb-4">API v1 integration for marketplace platform management</p>
            <div class="text-green-600 text-sm font-semibold">✅ Fully Integrated</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:plus-circle" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Custom APIs</h3>
            <p class="text-gray-600 text-sm mb-4">Flexible integration architecture for custom e-commerce solutions</p>
            <div class="text-blue-600 text-sm font-semibold">🚀 Available</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-32 bg-gradient-to-br from-gray-900 to-black">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold text-white mb-6">Integration Capabilities</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive feature set designed for enterprise-level multi-channel operations
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Feature Cards -->
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Bidirectional Sync</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Real-time bidirectional synchronization of products, orders, inventory, pricing, and customer data across all channels.
            </p>
            <div class="text-cyan-400 font-semibold">150+ API Endpoints</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Real-time Updates</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Sub-second data propagation with webhook integration and event-driven synchronization for instant updates.
            </p>
            <div class="text-purple-400 font-semibold">&lt; 200ms Response Time</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Data Consistency</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              99.9% data consistency across all platforms with automated conflict resolution and comprehensive audit trails.
            </p>
            <div class="text-green-400 font-semibold">99.9% Accuracy</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Automated Workflows</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Intelligent automation with cron job management, error recovery, and batch processing for large datasets.
            </p>
            <div class="text-orange-400 font-semibold">70% Time Reduction</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:chart-bar" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Analytics & Insights</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Comprehensive analytics with performance metrics, sales insights, and channel-specific reporting dashboards.
            </p>
            <div class="text-pink-400 font-semibold">Multi-Channel Reports</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:scale" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Unlimited Scale</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Cloud-native architecture supporting unlimited orders and channels with horizontal auto-scaling capabilities.
            </p>
            <div class="text-indigo-400 font-semibold">Unlimited Capacity</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Specifications -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade architecture with robust performance and reliability metrics
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">8+</div>
            <div class="text-gray-600 font-medium">Integrated Platforms</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">150+</div>
            <div class="text-gray-600 font-medium">API Endpoints</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-green-600 mb-2">99.9%</div>
            <div class="text-gray-600 font-medium">Data Accuracy</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-red-600 mb-2">&lt;200ms</div>
            <div class="text-gray-600 font-medium">API Response Time</div>
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
  title: 'Multi-Channel Integration - DigiHub E-commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Connect and manage 8+ e-commerce platforms from a single dashboard. Real-time bidirectional synchronization with 99.9% data accuracy across Shopify, WooCommerce, Amazon, eBay, and more.'
    }
  ]
})
</script>
