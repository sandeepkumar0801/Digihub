<template>
  <div class="bg-black min-h-screen">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-black">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
             <div class="inline-flex items-center px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-8 backdrop-blur-md">
                <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-2" />
                <span>Centralized Command Center</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight">
                Unified <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Commerce OS</span>
            </h1>

            <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                One dashboard to rule them all. Sync inventory, orders, and pricing across <span class="text-blue-400 font-bold">8+ channels</span> in real-time.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                    Connect My Store
                </button>
                 <button class="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group">
                    <Icon name="heroicons:code-bracket" class="w-5 h-5 mr-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                    API Docs
                </button>
            </div>
        </div>
    </section>

    <!-- Supported Platforms Section -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">Ecosystem Agnostic</h2>
          <p class="text-gray-400">If you sell there, we connect there.</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Platform Cards -->
          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-green-500/50 transition-all group">
            <div class="w-14 h-14 bg-green-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <Icon name="logos:shopify" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Shopify</h3>
            <p class="text-gray-500 text-sm mb-4">Deep Admin API integration for full sync.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>
          
          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-purple-500/50 transition-all group">
            <div class="w-14 h-14 bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Icon name="logos:woocommerce" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2">WooCommerce</h3>
            <p class="text-gray-500 text-sm mb-4">Bi-directional REST API v3 sync.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>
          
          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-orange-500/50 transition-all group">
            <div class="w-14 h-14 bg-orange-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Icon name="logos:amazon" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Amazon</h3>
            <p class="text-gray-500 text-sm mb-4">SP-API for FBA & FBM orders.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>
          
           <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
            <div class="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Icon name="logos:ebay" class="w-10 h-10" />
            </div>
             <h3 class="text-lg font-bold text-white mb-2">eBay</h3>
            <p class="text-gray-500 text-sm mb-4">Trading API for global listings.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>
          
          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-orange-600/50 transition-all group">
            <div class="w-14 h-14 bg-orange-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600/20 transition-colors">
              <Icon name="logos:magento" class="w-8 h-8" />
            </div>
             <h3 class="text-lg font-bold text-white mb-2">Magento</h3>
            <p class="text-gray-500 text-sm mb-4">Enterprise REST API integration.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>

          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-pink-500/50 transition-all group">
            <div class="w-14 h-14 bg-pink-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
              <Icon name="logos:prestashop" class="w-8 h-8" />
            </div>
             <h3 class="text-lg font-bold text-white mb-2">PrestaShop</h3>
            <p class="text-gray-500 text-sm mb-4">Web Service automation.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>

          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group">
            <div class="w-14 h-14 bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <Icon name="heroicons:building-storefront" class="w-8 h-8 text-indigo-500" />
            </div>
             <h3 class="text-lg font-bold text-white mb-2">Mirakl</h3>
            <p class="text-gray-500 text-sm mb-4">Marketplace API v1.</p>
            <div class="text-green-500 text-xs font-bold uppercase tracking-wider">● Live Sync</div>
          </div>

          <div class="bg-black border border-slate-800 p-6 rounded-3xl hover:border-gray-500/50 transition-all group">
            <div class="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
              <Icon name="heroicons:plus" class="w-8 h-8 text-white" />
            </div>
             <h3 class="text-lg font-bold text-white mb-2">Custom API</h3>
            <p class="text-gray-500 text-sm mb-4">Build your own connector.</p>
            <div class="text-gray-500 text-xs font-bold uppercase tracking-wider">● Ready</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-24 bg-black relative">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-bold text-white mb-6">Sync Capabilities</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            The nervous system of your e-commerce tools.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature Cards -->
          <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <Icon name="heroicons:arrow-path" class="w-10 h-10 text-cyan-500 mb-6 animate-spin-slow" />
            <h3 class="text-2xl font-bold text-white mb-4">Bidirectional Sync</h3>
            <p class="text-gray-400 mb-6">
              Inventory updates on Shopify reflect on Amazon instantly, and vice versa. No more overselling.
            </p>
            <div class="text-cyan-400 font-bold">Latency: &lt;2s</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors">
            <Icon name="heroicons:clock" class="w-10 h-10 text-purple-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Real-time Webhooks</h3>
            <p class="text-gray-400 mb-6">
              We listen to store events (Order Created, Refunded) and trigger downstream actions instantly.
            </p>
            <div class="text-purple-400 font-bold">Event Driven</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-green-500/50 transition-colors">
            <Icon name="heroicons:shield-check" class="w-10 h-10 text-green-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">99.9% Accuracy</h3>
            <p class="text-gray-400 mb-6">
               Automated conflict resolution ensures your stock levels are always the single source of truth.
            </p>
            <div class="text-green-400 font-bold">Conflict Auto-Resolve</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/50 transition-colors">
            <Icon name="heroicons:cog-6-tooth" class="w-10 h-10 text-orange-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Workflow Engine</h3>
            <p class="text-gray-400 mb-6">
               Set rules: "If order value > 5000, split shipment" or "If SKU is fragile, upgrade shipping."
            </p>
            <div class="text-orange-400 font-bold">Logic Layer</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 transition-colors">
            <Icon name="heroicons:chart-bar" class="w-10 h-10 text-pink-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Unified Analytics</h3>
            <p class="text-gray-400 mb-6">
               See sales, returns, and margins from ALL channels in one consolidated P&L view.
            </p>
            <div class="text-pink-400 font-bold">Consolidated Dashboard</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-colors">
            <Icon name="heroicons:scale" class="w-10 h-10 text-indigo-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Infinite Scale</h3>
            <p class="text-gray-400 mb-6">
               Built on auto-scaling serverless infrastructure. Handle 10 or 100,000 orders/minute.
            </p>
            <div class="text-indigo-400 font-bold">Serverless Core</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Specifications -->
    <section class="py-24 bg-slate-900/20 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
          <div>
            <div class="text-4xl font-black text-blue-500 mb-2">8+</div>
            <div class="text-gray-400 text-sm">Platforms</div>
          </div>
          <div>
            <div class="text-4xl font-black text-purple-500 mb-2">150+</div>
            <div class="text-gray-400 text-sm">API Endpoints</div>
          </div>
          <div>
            <div class="text-4xl font-black text-green-500 mb-2">99.9%</div>
            <div class="text-gray-400 text-sm">Uptime</div>
          </div>
          <div>
            <div class="text-4xl font-black text-red-500 mb-2">&lt;200ms</div>
            <div class="text-gray-400 text-sm">API Latency</div>
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
