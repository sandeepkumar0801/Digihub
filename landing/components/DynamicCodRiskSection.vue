<template>
  <section class="py-32 relative overflow-hidden bg-black text-white">
    <!-- Dynamic Background -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-green-900/10"></div>
      <!-- Grid -->
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, #333 1px, transparent 0); background-size: 30px 30px;"></div>
      
      <!-- Pulse Orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/5 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        <!-- Visuals -->
        <div class="relative order-2 lg:order-1">
          <!-- Main Interface Container -->
          <div class="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <span class="font-mono text-sm text-slate-400">LIVE RISK ANALYSIS</span>
              </div>
              <div class="font-mono text-xs text-slate-500">RID: #9X82-B2</div>
            </div>

            <!-- Risk Meter Visualization -->
            <div class="relative flex justify-center mb-10">
               <div class="relative w-64 h-32 overflow-hidden">
                 <!-- Gauge Background -->
                 <div class="absolute top-0 left-0 w-full h-full bg-slate-800 rounded-t-full"></div>
                 <!-- Gauge Gradient (Risk to Safe) -->
                 <div class="absolute top-2 left-2 right-2 bottom-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-t-full opacity-20"></div>
                 
                 <!-- Needle Wrapper -->
                 <div class="absolute bottom-0 left-1/2 w-full pt-[100%] -translate-x-1/2 rotate-[-45deg] origin-bottom transition-all duration-1000 ease-out" style="transform: translateX(-50%) rotate(45deg);">
                   <div class="absolute bottom-0 left-1/2 w-1 h-1/2 bg-white origin-bottom shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                 </div>
                 
                 <!-- Center Dot -->
                 <div class="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2 shadow-lg z-10"></div>
               </div>
               
               <!-- Score Display -->
               <div class="absolute -bottom-8 text-center">
                 <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-green-400">
                    SAFE
                 </div>
                 <div class="text-xs text-slate-400 font-mono">SCORE: 85/100</div>
               </div>
            </div>

            <!-- Analysis Parameters -->
            <div class="space-y-3 font-mono text-xs">
              <div class="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                <span class="text-slate-400">RTO History</span>
                <span class="text-green-400 flex items-center">
                  <Icon name="heroicons:check-circle" class="w-3 h-3 mr-1" /> Clean
                </span>
              </div>
              <div class="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                 <span class="text-slate-400">Address Match</span>
                 <span class="text-yellow-400 flex items-center">
                   <Icon name="heroicons:exclamation-circle" class="w-3 h-3 mr-1" /> Fuzzy
                 </span>
              </div>
               <div class="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                 <span class="text-slate-400">Device Fingerprint</span>
                 <span class="text-green-400 flex items-center">
                   <Icon name="heroicons:check-circle" class="w-3 h-3 mr-1" /> Trusted
                 </span>
              </div>
            </div>

            <!-- Floating Scan Line -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan opacity-50"></div>
          </div>
          
           <!-- Decorative Background Elements -->
           <div class="absolute -top-10 -left-10 w-20 h-20 border border-slate-700/50 rounded-full animate-spin-slow"></div>
           <div class="absolute -bottom-5 -right-5 w-32 h-32 border border-slate-700/50 rounded-full animate-spin-slow animation-delay-2000"></div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">
            <div class="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-semibold mb-6">
              <Icon name="heroicons:shield-check" class="w-4 h-4 mr-2" />
              Pre-Shipment Intelligence
            </div>
            
            <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight text-white">
              Dynamic COD <br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Risk Scoring</span>
            </h2>
            
            <p class="text-xl text-gray-400 mb-8 leading-relaxed">
              Stop guessing. We analyze 100+ parameters for every order <strong>before</strong> you ship. Detect high-risk COD orders instantly and switch to partial payment to secure your revenue.
            </p>

            <div class="flex flex-col gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-red-400 shrink-0">
                        <Icon name="heroicons:chart-bar" class="w-6 h-6" />
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white">Data-Driven Decisions</h4>
                        <p class="text-gray-500 text-sm">Real-time analysis of user behavior, history, and network patterns.</p>
                    </div>
                </div>
                 <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-green-400 shrink-0">
                        <Icon name="heroicons:currency-dollar" class="w-6 h-6" />
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white">Cost Minimization</h4>
                        <p class="text-gray-500 text-sm">Convert risky COD orders to prepaid or partial payment automatically.</p>
                    </div>
                </div>
            </div>

            <div class="mt-10">
               <NuxtLink to="/cod-risk-intelligence" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 transition-all duration-300">
                Explore Risk Intelligence
                <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
              </NuxtLink>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan {
  animation: scan 3s linear infinite;
}
</style>
