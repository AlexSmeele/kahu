-- Remove fake vet clinic data
DELETE FROM vet_clinics WHERE 
  address IN (
    '123 Queen Street, Auckland, New Zealand',
    '456 Lambton Quay, Wellington, New Zealand', 
    '789 Colombo Street, Christchurch, New Zealand',
    '321 Victoria Street, Hamilton, New Zealand',
    '654 George Street, Dunedin, New Zealand'
  );