<template>
  <div class="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
    <AppNavigation />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div class="container mx-auto px-6 relative z-10 text-center">
            <div class="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-semibold mb-8">
              <Icon name="heroicons:puzzle-piece" class="w-4 h-4 mr-2" />
              Optional Modules
            </div>
            
            <h1 class="text-5xl md:text-6xl font-bold mb-6 text-white">
              Platform <span class="text-blue-400">Add-ons</span>
            </h1>
            
            <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                We are known for our intelligence layer, but we also offer robust utility modules to manage your operations. Use them only if you need them.
            </p>
        </div>
    </section>

    <!-- Add-ons Grid -->
    <section class="py-20">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <!-- Channel Connector -->
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
                    <div class="w-14 h-14 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-500">
                         <Icon name="heroicons:globe-alt" class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Multi-Channel Integration</h3>
                    <p class="text-gray-400 text-sm mb-4">
                        Unified dashboard for Shopify, WooCommerce, Amazon, and deeper integrations.
                    </p>
                    <NuxtLink to="/features/multi-channel-integration" class="text-blue-400 text-sm font-semibold hover:underline">Learn more</NuxtLink>
                </div>

                <!-- Logistics -->
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-orange-500/50 transition-colors">
                    <div class="w-14 h-14 bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                         <Icon name="heroicons:truck" class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Logistics Management</h3>
                    <p class="text-gray-400 text-sm mb-4">
                        Connect Bluedart, Delhivery, Shadowfax accounts. Auto-assign carriers based on pincode serviceability.
                    </p>
                    <NuxtLink to="/features/logistics-management" class="text-orange-400 text-sm font-semibold hover:underline">Learn more</NuxtLink>
                </div>

                 <!-- Order Processing -->
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
                    <div class="w-14 h-14 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-500">
                         <Icon name="heroicons:cog-6-tooth" class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Order Processing</h3>
                    <p class="text-gray-400 text-sm mb-4">
                        Automate manifest generation, label printing, and order status updates.
                    </p>
                    <NuxtLink to="/features/order-processing" class="text-purple-400 text-sm font-semibold hover:underline">Learn more</NuxtLink>
                </div>

                <!-- Sync -->
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 transition-colors">
                    <div class="w-14 h-14 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 text-cyan-500">
                         <Icon name="heroicons:arrow-path" class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Real-time Sync</h3>
                    <p class="text-gray-400 text-sm mb-4">
                         Inventory and price synchronization across all connected sales channels.
                    </p>
                    <NuxtLink to="/features/real-time-synchronization" class="text-cyan-400 text-sm font-semibold hover:underline">Learn more</NuxtLink>
                </div>

                 <!-- Track -->
                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition-colors">
                    <div class="w-14 h-14 bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 text-indigo-500">
                         <Icon name="heroicons:map-pin" class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Real-time Tracking</h3>
                    <p class="text-gray-400 text-sm mb-4">
                         Branded tracking pages and SMS/Email notifications for end customers.
                    </p>
                    <NuxtLink to="/features/real-time-tracking" class="text-indigo-400 text-sm font-semibold hover:underline">Learn more</NuxtLink>
                </div>

            </div>
        </div>
    </section>

    <!-- Core Value Proposition Section (Moved) -->
    <section class="py-32 relative overflow-hidden bg-black border-t border-slate-800">
      <!-- Animated Background -->
      <div class="absolute inset-0">
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-20">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-cyan-400 text-sm font-semibold mb-8 border border-cyan-400/30">
            <Icon name="heroicons:chart-bar-square" class="w-5 h-5 mr-3" />
            Operational Efficiency
          </div>
          
          <h2 class="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
            Measurable <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Results</span>
          </h2>
        </div>
        
        <!-- Value Cards Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Operational Efficiency -->
          <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div class="text-5xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text mb-2">70%</div>
              <div class="text-white/60 text-sm font-medium tracking-wider uppercase mb-6">Reduction</div>
              <h3 class="text-xl font-bold text-white mb-3">Operational Overhead</h3>
              <p class="text-white/70 text-sm">Dramatic reduction in manual processing time through intelligent automation.</p>
          </div>
          
          <!-- Data Consistency -->
          <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div class="text-5xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text mb-2">100%</div>
              <div class="text-white/60 text-sm font-medium tracking-wider uppercase mb-6">Synchronized</div>
              <h3 class="text-xl font-bold text-white mb-3">Data Consistency</h3>
              <p class="text-white/70 text-sm">Perfect synchronization across all channels and systems.</p>
          </div>
          
          <!-- Cost Optimization -->
          <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div class="text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">40%</div>
              <div class="text-white/60 text-sm font-medium tracking-wider uppercase mb-6">Cost Savings</div>
              <h3 class="text-xl font-bold text-white mb-3">Shipping Costs</h3>
              <p class="text-white/70 text-sm">Intelligent carrier selection and automated rate optimization.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrations Section (Moved) -->
    <section class="py-24 relative overflow-hidden bg-slate-900 border-t border-slate-800">
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
            Seamless <span class="text-blue-500">Integrations</span>
          </h2>
          <p class="text-gray-400">Connect with the world's leading e-commerce platforms and carriers.</p>
        </div>
        
       

        <!-- Screenshots -->
        <div class="grid md:grid-cols-2 gap-8 mt-16">
          <div class="bg-slate-800 rounded-2xl p-4 border border-slate-700">
             <img src="/connectorDashboard.png" alt="Connector Dashboard" class="w-full h-auto rounded-lg opacity-80 hover:opacity-100 transition-opacity" />
             <p class="text-center text-gray-500 text-sm mt-4">Connector Dashboard</p>
          </div>
          <div class="bg-slate-800 rounded-2xl p-4 border border-slate-700">
             <img src="/shipdashboard.png" alt="Shipping Dashboard" class="w-full h-auto rounded-lg opacity-80 hover:opacity-100 transition-opacity" />
             <p class="text-center text-gray-500 text-sm mt-4">Shipping Dashboard</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>
