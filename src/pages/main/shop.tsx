import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingPage from "@src/components/loading";

// Define types for shop items and inventory
interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  category: "avatar" | "background" | "badge" | "theme" | "powerup";
  isAvailable: boolean;
}

interface InventoryItem {
  itemId: string;
  dateAcquired: Date;
  isEquipped: boolean;
  details: ShopItem;
}

// Define types for API responses
interface ShopItemsResponse {
  message: string;
  shopItems: ShopItem[];
}

interface InventoryResponse {
  message: string;
  inventory: InventoryItem[];
}

interface PurchaseResponse {
  message: string;
  item: ShopItem;
  remainingGems: number;
}

// Tab options for the shop
type ShopTab = "shop" | "inventory";

// Category icons and labels
const categoryConfig: Record<string, { icon: string; label: string; gradient: string }> = {
  background: { icon: "🏞️", label: "Banners", gradient: "from-purple-500 to-pink-500" },
  badge: { icon: "🏅", label: "Badges", gradient: "from-yellow-500 to-orange-500" },
  avatar: { icon: "👤", label: "Avatars", gradient: "from-blue-500 to-cyan-500" },
  theme: { icon: "🎨", label: "Themes", gradient: "from-green-500 to-emerald-500" },
  powerup: { icon: "⚡", label: "Power-ups", gradient: "from-red-500 to-rose-500" },
};

