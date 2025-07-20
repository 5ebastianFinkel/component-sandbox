<template>
  <div class="product-card">
    <h2 class="product-card__title">{{ productName }}</h2>
    <p class="product-card__subtitle">{{ subtitle }}</p>
    <p class="product-card__price">${{ price }}</p>
    <p class="product-card__description">{{ description }}</p>
    <button 
      class="product-card__button"
      @click="handleAddToCart"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">

interface ProductCardProps {
  productName?: string
  subtitle?: string
  price?: string
  description?: string
  buttonText?: string
}

interface ProductCardEmits {
  (e: 'add-to-cart'): void
}


const props = withDefaults(defineProps<ProductCardProps>(), {
  productName: 'Product name',
  subtitle: 'Subheading',
  price: '10.99',
  description: 'Body text for describing what this product is and why this product is simply a must-buy.',
  buttonText: 'Add to cart'
})

const emit = defineEmits<ProductCardEmits>()

const handleAddToCart = () => {
  emit('add-to-cart')
}
</script>

<style scoped lang="scss">
.product-card {
  background-color: var(--color-white, #FFFFFF);
  padding: 0;
  max-width: 515px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__title {
    color: var(--color-black, #000000);
    font-size: 40px;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  &__subtitle {
    color: #828282;
    font-size: 24px;
    font-weight: 400;
    margin: 0;
    line-height: 1.5;
  }

  &__price {
    color: var(--color-black, #000000);
    font-size: 24px;
    font-weight: 500;
    margin: 0;
    line-height: 1.5;
  }

  &__description {
    color: #828282;
    font-size: 20px;
    font-weight: 400;
    margin: 0;
    line-height: 1.5;
  }

  &__button {
    width: 100%;
    background-color: var(--color-black, #000000);
    color: var(--color-white, #FFFFFF);
    border: none;
    border-radius: 8px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s ease;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);

    &:hover {
      opacity: 0.85;
    }

    &:active {
      opacity: 0.75;
    }
  }
}
</style>