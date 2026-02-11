<template>
  <section class="py-24 bg-black relative overflow-hidden">
    <!-- Matrix Background -->
    <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#4b5563 1px, transparent 1px); background-size: 30px 30px;"></div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Vertical List of Benefits -->
        <div class="space-y-8">
          <div class="relative pl-8 border-l-2 border-slate-800 hover:border-green-500 transition-colors duration-300 group">
             <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-green-500 transition-colors"></div>
             <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Zero "Platform Tax"</h3>
             <p class="text-gray-400 leading-relaxed">
               Aggregators hide fees in inflated shipping rates. We don't. We provide a pure Time and Cost Edge by speeding up your cash flow without touching your courier margins.
             </p>
          </div>

          <div class="relative pl-8 border-l-2 border-slate-800 hover:border-blue-500 transition-colors duration-300 group">
             <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-blue-500 transition-colors"></div>
             <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Your Checkout, Untouched</h3>
             <p class="text-gray-400 leading-relaxed">
               We don't force a "Pay with [Brand]" UI. We remain invisible. Your customers enjoy a seamless experience that looks 100% like your brand.
             </p>
          </div>

          <div class="relative pl-8 border-l-2 border-slate-800 hover:border-orange-500 transition-colors duration-300 group">
             <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-orange-500 transition-colors"></div>
             <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Freedom of Logistics</h3>
             <p class="text-gray-400 leading-relaxed">
               Keep your shipping partner relationships. Our system acts as the "Brain" on top. Use whoever you want; we make them efficient.
             </p>
          </div>

          <div class="relative pl-8 border-l-2 border-slate-800 hover:border-purple-500 transition-colors duration-300 group">
             <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-purple-500 transition-colors"></div>
             <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">The "Hassle-Free" Guarantee</h3>
             <p class="text-gray-400 leading-relaxed">
               No complex migration. No dev-heavy integration. We plug into your stack to inject intelligence where it’s needed most: The Bottom Line.
             </p>
          </div>
        </div>

        <!-- Visual Side -->
        <div class="relative h-full min-h-[400px] flex items-center justify-center bg-slate-900/30 rounded-3xl border border-white/5 p-8">
            <!-- Central Badge -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative w-64 h-64">
                    <div class="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
                    <div class="absolute inset-4 border border-white/10 rounded-full border-dashed animate-spin-slow"></div>
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Icon name="heroicons:scale" class="w-16 h-16 text-white mb-4" />
                        <div class="text-2xl font-black text-white">Pure<br>Profit</div>
                    </div>
                    
                    <!-- Satellites -->
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                        <Icon name="heroicons:currency-rupee" class="w-6 h-6 text-green-500" />
                    </div>
                    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                        <Icon name="heroicons:truck" class="w-6 h-6 text-orange-500" />
                    </div>
                     <div class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                        <Icon name="heroicons:credit-card" class="w-6 h-6 text-blue-500" />
                    </div>
                     <div class="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                        <Icon name="heroicons:hand-thumb-up" class="w-6 h-6 text-purple-500" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin 20s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
