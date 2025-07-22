import type { Meta, StoryObj } from '@storybook/vue3'
import ProductCard from './ProductCard.vue'

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    productName: { control: 'text' },
    subtitle: { control: 'text' },
    price: { control: 'text' },
    description: { control: 'text' },
    buttonText: { control: 'text' },
  },
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    productName: 'Product Name',
    subtitle: 'This is a subheading that accompanies your product',
    price: '10.99',
    description: 'Body text for describing what this product is and why this product is simply a must-buy.',
    buttonText: 'Add to cart',
  },
}

export const CustomProduct: Story = {
  args: {
    productName: 'Premium Coffee Beans',
    subtitle: 'Single-origin Arabica from Colombia',
    price: '24.99',
    description: 'Experience the rich, smooth flavor of our hand-picked Colombian coffee beans. Roasted to perfection for the ultimate coffee experience.',
    buttonText: 'Add to cart',
  },
}

export const LongContent: Story = {
  args: {
    productName: 'Extra Long Product Name That Might Wrap to Multiple Lines',
    subtitle: 'This is a much longer subheading that demonstrates how the component handles extended text content gracefully',
    price: '199.99',
    description: 'This is a significantly longer description that tests how the component handles multiple lines of body text. It includes detailed information about the product features, benefits, and why customers should consider purchasing it. The text should wrap naturally and maintain proper spacing.',
    buttonText: 'Add to cart',
  },
}

export const Interactive: Story = {
  args: {
    productName: 'Interactive Demo',
    subtitle: 'Click the button to see the event in action',
    price: '15.00',
    description: 'This story demonstrates the interactive functionality. Try clicking the "Add to cart" button and typing in the text field.',
    buttonText: 'Add to cart',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = canvasElement as HTMLElement
    const input = canvas.querySelector('.product-card__input') as HTMLInputElement
    const button = canvas.querySelector('.product-card__button') as HTMLButtonElement
    
    // Simulate user typing
    if (input) {
      input.value = 'Gift wrapping please!'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    
    // Wait a moment then click the button
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (button) {
      button.click()
    }
  }
}