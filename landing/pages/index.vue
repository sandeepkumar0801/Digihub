<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <!-- Animated Background Container -->
      <div class="absolute inset-0 z-0">
        <!-- CSS Particle System -->
        <div class="particle-system">
          <div v-for="i in 50" :key="i" class="data-particle" :style="`top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 6}s; bg-color: ${i % 2 === 0 ? '#4deeea' : '#74ee15'};`"></div>
        </div>
        
        <!-- Abstract Data/Finance Floaters -->
        <div class="floating-cube blur-sm" style="top: 15%; left: 10%; animation-delay: 0s; border-color: rgba(77, 238, 234, 0.2);"></div>
        <div class="floating-cube blur-md" style="top: 60%; right: 15%; animation-delay: -3s; border-color: rgba(116, 238, 21, 0.2);"></div>
      </div>
  
      <!-- Glassmorphism Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-purple-900/30 backdrop-blur-[2px] z-2"></div>
      
      <div class="container mx-auto px-6 relative z-10 pt-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Content Side -->
          <div class="text-white">
            <!-- Floating Badge -->
            <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-md rounded-full border border-red-500/20 text-red-400 text-sm font-semibold mb-8 animate-fade-in-up">
              <div class="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              We don't sell shipping. We sell certainty.
            </div>
            
            <h1 class="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight animate-fade-in-up" style="animation-delay: 0.1s;">
              <span class="block text-white mb-2">COD Intelligence:</span>
              <span class="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent animate-gradient">
                Risk, Conversion & Settlement
              </span>
            </h1>
            
            <p class="text-xl md:text-2xl mb-10 text-gray-400 leading-relaxed max-w-2xl animate-fade-in-up" style="animation-delay: 0.2s;">
              Thin integration, deep intelligence. We orchestrate the chaotic layer between brands and courier partners with 
              <span class="text-white font-semibold">Predictive Risk Scoring</span>, 
              <span class="text-white font-semibold">Automated NDR</span>, and 
              <span class="text-white font-semibold">T+0 Settlement</span>.
            </p>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-6 mb-12 animate-fade-in-up" style="animation-delay: 0.3s;">
              <button class="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25">
                <div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative flex items-center justify-center">
                  <Icon name="heroicons:chart-bar-square" class="w-6 h-6 mr-3" />
                  Analyze My Risk
                  <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              <button class="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/30">
                <div class="flex items-center justify-center">
                  <Icon name="heroicons:play-circle" class="w-6 h-6 mr-3 group-hover:text-red-400 transition-colors" />
                  See It In Action
                </div>
              </button>
            </div>
            
            <!-- Trust Indicators -->
            <div class="flex flex-wrap gap-8 text-sm animate-fade-in-up" style="animation-delay: 0.4s;">
              <div class="flex items-center text-gray-400">
                <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2 text-green-400" />
                <span>Risk Intelligence</span>
              </div>
              <div class="flex items-center text-gray-400">
                <Icon name="heroicons:currency-rupee" class="w-5 h-5 mr-2 text-yellow-400" />
                <span>NBFC Settlement</span>
              </div>
              <div class="flex items-center text-gray-400">
                <Icon name="heroicons:bolt" class="w-5 h-5 mr-2 text-cyan-400" />
                <span>Thin Integration</span>
              </div>
            </div>
          </div>
          
          <!-- Visual Side -->
          <div class="relative animate-fade-in-left" style="animation-delay: 0.2s;">
            <!-- Main 3D Visualization Container -->
            <div class="relative w-full h-96 lg:h-[600px]">
              <!-- Central Hub Visualization -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative">
                  <!-- Central Core: BRAIN / AI -->
                  <div class="w-40 h-40 bg-gradient-to-br from-slate-800 to-black rounded-full border border-slate-700 animate-pulse-slow shadow-3xl shadow-red-500/20 flex items-center justify-center z-10 relative">
                     <!-- Neural Network Graphic Placeholder -->
                    <Icon name="heroicons:cpu-chip" class="w-20 h-20 text-red-500" />
                    <!-- Rings -->
                    <div class="absolute inset-0 border border-red-500/30 rounded-full animate-ping-slow"></div>
                  </div>

                  <!-- Orbiting Modules -->
                  <div class="absolute inset-0 animate-spin-very-slow">
                     <!-- Module A: Risk -->
                    <div class="absolute -top-24 left-1/2 transform -translate-x-1/2">
                        <div class="w-20 h-20 bg-slate-900/90 backdrop-blur border border-red-500/50 rounded-xl flex flex-col items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                            <Icon name="heroicons:shield-exclamation" class="w-8 h-8 text-red-500 mb-1" />
                            <span class="text-[10px] text-gray-300 font-mono">RISK</span>
                        </div>
                    </div>
                    <!-- Module B: Conversion -->
                    <div class="absolute top-1/2 -right-32 transform -translate-y-1/2">
                         <div class="w-20 h-20 bg-slate-900/90 backdrop-blur border border-green-500/50 rounded-xl flex flex-col items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                            <Icon name="logos:whatsapp-icon" class="w-8 h-8 text-green-500 mb-1" />
                            <span class="text-[10px] text-gray-300 font-mono">CONVERT</span>
                        </div>
                    </div>
                    <!-- Module C: Settlement -->
                    <div class="absolute -bottom-24 left-1/2 transform -translate-x-1/2">
                         <div class="w-20 h-20 bg-slate-900/90 backdrop-blur border border-yellow-500/50 rounded-xl flex flex-col items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                            <Icon name="heroicons:currency-rupee" class="w-8 h-8 text-yellow-500 mb-1" />
                            <span class="text-[10px] text-gray-300 font-mono">SETTLE</span>
                        </div>
                    </div>
                     <!-- Add-on: Logistics -->
                     <div class="absolute top-1/2 -left-32 transform -translate-y-1/2 opacity-50">
                        <div class="w-16 h-16 bg-slate-900/50 backdrop-blur border border-slate-600/30 rounded-xl flex flex-col items-center justify-center dashed-border">
                           <Icon name="heroicons:truck" class="w-6 h-6 text-slate-500 mb-1" />
                           <span class="text-[9px] text-slate-500 font-mono">LOGISTICS</span>
                       </div>
                   </div>
                  </div>
                  
                  <!-- Connections -->
                  <div class="absolute inset-0 pointer-events-none">
                     <svg class="w-full h-full visible" viewBox="0 0 400 400" style="overflow: visible;">
                        <circle cx="200" cy="200" r="140" fill="none" class="stroke-slate-700/30" stroke-width="1" />
                        <circle cx="200" cy="200" r="140" fill="none" class="stroke-red-500/20 stroke-dasharray-10 animate-spin-reverse" stroke-width="2" />
                     </svg>
                  </div>
                </div>
              </div>
              
               <!-- Floating Stats Cards -->
               <div class="absolute top-0 right-0 animate-float" style="animation-delay: 1s;">
                  <div class="bg-black/60 backdrop-blur-md border border-red-500/30 p-4 rounded-xl shadow-2xl">
                      <div class="text-xs text-gray-400 mb-1">RTO Prediction</div>
                      <div class="flex items-center gap-2">
                          <span class="text-xl font-bold text-red-500">High Risk</span>
                          <span class="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded uppercase">Block</span>
                      </div>
                  </div>
               </div>

               <div class="absolute bottom-10 left-0 animate-float" style="animation-delay: 2s;">
                  <div class="bg-black/60 backdrop-blur-md border border-green-500/30 p-4 rounded-xl shadow-2xl">
                      <div class="text-xs text-gray-400 mb-1">COD Settlement</div>
                      <div class="flex items-center gap-2">
                          <span class="text-xl font-bold text-green-500">T+0 Instant</span>
                          <Icon name="heroicons:check-badge" class="w-4 h-4 text-green-500" />
                      </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Problem Section -->
    <section class="py-24 bg-black relative overflow-hidden">
       <!-- Dramatic Background -->
       <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
       <div class="absolute inset-0 z-0 opacity-30">
          <div class="absolute top-[10%] left-[10%] w-72 h-72 bg-red-600/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
          <div class="absolute bottom-[10%] right-[10%] w-72 h-72 bg-orange-600/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow" style="animation-delay: 2s"></div>
       </div>

       <div class="container mx-auto px-6 relative z-10">
          <div class="text-center mb-20">
             <div class="inline-flex items-center px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-full text-red-500 text-sm font-bold mb-6 animate-fade-in-up">
                <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 mr-2" />
                The Reality of COD
             </div>
             <h2 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-fade-in-up" style="animation-delay: 0.1s;">
                Chaos in the <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Last Mile</span>
             </h2>
             <p class="text-xl text-gray-400 max-w-3xl mx-auto animate-fade-in-up" style="animation-delay: 0.2s;">
                Unmanaged COD risk isn't just a logistics issue. It's a localized bleeding of your working capital.
             </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8 text-left">
             <!-- Problem 1: RTO -->
             <div class="group relative bg-slate-900/50 border border-red-900/30 p-8 rounded-3xl hover:bg-red-900/10 hover:border-red-500/50 transition-all duration-500 animate-fade-in-up" style="animation-delay: 0.3s;">
                <div class="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Icon name="heroicons:archive-box-x-mark" class="w-16 h-16 text-red-600" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4"><span class="text-red-500">High RTO</span> & Returns</h3>
                <p class="text-gray-400 leading-relaxed mb-6">
                   No unified buyer intelligence means you're flying blind.
                   <br><br>
                   <span class="text-white font-semibold">The Result:</span> 2-way freight loss, damaged inventory, and operational waste.
                </p>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div class="h-full bg-red-600 w-3/4"></div>
                </div>
             </div>

             <!-- Problem 2: Inefficiency -->
             <div class="group relative bg-slate-900/50 border border-orange-900/30 p-8 rounded-3xl hover:bg-orange-900/10 hover:border-orange-500/50 transition-all duration-500 animate-fade-in-up" style="animation-delay: 0.4s;">
                 <div class="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Icon name="heroicons:clock" class="w-16 h-16 text-orange-600" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4">Delivery <span class="text-orange-500">Inefficiencies</span></h3>
                <p class="text-gray-400 leading-relaxed mb-6">
                   Address errors, courier mismatches, and unreachable buyers.
                   <br><br>
                   <span class="text-white font-semibold">The Result:</span> Preventable failures that automated workflows could have saved.
                </p>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div class="h-full bg-orange-600 w-2/3"></div>
                </div>
             </div>

             <!-- Problem 3: Cash Flow -->
             <div class="group relative bg-slate-900/50 border border-yellow-900/30 p-8 rounded-3xl hover:bg-yellow-900/10 hover:border-yellow-500/50 transition-all duration-500 animate-fade-in-up" style="animation-delay: 0.5s;">
                 <div class="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Icon name="heroicons:banknotes" class="w-16 h-16 text-yellow-600" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4">Trapped <span class="text-yellow-500">Capital</span></h3>
                <p class="text-gray-400 leading-relaxed mb-6">
                   T+7 to T+14 remittance cycles kill your ad spend velocity.
                   <br><br>
                   <span class="text-white font-semibold">The Result:</span> 15-20% of your revenue is always stuck in transit.
                </p>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div class="h-full bg-yellow-600 w-1/2"></div>
                </div>
             </div>
          </div>
       </div>
    </section>

    <!-- Core Intelligence Modules Intro -->
    <section class="py-20 bg-black text-center relative overflow-hidden">
       <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-black pointer-events-none"></div>
       <div class="container mx-auto px-6 relative z-10">
          <h2 class="text-3xl md:text-5xl font-black text-white mb-6">
            The <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-yellow-500">Intelligence Layer</span>
          </h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
             You wouldnt even notice. We optimize the money and data flowing through them.
          </p>
       </div>
    </section>

    <!-- Module A: Risk -->
    <DynamicCodRiskSection />

    <!-- Module B: Conversion -->
    <ModuleConversion />

    <!-- Module C: Settlement -->
    <ModuleSettlement />

    <!-- Platform Workflow Section -->
    <section class="py-24 bg-black relative border-t border-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-20">
                <h2 class="text-4xl md:text-6xl font-black text-white mb-6">
                    End-to-End <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Intelligence Flow</span>
                </h2>
                <p class="text-xl text-gray-400">From checkout to bank account, we orchestrate every millisecond.</p>
            </div>

            <!-- Workflow Visual -->
            <div class="relative">
                <!-- Connecting Line (Desktop) -->
                <div class="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-purple-900 to-green-900 -translate-y-1/2 z-0"></div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                    <!-- Step 1: Merchant -->
                    <div class="bg-black border border-slate-800 p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300">
                        <div class="w-16 h-16 mx-auto bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-400 border border-blue-500/30">
                            <Icon name="heroicons:shopping-cart" class="w-8 h-8" />
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">1. Checkout</h3>
                        <p class="text-sm text-gray-500">Real-time risk scoring plugin analyzes customer intent instantly.</p>
                    </div>

                    <!-- Step 2: Risk Engine -->
                    <div class="bg-black border border-red-900/50 p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                        <div class="w-16 h-16 mx-auto bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-500/30 animate-pulse">
                            <Icon name="heroicons:cpu-chip" class="w-8 h-8" />
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">2. Decision</h3>
                        <p class="text-sm text-gray-500">AI accepts, blocks, or converts COD to partial payment based on risk.</p>
                    </div>

                    <!-- Step 3: Fulfillment & Recovery -->
                    <div class="bg-black border border-green-900/50 p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300">
                        <div class="w-16 h-16 mx-auto bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-500 border border-green-500/30">
                            <Icon name="heroicons:truck" class="w-8 h-8" />
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">3. Fulfillment</h3>
                        <p class="text-sm text-gray-500">Automated address cleaning and WhatsApp confirmation before dispatch.</p>
                    </div>

                    <!-- Step 4: Settlement -->
                    <div class="bg-black border border-yellow-900/50 p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform duration-300">
                        <div class="w-16 h-16 mx-auto bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 text-yellow-500 border border-yellow-500/30">
                            <Icon name="heroicons:currency-rupee" class="w-8 h-8" />
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">4. Settlement</h3>
                        <p class="text-sm text-gray-500">T+0 fund transfer coupled with post-delivery reconciliation.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Add-Ons Section (Formerly Features) -->
    <!-- Why We Win Section -->
    <section class="py-32 bg-black relative overflow-hidden border-t border-slate-900">
        <!-- Tech Background -->
        <div class="absolute inset-0">
             <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>
             <!-- Animated Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px); background-size: 30px 30px;"></div>
             
             <!-- Floating Nodes Animation -->
             <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
             <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-500 rounded-full animate-ping" style="animation-delay: 1s;"></div>
             <div class="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-ping" style="animation-delay: 2s;"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-24">
                 <div class="inline-flex items-center px-4 py-2 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-bold mb-6">
                    <Icon name="heroicons:cpu-chip" class="w-4 h-4 mr-2" />
                    Proprietary Intelligence
                 </div>
                 <h2 class="text-5xl md:text-7xl font-black text-white mb-8">
                    Why We <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Win</span>
                 </h2>
                 <p class="text-xl text-gray-400 max-w-3xl mx-auto">
                    Execution-tied intelligence. We don't just move data; we engineering <span class="text-white font-semibold">financial certainty</span>.
                 </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Card 1: Single Platform -->
                <div class="relative group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1">
                    <div class="absolute inset-0 bg-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="w-14 h-14 bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
                        <Icon name="heroicons:server-stack" class="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Unified Intelligence</h3>
                    <p class="text-gray-400 leading-relaxed">A single brain for <span class="text-indigo-400">Risk → Conversion → Settlement</span>. No silos, just pure execution flow across the entire lifecycle.</p>
                </div>

                <!-- Card 2: Liquidity -->
                <div class="relative group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-1">
                     <div class="absolute inset-0 bg-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div class="w-14 h-14 bg-cyan-900/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">
                        <Icon name="heroicons:banknotes" class="w-8 h-8 text-cyan-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Liquidity Velocity</h3>
                    <p class="text-gray-400 leading-relaxed">Direct NBFC integration via our rails to unlock <span class="text-cyan-400">safe, fast capital</span>. Turn COD into working capital instantly.</p>
                </div>

                <!-- Card 3: Network Effects -->
                <div class="relative group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-1">
                     <div class="absolute inset-0 bg-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div class="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                        <Icon name="heroicons:share" class="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Network Operations</h3>
                    <p class="text-gray-400 leading-relaxed">Aggregated intelligence from high-volume D2C & ONDC segments reduces <span class="text-purple-400">CAC</span> and logistics costs for everyone.</p>
                </div>

                 <!-- Card 4: AI/ML Focus -->
                <div class="relative group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-pink-500/50 transition-all duration-500 lg:col-span-2 overflow-hidden">
                     <div class="absolute inset-0 bg-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     
                     <!-- Deep Analysis Graphic -->
                     <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-pink-900/10 to-transparent pointer-events-none"></div>
                     
                     <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div class="flex-1">
                            <div class="w-14 h-14 bg-pink-900/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20 group-hover:border-pink-500/50 transition-colors">
                                <Icon name="heroicons:sparkles" class="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-4">Deep Learning Core</h3>
                            <p class="text-gray-400 text-lg leading-relaxed">
                                Our AI isn't just marketing—it's a <span class="text-pink-400 font-semibold">retention engine</span>. 
                                We perform deep analysis on every transaction signal. 
                                <br/><br/>
                                <span class="text-white border-l-2 border-pink-500 pl-4 block">
                                    "Settlement & Risk Scoring become stickier with every transaction."
                                </span>
                            </p>
                        </div>
                        
                        <!-- Visual representation of ML -->
                        <div class="hidden md:flex gap-2">
                             <div class="flex flex-col gap-2">
                                 <div class="w-16 h-8 bg-slate-800 rounded border border-slate-700 animate-pulse"></div>
                                 <div class="w-16 h-8 bg-slate-800 rounded border border-slate-700 animate-pulse" style="animation-delay: 0.2s"></div>
                                 <div class="w-16 h-8 bg-slate-800 rounded border border-slate-700 animate-pulse" style="animation-delay: 0.4s"></div>
                             </div>
                             <div class="flex flex-col justify-center">
                                 <Icon name="heroicons:arrow-right" class="w-6 h-6 text-pink-500" />
                             </div>
                             <div class="w-24 h-24 bg-pink-900/20 rounded-xl border border-pink-500/30 flex items-center justify-center">
                                 <Icon name="heroicons:brain-circuit" class="w-12 h-12 text-pink-500" />
                             </div>
                        </div>
                     </div>
                </div>

                 <!-- Card 5: Business Model -->
                <div class="relative group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-green-500/50 transition-all duration-500 hover:-translate-y-1">
                     <div class="absolute inset-0 bg-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div class="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20 group-hover:border-green-500/50 transition-colors">
                        <Icon name="heroicons:chart-bar" class="w-8 h-8 text-green-500" />
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-4">Execution-Tied Success</h3>
                    <p class="text-gray-400 leading-relaxed">
                        Transaction-priced. We only win when you process volume successfully.
                        <br/><br/>
                        <span class="text-xs text-green-400 font-mono bg-green-900/20 px-2 py-1 rounded">Modular & API-First</span>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white relative overflow-hidden">
      <!-- Background Patterns -->
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      <div class="container mx-auto px-6 text-center relative z-10">
        <h2 class="text-4xl md:text-6xl font-black mb-6">
          Stop Bleeding Cash on COD.
        </h2>
        <p class="text-xl mb-10 max-w-2xl mx-auto opacity-90 font-medium">
          Join the D2C brands that have reduced RTO by 30% and unlocked T+0 settlement.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="inline-flex items-center px-10 py-5 bg-black rounded-2xl text-white font-bold text-xl hover:scale-105 transition-transform duration-300 cursor-pointer shadow-2xl border border-white/20">
            <Icon name="heroicons:shield-check" class="w-6 h-6 mr-3 text-red-500" />
            Get A Risk Audit
          </button>
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
  title: 'DigiHub - E-commerce Channel Connector & Logistics Management System',
  meta: [
    {
      name: 'description',
      content: 'Enterprise-grade multi-marketplace synchronization and logistics platform. Streamline e-commerce operations across multiple sales channels with real-time inventory sync, automated order processing, and multi-carrier shipping integration.'
    },
    {
      property: 'og:title',
      content: 'DigiHub - E-commerce Channel Connector & Logistics Management System'
    },
    {
      property: 'og:description',
      content: 'Transform your e-commerce operations with our comprehensive channel connector and logistics management system. Support for Shopify, WooCommerce, Amazon, and more.'
    }
  ]
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
