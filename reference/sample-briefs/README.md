# Sample Briefs

This folder contains realistic sample briefs for testing the TF Project Builder.

## Files

| File | Type | Budget | Workflow |
|------|------|--------|----------|
| `01-type-a-bmw-campaign.md` | A | 175,000 EUR | Full (A+B-TYPE) |
| `02-type-c-retail-seasonal.md` | C | 18,000 EUR | Simplified (C+D-TYPE) |
| `03-type-e-blanket-deal.md` | E | 2,000 EUR | Blanket only |
| `04-type-b-airline.md` | B | 65,000 EUR | Full (A+B-TYPE) |
| `05-production-bespoke.md` | Production | 40,000 EUR | Production workflow |
| `06-type-d-craft-beer.md` | D | 8,000 EUR | Simplified (C+D-TYPE) |
| `07-type-b-streaming.md` | B | 55,000 EUR | Full (A+B-TYPE) |
| `08-type-a-luxury-fashion.md` | A | 200,000 EUR | Full (A+B-TYPE) |
| `09-production-game-trailer.md` | Production | 45,000 EUR | Production workflow |
| `10-type-c-incomplete.md` | C | ~15,000 EUR | Incomplete brief |

## Using These Samples

### For Design OS `/sample-data`

When running `/sample-data` for the Brief Extraction section, reference these briefs to generate realistic sample data.

### For Testing

Use the "Raw Brief Text" section to test the extraction system:
1. Copy the raw text
2. Paste into the chat interface
3. Compare extracted data against "Expected Extraction"

### Brief Characteristics

**Type A (01-type-a):**
- High completeness (85%)
- Global scope
- Complex deliverables
- Tight timeline
- Premium creative direction

**Type C (02-type-c):**
- Medium completeness (55%)
- Vague brief
- Missing critical info
- Standard timeline
- Simple requirements

**Type E (03-type-e):**
- Good completeness for type (70%)
- Blanket catalog use
- Minimal requirements
- Rush timeline

**Type B (04-type-b):**
- Good completeness (80%)
- European scope
- Standard complexity
- Dual options (sync or bespoke)

**Production (05-production):**
- High completeness (90%)
- Bespoke requirements
- Full stems needed
- Standard timeline

**Type D (06-type-d):**
- Good completeness (80%)
- Regional scope (DACH)
- Digital only campaign
- Indie rock genre focus
- Clear brand voice (BrewDog)

**Type B (07-type-b):**
- Excellent completeness (90%)
- European multi-territory
- Trailer with cutdowns
- Specific sync points provided
- Dark/gothic creative direction

**Type A (08-type-a):**
- Good completeness (85%)
- Luxury/fashion client
- Global scope + fashion show
- Confidential/NDA required
- Complex deliverables (runway version)

**Production (09-production):**
- Excellent completeness (95%)
- Gaming/esports anthem
- Full buyout required
- Detailed technical specs
- Multiple version formats

**Type C Incomplete (10-type-c):**
- Very low completeness (25%)
- Missing critical information
- Vague creative direction
- Budget unconfirmed
- Tests extraction of incomplete briefs
