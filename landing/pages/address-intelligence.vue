<template>
  <div class="min-h-screen bg-slate-900 text-white">
    <AppNavigation />
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-slate-900">
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-900 to-slate-900"></div>
             <div class="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl rounded-full"></div>
             <!-- Grid Pattern -->
             <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px); background-size: 40px 40px;"></div>
        </div>
        <div class="container mx-auto px-6 relative z-10">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                <!-- Text -->
                 <div>
                    <div class="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-semibold mb-6">
                      <Icon name="heroicons:map" class="w-4 h-4 mr-2" />
                      Precision Logistics
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight">
                      Ship to the <br>
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Right Place, Every Time</span>
                    </h1>
                     <p class="text-xl text-gray-300 mb-10 leading-relaxed">
                      Eliminate failed deliveries. Our AI-driven address intelligence validates, corrects, and standardizes addresses in real-time to ensure 100% deliverability.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                        Start Validating
                        <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
                        </button>
                    </div>
                 </div>
                 <!-- Visualization -->
                 <div class="relative">
                    <!-- Bad Address Card -->
                     <div class="relative bg-white text-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm mx-auto border-4 border-red-400/50 transform -rotate-3 transition-transform duration-500 z-10">
                        <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                             <div class="font-bold text-lg text-red-500 flex items-center"><Icon name="heroicons:x-circle" class="w-5 h-5 mr-2"/> Raw Input</div>
                        </div>
                        <div class="space-y-1 text-sm font-mono text-gray-600">
                             <p>123 mein st,</p>
                             <p>aprt 4b</p>
                             <p>ny new york 10001</p>
                        </div>
                     </div>
                     <!-- Arrow -->
                      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                         <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                             <Icon name="heroicons:arrow-down" class="w-6 h-6 text-white" />
                         </div>
                     </div>
                     <!-- Good Address Card -->
                      <div class="relative bg-slate-800 text-white rounded-2xl p-6 shadow-2xl max-w-sm mx-auto border-4 border-green-500/50 transform rotate-3 transition-transform duration-500 mt-[-20px] z-0">
                         <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                             <div class="font-bold text-lg text-green-400 flex items-center"><Icon name="heroicons:check-circle" class="w-5 h-5 mr-2"/> Validated & Geocoded</div>
                        </div>
                        <div class="space-y-1 text-sm font-mono text-gray-300">
                             <p class="text-green-400">123 Main St</p>
                             <p class="text-green-400">Apt 4B</p>
                             <p class="text-green-400">New York, NY 10001</p>
                             <p class="text-xs text-gray-500 mt-2 flex items-center"><Icon name="heroicons:map-pin" class="w-3 h-3 mr-1"/> 40.7484° N, 73.9857° W</p>
                        </div>
                      </div>
                 </div>
            </div>
        </div>
    </section>
    
    <!-- Capabilities -->
     <section class="py-20 bg-slate-800/50">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                 <h2 class="text-3xl md:text-4xl font-bold mb-4">Intelligent Correction</h2>
                <p class="text-gray-400">Fixes mistakes before they become shipping errors.</p>
            </div>
             <div class="grid md:grid-cols-3 gap-8">
                <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-colors">
                    <div class="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:pencil-square" class="w-7 h-7" />
                    </div>
                     <h3 class="text-xl font-bold mb-3 text-white">Typo Correction</h3>
                    <p class="text-gray-400">Automatically fixes misspellings (e.g., "Mian St" -> "Main St") using fuzzy matching algorithms.</p>
                </div>
                 <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:puzzle-piece" class="w-7 h-7" />
                    </div>
                     <h3 class="text-xl font-bold mb-3 text-white">Missing Info Completion</h3>
                    <p class="text-gray-400">Fills in missing Zip codes, states, or cities based on the provided street information.</p>
                </div>
                 <div class="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-colors">
                    <div class="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                        <Icon name="heroicons:chart-bar" class="w-7 h-7" />
                    </div>
                     <h3 class="text-xl font-bold mb-3 text-white">Deliverability Scoring</h3>
                    <p class="text-gray-400">Assigns a confidence score to every address. Low scores can trigger a manual review or customer prompt.</p>
                </div>
             </div>
        </div>
     </section>
     
      <!-- Stats -->
    <section class="py-20 bg-slate-900 border-t border-slate-800">
        <div class="container mx-auto px-6">
             <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                    <div class="text-4xl font-black text-cyan-500 mb-2">35%</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Failed Deliveries Reduced</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-blue-500 mb-2">99.8%</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Address Accuracy</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-green-500 mb-2">Global</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">Coverage</div>
                </div>
                 <div>
                    <div class="text-4xl font-black text-purple-500 mb-2">&lt;100ms</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wider">API Latency</div>
                </div>
             </div>
        </div>
    </section>
  </div>
</template>

<script setup>
</script>