const Shop = () => {
  const navigate = useNavigate();
  const { user, setUser, getAuthHeader } = useAuth();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>("shop");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch shop items and user inventory
  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch shop items
        const shopResponse = await fetch(`${API_BASE_URL}/shop/getShopItems`, {
          credentials: "include",
          headers: await getAuthHeader()
        });

        if (!shopResponse.ok) {
          throw new Error(`Failed to fetch shop items: ${shopResponse.status}`);
        }

        const shopData: ShopItemsResponse = await shopResponse.json();
        setShopItems(shopData.shopItems);

        // Fetch user inventory if user is logged in
        if (user?._id) {
          const inventoryResponse = await fetch(
            `${API_BASE_URL}/shop/userInventory/${user._id}`,
            {
              credentials: "include",
              headers: await getAuthHeader()
            }
          );

          if (inventoryResponse.ok) {
            const inventoryData: InventoryResponse = await inventoryResponse.json();
            setInventory(inventoryData.inventory || []);
          } else {
            console.warn("Could not fetch user inventory", await inventoryResponse.text());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shop data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [user]);

  // Handle purchase of an item
  const handlePurchase = async (itemId: string) => {
    if (!user?._id) {
      setPurchaseStatus({
        status: "error",
        message: "You need to be logged in to make purchases"
      });
      return;
    }

    // Check if user already owns this item
    const alreadyOwns = inventory.some(item => item.itemId === itemId);
    if (alreadyOwns) {
      setPurchaseStatus({
        status: "error",
        message: "You already own this item"
      });
      return;
    }

    // Check if user has enough gems
    const item = shopItems.find(item => item.itemId === itemId);
    if (!item) {
      setPurchaseStatus({
        status: "error",
        message: "Item not found"
      });
      return;
    }

    if ((user.gems || 0) < item.price) {
      setPurchaseStatus({
        status: "error",
        message: "Not enough gems to purchase this item"
      });
      return;
    }

    // Proceed with purchase
    setPurchaseStatus({ status: "loading", message: "Processing purchase..." });

    try {
      const purchaseResponse = await fetch(`${API_BASE_URL}/shop/purchaseItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAuthHeader() },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          itemId: itemId
        })
      });

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json();
        throw new Error(errorData.message || "Purchase failed");
      }

      const purchaseData: PurchaseResponse = await purchaseResponse.json();

      // Update user's gems
      if (setUser && user) {
        setUser({ ...user, gems: purchaseData.remainingGems });
      }

      // Update inventory
      setInventory(prev => [
        ...prev,
        {
          itemId: purchaseData.item.itemId,
          dateAcquired: new Date(),
          isEquipped: false,
          details: purchaseData.item
        }
      ]);

      setPurchaseStatus({
        status: "success",
        message: purchaseData.message
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus({ status: "idle", message: "" });
      }, 3000);

    } catch (err) {
      setPurchaseStatus({
        status: "error",
        message: err instanceof Error ? err.message : "Purchase failed"
      });

      // Reset error status after 3 seconds
      setTimeout(() => {
        setPurchaseStatus({ status: "idle", message: "" });
      }, 3000);
    }
  };

  // Handle equipping/unequipping items
  const handleEquipToggle = async (itemId: string, currentlyEquipped: boolean) => {
    if (!user?._id) return;

    try {
      const equipResponse = await fetch(`${API_BASE_URL}/shop/equipItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...await getAuthHeader() },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          itemId: itemId,
          equip: !currentlyEquipped
        })
      });

      if (!equipResponse.ok) {
        const errorData = await equipResponse.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      // Update inventory to reflect changes
      setInventory(prev => {
        // Get the category of the item being equipped
        const itemToToggle = prev.find(item => item.itemId === itemId);
        if (!itemToToggle) return prev;

        const category = itemToToggle.details.category;

        return prev.map(item => {
          // If this is the item being toggled, update its equipped state
          if (item.itemId === itemId) {
            return { ...item, isEquipped: !currentlyEquipped };
          }

          // If equipping an item, unequip other items of the same category
          if (!currentlyEquipped &&
            item.details.category === category &&
            item.isEquipped &&
            item.itemId !== itemId) {
            return { ...item, isEquipped: false };
          }

          return item;
        });
      });

    } catch (err) {
      console.error("Failed to equip/unequip item:", err);
    }
  };

  // Group shop items by category
  const shopItemsByCategory = shopItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);

  // Group inventory items by category
  const inventoryByCategory = inventory.reduce((acc, item) => {
    const category = item.details.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  // Get available categories
  const availableCategories = Object.keys(shopItemsByCategory);

  // Filter items based on selected category
  const filteredCategories = selectedCategory
    ? [selectedCategory]
    : ["background", "badge", "avatar", "theme", "powerup"];

  // Loading state
  if (loading) {
    return <LoadingPage message="Loading shop..." fullScreen={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex flex-col items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-base sm:text-lg text-red-600 dark:text-red-400 mb-4 font-medium">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 pt-2 sm:pt-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 pb-24 sm:pb-20">

        {/* Header Section with Glassmorphism */}
        <div className="glass-card rounded-lg sm:rounded-2xl p-2.5 sm:p-4 md:p-5 mb-3 sm:mb-6 fade-in-stagger border border-white/20 dark:border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            {/* Shop Title with Gradient */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-2xl">🛒</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text">
                  Shop
                </h1>
                <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                  Customize your learning experience
                </p>
              </div>
            </div>

            {/* User Gems Badge with Enhanced Styling */}
            <div className="glass-card px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group border border-cyan-200/50 dark:border-cyan-800/50">
              <span className="text-base sm:text-xl group-hover:scale-110 transition-transform duration-300">💎</span>
              <span className="font-bold text-xs sm:text-base bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                {user?.gems || 0}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">gems</span>
            </div>
          </div>

          {/* Tab Navigation with Pill Style */}
          <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 p-0.5 sm:p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex-1 py-1.5 sm:py-2.5 px-2 sm:px-4 text-xs sm:text-base font-semibold rounded-md sm:rounded-lg transition-all duration-300 ${activeTab === "shop"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
            >
              <span className="mr-1 sm:mr-1.5">🛍️</span>
              Shop
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-1.5 sm:py-2.5 px-2 sm:px-4 text-xs sm:text-base font-semibold rounded-md sm:rounded-lg transition-all duration-300 ${activeTab === "inventory"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
            >
              <span className="mr-1 sm:mr-1.5">📦</span>
              Items ({inventory.length})
            </button>
          </div>
        </div>

        {/* Purchase Status Message with Animation */}
        {purchaseStatus.status !== "idle" && (
          <div
            className={`mb-3 sm:mb-4 p-2 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-base font-medium shadow-lg fade-in-stagger flex items-center gap-2 sm:gap-3 ${purchaseStatus.status === "success"
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
              : purchaseStatus.status === "error"
                ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                : "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
              }`}
          >
            <span className="text-base sm:text-xl">
              {purchaseStatus.status === "success" ? "✅" : purchaseStatus.status === "error" ? "❌" : "⏳"}
            </span>
            {purchaseStatus.message}
          </div>
        )}

        {/* Shop Tab Content */}
        {activeTab === "shop" && (
          <div className="space-y-4 sm:space-y-6">

            {/* Category Filter Pills */}
            <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-4 fade-in-stagger border border-white/20 dark:border-white/10" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-medium rounded-full transition-all duration-300 ${!selectedCategory
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                  All
                </button>
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-1.5 ${selectedCategory === category
                      ? `bg-gradient-to-r ${categoryConfig[category]?.gradient || "from-gray-500 to-gray-600"} text-white shadow-md`
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-xs sm:text-base">{categoryConfig[category]?.icon}</span>
                    <span className="hidden sm:inline">{categoryConfig[category]?.label || category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Sections */}
            {filteredCategories.map((category, categoryIndex) => {
              const categoryItems = shopItemsByCategory[category] || [];
              if (categoryItems.length === 0) return null;

              const config = categoryConfig[category] || { icon: "📦", label: category, gradient: "from-gray-500 to-gray-600" };

              return (
                <div
                  key={category}
                  className="glass-card rounded-xl sm:rounded-2xl overflow-hidden fade-in-stagger border border-white/20 dark:border-white/10"
                  style={{ animationDelay: `${(categoryIndex + 1) * 100}ms` }}
                >
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${config.gradient} p-2 sm:p-4`}>
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <span className="text-base sm:text-2xl">{config.icon}</span>
                      <h2 className="text-sm sm:text-lg md:text-xl font-bold text-white">
                        {config.label}
                      </h2>
                      <span className="ml-auto px-1.5 py-0.5 sm:px-2 bg-white/20 rounded-full text-[10px] sm:text-sm text-white font-medium">
                        {categoryItems.length}
                      </span>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="p-2 sm:p-4">
                    <div className={`grid gap-2 sm:gap-4 ${category === 'background'
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                      }`}>
                      {categoryItems.map((item, itemIndex) => {
                        const isOwned = inventory.some(i => i.itemId === item.itemId);
                        const canAfford = (user?.gems || 0) >= item.price;

                        return (
                          <div
                            key={item.itemId}
                            className={`group relative bg-white dark:bg-gray-800/80 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl card-lift ${isOwned
                              ? "border-green-300 dark:border-green-700"
                              : canAfford
                                ? "border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600"
                                : "border-gray-200 dark:border-gray-700 opacity-75"
                              }`}
                            style={{ animationDelay: `${itemIndex * 50}ms` }}
                          >
                            {/* Owned Badge */}
                            {isOwned && (
                              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] sm:text-xs font-bold rounded-full shadow-lg flex items-center gap-0.5 sm:gap-1">
                                <span>✓</span>
                                <span className="hidden sm:inline">Owned</span>
                              </div>
                            )}

                            {/* Item Image */}
                            <div className={`relative ${category === 'badge' ? 'h-20 sm:h-32' : 'h-24 sm:h-44'} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden`}>
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 flex items-center justify-center">
                                  <span className="text-2xl sm:text-4xl">{config.icon}</span>
                                </div>
                              )}

                              {/* Shimmer overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></div>
                            </div>

                            {/* Item Details */}
                            <div className="p-1.5 sm:p-3">
                              <h3 className="font-semibold text-[11px] sm:text-base text-gray-800 dark:text-white line-clamp-1 mb-0.5 sm:mb-1">
                                {item.name}
                              </h3>
                              <p className="text-[9px] sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 min-h-[1.5rem] sm:min-h-[2.5rem]">
                                {item.description}
                              </p>

                              {/* Price and Buy Button */}
                              <div className="flex items-center justify-between gap-1 sm:gap-2">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-cyan-50 dark:bg-cyan-900/30 rounded-md sm:rounded-lg">
                                  <span className="text-xs sm:text-base">💎</span>
                                  <span className="font-bold text-[10px] sm:text-base text-cyan-700 dark:text-cyan-300">
                                    {item.price}
                                  </span>
                                </div>

                                <button
                                  onClick={() => !isOwned && canAfford && handlePurchase(item.itemId)}
                                  disabled={isOwned || !canAfford || purchaseStatus.status === "loading"}
                                  className={`px-2 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition-all duration-300 ${isOwned
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default"
                                    : !canAfford
                                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-md hover:shadow-lg transform hover:scale-105"
                                    }`}
                                >
                                  {isOwned ? "✓" : !canAfford ? "More" : "Buy"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredCategories.every(cat => (shopItemsByCategory[cat] || []).length === 0) && (
              <div className="glass-card rounded-2xl p-8 text-center fade-in-stagger">
                <div className="text-5xl mb-4">🏪</div>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  No items available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab Content */}
        {activeTab === "inventory" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Empty Inventory State */}
            {inventory.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 sm:p-12 text-center fade-in-stagger border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Your inventory is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start collecting items from the shop to customize your profile!
                </p>
                <button
                  onClick={() => setActiveTab("shop")}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-2">🛍️</span>
                  Browse Shop
                </button>
              </div>
            ) : (
              /* Inventory Categories */
              Object.entries(inventoryByCategory).map(([category, items], categoryIndex) => {
                const config = categoryConfig[category] || { icon: "📦", label: category, gradient: "from-gray-500 to-gray-600" };

                return (
                  <div
                    key={category}
                    className="glass-card rounded-xl sm:rounded-2xl overflow-hidden fade-in-stagger border border-white/20 dark:border-white/10"
                    style={{ animationDelay: `${categoryIndex * 100}ms` }}
                  >
                    {/* Category Header */}
                    <div className={`bg-gradient-to-r ${config.gradient} p-3 sm:p-4`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">{config.icon}</span>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
                          {config.label}
                        </h2>
                        <span className="ml-auto px-2 py-0.5 bg-white/20 rounded-full text-xs sm:text-sm text-white font-medium">
                          {items.length} owned
                        </span>
                      </div>
                    </div>

                    {/* Inventory Items Grid */}
                    <div className="p-3 sm:p-4">
                      <div className={`grid gap-3 sm:gap-4 ${category === 'background'
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                        }`}>
                        {items.map((item, itemIndex) => (
                          <div
                            key={item.itemId}
                            className={`group relative bg-white dark:bg-gray-800/80 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl card-lift ${item.isEquipped
                              ? "border-cyan-400 dark:border-cyan-500 ring-2 ring-cyan-400/30"
                              : "border-gray-200 dark:border-gray-700"
                              }`}
                            style={{ animationDelay: `${itemIndex * 50}ms` }}
                          >
                            {/* Equipped Badge */}
                            {item.isEquipped && (
                              <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                                <span>⭐</span>
                                <span className="hidden sm:inline">Equipped</span>
                              </div>
                            )}

                            {/* Item Image */}
                            <div className={`relative ${category === 'badge' ? 'h-24 sm:h-32' : 'h-32 sm:h-44'} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden`}>
                              {item.details.imageUrl ? (
                                <img
                                  src={item.details.imageUrl}
                                  alt={item.details.name}
                                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 flex items-center justify-center">
                                  <span className="text-3xl sm:text-4xl">{config.icon}</span>
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className="p-2.5 sm:p-3">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white line-clamp-1 mb-1">
                                {item.details.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 min-h-[2.5rem]">
                                {item.details.description}
                              </p>

                              {/* Equip/Unequip Button */}
                              <button
                                onClick={() => handleEquipToggle(item.itemId, item.isEquipped)}
                                className={`w-full py-2 sm:py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${item.isEquipped
                                  ? "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500"
                                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-md hover:shadow-lg"
                                  }`}
                              >
                                {item.isEquipped ? "Unequip" : "Equip"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;