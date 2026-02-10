<template>
  <div class="bg-black min-h-screen">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-black">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#9333ea 1px, transparent 1px), linear-gradient(90deg, #9333ea 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
             <div class="inline-flex items-center px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-400 text-sm font-semibold mb-8 backdrop-blur-md">
                <Icon name="heroicons:truck" class="w-5 h-5 mr-2" />
                <span>Smart Logistics Engine</span>
            </div>

            <h1 class="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight">
                Multi-Carrier <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Orchestration</span>
            </h1>

            <p class="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                Slash shipping costs by <span class="text-purple-400 font-bold">40%</span> with AI-driven carrier selection.
                One API, 4+ integrated carriers, infinite scalability.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <button class="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)]">
                    Optimize My Shipping
                </button>
                 <button class="px-8 py-4 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center group">
                    <Icon name="heroicons:calculator" class="w-5 h-5 mr-2 text-purple-500 group-hover:scale-110 transition-transform" />
                    Check Rates
                </button>
            </div>
        </div>
    </section>

    <!-- Integrated Carriers Section -->
    <section class="py-24 bg-slate-900/30 border-t border-slate-800">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">Integrated Powerhouse</h2>
          <p class="text-gray-400">Pre-negotiated rates with the industry's best.</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Carrier Cards -->
          <div class="group bg-black border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-all duration-300">
            <div class="w-16 h-16 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <Icon name="heroicons:building-office" class="w-8 h-8 text-green-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">DigiHub Fleet</h3>
            <p class="text-gray-400 text-sm mb-4">In-house logistics for hyper-local control.</p>
            <div class="text-green-500 font-bold text-lg mb-2">₹60 Base Rate</div>
          </div>
          
          <div class="group bg-black border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300">
            <div class="w-16 h-16 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Icon name="heroicons:rocket-launch" class="w-8 h-8 text-blue-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Bluedart</h3>
            <p class="text-gray-400 text-sm mb-4">Premium air express for next-day needs.</p>
            <div class="text-blue-500 font-bold text-lg mb-2">Express Priority</div>
          </div>
          
          <div class="group bg-black border border-slate-800 p-8 rounded-3xl hover:border-red-500/50 transition-all duration-300">
            <div class="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
               <Icon name="heroicons:truck" class="w-8 h-8 text-red-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">DTDC</h3>
            <p class="text-gray-400 text-sm mb-4">Extensive surface network for cost efficiency.</p>
            <div class="text-red-500 font-bold text-lg mb-2">National Reach</div>
          </div>
          
          <div class="group bg-black border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-300">
            <div class="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
               <Icon name="heroicons:map" class="w-8 h-8 text-purple-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Delhivery</h3>
            <p class="text-gray-400 text-sm mb-4">Tech-first logistics for deep tier coverage.</p>
            <div class="text-purple-500 font-bold text-lg mb-2">Deep Reach</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Logistics Features Section -->
    <section class="py-24 bg-black relative">
      <div class="container mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Logistics Intelligence</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Not just shipping. Smart shipping.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature Cards -->
          <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors">
            <Icon name="heroicons:scale" class="w-10 h-10 text-purple-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Rate Optimizer</h3>
            <p class="text-gray-400 mb-6">
              Our engine compares real-time rates across all carriers and auto-selects the cheapest option for every single PIN code.
            </p>
            <div class="text-purple-400 font-bold">40% Savings</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors">
            <Icon name="heroicons:map-pin" class="w-10 h-10 text-blue-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Serviceability Check</h3>
            <p class="text-gray-400 mb-6">
               Instantly check if a PIN code is serviceable by COD or Prepaid before you even print the label.
            </p>
            <div class="text-blue-400 font-bold">Zero Blind Shipping</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-green-500/50 transition-colors">
            <Icon name="heroicons:document-text" class="w-10 h-10 text-green-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">1-Click Labels</h3>
            <p class="text-gray-400 mb-6">
               Bulk generate shipping labels in seconds. API automatically fetches the AWB and tracking details.
            </p>
            <div class="text-green-400 font-bold">Automated Manifest</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/50 transition-colors">
            <Icon name="heroicons:clock" class="w-10 h-10 text-orange-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Pickup Orchestration</h3>
            <p class="text-gray-400 mb-6">
               Coordinate pickups across multiple warehouses. We auto-assign the nearest carrier facility.
            </p>
            <div class="text-orange-400 font-bold">Routing Logic</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 transition-colors">
            <Icon name="heroicons:chart-bar" class="w-10 h-10 text-pink-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">Live Analytics</h3>
            <p class="text-gray-400 mb-6">
               Track delivery performance by carrier, region, and zone. Know exactly who delivered on time.
            </p>
            <div class="text-pink-400 font-bold">Performance Heatmap</div>
          </div>
          
           <div class="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-colors">
            <Icon name="heroicons:shield-check" class="w-10 h-10 text-indigo-500 mb-6" />
            <h3 class="text-2xl font-bold text-white mb-4">NDR Management</h3>
            <p class="text-gray-400 mb-6">
               Automated workflows to handle "Customer Not Available" marks. We don't let packages return easily.
            </p>
            <div class="text-indigo-400 font-bold">Retention Engine</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Workflow Section -->
    <section class="py-24 bg-slate-900/20 border-t border-slate-900">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">The Workflow</h2>
          <p class="text-gray-400">From order to pickup in 4 steps.</p>
        </div>
        
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-4 gap-8">
            <!-- Workflow Steps -->
             <div class="bg-black border border-slate-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all">
                <div class="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-xl mb-4 mx-auto border border-purple-500/30">1</div>
                <h3 class="text-white font-bold mb-2">Data Capture</h3>
                <p class="text-sm text-gray-500">Address & weight validation.</p>
             </div>
             
             <div class="bg-black border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all">
                <div class="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl mb-4 mx-auto border border-blue-500/30">2</div>
                <h3 class="text-white font-bold mb-2">Carrier Select</h3>
                <p class="text-sm text-gray-500">AI picks best rate/speed.</p>
             </div>
             
             <div class="bg-black border border-slate-800 rounded-2xl p-6 text-center hover:border-green-500/50 transition-all">
                <div class="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center text-green-400 font-bold text-xl mb-4 mx-auto border border-green-500/30">3</div>
                <h3 class="text-white font-bold mb-2">Label Gen</h3>
                <p class="text-sm text-gray-500">AWB assigned instantly.</p>
             </div>
             
             <div class="bg-black border border-slate-800 rounded-2xl p-6 text-center hover:border-orange-500/50 transition-all">
                <div class="w-12 h-12 bg-orange-900/30 rounded-full flex items-center justify-center text-orange-400 font-bold text-xl mb-4 mx-auto border border-orange-500/30">4</div>
                <h3 class="text-white font-bold mb-2">Pickup</h3>
                <p class="text-sm text-gray-500">Manifest sent to warehouse.</p>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="py-20 bg-black border-t border-slate-900">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
          <div>
            <div class="text-4xl font-black text-purple-500 mb-2">40%</div>
            <div class="text-gray-400 text-sm">Shipping Saved</div>
          </div>
          <div>
            <div class="text-4xl font-black text-green-500 mb-2">99.5%</div>
            <div class="text-gray-400 text-sm">Delivery Success</div>
          </div>
          <div>
            <div class="text-4xl font-black text-blue-500 mb-2">4+</div>
            <div class="text-gray-400 text-sm">Carriers</div>
          </div>
          <div>
            <div class="text-4xl font-black text-orange-500 mb-2">Instant</div>
            <div class="text-gray-400 text-sm">AWB Generation</div>
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
