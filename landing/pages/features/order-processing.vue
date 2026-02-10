<template>
  <div class="bg-black min-h-screen">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-black">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
             <div class="inline-flex items-center px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold mb-8 backdrop-blur-md">
                <Icon name="heroicons:cpu-chip" class="w-5 h-5 mr-2" />
                <span>Zero-Touch Fulfillment</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight">
                Automated <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Order Logic</span>
            </h1>

            <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                Process 5,000+ orders in one click. Validate addresses, detect fraud, and assign couriers <span class="text-green-400 font-bold">automatically</span>.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]">
                    Automate My Orders
                </button>
                 <button class="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group">
                    <Icon name="heroicons:play" class="w-5 h-5 mr-2 text-green-500 group-hover:scale-110 transition-transform" />
                    Watch Demo
                </button>
            </div>
        </div>
    </section>

    <!-- Processing Pipeline Section -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">The Processing Pipeline</h2>
          <p class="text-gray-400">Order In -> Magic Happens -> Order Out.</p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-5 gap-4 relative">
             <!-- Connector lines (Desktop) -->
             <div class="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-green-900 via-green-500 to-green-900 -translate-y-1/2 opacity-30"></div>

             <div class="bg-black border border-slate-800 p-6 rounded-2xl relative z-10 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Icon name="heroicons:shopping-cart" class="w-6 h-6 text-green-500" />
                </div>
                <h3 class="text-white font-bold text-sm">Order Placed</h3>
                <p class="text-xs text-gray-500 mt-2">Shopify/Woo/Amazon</p>
             </div>

             <div class="bg-black border border-slate-800 p-6 rounded-2xl relative z-10 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Icon name="heroicons:shield-exclamation" class="w-6 h-6 text-green-500" />
                </div>
                <h3 class="text-white font-bold text-sm">Risk Check</h3>
                <p class="text-xs text-gray-500 mt-2">Fraud & Address Validation</p>
             </div>

             <div class="bg-black border border-slate-800 p-6 rounded-2xl relative z-10 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                     <Icon name="heroicons:building-storefront" class="w-6 h-6 text-green-500" />
                </div>
                <h3 class="text-white font-bold text-sm">Allocation</h3>
                <p class="text-xs text-gray-500 mt-2">Nearest Warehouse Assigned</p>
             </div>

             <div class="bg-black border border-slate-800 p-6 rounded-2xl relative z-10 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                     <Icon name="heroicons:document-text" class="w-6 h-6 text-green-500" />
                </div>
                <h3 class="text-white font-bold text-sm">Manifest</h3>
                <p class="text-xs text-gray-500 mt-2">Label & Invoice Gen</p>
             </div>

             <div class="bg-black border border-slate-800 p-6 rounded-2xl relative z-10 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Icon name="heroicons:truck" class="w-6 h-6 text-green-500" />
                </div>
                <h3 class="text-white font-bold text-sm">Dispatched</h3>
                <p class="text-xs text-gray-500 mt-2">Tracking ID Sent</p>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="py-24 bg-black relative">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-bold text-white mb-6">Automation Engines</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Tools that handle the boring stuff for you.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature Cards -->
          <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-colors">
            <Icon name="heroicons:bolt" class="w-10 h-10 text-emerald-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Bulk Actions</h3>
            <p class="text-gray-400 mb-6">
              Select 500 orders and click "Ship". We generate labels, invoices, and manifests in one go.
            </p>
            <div class="text-emerald-400 font-bold">50x Faster</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-lime-500/50 transition-colors">
            <Icon name="heroicons:printer" class="w-10 h-10 text-lime-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Smart Print</h3>
            <p class="text-gray-400 mb-6">
              Customizable aesthetic labels and invoices (A4/A6/Thermal). Brand every touchpoint.
            </p>
            <div class="text-lime-400 font-bold">Branded Experience</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-green-500/50 transition-colors">
            <Icon name="heroicons:funnel" class="w-10 h-10 text-green-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Order Filtering</h3>
            <p class="text-gray-400 mb-6">
               Segment orders by zone, payment mode (COD/Prepaid), weight, or SKU to prioritize fulfillment.
            </p>
            <div class="text-green-400 font-bold">Granular Control</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-colors">
            <Icon name="heroicons:clipboard-document-list" class="w-10 h-10 text-teal-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Pick Lists</h3>
            <p class="text-gray-400 mb-6">
               Generate optimized pick lists for warehouse staff. Group items by rack location.
            </p>
            <div class="text-teal-400 font-bold">Warehouse Efficiency</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <Icon name="heroicons:qr-code" class="w-10 h-10 text-cyan-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Scan & Pack</h3>
            <p class="text-gray-400 mb-6">
               Use barcode scanners to verify items before packing. Eliminate wrong shipments.
            </p>
            <div class="text-cyan-400 font-bold">0% Error Rate</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-colors">
            <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 text-emerald-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Exception Alerts</h3>
            <p class="text-gray-400 mb-6">
               Auto-hold high-risk orders (e.g., incomplete address, high COD value) for manual review.
            </p>
            <div class="text-emerald-400 font-bold">Loss Prevention</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Metrics -->
    <section class="py-24 bg-slate-900/20 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
          <div>
            <div class="text-4xl font-black text-emerald-500 mb-2">3x</div>
            <div class="text-gray-400 text-sm">Faster Fulfillment</div>
          </div>
          <div>
            <div class="text-4xl font-black text-green-500 mb-2">99.9%</div>
            <div class="text-gray-400 text-sm">Accuracy</div>
          </div>
          <div>
            <div class="text-4xl font-black text-lime-500 mb-2">0</div>
            <div class="text-gray-400 text-sm">Manual Data Entry</div>
          </div>
          <div>
            <div class="text-4xl font-black text-teal-500 mb-2">100%</div>
            <div class="text-gray-400 text-sm">Traceability</div>
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
  title: 'Automated Order Logic - DigiHub Zero-Touch Fulfillment',
  meta: [
    {
      name: 'description',
      content: 'Process 5,000+ orders in one click with automated validation, fraud detection, and carrier assignment. Eliminate manual errors and speed up fulfillment by 50x.'
    }
  ]
})
</script>
