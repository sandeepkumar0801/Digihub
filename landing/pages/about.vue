<template>
  <div>
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Hero Section -->
    <section class="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span class="gradient-text">DigiHub</span>
          </h1>
          <p class="text-xl text-gray-600 leading-relaxed">
            We're revolutionizing e-commerce operations with our comprehensive 
            channel connector and logistics management platform, empowering businesses 
            to scale efficiently across multiple marketplaces.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              To simplify and streamline multi-channel e-commerce operations by providing 
              an integrated platform that connects, synchronizes, and optimizes every aspect 
              of online retail - from product management to order fulfillment.
            </p>
            <p class="text-lg text-gray-600 leading-relaxed">
              We believe that businesses should focus on growth, not on managing complex 
              integrations and manual processes. That's why we've built DigiHub to be 
              the central nervous system of modern e-commerce operations.
            </p>
          </div>
          <div class="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <div class="text-center">
              <Icon name="heroicons:target" class="w-20 h-20 text-blue-600 mx-auto mb-4" />
              <h3 class="text-2xl font-bold text-gray-900">Mission Driven</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Story -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl font-bold text-gray-900 text-center mb-12">Our Story</h2>
          <div class="space-y-8">
            <div class="bg-white rounded-2xl p-8 shadow-lg">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:light-bulb" class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">The Problem</h3>
                  <p class="text-gray-600 leading-relaxed">
                    We witnessed countless e-commerce businesses struggling with fragmented systems, 
                    manual data entry, inventory discrepancies, and operational inefficiencies. 
                    Managing multiple sales channels was becoming a nightmare rather than an opportunity.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-8 shadow-lg">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">The Solution</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Our team of experienced developers and e-commerce specialists came together to 
                    build DigiHub - a comprehensive platform that would eliminate these pain points 
                    through intelligent automation and seamless integrations.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-8 shadow-lg">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:rocket-launch" class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">The Impact</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Today, DigiHub powers thousands of e-commerce operations worldwide, helping 
                    businesses reduce operational costs by 40%, improve efficiency by 70%, and 
                    scale their operations without the traditional complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do and drive our commitment to excellence
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:star" class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
            <p class="text-gray-600">
              We strive for excellence in every aspect of our platform, from code quality 
              to customer support, ensuring our users get the best possible experience.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:users" class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Customer-Centric</h3>
            <p class="text-gray-600">
              Our customers' success is our success. Every feature we build and decision 
              we make is guided by how it will benefit our users and their businesses.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:bolt" class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p class="text-gray-600">
              We continuously innovate and adapt to the evolving e-commerce landscape, 
              ensuring our platform stays ahead of industry trends and requirements.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:shield-check" class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Reliability</h3>
            <p class="text-gray-600">
              With 99.9% uptime and enterprise-grade security, we ensure our platform 
              is always available when you need it most, handling your critical operations.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:puzzle-piece" class="w-8 h-8 text-indigo-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Simplicity</h3>
            <p class="text-gray-600">
              We believe powerful doesn't have to mean complicated. Our intuitive interfaces 
              and streamlined workflows make complex operations simple and manageable.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:heart" class="w-8 h-8 text-red-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Transparency</h3>
            <p class="text-gray-600">
              We maintain complete transparency in our operations, pricing, and communication, 
              building trust through honest and open relationships with our clients.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            A diverse group of experts passionate about transforming e-commerce operations
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Team Member 1 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">John Smith</h3>
            <p class="text-blue-600 font-medium mb-4">Chief Executive Officer</p>
            <p class="text-gray-600 text-sm">
              15+ years in e-commerce technology with a passion for solving complex 
              operational challenges through innovative solutions.
            </p>
          </div>
          
          <!-- Team Member 2 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sarah Johnson</h3>
            <p class="text-green-600 font-medium mb-4">Chief Technology Officer</p>
            <p class="text-gray-600 text-sm">
              Expert in distributed systems and API integrations, leading our technical 
              vision and ensuring platform scalability and reliability.
            </p>
          </div>
          
          <!-- Team Member 3 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Mike Chen</h3>
            <p class="text-purple-600 font-medium mb-4">Head of Product</p>
            <p class="text-gray-600 text-sm">
              Product strategist with deep understanding of e-commerce workflows, 
              driving feature development based on real user needs.
            </p>
          </div>
          
          <!-- Team Member 4 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Lisa Rodriguez</h3>
            <p class="text-orange-600 font-medium mb-4">Head of Customer Success</p>
            <p class="text-gray-600 text-sm">
              Dedicated to ensuring our clients achieve maximum value from DigiHub, 
              with expertise in e-commerce operations and customer support.
            </p>
          </div>
          
          <!-- Team Member 5 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">David Kumar</h3>
            <p class="text-indigo-600 font-medium mb-4">Lead DevOps Engineer</p>
            <p class="text-gray-600 text-sm">
              Infrastructure specialist ensuring 99.9% uptime and seamless deployments 
              across our Azure-based cloud architecture.
            </p>
          </div>
          
          <!-- Team Member 6 -->
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-12 h-12 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Emma Thompson</h3>
            <p class="text-pink-600 font-medium mb-4">UX/UI Design Lead</p>
            <p class="text-gray-600 text-sm">
              Creative designer focused on creating intuitive and beautiful interfaces 
              that make complex operations simple and enjoyable.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 hero-gradient text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          Ready to Join Our Success Story?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Experience the difference DigiHub can make for your e-commerce operations. 
          Join thousands of businesses already transforming their workflows.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="btn-primary bg-white text-blue-600 hover:bg-gray-100">
            <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
            Start Your Journey
          </button>
          <NuxtLink to="/contact" class="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5 mr-2" />
            Talk to Our Team
          </NuxtLink>
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
  title: 'About DigiHub - E-commerce Channel Connector & Logistics Management',
  meta: [
    {
      name: 'description',
      content: 'Learn about DigiHub\'s mission to revolutionize e-commerce operations through comprehensive channel integration and logistics management. Meet our team and discover our story.'
    },
    {
      property: 'og:title',
      content: 'About DigiHub - E-commerce Channel Connector & Logistics Management'
    },
    {
      property: 'og:description',
      content: 'Discover how DigiHub is transforming e-commerce operations with our integrated platform for multi-channel management and logistics automation.'
    }
  ]
})
</script>
