<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'super_admin')->first()
            ?? User::where('role', 'admin')->first();

        if (! $admin) {
            $this->command->warn('No admin user found — skipping blog seeder.');
            return;
        }

        $posts = [
            // ── Guides ──────────────────────────────────────
            [
                'title'      => 'The Complete Guide to Renting Your First Apartment in Lagos',
                'category'   => 'guide',
                'tags'       => ['renting', 'first-timer', 'lagos'],
                'excerpt'    => 'Moving to Lagos? Here\'s everything you need to know about finding and securing your first rental — from agent fees to inspection tips.',
                'content'    => <<<'MD'
## Introduction

Lagos is one of Africa's fastest-growing cities, and finding the right apartment can feel overwhelming — especially if you're new. This guide walks you through every step, from budgeting to signing the tenancy agreement.

## Step 1: Set Your Budget Realistically

Before you start viewing apartments, understand the true cost of renting in Lagos:

- **Rent**: Usually paid 1-2 years in advance (yes, really)
- **Agency fee**: Typically 10% of annual rent
- **Caution fee**: Usually equal to one month's rent
- **Legal fee**: 10% of annual rent for the agreement
- **Service charge**: Varies — ₦200K-₦2M/year in serviced estates

### Sample budget for a 2-bedroom flat in Lekki Phase 1:
- Annual rent: ₦3,500,000
- Agency fee (10%): ₦350,000
- Caution/deposit: ₦291,667
- Legal fee (10%): ₦350,000
- **Total move-in cost: ~₦4,491,667**

## Step 2: Choose Your Area

Lagos neighbourhoods have distinct personalities:

- **Lekki Phase 1 / Chevron**: Young professionals, good nightlife, moderate traffic
- **Victoria Island**: Corporate, expensive, walkable to offices
- **Ikeja GRA**: Family-friendly, close to the airport, quieter
- **Yaba / Surulere**: Affordable, close to the Mainland business district
- **Ajah / Sangotedo**: Budget-friendly, but longer commute

## Step 3: Find a Reputable Agent

Always work with verified agents. On AncerLarins, look for the verified badge. Red flags to watch for:

- Asking for "commitment fees" before inspection
- No physical office
- Pressure to pay immediately
- Properties that seem too good to be true

## Step 4: Inspect Thoroughly

During inspection, check:

- **Water supply**: Is there a borehole? Water runs consistently?
- **Electricity**: Prepaid meter installed? Transformer situation?
- **Security**: Gated estate? Guard at the gate? CCTV?
- **Road access**: Visit during rush hour to gauge traffic
- **Neighbours**: Ask about noise levels

## Step 5: Negotiate and Sign

- Everything is negotiable — rent, payment plan, agency fee
- Always get a proper tenancy agreement
- Take photos of the apartment's condition before moving in
- Get receipts for every payment

## Conclusion

Renting in Lagos doesn't have to be stressful. Do your research, budget properly, and work with trusted professionals. Browse verified listings on AncerLarins to get started.
MD,
            ],

            [
                'title'      => 'How to Verify Property Ownership in Lagos: A Step-by-Step Guide',
                'category'   => 'guide',
                'tags'       => ['buying', 'verification', 'legal', 'c-of-o'],
                'excerpt'    => 'Before you buy any property in Lagos, learn how to verify ownership documents and avoid falling victim to land scams.',
                'content'    => <<<'MD'
## Why Verification Matters

Lagos has a well-documented history of land fraud. The phrase "Omo Onile" (children of the land) strikes fear into property buyers. This guide helps you verify any property before you part with your money.

## Key Documents to Check

### 1. Certificate of Occupancy (C of O)
- Issued by the Lagos State Government
- Verify at the Lagos State Land Registry, Alausa
- Costs approximately ₦5,000-₦10,000 to search

### 2. Governor's Consent
- Required for any transfer of property with a C of O
- Without it, the property hasn't been legally transferred to the seller

### 3. Survey Plan
- Must be a certified true copy
- Verify at the Office of the Surveyor General
- Ensure coordinates match the physical location

### 4. Deed of Assignment
- Shows chain of ownership
- Must be stamped at the Federal Inland Revenue Service (FIRS)

## Step-by-Step Verification Process

### Step 1: Conduct a Search at the Land Registry
Visit the Land Registry at Block 13, The Secretariat, Alausa, Ikeja. Submit the property details and pay the search fee. This reveals the registered owner.

### Step 2: Verify the Survey
Take the survey plan to the Surveyor General's office. Confirm the beacon numbers match the approved layout.

### Step 3: Check for Encumbrances
Search for any existing mortgages, liens, or government acquisition notices on the property.

### Step 4: Physical Verification
Visit the property. Confirm boundaries match the survey. Speak with neighbours about ownership history.

### Step 5: Engage a Property Lawyer
Never skip this. A good property lawyer costs ₦200,000-₦500,000 but saves you from ₦millions in losses.

## Common Red Flags

- Seller rushing you to pay
- Documents that look photocopied or altered
- Multiple agents selling the same property
- Price significantly below market value
- Seller can't produce original documents

## Conclusion

Property verification in Lagos takes time and money, but it's the most important investment you'll make. Never buy property without proper due diligence.
MD,
            ],

            // ── Market Reports ──────────────────────────────
            [
                'title'      => 'Lagos Property Market Report: Q1 2026',
                'category'   => 'market_report',
                'tags'       => ['market-report', 'q1-2026', 'prices', 'trends'],
                'excerpt'    => 'Rental prices in Lekki rose 18% year-over-year while the Mainland saw more moderate growth. Here\'s the full Q1 2026 breakdown.',
                'content'    => <<<'MD'
## Executive Summary

The Lagos property market continued its upward trend in Q1 2026, driven by inflation, population growth, and limited new supply in premium areas. Key highlights:

- Average rents up **18% YoY** on the Island, **12% YoY** on the Mainland
- Short-let market grew **35%** as business travel rebounds
- New developments concentrated in Ibeju-Lekki corridor

## Rental Market

### Island (Lekki, VI, Ikoyi)

| Property Type | Avg Annual Rent (₦) | YoY Change |
|---------------|---------------------|------------|
| 1-Bed Flat | 2,500,000 | +15% |
| 2-Bed Flat | 4,200,000 | +18% |
| 3-Bed Flat | 7,000,000 | +20% |
| 4-Bed Duplex | 15,000,000 | +12% |

### Mainland (Ikeja, Yaba, Surulere, Maryland)

| Property Type | Avg Annual Rent (₦) | YoY Change |
|---------------|---------------------|------------|
| 1-Bed Flat | 800,000 | +10% |
| 2-Bed Flat | 1,500,000 | +12% |
| 3-Bed Flat | 2,800,000 | +14% |
| 4-Bed Duplex | 5,500,000 | +8% |

## Sales Market

Land prices in Ibeju-Lekki continue to rise as the Lekki Free Trade Zone development progresses. A plot in Bogije that sold for ₦8M in 2024 now commands ₦15-18M.

Banana Island remains Lagos' most expensive address with prices ranging from ₦800M to ₦3B for a detached house.

## Short-Let Boom

The short-let segment is the fastest-growing category. Average nightly rates:

- **Lekki Phase 1**: ₦80,000-₦150,000/night
- **Victoria Island**: ₦120,000-₦250,000/night
- **Ikeja GRA**: ₦50,000-₦100,000/night

Occupancy rates averaged 72% across Island locations.

## Outlook

We expect continued price increases through 2026, with the Mainland offering the best value for renters and Ibeju-Lekki the strongest capital appreciation potential for buyers.
MD,
            ],

            // ── Area Spotlights ─────────────────────────────
            [
                'title'      => 'Area Spotlight: Why Lekki Phase 1 Remains Lagos\' Most Popular Neighbourhood',
                'category'   => 'area_spotlight',
                'tags'       => ['lekki', 'area-guide', 'neighbourhood'],
                'excerpt'    => 'From world-class restaurants to the best gyms in Lagos, discover why Lekki Phase 1 continues to attract young professionals and families alike.',
                'content'    => <<<'MD'
## Overview

Lekki Phase 1 is arguably Lagos' most balanced neighbourhood — offering a mix of residential comfort, entertainment, and convenience that few areas can match. Bounded by the Lekki-Epe Expressway and the Lagos Lagoon, it's home to over 50,000 residents.

## What Makes Lekki Phase 1 Special

### Location
- 20 minutes from Victoria Island (off-peak)
- Direct access via Lekki-Epe Expressway and Admiralty Way
- Close to Chevron, Ikate, and the expanding Lekki corridor

### Amenities
- **Shopping**: The Palms Mall, Filmhouse Cinemas, ShopRite
- **Dining**: Sky Restaurant, Bottles, Circa, Sailor's Lounge
- **Fitness**: Bodyline Gym, The Gym Lagos, CrossFit Lekki
- **Healthcare**: Reddington Hospital, St. Nicholas Hospital
- **Schools**: Greensprings, Corona, Chrisland

### Security
Most streets have resident associations with security gates. The area is generally considered safe, though traffic can be an issue during rush hours.

## Property Market

### Rental Ranges (2026)
- **Mini flat**: ₦1,000,000 - ₦1,500,000/year
- **2-bedroom flat**: ₦3,000,000 - ₦5,000,000/year
- **3-bedroom flat**: ₦5,000,000 - ₦8,000,000/year
- **4-bedroom duplex**: ₦8,000,000 - ₦15,000,000/year

### Sales Ranges
- **Land (600sqm)**: ₦120,000,000 - ₦200,000,000
- **3-bedroom flat**: ₦50,000,000 - ₦80,000,000
- **5-bedroom duplex**: ₦150,000,000 - ₦350,000,000

## Pros and Cons

**Pros:**
- Excellent amenities and nightlife
- Strong appreciation potential
- Relatively safe
- Good road network within the estate

**Cons:**
- Traffic congestion on the expressway
- Flooding during heavy rains
- Expensive compared to Mainland alternatives
- Parking can be difficult on popular streets

## Verdict

Lekki Phase 1 is ideal for young professionals, couples, and small families who want an active lifestyle with urban convenience. If you can handle the traffic and the price tag, it's hard to beat.
MD,
            ],

            [
                'title'      => 'Area Spotlight: Ikeja GRA — The Mainland\'s Hidden Gem',
                'category'   => 'area_spotlight',
                'tags'       => ['ikeja', 'mainland', 'area-guide', 'family-friendly'],
                'excerpt'    => 'Quiet streets, old-money charm, and proximity to the airport make Ikeja GRA one of Lagos\' most underrated residential areas.',
                'content'    => <<<'MD'
## Overview

While the Island gets most of the attention, Ikeja GRA (Government Reserved Area) quietly offers one of the best living experiences in Lagos. Tree-lined streets, spacious plots, and a community feel that's increasingly rare in the city.

## History

Originally developed as a residential area for senior government officials in the 1960s, Ikeja GRA has evolved into a mixed residential-commercial neighbourhood that retains its prestige.

## Key Highlights

### Location Advantages
- **10 minutes** from Murtala Muhammed International Airport
- **15 minutes** from Ikeja CBD and Computer Village
- Easy access to the Lagos-Ibadan Expressway
- Central position between Island and outer Mainland

### Infrastructure
- **Power**: One of the most reliable areas in Lagos — some streets enjoy 18-20 hours of electricity
- **Roads**: Well-maintained internal roads
- **Drainage**: Better than most Lagos areas, though Joel Ogunnaike axis floods occasionally

### Amenities
- **Shopping**: Ikeja City Mall, Maryland Mall
- **Dining**: The Wheatbaker Hotel, Southern Sun, Jevinik
- **Healthcare**: Lagos State University Teaching Hospital (LASUTH), EKO Hospital
- **Education**: Corona Schools, Dowen College, Lagos State Model College

## Property Market

### Rental Ranges (2026)
- **2-bedroom flat**: ₦1,200,000 - ₦2,000,000/year
- **3-bedroom flat**: ₦2,000,000 - ₦3,500,000/year
- **4-bedroom duplex**: ₦4,000,000 - ₦7,000,000/year
- **5-bedroom detached**: ₦6,000,000 - ₦12,000,000/year

### Sales Ranges
- **Land (1000sqm)**: ₦150,000,000 - ₦300,000,000
- **4-bedroom duplex**: ₦80,000,000 - ₦180,000,000

## Who Should Live Here

Ikeja GRA is perfect for:
- Families who want space and quiet
- Frequent travellers (airport proximity)
- Professionals working on the Mainland
- Anyone who values reliable power supply

## Verdict

If you want Island-quality living at Mainland prices, Ikeja GRA is your best bet. The area offers security, space, and infrastructure that many Island neighbourhoods struggle to match.
MD,
            ],

            // ── Tips ────────────────────────────────────────
            [
                'title'      => '7 Red Flags That Scream "Property Scam" in Lagos',
                'category'   => 'tips',
                'tags'       => ['scam', 'fraud', 'tips', 'safety'],
                'excerpt'    => 'Thousands of Nigerians lose money to property scams every year. Learn to spot the warning signs before it\'s too late.',
                'content'    => <<<'MD'
## The Problem

Property fraud costs Nigerians an estimated ₦200 billion annually. Lagos, with its booming real estate market, is ground zero. Here are the red flags every buyer and renter must know.

## Red Flag #1: Unbelievably Low Price

If a 3-bedroom flat in Lekki Phase 1 is listed at ₦1.5 million/year when the market rate is ₦4-5 million, something is very wrong. Scammers use low prices to create urgency.

**What to do:** Research average prices on AncerLarins before viewing any property.

## Red Flag #2: "Pay Before Inspection"

Any agent who asks for money before you physically inspect a property is likely a scammer. Legitimate agents show properties first.

**What to do:** Never pay anything until you've seen the property in person. Period.

## Red Flag #3: Pressure to Pay Immediately

"Someone else is about to pay." "The landlord will increase the price tomorrow." "I have 5 other people interested." Classic pressure tactics.

**What to do:** Walk away. Good properties exist — there will always be another one.

## Red Flag #4: No Proper Documentation

The agent can't produce a tenancy agreement template. The landlord doesn't have a C of O or receipt of purchase. The survey plan looks suspicious.

**What to do:** Engage a property lawyer to verify all documents before paying.

## Red Flag #5: Agent Has No Physical Office

A legitimate real estate agent should have a verifiable business address. If they only communicate via WhatsApp and always meet at "the property," be cautious.

**What to do:** Visit the agent's office. Verify their registration with REDAN or FIABCI.

## Red Flag #6: Multiple Agents, Same Property

If three different agents claim to be the "exclusive" agent for the same property, something is off. This often indicates the property is being used as bait.

**What to do:** Contact the estate management or landlord directly to verify who the authorized agent is.

## Red Flag #7: Cash-Only Transactions

Professional agents accept bank transfers and provide receipts. If someone insists on cash only, they're likely trying to avoid a paper trail.

**What to do:** Always pay via bank transfer with the recipient's real name. Keep all receipts and correspondence.

## Protect Yourself

- Use verified platforms like AncerLarins
- Always inspect in person
- Hire a property lawyer
- Never pay 100% upfront to a stranger
- Trust your instincts — if it feels wrong, it probably is
MD,
            ],

            [
                'title'      => 'Short-Let vs Long-Term Rental: Which Is More Profitable for Lagos Landlords?',
                'category'   => 'tips',
                'tags'       => ['short-let', 'investment', 'landlord', 'returns'],
                'excerpt'    => 'The short-let market is booming in Lagos, but is it actually more profitable than traditional long-term rentals? We crunch the numbers.',
                'content'    => <<<'MD'
## The Short-Let Revolution

Lagos has seen an explosion of short-let apartments, driven by business travellers, diaspora visits, and the rise of remote work. But does the hype match the returns?

## Case Study: 2-Bedroom Flat in Lekki Phase 1

### Long-Term Rental
- Annual rent: ₦4,000,000
- Occupancy: 100% (tenant pays whether they're there or not)
- Management effort: Low
- Furnishing cost: ₦0 (tenant furnishes)
- **Net annual income: ~₦3,600,000** (after 10% agency)

### Short-Let Rental
- Nightly rate: ₦100,000
- Average occupancy: 65% (237 nights/year)
- Gross revenue: ₦23,700,000
- Cleaning per turnover (est. 120 turnovers): ₦1,200,000
- Utilities (PHCN, diesel, water): ₦2,400,000
- Platform fees (15%): ₦3,555,000
- Maintenance & replacements: ₦1,500,000
- Property manager (20% of gross): ₦4,740,000
- Furnishing (amortized over 3 years): ₦2,000,000/year
- **Net annual income: ~₦8,305,000**

## The Verdict

Short-lets can yield **2-3x more** than long-term rentals, but they require:
- Significant upfront investment (₦5-8M to furnish properly)
- Active management or a property manager
- Location in high-demand areas (Lekki, VI, Ikoyi)
- Consistent quality and marketing

## When Long-Term Wins

- Properties outside prime areas
- Landlords who want passive income
- Properties not suited for short-stays (no generator, poor water supply)
- During economic downturns when travel drops

## When Short-Let Wins

- Prime Island locations
- Well-furnished, Instagram-worthy apartments
- Properties with reliable power and water
- Landlords willing to invest in management

## Our Recommendation

Consider a hybrid approach: long-term lease with a short-let clause for specific months. Some landlords rent 9 months long-term and convert to short-let during December-February peak season.
MD,
            ],

            // ── News ────────────────────────────────────────
            [
                'title'      => 'Lagos Blue Line Rail: How It\'s Reshaping Property Values Along the Corridor',
                'category'   => 'news',
                'tags'       => ['blue-line', 'rail', 'infrastructure', 'property-values'],
                'excerpt'    => 'The Lagos Blue Line rail is transforming previously overlooked areas into real estate hotspots. Here\'s where to invest before prices peak.',
                'content'    => <<<'MD'
## The Blue Line Effect

The Lagos Rail Mass Transit Blue Line, running from Marina to Okokomaiko, has begun transforming property markets along its 27km corridor. Areas within 1km of stations are seeing price increases of 25-40%.

## Station-by-Station Impact

### Marina Station
Already premium territory. Impact: Moderate (5-10% additional appreciation).

### Mile 2 Station
Previously overlooked, Mile 2 is seeing renewed interest. 2-bedroom flats that rented for ₦400,000/year in 2024 now command ₦600,000+.

### Festac Station
Festac Town is experiencing a renaissance. New developments are targeting young professionals who work on the Island but want affordable housing.

### Okokomaiko Station
The terminus station. Land prices have doubled in surrounding areas. Smart investors are buying now before the Red Line extension connects to the Blue Line.

## Investment Opportunities

### Best Value Plays
1. **Festac Town**: 2-bed flats from ₦15M. Rental yield: 8-10%
2. **Mile 2 area**: Land from ₦25M per plot. Expected 30% appreciation by 2027
3. **Orile**: Close to National Theatre station. Extremely undervalued

### For Renters
If you work on Lagos Island, consider renting along the Blue Line corridor. A 2-bedroom flat in Festac at ₦800K/year + ₦200 train fare daily could save you millions compared to renting on VI.

## Future Lines

The Red Line (Agbado to Marina) is next, with stations at Ikeja, Oshodi, and Yaba. Properties near planned stations are already appreciating.

## Conclusion

Infrastructure transforms property markets. The Blue Line is Lagos' most impactful transport project in decades. Position yourself early along current and planned rail corridors.
MD,
            ],

            [
                'title'      => 'Eko Atlantic: The City Rising From the Sea — 2026 Progress Update',
                'category'   => 'news',
                'tags'       => ['eko-atlantic', 'development', 'victoria-island', 'luxury'],
                'excerpt'    => 'Eko Atlantic City continues to take shape with new residential towers and commercial spaces. Here\'s what\'s changed in 2026.',
                'content'    => <<<'MD'
## What Is Eko Atlantic?

Eko Atlantic City is a planned city being built on reclaimed land from the Atlantic Ocean, adjacent to Victoria Island. When completed, it will house 250,000 residents and 150,000 daily commuters across 10 million square metres.

## 2026 Progress

### Completed
- **Eko Pearl Towers**: Five residential towers, fully occupied
- **Azuri Peninsula**: Luxury waterfront apartments, 90% sold
- **Road infrastructure**: Primary and secondary roads network complete
- **Sea wall**: The Great Wall of Lagos — 8.5km of protection against ocean surges

### Under Construction
- **Eko Energy Estate**: Mixed-use development with own power plant
- **Commercial District**: Office towers targeting multinational HQs
- **Marina District**: Waterfront retail and entertainment

### Planned
- **Blue Water residential**: Affordable-luxury segment targeting young professionals
- **Convention Centre**: 5,000-seat venue for events and conferences

## Current Property Prices

- **Azuri 2-bed apartment**: ₦150,000,000 - ₦200,000,000
- **Eko Pearl 3-bed**: ₦250,000,000 - ₦400,000,000
- **Land (per sqm)**: $700 - $1,200 depending on district
- **Short-let nightly rate**: ₦200,000 - ₦500,000

## Should You Invest?

**For:** World-class infrastructure, independent power, increasing scarcity as land sells out, prestige address.

**Against:** Very high entry point, completion timeline uncertain for some zones, distance from Mainland Lagos, limited current amenities.

## Verdict

Eko Atlantic is a long-term play. If you have the capital, early entry now could yield significant returns as the city matures. For most Lagos residents, it's worth watching but probably not yet affordable.
MD,
            ],

            // ── More Tips ───────────────────────────────────
            [
                'title'      => 'Understanding Service Charges in Lagos Estates: What You\'re Actually Paying For',
                'category'   => 'tips',
                'tags'       => ['service-charge', 'estates', 'cost', 'breakdown'],
                'excerpt'    => 'Service charges can add millions to your annual housing cost. Here\'s a breakdown of what they cover and whether you\'re getting value.',
                'content'    => <<<'MD'
## What Are Service Charges?

Service charges are annual fees paid by residents of estates and serviced apartments in Lagos. They cover shared services and maintenance. In some estates, they're as much as the rent itself.

## Typical Service Charge Breakdown

### Gated Estate (e.g., Chevron Estate, Lekki)
Annual charge: ₦1,500,000 - ₦3,000,000

| Item | % of Charge |
|------|------------|
| Security (24/7 guards, CCTV) | 35% |
| Power (shared generator/transformer) | 25% |
| Road maintenance | 15% |
| Waste management | 10% |
| Green areas & landscaping | 8% |
| Administration | 7% |

### Luxury Estate (e.g., Banana Island)
Annual charge: ₦5,000,000 - ₦15,000,000

Includes everything above plus:
- Waterway maintenance
- Jetty services
- Premium security (armed response)
- Estate management company

### Serviced Apartment Building
Monthly charge: ₦150,000 - ₦500,000

Usually covers:
- Elevator maintenance
- Swimming pool
- Gym access
- Lobby security
- Common area cleaning
- Building insurance

## Red Flags in Service Charges

- No itemized breakdown provided
- Charges increasing without explanation
- Services not being delivered (broken generators, absent guards)
- Estate association not holding AGMs
- No audited financial statements

## Know Your Rights

- You can request a breakdown of charges
- Estate associations must hold annual general meetings
- Challenge unreasonable increases through the association
- Document service failures for dispute resolution

## Conclusion

Service charges are a necessary cost of estate living in Lagos, but you should know exactly what you're paying for. Always factor them into your total housing budget — a ₦3M apartment with ₦2M in service charges is really costing you ₦5M per year.
MD,
            ],
        ];

        foreach ($posts as $i => $post) {
            $slug = str($post['title'])->slug()->toString();

            BlogPost::firstOrCreate(
                ['slug' => $slug],
                [
                    'author_id'        => $admin->id,
                    'title'            => $post['title'],
                    'slug'             => $slug,
                    'excerpt'          => $post['excerpt'],
                    'content'          => $post['content'],
                    'category'         => $post['category'],
                    'tags'             => $post['tags'],
                    'status'           => 'published',
                    'published_at'     => now()->subDays(count($posts) - $i),
                    'view_count'       => rand(50, 2000),
                    'meta_title'       => $post['title'],
                    'meta_description' => $post['excerpt'],
                ]
            );
        }

        $this->command->info('Seeded ' . count($posts) . ' blog posts.');
    }
}
