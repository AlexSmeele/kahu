import { useState, useMemo } from "react";
import { Search, Filter, ShoppingCart, Star, ShoppingBag } from "lucide-react";
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
    category: "Bedding",
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
];

const categories = ["All", "Food", "Toys", "Accessories", "Treats", "Bedding", "Training"];

export function MarketplaceScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <Button variant="ghost" size="sm" className="p-2">
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products, suppliers, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-start">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="self-stretch min-h-[2.5rem]">
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
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-foreground ml-1">{product.rating}</span>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div className="text-lg font-bold text-primary">
                  ${product.price.toFixed(2)}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  disabled={!product.inStock}
                  variant={product.inStock ? "default" : "secondary"}
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
    </div>
  );
}