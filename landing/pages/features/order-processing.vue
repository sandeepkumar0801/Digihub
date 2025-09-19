<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="py-32 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full text-orange-400 text-sm font-semibold mb-8 border border-orange-400/30">
            <Icon name="heroicons:shopping-bag" class="w-5 h-5 mr-3" />
            Order Processing
            <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-3" />
          </div>
          
          <h1 class="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Automated Order
            </span>
            <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
              Processing Workflow
            </span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Streamline your order fulfillment with <span class="text-orange-400 font-semibold">60% faster processing</span> 
            through intelligent automation and multi-carrier integration.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button class="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
              <div class="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center justify-center">
                <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 mr-3" />
                Start Processing
              </div>
            </button>
            
            <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-orange-400/50">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:chart-bar" class="w-6 h-6 mr-3 group-hover:text-orange-400 transition-colors" />
                View Analytics
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4-Step Workflow Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">4-Step Automated Workflow</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamlined order processing from capture to delivery with intelligent automation
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Step 1 -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto mt-4">
              <Icon name="heroicons:arrow-down-tray" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Order Capture</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-6">
              Automatic order import from all connected e-commerce platforms with real-time validation and duplicate detection.
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Multi-channel import</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Data validation</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Duplicate prevention</span>
              </div>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto mt-4">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Order Validation</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-6">
              Comprehensive validation including inventory check, address verification, and payment confirmation before processing.
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Inventory verification</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Address validation</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Payment verification</span>
              </div>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto mt-4">
              <Icon name="heroicons:truck" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Logistics Transfer</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-6">
              Seamless transfer to logistics system with automatic carrier selection and shipping label generation.
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Carrier optimization</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Label generation</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Pickup scheduling</span>
              </div>
            </div>
          </div>
          
          <!-- Step 4 -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto mt-4">
              <Icon name="heroicons:eye" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Tracking & Updates</h3>
            <p class="text-gray-600 text-sm leading-relaxed mb-6">
              Real-time tracking with automatic status updates pushed back to all connected e-commerce platforms.
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Real-time tracking</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Status synchronization</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Customer notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-32 bg-gradient-to-br from-gray-900 to-black">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold text-white mb-6">Advanced Processing Features</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive order management capabilities designed for high-volume e-commerce operations
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Feature Cards -->
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:bolt" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Bulk Operations</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Process thousands of orders simultaneously with CSV upload, bulk status updates, and batch export capabilities.
            </p>
            <div class="text-orange-400 font-semibold">1000+ Orders/Batch</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:shield-exclamation" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Exception Handling</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Intelligent handling of COD, RTO, NDR scenarios with automated resolution workflows and manual intervention queues.
            </p>
            <div class="text-yellow-400 font-semibold">95% Auto-Resolution</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:arrow-path" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Status Synchronization</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Real-time order status updates automatically synchronized across all connected e-commerce platforms.
            </p>
            <div class="text-green-400 font-semibold">Real-time Updates</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:document-duplicate" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Order Validation</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Comprehensive validation including duplicate detection, inventory verification, and business rule enforcement.
            </p>
            <div class="text-blue-400 font-semibold">99.9% Accuracy</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:chart-bar-square" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Analytics & Reporting</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Detailed order analytics with processing metrics, performance insights, and customizable reporting dashboards.
            </p>
            <div class="text-purple-400 font-semibold">Real-time Insights</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:scale" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Scalable Architecture</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Cloud-native architecture supporting unlimited order volumes with horizontal auto-scaling capabilities.
            </p>
            <div class="text-pink-400 font-semibold">Unlimited Scale</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Order Lifecycle Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Complete Order Lifecycle</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            End-to-end order management from creation to delivery completion
          </p>
        </div>
        
        <div class="max-w-4xl mx-auto">
          <div class="space-y-8">
            <!-- Lifecycle Steps -->
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-6">
                1
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Order Creation</h3>
                <p class="text-gray-600 leading-relaxed">
                  Customer places order on any connected e-commerce platform (Shopify, WooCommerce, Amazon, etc.)
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-6">
                2
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Automatic Import</h3>
                <p class="text-gray-600 leading-relaxed">
                  Order automatically imported into DigiHub system with real-time validation and data enrichment
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-6">
                3
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Processing & Validation</h3>
                <p class="text-gray-600 leading-relaxed">
                  Comprehensive validation including inventory check, address verification, and business rule application
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-6">
                4
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Logistics Handoff</h3>
                <p class="text-gray-600 leading-relaxed">
                  Seamless transfer to logistics system with carrier selection and shipping label generation
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-6">
                5
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Fulfillment & Delivery</h3>
                <p class="text-gray-600 leading-relaxed">
                  Real-time tracking with automatic status updates synchronized back to all e-commerce platforms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Processing Performance</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading performance metrics with enterprise-grade reliability
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-orange-600 mb-2">60%</div>
            <div class="text-gray-600 font-medium">Faster Processing</div>
            <div class="text-gray-500 text-sm mt-1">Compared to manual</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-green-600 mb-2">99.5%</div>
            <div class="text-gray-600 font-medium">Success Rate</div>
            <div class="text-gray-500 text-sm mt-1">Order completion</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">1000+</div>
            <div class="text-gray-600 font-medium">Orders/Hour</div>
            <div class="text-gray-500 text-sm mt-1">Processing capacity</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">95%</div>
            <div class="text-gray-600 font-medium">Auto-Resolution</div>
            <div class="text-gray-500 text-sm mt-1">Exception handling</div>
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
  title: 'Order Processing - DigiHub Automated Fulfillment System',
  meta: [
    {
      name: 'description',
      content: 'Streamline order fulfillment with 60% faster processing through intelligent automation. 4-step workflow with bulk operations, exception handling, and real-time tracking.'
    }
  ]
})
</script>
