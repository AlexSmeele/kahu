-- Create food_inventory table
CREATE TABLE public.food_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  brand TEXT,
  food_type TEXT NOT NULL,
  quantity_remaining NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  opened_date DATE,
  expiration_date DATE,
  batch_lot_number TEXT,
  storage_location TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC,
  low_stock_alert_threshold NUMERIC DEFAULT 0.5,
  alert_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view food inventory for their dogs"
  ON public.food_inventory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = food_inventory.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert food inventory for their dogs"
  ON public.food_inventory
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = food_inventory.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update food inventory for their dogs"
  ON public.food_inventory
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = food_inventory.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete food inventory for their dogs"
  ON public.food_inventory
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = food_inventory.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_food_inventory_dog_id ON public.food_inventory(dog_id);
CREATE INDEX idx_food_inventory_expiration_date ON public.food_inventory(expiration_date);

-- Create trigger for updated_at
CREATE TRIGGER update_food_inventory_updated_at
  BEFORE UPDATE ON public.food_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();