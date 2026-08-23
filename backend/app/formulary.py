from app.models import Species, ProductType
from typing import Optional

# A simple mock formulary for the pitch. 
# In a real app, this would be a database table referencing specific pharmaceutical products.
# Keys are tuples of (drug_name, species, route, product_type)
# Values are withdrawal period in hours.
FORMULARY_DB = {
    # Amoxicillin (IM)
    ("amoxicillin", Species.COW, "im", ProductType.MILK): 120, # 5 days
    ("amoxicillin", Species.COW, "im", ProductType.MEAT): 336, # 14 days
    ("amoxicillin", Species.BUFFALO, "im", ProductType.MILK): 120,
    ("amoxicillin", Species.BUFFALO, "im", ProductType.MEAT): 336,
    
    # Oxytetracycline (Injection)
    ("oxytetracycline", Species.COW, "injection", ProductType.MILK): 144, # 6 days
    ("oxytetracycline", Species.COW, "injection", ProductType.MEAT): 672, # 28 days
    ("oxytetracycline", Species.BUFFALO, "injection", ProductType.MILK): 144,
    ("oxytetracycline", Species.BUFFALO, "injection", ProductType.MEAT): 672,
    ("oxytetracycline", Species.POULTRY, "medicated feed", ProductType.EGGS): 96, # 4 days
    ("oxytetracycline", Species.POULTRY, "medicated feed", ProductType.MEAT): 120, # 5 days

    # Meloxicam
    ("meloxicam", Species.COW, "sc", ProductType.MILK): 120,
    ("meloxicam", Species.COW, "sc", ProductType.MEAT): 360, # 15 days
}

def get_withdrawal_hours(drug: str, species: Species, route: str, product: ProductType) -> int:
    """
    Returns the withdrawal period in hours for a specific drug and species.
    Defaults to a conservative 14 days (336 hours) if not found in the simplified formulary.
    """
    if not drug or not route:
        return 0
        
    key = (drug.lower(), species, route.lower(), product)
    if key in FORMULARY_DB:
        return FORMULARY_DB[key]
    
    # Check fallback route-independent (just drug + species + product)
    for k, v in FORMULARY_DB.items():
        if k[0] == drug.lower() and k[1] == species and k[3] == product:
            return v
            
    # Default conservative withdrawal period if unknown (14 days = 336 hours)
    return 336
