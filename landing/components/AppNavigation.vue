<template>
  <nav class="w-full bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 relative z-50">
    <div class="container mx-auto px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:cube" class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="font-bold text-xl text-gray-900">DigiHub</div>
            <div class="text-xs text-gray-500 -mt-1">ChannelConnector</div>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Home
          </NuxtLink>
          <NuxtLink to="/about" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            About
          </NuxtLink>
          <div class="relative group">
            <button class="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center">
              Features
              <Icon name="heroicons:chevron-down" class="w-4 h-4 ml-1" />
            </button>
             <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
               <div class="p-4 space-y-2">
                <NuxtLink to="/features/multi-channel-integration" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Multi-Channel Integration
                </NuxtLink>
                <NuxtLink to="/features/real-time-synchronization" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Real-time Synchronization
                </NuxtLink>
                <NuxtLink to="/features/order-processing" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Order Processing
                </NuxtLink>
                <NuxtLink to="/features/logistics-management" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Logistics Management
                </NuxtLink>
                <NuxtLink to="/features/real-time-tracking" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Real-time Tracking
                </NuxtLink>
              </div>
            </div>
          </div>
          <NuxtLink to="/contact" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Contact
          </NuxtLink>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          
          <button class="btn-primary text-sm py-2 px-6">
            <NuxtLink to="/contact" class="text-white-700 hover:text-blue-600 font-medium transition-colors">
            Get Started
          </NuxtLink>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMobileMenu" 
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      v-show="mobileMenuOpen" 
      class="md:hidden bg-white border-t border-gray-100"
    >
      <div class="container mx-auto px-6 py-4 space-y-4">
        <NuxtLink to="/" class="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Home
        </NuxtLink>
        <NuxtLink to="/about" class="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
          About
        </NuxtLink>
          <div class="space-y-2">
            <div class="text-gray-700 font-medium">Features</div>
            <div class="pl-4 space-y-2 text-sm">
              <NuxtLink to="/features/multi-channel-integration" class="block text-gray-600 hover:text-blue-600 transition-colors">Multi-Channel Integration</NuxtLink>
              <NuxtLink to="/features/real-time-synchronization" class="block text-gray-600 hover:text-blue-600 transition-colors">Real-time Synchronization</NuxtLink>
              <NuxtLink to="/features/order-processing" class="block text-gray-600 hover:text-blue-600 transition-colors">Order Processing</NuxtLink>
              <NuxtLink to="/features/logistics-management" class="block text-gray-600 hover:text-blue-600 transition-colors">Logistics Management</NuxtLink>
              <NuxtLink to="/features/real-time-tracking" class="block text-gray-600 hover:text-blue-600 transition-colors">Real-time Tracking</NuxtLink>
            </div>
          </div>
        <NuxtLink to="/contact" class="block text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Contact
        </NuxtLink>
        <div class="pt-4 border-t border-gray-100 space-y-2">
          <button class="block w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Login
          </button>
          <button class="btn-primary w-full text-sm py-2">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu when clicking outside or on route change
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
      mobileMenuOpen.value = false
    }
  })
})

// Close mobile menu on route change
watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false
})
</script>
