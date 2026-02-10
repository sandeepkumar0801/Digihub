<template>
  <div class="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
    <AppNavigation />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden">
       <!-- Background -->
        <div class="absolute inset-0 bg-black">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black"></div>
             <!-- Cyber Grid -->
             <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#eab308 1px, transparent 1px), linear-gradient(90deg, #eab308 1px, transparent 1px); background-size: 50px 50px; transform: perspective(100vh) rotateX(60deg) translateY(-100px) scale(2);"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                 <div class="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-sm font-semibold mb-8 tracking-widest uppercase">
                  <Icon name="heroicons:banknotes" class="w-4 h-4 mr-2" />
                  Financial Orchestration
                </div>
                
                <h1 class="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                  T+0 Settlement.<br>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 animate-gradient">Cash Flow at Speed of Light.</span>
                </h1>
                
                <p class="text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
                    Why wait 4-7 days for your COD money? We partner with RBI-compliant NBFCs to settle your COD revenue instantly. Reinvest in ads immediately.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-6 justify-center">
                    <button class="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] hover:scale-105 flex items-center">
                    Check Eligibility
                    <Icon name="heroicons:currency-rupee" class="ml-3 w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose Section -->
    <section class="py-24 bg-black relative border-t border-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                 <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose Accelerated Settlements?</h2>
                 <p class="text-gray-400 max-w-2xl mx-auto">Don't let "Out of Stock" banners kill your momentum. Turn today’s sales into tomorrow’s inventory.</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- Feature 1 -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group">
                    <div class="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon name="heroicons:arrow-path" class="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Restock Faster</h3>
                    <p class="text-sm text-gray-400">Prevent stockouts by reinvesting capital instantly rather than waiting weeks.</p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group">
                    <div class="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon name="heroicons:rocket-launch" class="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Scale Ad Spend</h3>
                    <p class="text-sm text-gray-400">Feed winning campaigns with real-time revenue. Don't pause ads due to cash crunch.</p>
                </div>

                <!-- Feature 3 -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group">
                    <div class="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon name="heroicons:shield-check" class="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">RBI Compliant</h3>
                    <p class="text-sm text-gray-400">Built on regulated frameworks. Secure, transparent, and direct NBFC transfers.</p>
                </div>

                <!-- Feature 4 -->
                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-colors group">
                    <div class="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon name="heroicons:adjustments-horizontal" class="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Tiered Flexibility</h3>
                    <p class="text-sm text-gray-400">Choose the speed that fits your margins. T+0 to T+3, you are in control.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-24 bg-slate-900 relative">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                 <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Pricing Tailored to Your Growth</h2>
                 <p class="text-gray-400 mb-8">Transparent fees. No hidden costs. Just pure liquidity.</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <!-- T+0 -->
                <div class="bg-black border-2 border-yellow-500 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <div class="absolute -top-4 right-8 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">POPULAR</div>
                    <h3 class="text-2xl font-black text-white mb-2">T + 0</h3>
                    <p class="text-yellow-500 font-bold mb-6">Same Day</p>
                    <div class="text-4xl font-bold text-white mb-2">1.4% <span class="text-lg text-gray-500 font-normal">- 1.8%</span></div>
                    <p class="text-xs text-gray-500 mb-8">per transaction</p>
                    <ul class="text-sm text-gray-400 space-y-3 mb-8">
                        <li class="flex items-start"><Icon name="heroicons:check" class="w-5 h-5 text-yellow-500 mr-2 shrink-0" /> Aggressive scaling</li>
                        <li class="flex items-start"><Icon name="heroicons:check" class="w-5 h-5 text-yellow-500 mr-2 shrink-0" /> High-velocity ads</li>
                    </ul>
                </div>

                <!-- T+1 -->
                <div class="bg-black border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition-colors">
                    <h3 class="text-2xl font-bold text-white mb-2">T + 1</h3>
                    <p class="text-gray-400 font-bold mb-6">Next Day</p>
                    <div class="text-3xl font-bold text-white mb-2">1.0% <span class="text-lg text-gray-500 font-normal">- 1.2%</span></div>
                    <p class="text-xs text-gray-500 mb-8">per transaction</p>
                    <ul class="text-sm text-gray-400 space-y-3 mb-8">
                         <li class="flex items-start"><Icon name="heroicons:check" class="w-5 h-5 text-slate-500 mr-2 shrink-0" /> Steady inventory flow</li>
                    </ul>
                </div>

                <!-- T+2 -->
                <div class="bg-black border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition-colors">
                    <h3 class="text-2xl font-bold text-white mb-2">T + 2</h3>
                    <p class="text-gray-400 font-bold mb-6">Standard +</p>
                     <div class="text-3xl font-bold text-white mb-2">0.80%</div>
                    <p class="text-xs text-gray-500 mb-8">flat fee</p>
                    <ul class="text-sm text-gray-400 space-y-3 mb-8">
                         <li class="flex items-start"><Icon name="heroicons:check" class="w-5 h-5 text-slate-500 mr-2 shrink-0" /> Balanced margins</li>
                    </ul>
                </div>

                <!-- T+3 -->
                <div class="bg-black border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition-colors">
                    <h3 class="text-2xl font-bold text-white mb-2">T + 3</h3>
                    <p class="text-gray-400 font-bold mb-6">Economy</p>
                    <div class="text-3xl font-bold text-white mb-2">0.60%</div>
                    <p class="text-xs text-gray-500 mb-8">flat fee</p>
                    <ul class="text-sm text-gray-400 space-y-3 mb-8">
                         <li class="flex items-start"><Icon name="heroicons:check" class="w-5 h-5 text-slate-500 mr-2 shrink-0" /> Cost optimization</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="py-24 bg-black relative border-t border-slate-900">
         <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                 <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            </div>
            
            <div class="flex flex-col md:flex-row justify-center items-center gap-8 relative">
                 <!-- Line -->
                 <div class="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-800 via-yellow-900/50 to-slate-800 -translate-y-1/2 z-0"></div>

                 <!-- Step 1 -->
                 <div class="relative z-10 bg-black border border-slate-700 p-6 rounded-2xl w-full md:w-64 text-center">
                     <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold border border-slate-600">1</div>
                     <h3 class="text-lg font-bold text-white mb-2">Deliver</h3>
                     <p class="text-sm text-gray-500">Customer receives COD order.</p>
                 </div>

                 <!-- Step 2 -->
                 <div class="relative z-10 bg-black border border-slate-700 p-6 rounded-2xl w-full md:w-64 text-center">
                     <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold border border-slate-600">2</div>
                     <h3 class="text-lg font-bold text-white mb-2">Verify</h3>
                     <p class="text-sm text-gray-500">System syncs with courier.</p>
                 </div>

                 <!-- Step 3 -->
                  <div class="relative z-10 bg-black border border-yellow-500 p-6 rounded-2xl w-full md:w-64 text-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                     <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold">3</div>
                     <h3 class="text-lg font-bold text-white mb-2">Settle</h3>
                     <p class="text-sm text-gray-500">NBFC triggers T+0 payout.</p>
                 </div>

                 <!-- Step 4 -->
                  <div class="relative z-10 bg-black border border-slate-700 p-6 rounded-2xl w-full md:w-64 text-center">
                     <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold border border-slate-600">4</div>
                     <h3 class="text-lg font-bold text-white mb-2">Grow</h3>
                     <p class="text-sm text-gray-500">Reinvest funds immediately.</p>
                 </div>
            </div>
         </div>
    </section>

    <!-- Calculator & FAQ Section -->
    <section class="py-24 bg-slate-900/50">
        <div class="container mx-auto px-6">
            <div class="grid lg:grid-cols-2 gap-16">
                <!-- Liquidity Calculator -->
                <div>
                     <div class="bg-black border border-slate-700 rounded-3xl p-8 sticky top-24">
                        <div class="flex items-center mb-8">
                             <Icon name="heroicons:calculator" class="w-8 h-8 text-yellow-500 mr-3" />
                             <h3 class="text-2xl font-bold text-white">Liquidity Calculator</h3>
                        </div>
                        
                        <div class="mb-8">
                            <label class="block text-gray-400 text-sm mb-3">Monthly COD Volume (₹)</label>
                            <input 
                                v-model.number="monthlyVolume" 
                                type="number" 
                                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors text-xl font-mono"
                                placeholder="e.g., 500000"
                            />
                        </div>
                        
                        <div class="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
                            <div class="text-gray-400 text-sm mb-2">Trapped Capital Unlocked Instantly</div>
                            <div class="text-4xl font-bold text-yellow-500 font-mono">₹{{ formattedUnlockedAmount }}</div>
                            <p class="text-xs text-gray-500 mt-2">*Est. ~30% of revenue usually stuck in 10-day remittance cycles</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-900/50 p-4 rounded-xl">
                                <div class="text-xs text-gray-500 mb-1">Standard Cycle</div>
                                <div class="text-lg text-white font-bold">~2 Turns/Mo</div>
                            </div>
                             <div class="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-xl">
                                <div class="text-xs text-yellow-500 mb-1">With DigiHub</div>
                                <div class="text-lg text-white font-bold">~20 Turns/Mo</div>
                            </div>
                        </div>
                     </div>
                </div>

                <!-- FAQ -->
                <div>
                    <h2 class="text-3xl font-bold text-white mb-10">Frequently Asked Questions</h2>
                    <div class="space-y-6">
                        <!-- FAQ Item 1 -->
                        <div v-for="(faq, index) in faqs" :key="index" class="border-b border-slate-800 pb-6">
                            <button @click="toggleFaq(index)" class="flex justify-between items-start w-full text-left group">
                                <span class="text-lg font-medium text-gray-200 group-hover:text-yellow-500 transition-colors pr-6">{{ faq.question }}</span>
                                <Icon 
                                    name="heroicons:chevron-down" 
                                    class="w-6 h-6 text-gray-500 transition-transform duration-300" 
                                    :class="{ 'rotate-180': faq.isOpen }"
                                />
                            </button>
                            <div 
                                class="grid transition-all duration-300 ease-in-out"
                                :class="faq.isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'"
                            >
                                <div class="overflow-hidden">
                                     <p class="text-gray-400 leading-relaxed">{{ faq.answer }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
const monthlyVolume = ref(1000000)

const formattedUnlockedAmount = computed(() => {
    // Estimating ~30% of monthly revenue is trapped in 10-day cycles (10/30 days)
    const amount = monthlyVolume.value * 0.30
    return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(amount)
})

const faqs = ref([
    {
        question: "How is this different from my current COD remittance?",
        answer: "Standard COD cycles usually take 7 to 12 days as funds move from courier -> aggregator -> you. Our Settlement Orchestration bypasses this by partnering with NBFCs to provide funds as soon as delivery is confirmed.",
        isOpen: true
    },
    {
        question: "Is this service RBI-compliant?",
        answer: "Absolutely. We act as an orchestration layer. The actual financing and disbursement are handled by RBI-registered NBFCs. All fund flows follow the latest RBI guidelines on digital lending.",
        isOpen: false
    },
    {
        question: "What does 'T' stand for in T+0?",
        answer: "'T' represents the Transaction Day—specifically, the day the delivery status is updated as 'Delivered'. T+0 means money hits your account the same day.",
        isOpen: false
    },
    {
        question: "Will this impact my credit score?",
        answer: "This is viewed as a working capital solution based on confirmed sales. Timely settlements and healthy volumes can actually help you build a stronger financial profile for future credit needs.",
        isOpen: false
    },
    {
        question: "How do I track these payments?",
        answer: "Our dashboard provides a Unified Reconciliation Report. Every settlement is mapped to a specific Order ID, showing the gross order value, orchestration fee, and final credited amount.",
        isOpen: false
    }
])

const toggleFaq = (index) => {
    faqs.value[index].isOpen = !faqs.value[index].isOpen
}
</script>
