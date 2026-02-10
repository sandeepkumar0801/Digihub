<template>
  <section class="py-24 relative overflow-hidden bg-slate-950">
    <!-- Background Elements -->
    <div class="absolute inset-0">
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-900/10 to-transparent"></div>
      <div class="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        
        <!-- Content Side -->
        <div class="order-2 lg:order-1">
          <div class="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-6">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
            Conversion Intelligence
          </div>
          
          <h2 class="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
            Automated <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">NDR & Recovery</span>
          </h2>
          
          <p class="text-xl text-gray-400 mb-8 leading-relaxed">
            Don't let failed deliveries eating your margins. Our AI-driven workflow converts marginal COD orders into successful deliveries through automated interventions.
          </p>

          <div class="space-y-6">
            <div class="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-colors">
               <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0 mt-1">
                 <Icon name="logos:whatsapp-icon" class="w-5 h-5" />
               </div>
               <div>
                 <h4 class="text-lg font-bold text-white">WhatsApp & IVR Confirmation</h4>
                 <p class="text-gray-500 text-sm mt-1">
                   Pre-delivery automated checks to filter out fake intent. AI-powered address correction via WhatsApp bot.
                 </p>
               </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-colors">
               <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                 <Icon name="heroicons:arrow-path-rounded-square" class="w-6 h-6" />
               </div>
               <div>
                 <h4 class="text-lg font-bold text-white">Multi-Step NDR Workflows</h4>
                 <p class="text-gray-500 text-sm mt-1">
                   If a delivery fails, we instantly trigger a re-attempt workflow or switch couriers to ensure success.
                 </p>
               </div>
            </div>
          </div>
        </div>

        <!-- Visual Side -->
        <div class="relative order-1 lg:order-2">
           <!-- Chat Interface Mockup -->
           <div class="relative mx-auto max-w-sm bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              <!-- Chat Header -->
              <div class="bg-slate-800 p-4 flex items-center gap-3 border-b border-slate-700">
                <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">DH</div>
                <div>
                   <div class="text-sm font-bold text-white">Support Bot</div>
                   <div class="text-[10px] text-green-400 flex items-center gap-1">
                     <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                   </div>
                </div>
              </div>

              <!-- Chat Body -->
              <div class="p-4 space-y-4 h-[350px] bg-slate-900/50 relative">
                 <!-- Background Pattern -->
                 <div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                 <!-- Bot Message 1 -->
                 <div class="flex gap-2">
                    <div class="max-w-[85%] bg-slate-800 rounded-2xl p-3 text-xs text-slate-300 shadow-md">
                       Hi! We noticed an issue with your address "123 Main St". Is this correct?
                       <div class="text-[10px] opacity-50 mt-1 text-right">10:42 AM</div>
                    </div>
                 </div>

                 <!-- User Message -->
                 <div class="flex gap-2 justify-end">
                    <div class="max-w-[85%] bg-green-600 rounded-2xl p-3 text-xs text-white shadow-md">
                       No, it's "123 Main St, Apt 4B".
                       <div class="text-[10px] opacity-70 mt-1 text-right">10:43 AM</div>
                    </div>
                 </div>

                 <!-- Bot Message 2 -->
                 <div class="flex gap-2">
                    <div class="max-w-[85%] bg-slate-800 rounded-2xl p-3 text-xs text-slate-300 shadow-md">
                       <span class="text-green-400 font-bold block mb-1">
                          <Icon name="heroicons:check-circle" class="w-3 h-3 inline mr-1" /> Updated
                       </span>
                       Thanks! We've updated your delivery address. Your order is now out for delivery! 🚀
                       <div class="text-[10px] opacity-50 mt-1 text-right">10:43 AM</div>
                    </div>
                 </div>

                 <!-- Success Notification -->
                 <div class="absolute bottom-4 left-4 right-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 backdrop-blur-md animate-fade-in-up">
                    <div class="flex items-center gap-3">
                       <div class="bg-green-500 rounded-full p-1">
                          <Icon name="heroicons:check" class="w-4 h-4 text-white" />
                       </div>
                       <div>
                          <div class="text-xs font-bold text-green-400">Order Delivered</div>
                          <div class="text-[10px] text-gray-400">Recovered from RTO Risk</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Floating Stats -->
           <div class="absolute -right-4 top-20 bg-slate-800/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-xl animate-float">
              <div class="text-2xl font-bold text-white mb-1">85%</div>
              <div class="text-xs text-gray-400">NDR Recovery Rate</div>
           </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
</script>
