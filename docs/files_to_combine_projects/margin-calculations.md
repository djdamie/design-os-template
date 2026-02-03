# Margin Calculations

## Overview
TF uses a tiered margin structure based on project budget. The margin is TF's fee; the payout is what goes to rights holders.

## Margin Tiers

| Budget Range | TF Margin | Payout to Rights Holders |
|--------------|-----------|--------------------------|
| €0 - €1,500 | 100% | €0 (Library/Blanket Deals) |
| €1,500 - €30,000 | 50% | 50% of budget |
| €30,000 - €100,000 | 25% | 75% of budget |
| €100,000 - €250,000 | 20% | 80% of budget |
| €250,000 - €500,000 | 15% | 85% of budget |
| Above €500,000 | 10% | 90% of budget |

## Examples

### Example 1: Small Project
- **Budget:** €15,000
- **Tier:** €1,500-30,000 (50% margin)
- **TF Fee:** €7,500
- **Payout:** €7,500

### Example 2: Medium Project
- **Budget:** €75,000
- **Tier:** €30,000-100,000 (25% margin)
- **TF Fee:** €18,750
- **Payout:** €56,250

### Example 3: Large Project
- **Budget:** €150,000
- **Tier:** €100,000-250,000 (20% margin)
- **TF Fee:** €30,000
- **Payout:** €120,000

### Example 4: Library Deal
- **Budget:** €1,200
- **Tier:** €0-1,500 (100% margin)
- **TF Fee:** €1,200
- **Payout:** €0 (covered by blanket deal)

## Special Cases

### Custom Client Arrangements
Some clients have negotiated:
- **Flat fees** - Fixed TF fee regardless of budget
- **Hourly rates** - For certain project types
- **Volume discounts** - For ongoing relationships

These override the standard tier structure.

### Currency Handling
- Default currency: EUR
- USD projects: Convert to EUR for tier calculation
- Display both currencies in UI

### Edge Cases
- Budget exactly on tier boundary: Use the higher tier (e.g., €30,000 → 25% margin, not 50%)
- Budget unknown: Cannot calculate margin, flag as critical missing info
- Multi-track projects: Budget split discussion required

## Implementation Notes

### Database Function
```sql
SELECT * FROM calculate_payout(75000);
-- Returns: payout=56250, margin_pct=25.00, tier='TIER_2'
```

### Frontend Display
Show both:
- Margin percentage with tier label
- Calculated payout amount
- Visual indicator of which tier applies

### Validation Rules
- Budget must be positive number
- Budget cannot exceed €10,000,000 (flag for manual review)
- Warn if budget seems unusually low for project scope
