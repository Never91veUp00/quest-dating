import { defineStore } from 'pinia'

// Заготовка для будущей корзины (если будет несколько заказов одновременно)
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0
  }),

  getters: {
    itemCount: (state) => state.items.length,
    
    cartTotal: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },

    hasItems: (state) => state.items.length > 0
  },

  actions: {
    addItem(item) {
      const existingItem = this.items.find(i => i.id === item.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...item,
          quantity: 1
        })
      }
      
      this.updateTotal()
    },

    removeItem(itemId) {
      const index = this.items.findIndex(i => i.id === itemId)
      
      if (index > -1) {
        this.items.splice(index, 1)
      }
      
      this.updateTotal()
    },

    updateQuantity(itemId, quantity) {
      const item = this.items.find(i => i.id === itemId)
      
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
      
      this.updateTotal()
    },

    clearCart() {
      this.items = []
      this.total = 0
    },

    updateTotal() {
      this.total = this.cartTotal
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage
      }
    ]
  }
})