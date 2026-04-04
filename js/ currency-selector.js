/**
 * Currency Selector Component for EV Finder
 * Handles multi-currency display and conversion
 */

class CurrencySelector {
    constructor() {
        this.currencies = [];
        this.selectedCurrency = null;
        // Use global API_BASE_URL from config.js
        this.apiBaseUrl = window.API_BASE_URL ? window.API_BASE_URL.replace('/api', '') : 'http://localhost:5000/api';
        this.init();
    }

    async init() {
        await this.loadCurrencies();
        await this.loadUserPreference();
        this.renderSelector();
        this.setupEventListeners();
    }

    async loadCurrencies() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/currency`);
            if (response.ok) {
                this.currencies = await response.json();
                console.log('✅ Currencies loaded:', this.currencies.length);
            } else {
                console.warn('Using fallback currencies');
                this.useFallbackCurrencies();
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
            this.useFallbackCurrencies();
        }
    }

    useFallbackCurrencies() {
        this.currencies = [
            { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1, isDefault: true },
            { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92, isDefault: false },
            { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79, isDefault: false },
            { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 83.5, isDefault: false },
            { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 151.5, isDefault: false },
            { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 1.37, isDefault: false },
            { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.53, isDefault: false },
            { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', exchangeRate: 7.24, isDefault: false }
        ];
    }

    async loadUserPreference() {
        const savedCurrency = localStorage.getItem('preferredCurrency');
        
        if (savedCurrency) {
            try {
                this.selectedCurrency = JSON.parse(savedCurrency);
                console.log('📦 Loaded currency from localStorage:', this.selectedCurrency.code);
            } catch {
                this.selectedCurrency = this.currencies.find(c => c.isDefault) || this.currencies[0];
            }
        } else {
            // Try to get default from backend
            try {
                const token = localStorage.getItem('token');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const response = await fetch(`${this.apiBaseUrl}/api/currency/user-preference`, { headers });
                if (response.ok) {
                    const defaultCurrency = await response.json();
                    this.selectedCurrency = defaultCurrency;
                } else {
                    this.selectedCurrency = this.currencies.find(c => c.isDefault) || this.currencies[0];
                }
            } catch {
                this.selectedCurrency = this.currencies.find(c => c.isDefault) || this.currencies[0];
            }
        }
        
        // Save to localStorage
        localStorage.setItem('preferredCurrency', JSON.stringify(this.selectedCurrency));
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('currencyLoaded', { 
            detail: { currency: this.selectedCurrency } 
        }));
    }

    renderSelector() {
        // Check if selector already exists
        let selectorContainer = document.getElementById('currency-selector-container');
        if (!selectorContainer) {
            selectorContainer = document.createElement('div');
            selectorContainer.id = 'currency-selector-container';
            selectorContainer.className = 'fixed top-20 right-4 z-50';
            document.body.appendChild(selectorContainer);
        }

        selectorContainer.innerHTML = `
            <div class="relative inline-block text-left">
                <div>
                    <button type="button" id="currency-menu-button" class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <span id="selected-currency-display" class="flex items-center">
                            <span class="mr-1">${this.selectedCurrency?.symbol || '$'}</span>
                            <span>${this.selectedCurrency?.code || 'USD'}</span>
                        </span>
                        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div id="currency-dropdown" class="hidden origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50 max-h-96 overflow-y-auto">
                    <div class="py-1" role="none">
                        <div class="px-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-50">
                            Select Currency
                        </div>
                        ${this.currencies.map(currency => {
                            const isSelected = this.selectedCurrency?.code === currency.code;
                            return `
                            <a href="#" class="currency-option flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 ${isSelected ? 'bg-green-50' : ''}" 
                               data-code="${currency.code}" 
                               data-symbol="${currency.symbol}" 
                               data-rate="${currency.exchangeRate}"
                               data-name="${currency.name}">
                                <div class="flex items-center">
                                    <span class="inline-block w-8 text-lg font-medium">${currency.symbol}</span>
                                    <span class="inline-block w-12 font-medium">${currency.code}</span>
                                    <span class="text-xs text-gray-500 ml-2">${currency.name}</span>
                                </div>
                                ${isSelected ? '<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
                            </a>
                        `}).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add event listener to the button
        const menuButton = document.getElementById('currency-menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('currency-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('hidden');
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('currency-dropdown');
            if (dropdown && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
            }
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.currency-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const code = option.dataset.code;
                const symbol = option.dataset.symbol;
                const rate = parseFloat(option.dataset.rate);
                const name = option.dataset.name;
                
                const currency = {
                    code,
                    symbol,
                    exchangeRate: rate,
                    name
                };
                
                this.selectedCurrency = currency;
                localStorage.setItem('preferredCurrency', JSON.stringify(currency));
                
                // Update display
                const displaySpan = document.getElementById('selected-currency-display');
                if (displaySpan) {
                    displaySpan.innerHTML = `
                        <span class="mr-1">${symbol}</span>
                        <span>${code}</span>
                    `;
                }
                
                // Close dropdown
                const dropdown = document.getElementById('currency-dropdown');
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
                
                // Trigger custom event for other components
                window.dispatchEvent(new CustomEvent('currencyChanged', { 
                    detail: { currency } 
                }));
                
                // Show toast notification
                this.showToast(`Currency changed to ${code} (${symbol})`);
                
                // Update all prices on the page
                this.updateAllPrices();
            });
        });
    }

    showToast(message) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg mb-2 animate-slideIn';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 3000);
    }

    // Convert price from USD to selected currency
    convertPrice(priceInUSD) {
        if (!this.selectedCurrency) return { value: priceInUSD, symbol: '$', code: 'USD' };
        
        const convertedPrice = priceInUSD * this.selectedCurrency.exchangeRate;
        return {
            value: convertedPrice,
            symbol: this.selectedCurrency.symbol,
            code: this.selectedCurrency.code,
            formatted: `${this.selectedCurrency.symbol}${convertedPrice.toFixed(2)}`
        };
    }

    // Convert price from any currency to USD
    convertToUSD(price, fromCurrency) {
        if (!fromCurrency || !fromCurrency.exchangeRate) return price;
        return price / fromCurrency.exchangeRate;
    }

    // Get current currency
    getCurrentCurrency() {
        return this.selectedCurrency || { code: 'USD', symbol: '$', exchangeRate: 1, name: 'US Dollar' };
    }

    // Update all prices on the page
    updateAllPrices() {
        document.querySelectorAll('[data-price-usd]').forEach(el => {
            const priceUSD = parseFloat(el.dataset.priceUsd);
            const converted = this.convertPrice(priceUSD);
            el.textContent = converted.formatted;
        });
        
        // Also update any elements with price class
        document.querySelectorAll('.price-amount').forEach(el => {
            const priceUSD = parseFloat(el.dataset.priceUsd);
            if (!isNaN(priceUSD)) {
                const converted = this.convertPrice(priceUSD);
                el.textContent = converted.formatted;
            }
        });
    }

    // Format price with current currency
    formatPrice(priceUSD) {
        const converted = this.convertPrice(priceUSD);
        return converted.formatted;
    }
}

// Initialize currency selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure config.js is loaded
    setTimeout(() => {
        if (typeof window.API_BASE_URL !== 'undefined') {
            window.currencySelector = new CurrencySelector();
        } else {
            console.warn('API_BASE_URL not defined, currency selector will retry');
            setTimeout(() => {
                window.currencySelector = new CurrencySelector();
            }, 500);
        }
    }, 100);
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slideIn {
        animation: slideIn 0.3s ease-out;
    }
    
    #currency-dropdown {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .currency-option {
        transition: all 0.2s;
    }
    
    .currency-option:hover {
        background-color: #f3f4f6;
    }
`;
document.head.appendChild(style);
