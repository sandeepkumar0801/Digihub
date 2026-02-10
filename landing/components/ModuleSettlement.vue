<template>
  <section class="py-24 relative overflow-hidden bg-slate-950">
    <!-- Background Elements -->
    <div class="absolute inset-0">
       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] animate-pulse"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        
        <!-- Visual Side -->
        <div class="relative order-1">
            <!-- Card Stack Animation -->
            <div class="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
               
               <!-- Back Card (T+2) -->
               <div class="absolute w-64 h-40 bg-slate-800 rounded-2xl border border-slate-700 transform -rotate-12 translate-y-4 opacity-40 scale-90"></div>
               
               <!-- Middle Card (T+1) -->
               <div class="absolute w-64 h-40 bg-slate-800 rounded-2xl border border-slate-600 transform -rotate-6 translate-y-2 opacity-70 scale-95"></div>

               <!-- Front Card (T+0) -->
               <div class="relative w-72 h-46 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-500">
                  <div class="flex justify-between items-start mb-6">
                     <Icon name="heroicons:credit-card" class="w-8 h-8 opacity-80" />
                     <div class="text-xs font-mono bg-white/20 px-2 py-1 rounded">INSTANT</div>
                  </div>
                  <div class="text-3xl font-bold tracking-widest mb-1">₹ 1,45,000</div>
                  <div class="text-xs opacity-70 mb-4">Available Balance</div>
                  <div class="flex justify-between items-end">
                     <div class="text-sm font-medium">Early Settlement</div>
                     <div class="text-2xl font-bold">T+0</div>
                  </div>
               </div>

               <!-- Floating Coin Elements -->
               <div class="absolute -top-10 right-10 animate-bounce delay-100">
                  <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200">
                     <span class="font-bold text-yellow-800">₹</span>
                  </div>
               </div>
               <div class="absolute bottom-0 left-10 animate-bounce delay-300">
                  <div class="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-200">
                     <span class="font-bold text-sm text-amber-800">$</span>
                  </div>
               </div>

            </div>
        </div>

        <!-- Content Side -->
        <div class="order-2">
          <div class="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-semibold mb-6">
            <Icon name="heroicons:banknotes" class="w-4 h-4 mr-2" />
            Settlement Orchestration
          </div>
          
          <h2 class="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
            Unlock Cash Flow <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Velocity</span>
          </h2>
          
          <p class="text-xl text-gray-400 mb-8 leading-relaxed">
            Stop waiting weeks for your COD money. We partner with RBI-compliant NBFCs to settle your COD revenue in as fast as T+0 days.
          </p>

          <div class="grid grid-cols-2 gap-6">
             <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 transition-colors">
                <div class="text-yellow-400 text-2xl font-bold mb-1">T+0</div>
                <div class="text-slate-400 text-sm">Settlement Cycle</div>
             </div>
             <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 transition-colors">
                <div class="text-yellow-400 text-2xl font-bold mb-1">1.2%</div>
                <div class="text-slate-400 text-sm">Realized Revenue</div>
             </div>
             <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 transition-colors col-span-2">
                <div class="flex items-center gap-3 mb-2">
                   <Icon name="heroicons:shield-check" class="w-5 h-5 text-yellow-400" />
                   <div class="text-white font-bold">RBI-Compliant Orchestration</div>
                </div>
                <div class="text-slate-400 text-sm">
                   We provide the intelligence, our NBFC partners provide the capital. Fully compliant and secure.
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
</script>
