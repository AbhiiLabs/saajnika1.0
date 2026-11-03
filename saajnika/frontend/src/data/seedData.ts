import { Category, Product, HomepageBanner } from '../types';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'The Silk Edit',
    slug: 'the-silk-edit',
    tagline: 'Hand-reeled mulberry & gossamer chanderi silks',
    description: 'Lustrous festive coordinates, timeless sarees, and tissue organza dupattas imbued with pure metallic zari.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    display_order: 1,
    is_active: true,
    product_count: 8,
  },
  {
    id: 'cat-2',
    name: 'Contemporary Ethnic',
    slug: 'contemporary-ethnic',
    tagline: 'Reimagined heritage silhouettes with sculptural drape',
    description: 'Handcrafted tunics, kurta ensembles, and structured overlays designed for modern grace.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    display_order: 2,
    is_active: true,
    product_count: 12,
  },
  {
    id: 'cat-3',
    name: 'Festive Heirlooms',
    slug: 'festive-heirlooms',
    tagline: 'Masterpieces woven for generations to cherish',
    description: 'Ceremonial velvet jackets, brocade kurtas, and handcrafted angrakhas embellished with subtle zardozi needlework.',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    display_order: 3,
    is_active: true,
    product_count: 9,
  },
  {
    id: 'cat-4',
    name: 'Everyday Luxury',
    slug: 'everyday-luxury',
    tagline: 'Quiet sophistication for day-to-evening fluidity',
    description: 'Breathable organic cottons, handspun khadi, and fluid linen separates tailored to effortless perfection.',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    display_order: 4,
    is_active: true,
    product_count: 7,
  },
  {
    id: 'cat-5',
    name: 'Private Salon Co-ords',
    slug: 'private-salon-coords',
    tagline: 'Monochrome relaxed tailoring in handwoven raw fibers',
    description: 'Effortless twin-sets, wide-leg culottes, and belted tunics for discerning loungewear and salon entertaining.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    display_order: 5,
    is_active: true,
    product_count: 6,
  },
  {
    id: 'cat-6',
    name: 'Artisanal Dupattas & Heirlooms',
    slug: 'artisanal-dupattas',
    tagline: 'Intricate gossamer tissue with hand-beaten gold edging',
    description: 'Statement heirloom drapes, Banarasi kadwa weaves, and hand-embroidered borders celebrating craft legacy.',
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
    display_order: 6,
    is_active: true,
    product_count: 5,
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'The Noor Chanderi Kurta & Organza Dupatta Set',
    slug: 'the-noor-chanderi-kurta-organza-dupatta-set',
    sku: 'SJ-NOOR-01',
    category_name: 'Contemporary Ethnic',
    category_slug: 'contemporary-ethnic',
    collection_name: 'Winter Solstice',
    base_price: '7850.00',
    sale_price: '6990.00',
    current_price: '6990.00',
    discount_percent: 11,
    short_description: 'Handspun chanderi kurta with delicate pin-tucks and hand-painted tissue organza dupatta.',
    description: 'The Noor ensemble is an ode to understated grandeur. Handcrafted from luminous Maheshwari chanderi, this silhouette features architectural neck detailing, discreet inseam pockets, and gossamer organza finished with hand-rolled hems. Perfect for quiet celebrations and festive soirees.',
    fabric_and_care: '100% Handloom Chanderi Silk Cotton. Dupatta in Pure Tissue Organza. Dry clean only.',
    fit_and_sizing: 'Relaxed, fluid fit. Model is 5\'9" and wearing size S. Length: 46 inches.',
    shipping_and_returns: 'Dispatches in 24-48 hours. Complimentary express domestic transit. 7-day hassle-free exchange policy.',
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    secondary_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    images: [
      { id: 'img-1', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', is_primary: true, display_order: 1, alt_text: 'Noor Kurta front' },
      { id: 'img-2', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', is_primary: false, display_order: 2, alt_text: 'Organza dupatta detail' }
    ],
    available_colors: [
      { color_name: 'Alabaster Ivory', color_hex: '#F8F6F0' },
      { color_name: 'Dusky Rose', color_hex: '#B5837B' }
    ],
    available_sizes: ['XS', 'S', 'M', 'L', 'XL'],
    total_stock: 45,
    variants: [
      { id: 'var-1', sku: 'SJ-NOOR-01-S', size: 'S', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', additional_price: '0.00', stock_quantity: 12, is_active: true, final_price: '6990.00', is_in_stock: true },
      { id: 'var-2', sku: 'SJ-NOOR-01-M', size: 'M', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', additional_price: '0.00', stock_quantity: 14, is_active: true, final_price: '6990.00', is_in_stock: true },
      { id: 'var-3', sku: 'SJ-NOOR-01-L', size: 'L', color_name: 'Alabaster Ivory', color_hex: '#F8F6F0', additional_price: '0.00', stock_quantity: 9, is_active: true, final_price: '6990.00', is_in_stock: true }
    ]
  },
  {
    id: 'prod-2',
    name: 'The Rooh Fluted Chanderi Anarkali with Zari Border',
    slug: 'the-rooh-fluted-chanderi-anarkali-with-zari-border',
    sku: 'SJ-ROOH-02',
    category_name: 'Festive Heirlooms',
    category_slug: 'festive-heirlooms',
    collection_name: 'Winter Solstice',
    base_price: '11500.00',
    sale_price: null,
    current_price: '11500.00',
    discount_percent: 0,
    short_description: 'Twenty-panel kalidar silhouette featuring antique champagne zari wefts along the hemline.',
    description: 'Cut from fifty meters of fine hand-spun chanderi, the Rooh Anarkali flows with regal lightness. Its tailored bodice is complemented by hand-twisted cord buttons and fine hand-braided edging along the neckline.',
    fabric_and_care: 'Maheshwar Handspun Silk Chanderi with Pure Zari Border. Dry clean only. Store wrapped in unbleached muslin.',
    fit_and_sizing: 'Fitted at bust and waist, cascading into a sweeping full flare. Length: 52 inches.',
    shipping_and_returns: 'Atelier bespoke tailoring. Dispatches within 3 business days with insured courier.',
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    secondary_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    images: [
      { id: 'img-3', image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85', is_primary: true, display_order: 1, alt_text: 'Rooh Anarkali lookbook' }
    ],
    available_colors: [
      { color_name: 'Terracotta Wine', color_hex: '#844238' },
      { color_name: 'Charcoal Noir', color_hex: '#23201F' }
    ],
    available_sizes: ['S', 'M', 'L'],
    total_stock: 32,
    variants: [
      { id: 'var-4', sku: 'SJ-ROOH-02-S', size: 'S', color_name: 'Terracotta Wine', color_hex: '#844238', additional_price: '0.00', stock_quantity: 7, is_active: true, final_price: '11500.00', is_in_stock: true },
      { id: 'var-5', sku: 'SJ-ROOH-02-M', size: 'M', color_name: 'Terracotta Wine', color_hex: '#844238', additional_price: '0.00', stock_quantity: 11, is_active: true, final_price: '11500.00', is_in_stock: true }
    ]
  },
  {
    id: 'prod-3',
    name: 'Aurelia Banarasi Brocade Sari with Zari Weaves',
    slug: 'aurelia-banarasi-brocade-sari-with-zari-weaves',
    sku: 'SJ-AURELIA-05',
    category_name: 'The Silk Edit',
    category_slug: 'the-silk-edit',
    collection_name: 'Heirloom Archive',
    base_price: '26500.00',
    sale_price: '24500.00',
    current_price: '24500.00',
    discount_percent: 8,
    short_description: 'Pure Katan silk hand-woven on historic pit looms in Varanasi with antique gold zari shikargah motifs.',
    description: 'Taking over 90 days of meticulous pit-loom weaving, the Aurelia saree is an unrepeatable masterpiece. Each floral jaal is individually hand-clipped using the ancient kadwa technique, creating raised motifs that glisten with regal subtlety.',
    fabric_and_care: '100% Pure Varanasi Katan Silk with certified silver & gold dipped zari. Dry clean only.',
    fit_and_sizing: 'Length: 5.5 meters with 0.8 meter unstitched matching blouse fabric.',
    shipping_and_returns: 'Comes packaged in archival velvet keepsake box. Hand-delivered via white-glove courier.',
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    secondary_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    images: [
      { id: 'img-4', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', is_primary: true, display_order: 1, alt_text: 'Aurelia Banarasi Silk' }
    ],
    available_colors: [
      { color_name: 'Royal Crimson', color_hex: '#8C1D24' },
      { color_name: 'Emerald Forest', color_hex: '#1C3B2B' }
    ],
    available_sizes: ['FREE'],
    total_stock: 7,
    variants: [
      { id: 'var-6', sku: 'SJ-AURELIA-05-FREE', size: 'FREE', color_name: 'Royal Crimson', color_hex: '#8C1D24', additional_price: '0.00', stock_quantity: 3, is_active: true, final_price: '24500.00', is_in_stock: true }
    ]
  },
  {
    id: 'prod-4',
    name: 'The Sitara Tissue Organza Overlay Jacket',
    slug: 'the-sitara-tissue-organza-overlay-jacket',
    sku: 'SJ-SITARA-06',
    category_name: 'Festive Heirlooms',
    category_slug: 'festive-heirlooms',
    collection_name: 'Winter Solstice',
    base_price: '10800.00',
    sale_price: '9800.00',
    current_price: '9800.00',
    discount_percent: 9,
    short_description: 'Sheer champagne organza open-front jacket adorned with delicate pearl and bead hand-embroidery.',
    description: 'A versatile statement overlay that pairs effortlessly with slip dresses or tailored silk coordinates. Features scalloped front hems, vented bell sleeves, and shimmering bugle bead details.',
    fabric_and_care: 'Pure Silk Tissue Organza. Specialized dry clean only.',
    fit_and_sizing: 'Easy draped silhouette. Fits comfortably across standard sizes.',
    shipping_and_returns: 'Dispatches in 2 business days.',
    is_featured: true,
    is_new_arrival: true,
    primary_image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
    secondary_image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    images: [
      { id: 'img-5', image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85', is_primary: true, display_order: 1, alt_text: 'Sitara overlay jacket' }
    ],
    available_colors: [
      { color_name: 'Champagne Gold', color_hex: '#D4AF37' }
    ],
    available_sizes: ['S', 'M', 'L'],
    total_stock: 19,
    variants: [
      { id: 'var-7', sku: 'SJ-SITARA-06-M', size: 'M', color_name: 'Champagne Gold', color_hex: '#D4AF37', additional_price: '0.00', stock_quantity: 8, is_active: true, final_price: '9800.00', is_in_stock: true }
    ]
  },
  {
    id: 'prod-5',
    name: 'The Mehr Sculpted Linen Tunic',
    slug: 'the-mehr-sculpted-linen-tunic',
    sku: 'SJ-MEHR-03',
    category_name: 'Everyday Luxury',
    category_slug: 'everyday-luxury',
    collection_name: 'Artisanal Essentials',
    base_price: '4990.00',
    sale_price: '4290.00',
    current_price: '4290.00',
    discount_percent: 14,
    short_description: 'Boxy minimalist tunic in handwoven organic European flax linen with French seam construction.',
    description: 'Designed for unhurried living, the Mehr tunic bridges effortless lounge ease with architectural precision. Features drop shoulders, a band collar, and hand-finished blind hems.',
    fabric_and_care: '100% Certified Organic Hand-Loomed Linen. Gentle cold machine wash or dry clean.',
    fit_and_sizing: 'Relaxed, oversized silhouette. We advise choosing your usual size for a fluid drape.',
    shipping_and_returns: 'In stock. Same day courier dispatch.',
    is_featured: false,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    available_colors: [
      { color_name: 'Natural Ecru', color_hex: '#E7DFD5' }
    ],
    available_sizes: ['XS', 'S', 'M', 'L'],
    total_stock: 25,
    variants: [
      { id: 'var-8', sku: 'SJ-MEHR-03-S', size: 'S', color_name: 'Natural Ecru', color_hex: '#E7DFD5', additional_price: '0.00', stock_quantity: 15, is_active: true, final_price: '4290.00', is_in_stock: true }
    ]
  },
  {
    id: 'prod-6',
    name: 'The Tara Silk Angrakha Day Dress',
    slug: 'the-tara-silk-angrakha-day-dress',
    sku: 'SJ-TARA-04',
    category_name: 'Contemporary Ethnic',
    category_slug: 'contemporary-ethnic',
    collection_name: 'Winter Solstice',
    base_price: '8900.00',
    sale_price: '7650.00',
    current_price: '7650.00',
    discount_percent: 14,
    short_description: 'Wrap-style Angrakha dress in raw mulberry silk with tie-up tassel fastenings.',
    description: 'Inspired by Mughal court attire and refined for modern silhouettes, the Tara dress features an overlapping bodice that fastens gracefully at the side with handcrafted silk cords and metallic thread tassels.',
    fabric_and_care: 'Raw Mulberry Silk with fine hand-block printed lining. Dry clean only.',
    fit_and_sizing: 'Adjustable wrap bodice. True to size with customizable waist fit.',
    shipping_and_returns: 'Dispatches in 24-48 hours.',
    is_featured: true,
    is_new_arrival: false,
    primary_image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
    available_colors: [
      { color_name: 'Deep Sage', color_hex: '#4A5B4C' }
    ],
    available_sizes: ['S', 'M', 'L'],
    total_stock: 22,
    variants: [
      { id: 'var-9', sku: 'SJ-TARA-04-M', size: 'M', color_name: 'Deep Sage', color_hex: '#4A5B4C', additional_price: '0.00', stock_quantity: 10, is_active: true, final_price: '7650.00', is_in_stock: true }
    ]
  }
];

export const SEED_HERO_BANNER: HomepageBanner = {
  id: 'banner-hero',
  banner_type: 'HERO',
  kicker: 'COLLECTION 04 / WINTER SOLSTICE',
  title: 'Poetry in Pure Weave.',
  subtitle: 'Crafted by master artisan families in Maheshwar and Varanasi. Hand-reeled silks and sculpted organic textiles designed for quiet grace.',
  cta_text: 'Discover The Edit',
  cta_link: '/shop',
  image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
  display_order: 1,
};
