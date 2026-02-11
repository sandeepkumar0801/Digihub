<template>
  <div class="bg-black/50 border border-red-900/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
    <!-- Glow Effect -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors duration-500"></div>

    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-8">
        <div class="p-3 bg-red-900/20 rounded-xl border border-red-500/20 text-red-500">
           <Icon name="heroicons:calculator" class="w-6 h-6" />
        </div>
        <h3 class="text-2xl font-bold text-white">Risk Calculator</h3>
      </div>

      <!-- Inputs -->
      <div class="space-y-6 mb-8">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-400">Monthly Orders</span>
            <span class="text-white font-mono">{{ orders.toLocaleString() }}</span>
          </div>
          <input type="range" v-model.number="orders" min="100" max="50000" step="100" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all">
        </div>

        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-400">Average Order Value (₹)</span>
            <span class="text-white font-mono">₹{{ aov.toLocaleString() }}</span>
          </div>
          <input type="range" v-model.number="aov" min="500" max="20000" step="100" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all">
        </div>

        <div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-400">Current RTO Rate (%)</span>
            <span class="text-white font-mono">{{ rtoRate }}%</span>
          </div>
          <input type="range" v-model.number="rtoRate" min="5" max="60" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all">
        </div>
      </div>

      <!-- Results -->
      <div class="grid grid-cols-2 gap-4 pt-6 border-t border-red-900/30">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Potential Savings</p>
          <p class="text-2xl md:text-3xl font-black text-green-400">₹{{ estimatedSavingsFormatted }}</p>
          <p class="text-[10px] text-green-600/70 mt-1">per month</p>
        </div>
         <div>
          <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Recovered Orders</p>
          <p class="text-2xl md:text-3xl font-black text-white">{{ recoveredOrders }}</p>
          <p class="text-[10px] text-gray-600 mt-1">orders saved</p>
        </div>
      </div>
      
      <p class="text-[10px] text-gray-600 mt-4 italic">*Estimates based on average 30% RTO reduction observed across our network.</p>
    </div>
  </div>
</template>

<script setup>
const orders = ref(1000)
const aov = ref(1500)
const rtoRate = ref(20)

// Logic: 
// 1. Current RTO Orders = orders * (rtoRate / 100)
// 2. We reduce RTO by ~30% on average.
// 3. Saved Orders = Current RTO Orders * 0.30
// 4. Saved Revenue = Saved Orders * AOV
// 5. Saved Logistics (Forward + Reverse) = Saved Orders * 200 (approx)
// Total Savings = Saved Revenue + Saved Logistics

const recoveredOrders = computed(() => {
  return Math.round((orders.value * (rtoRate.value / 100)) * 0.30)
})

const estimatedSavings = computed(() => {
  const revenueSaved = recoveredOrders.value * aov.value
  const logisticsSaved = recoveredOrders.value * 150 // Conservative estimate for logistics
  return revenueSaved + logisticsSaved
})

const estimatedSavingsFormatted = computed(() => {
    if (estimatedSavings.value >= 10000000) {
        return (estimatedSavings.value / 10000000).toFixed(2) + ' Cr';
    } else if (estimatedSavings.value >= 100000) {
        return (estimatedSavings.value / 100000).toFixed(2) + ' L';
    } else {
        return estimatedSavings.value.toLocaleString('en-IN')
    }
})
</script>
