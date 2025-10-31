import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FoodInventoryItem {
  id: string;
  dog_id: string;
  food_name: string;
  brand?: string;
  food_type: string;
  quantity_remaining: number;
  unit: string;
  opened_date?: string;
  expiration_date?: string;
  batch_lot_number?: string;
  storage_location?: string;
  purchase_date?: string;
  purchase_cost?: number;
  low_stock_alert_threshold: number;
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useFoodInventory = (dogId?: string) => {
  const [inventoryItems, setInventoryItems] = useState<FoodInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventoryItems = useCallback(async () => {
    if (!dogId || dogId.startsWith('mock-')) {
      // Mock data for development
      setInventoryItems([
        {
          id: 'mock-1',
          dog_id: dogId || '',
          food_name: 'Premium Dry Food',
          brand: 'Royal Canin',
          food_type: 'Dry',
          quantity_remaining: 2.5,
          unit: 'kg',
          opened_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expiration_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          batch_lot_number: 'LOT123456',
          storage_location: 'Kitchen Pantry',
          purchase_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          purchase_cost: 45.99,
          low_stock_alert_threshold: 1.0,
          alert_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .eq('dog_id', dogId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching food inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  const addInventoryItem = async (item: Omit<FoodInventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!dogId || dogId.startsWith('mock-')) {
      console.log('Mock: Adding inventory item', item);
      return;
    }

    try {
      const { error } = await supabase
        .from('food_inventory')
        .insert([item]);

      if (error) throw error;
      await fetchInventoryItems();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<FoodInventoryItem>) => {
    if (!dogId || dogId.startsWith('mock-')) {
      console.log('Mock: Updating inventory item', id, updates);
      return;
    }

    try {
      const { error } = await supabase
        .from('food_inventory')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchInventoryItems();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!dogId || dogId.startsWith('mock-')) {
      console.log('Mock: Deleting inventory item', id);
      return;
    }

    try {
      const { error } = await supabase
        .from('food_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchInventoryItems();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  };

  const getLowStockItems = useCallback(() => {
    return inventoryItems.filter(
      item => item.alert_enabled && item.quantity_remaining <= item.low_stock_alert_threshold
    );
  }, [inventoryItems]);

  const getExpiringItems = useCallback((daysThreshold: number = 7) => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return inventoryItems.filter(item => {
      if (!item.expiration_date) return false;
      const expirationDate = new Date(item.expiration_date);
      return expirationDate <= thresholdDate && expirationDate >= new Date();
    });
  }, [inventoryItems]);

  return {
    inventoryItems,
    loading,
    fetchInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
    getExpiringItems,
  };
};
