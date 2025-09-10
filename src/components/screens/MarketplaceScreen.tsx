import { useState, useMemo } from "react";
import { Search, Filter, ShoppingCart, Star, ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { OrderHistoryModal } from "@/components/marketplace/OrderHistoryModal"; 
import { NotificationsDrawer } from "@/components/notifications/NotificationsDrawer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  price: number;
  supplier: string;
  category: string;
  rating: number;
  imageUrl: string;
  description: string;
  inStock: boolean;
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Dog Food - Chicken & Rice",
    price: 45.99,
    supplier: "Royal Canin",
    category: "Food",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop",
    description: "High-quality nutrition for adult dogs",
    inStock: true,
  },
  {
    id: "2",
    name: "Interactive Puzzle Toy",
    price: 24.99,
    supplier: "Kong",
    category: "Toys",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop",
    description: "Mental stimulation puzzle for smart dogs",
    inStock: true,
  },
  {
    id: "3",
    name: "Adjustable Harness",
    price: 32.50,
    supplier: "Ruffwear",
    category: "Accessories",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    description: "Comfortable and secure harness",
    inStock: false,
  },
  {
    id: "4",
    name: "Dental Chew Treats",
    price: 18.99,
    supplier: "Greenies",
    category: "Treats",
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    description: "Promotes dental health and fresh breath",
    inStock: true,
  },
  {
    id: "5",
    name: "Orthopedic Dog Bed",
    price: 89.99,
    supplier: "PetSafe",
    category: "Beds",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop",
    description: "Memory foam bed for joint support",
    inStock: true,
  },
  {
    id: "6",
    name: "Training Clicker Set",
    price: 12.99,
    supplier: "PetSmart",
    category: "Training",
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop",
    description: "Professional training clicker with wrist strap",
    inStock: true,
  },
  {
    id: "7",
    name: "Slow Feeder Bowl",
    price: 19.99,
    supplier: "Outward Hound",
    category: "Food",
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=300&h=300&fit=crop",
    description: "Reduces eating speed and bloating",
    inStock: true,
  },
  {
    id: "8",
    name: "GPS Tracking Collar",
    price: 149.99,
    supplier: "Whistle",
    category: "Accessories",
    rating: 4.2,
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    description: "Real-time location tracking and activity monitoring",
    inStock: true,
  },
  {
    id: "9",
    name: "Omega-3 Fish Oil Supplement",
    price: 28.99,
    supplier: "Zesty Paws",
    category: "Health",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
    description: "Supports healthy skin, coat, and joints",
    inStock: true,
  },
  {
    id: "10",
    name: "Dog Toothbrush Set",
    price: 15.99,
    supplier: "Arm & Hammer",
    category: "Health",
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&h=300&fit=crop",
    description: "Complete dental care kit with finger brush",
    inStock: true,
  },
  {
    id: "11",  
    name: "Enzymatic Toothpaste",
    price: 12.50,
    supplier: "Virbac",
    category: "Health",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1563865436874-9aef32095fda?w=300&h=300&fit=crop",
    description: "Poultry-flavored enzymatic toothpaste",
    inStock: true,
  },
  {
    id: "12",
    name: "Joint Support Supplement",
    price: 34.99,
    supplier: "Nutramax",
    category: "Health",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop",
    description: "Glucosamine and chondroitin for joint health",
    inStock: true,
  },
  {
    id: "13",
    name: "Probiotic Chews",
    price: 24.99,
    supplier: "PetHonesty",
    category: "Health", 
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300&h=300&fit=crop",
    description: "Digestive health support with probiotics",
    inStock: true,
  },
  {
    id: "14",
    name: "Ear Cleaning Solution",
    price: 18.99,
    supplier: "Vet's Best",
    category: "Health",
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    description: "Gentle formula for regular ear cleaning",
    inStock: true,
  }
];

const categories = ["All", "Food", "Toys", "Accessories", "Treats", "Beds", "Training", "Health"];

export function MarketplaceScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    supplier: string;
  }>>([]);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        supplier: product.supplier,
      }];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout successful!",
      description: `Order placed for ${cartItems.length} items. Total: $${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`,
    });
    setCartItems([]);
  };

  const handleReorder = (items: Array<{ id: string; name: string; price: number; quantity: number; imageUrl: string; supplier: string; }>) => {
    setCartItems(prev => {
      const newItems = [...prev];
      items.forEach(reorderItem => {
        const existingItemIndex = newItems.findIndex(item => item.id === reorderItem.id);
        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += reorderItem.quantity;
        } else {
          newItems.push({ ...reorderItem });
        }
      });
      return newItems;
    });
    
    toast({
      title: "Items added to cart",
      description: `${items.length} items from your previous order have been added to cart.`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <div className="flex items-center gap-2">
            <NotificationsDrawer />
            <CartDrawer
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleCheckout}
              onViewOrderHistory={() => setIsOrderHistoryOpen(true)}
            />
          </div>
        </div>
        
        {/* Search and Sort Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search product and suppliers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-24">
                <Filter className="w-4 h-4 mr-2" />
                {sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border border-border">
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price')}>
                Price
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Rating
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer flex-grow text-center justify-center min-w-[80px]"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden bg-card border border-border">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                    ${product.price.toFixed(2)}
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">by</span>
                  <Badge variant="outline">{product.supplier}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-foreground ml-1">{product.rating}</span>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  disabled={!product.inStock}
                  variant={product.inStock ? "default" : "secondary"}
                  onClick={() => product.inStock && handleAddToCart(product)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onReorder={handleReorder}
      />
    </div>
  );
}