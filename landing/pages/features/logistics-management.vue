<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-32 right-16 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full text-purple-400 text-sm font-semibold mb-8 border border-purple-400/30">
            <Icon name="heroicons:truck" class="w-5 h-5 mr-3" />
            Logistics Management
            <Icon name="heroicons:map" class="w-5 h-5 ml-3" />
          </div>
          
          <h1 class="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Multi-Carrier
            </span>
            <span class="block text-4xl md:text-5xl font-light mt-4 text-gray-300">
              Logistics Orchestration
            </span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Optimize shipping costs by <span class="text-purple-400 font-semibold">40%</span> with intelligent 
            carrier selection across 4+ integrated shipping providers.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button class="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center justify-center">
                <Icon name="heroicons:truck" class="w-6 h-6 mr-3" />
                Optimize Shipping
              </div>
            </button>
            
            <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-purple-400/50">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:calculator" class="w-6 h-6 mr-3 group-hover:text-purple-400 transition-colors" />
                Rate Calculator
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrated Carriers Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Integrated Shipping Carriers</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive carrier network providing optimal shipping solutions and competitive rates
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Carrier Cards -->
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:building-office" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">DigiHub</h3>
            <p class="text-gray-600 text-sm mb-4">In-house logistics system with custom features</p>
            <div class="text-green-600 font-bold text-lg mb-2">₹60 Base Rate</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Custom solutions</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                <span class="text-gray-700">Competitive pricing</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:rocket-launch" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Bluedart</h3>
            <p class="text-gray-600 text-sm mb-4">Express delivery with air and surface options</p>
            <div class="text-blue-600 font-bold text-lg mb-2">Express Service</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-blue-500 mr-2" />
                <span class="text-gray-700">Next-day delivery</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-blue-500 mr-2" />
                <span class="text-gray-700">Premium service</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:truck" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">DTDC</h3>
            <p class="text-gray-600 text-sm mb-4">Comprehensive logistics with B2B and B2C services</p>
            <div class="text-red-600 font-bold text-lg mb-2">Surface Transport</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-red-500 mr-2" />
                <span class="text-gray-700">Cost-effective</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-red-500 mr-2" />
                <span class="text-gray-700">Wide coverage</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Icon name="heroicons:map" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Delhivery</h3>
            <p class="text-gray-600 text-sm mb-4">Pan-India network with technology integration</p>
            <div class="text-purple-600 font-bold text-lg mb-2">Pan-India Network</div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-purple-500 mr-2" />
                <span class="text-gray-700">Extensive network</span>
              </div>
              <div class="flex items-center justify-center">
                <Icon name="heroicons:check" class="w-4 h-4 text-purple-500 mr-2" />
                <span class="text-gray-700">Tech integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Logistics Features Section -->
    <section class="py-32 bg-gradient-to-br from-gray-900 to-black">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold text-white mb-6">Advanced Logistics Capabilities</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive logistics management with intelligent automation and optimization
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Feature Cards -->
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:scale" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Rate Optimization</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Real-time rate comparison across all carriers with automatic selection of the most cost-effective shipping option.
            </p>
            <div class="text-purple-400 font-semibold">40% Cost Reduction</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:map-pin" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Serviceability Check</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Verify delivery coverage and service availability for any destination across all integrated carriers.
            </p>
            <div class="text-blue-400 font-semibold">100% Coverage Verification</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:document-text" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Label Generation</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Automated generation of carrier-specific shipping labels with barcode integration and pickup scheduling.
            </p>
            <div class="text-green-400 font-semibold">Instant Label Creation</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:clock" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Pickup Scheduling</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Coordinate pickup times with carriers and manage warehouse operations for optimal fulfillment efficiency.
            </p>
            <div class="text-orange-400 font-semibold">Automated Scheduling</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:chart-bar" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Performance Analytics</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Track carrier performance metrics, delivery success rates, and cost analytics for informed decision making.
            </p>
            <div class="text-pink-400 font-semibold">Real-time Metrics</div>
          </div>
          
          <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Exception Management</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Comprehensive handling of COD, RTO, NDR scenarios with automated resolution workflows and escalation procedures.
            </p>
            <div class="text-indigo-400 font-semibold">95% Auto-Resolution</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Workflow Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Intelligent Shipping Workflow</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamlined 4-step shipping process with validation and optimization at every stage
          </p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Workflow Steps -->
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                1
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Customer Details</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Capture and validate customer information, shipping address, and contact details with address standardization.
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                2
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Shipment Details</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Configure service selection, payment mode, insurance options, and delivery preferences for optimal shipping.
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Package Details</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Capture accurate package measurements, product information, declared value, and packaging requirements.
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                4
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Pickup Address</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Select pickup location, configure addresses, schedule pickup times, and add special handling instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cost Management Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Cost Management & Optimization</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced cost management features for maximum shipping efficiency and profitability
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Cost Features -->
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Rate Management</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Maintain current shipping rates with automatic updates and dynamic pricing adjustments.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:receipt-percent" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Discount Management</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Apply volume discounts, promotional rates, and customer-specific pricing automatically.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:fire" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Fuel Surcharge</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Handle dynamic fuel surcharge adjustments with real-time market-based calculations.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:calculator" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Tax Calculation</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Calculate applicable taxes, duties, and fees automatically based on destination and service type.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:chart-pie" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Profit Analysis</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Track profitability by shipment, client, and carrier with detailed financial analytics.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Icon name="heroicons:wallet" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Wallet Management</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Client wallet debiting for shipping charges with automated payment tracking and reconciliation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Logistics Performance</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading logistics performance with measurable business impact
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">40%</div>
            <div class="text-gray-600 font-medium">Cost Reduction</div>
            <div class="text-gray-500 text-sm mt-1">Through optimization</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-green-600 mb-2">99.5%</div>
            <div class="text-gray-600 font-medium">Delivery Success</div>
            <div class="text-gray-500 text-sm mt-1">Multi-carrier reliability</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-blue-600 mb-2">4+</div>
            <div class="text-gray-600 font-medium">Carrier Partners</div>
            <div class="text-gray-500 text-sm mt-1">Integrated providers</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-red-600 mb-2">95%</div>
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
  title: 'Logistics Management - DigiHub Multi-Carrier Shipping Platform',
  meta: [
    {
      name: 'description',
      content: 'Optimize shipping costs by 40% with intelligent multi-carrier logistics management. Integrated with 4+ carriers including DigiHub, Bluedart, DTDC, and Delhivery for optimal shipping solutions.'
    }
  ]
})
</script>
