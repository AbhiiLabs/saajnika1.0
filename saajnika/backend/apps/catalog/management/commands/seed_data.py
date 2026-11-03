import uuid
from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.accounts.models import CustomerProfile, Address
from apps.catalog.models import Category, Product, ProductImage, ProductVariant
from apps.inventory.models import Inventory, InventoryMovement
from apps.coupons.models import Coupon
from apps.cms.models import HomepageBanner, StoreSetting
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.shipping.models import Shipment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic luxury editorial fashion data for Saajnika'

    def handle(self, *args, **options):
        self.stdout.write("Starting Saajnika boutique data seeding...")

        # 1. Create Admin User
        admin_email = "admin@saajnika.com"
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'first_name': 'Boutique',
                'last_name': 'Director',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        if created:
            admin_user.set_password("SaajnikaAdmin2025!")
            admin_user.save()
            CustomerProfile.objects.get_or_create(user=admin_user, defaults={'loyalty_tier': 'Atelier Executive'})
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_email} / SaajnikaAdmin2025!"))

        # 2. Create Customers
        customers_info = [
            {
                'email': 'client@saajnika.com',
                'password': 'CustomerPass2025!',
                'first_name': 'Aanya',
                'last_name': 'Kapoor',
                'phone': '+91 98112 34567',
                'loyalty_tier': 'Private Connoisseur',
                'address': {
                    'full_name': 'Aanya Kapoor',
                    'phone': '+91 98112 34567',
                    'address_line1': 'Villa 14, Magnolia Enclave',
                    'address_line2': 'Golf Course Extension Road',
                    'landmark': 'Near The Palms Club',
                    'city': 'Gurugram',
                    'state': 'Haryana',
                    'pincode': '122002',
                    'address_type': Address.AddressType.HOME,
                }
            },
            {
                'email': 'meera.sharma@gmail.com',
                'password': 'CustomerPass2025!',
                'first_name': 'Meera',
                'last_name': 'Sharma',
                'phone': '+91 98201 88412',
                'loyalty_tier': 'Atelier Patron',
                'address': {
                    'full_name': 'Meera Sharma',
                    'phone': '+91 98201 88412',
                    'address_line1': 'Flat 8B, Imperial Heights',
                    'address_line2': 'Altamount Road, Cumballa Hill',
                    'landmark': 'Opposite Consulate Garden',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'pincode': '400026',
                    'address_type': Address.AddressType.HOME,
                }
            },
            {
                'email': 'radhika.patel@gmail.com',
                'password': 'CustomerPass2025!',
                'first_name': 'Radhika',
                'last_name': 'Patel',
                'phone': '+91 97245 11902',
                'loyalty_tier': 'Royal Heirloom Guild',
                'address': {
                    'full_name': 'Radhika Patel',
                    'phone': '+91 97245 11902',
                    'address_line1': 'A-402, Shivalik Villa',
                    'address_line2': 'Bodakdev, Judges Bungalow Road',
                    'landmark': 'Near Sindhu Bhavan',
                    'city': 'Ahmedabad',
                    'state': 'Gujarat',
                    'pincode': '380054',
                    'address_type': Address.AddressType.HOME,
                }
            },
            {
                'email': 'tanya.sen@gmail.com',
                'password': 'CustomerPass2025!',
                'first_name': 'Tanya',
                'last_name': 'Sen',
                'phone': '+91 98310 44921',
                'loyalty_tier': 'Private Connoisseur',
                'address': {
                    'full_name': 'Tanya Sen',
                    'phone': '+91 98310 44921',
                    'address_line1': '12/1 Queens Court',
                    'address_line2': 'Ballygunge Circular Road',
                    'landmark': 'Opposite Modern High School',
                    'city': 'Kolkata',
                    'state': 'West Bengal',
                    'pincode': '700019',
                    'address_type': Address.AddressType.HOME,
                }
            }
        ]

        customer_objs = []
        for c in customers_info:
            user, created = User.objects.get_or_create(
                email=c['email'],
                defaults={
                    'first_name': c['first_name'],
                    'last_name': c['last_name'],
                    'role': User.Role.CUSTOMER,
                    'phone': c['phone'],
                    'is_verified': True,
                }
            )
            if created:
                user.set_password(c['password'])
                user.save()
                CustomerProfile.objects.get_or_create(user=user, defaults={'loyalty_tier': c['loyalty_tier']})
                Address.objects.create(user=user, is_default=True, **c['address'])
            customer_objs.append(user)

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(customer_objs)} client patrons."))

        # 3. Create 6 Curated Categories
        categories_data = [
            {
                'name': 'The Silk Edit',
                'slug': 'the-silk-edit',
                'tagline': 'Hand-reeled mulberry & gossamer chanderi silks',
                'description': 'Lustrous festive coordinates, timeless sarees, and tissue organza dupattas imbued with pure metallic zari.',
                'image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
                'display_order': 1,
            },
            {
                'name': 'Contemporary Ethnic',
                'slug': 'contemporary-ethnic',
                'tagline': 'Reimagined heritage silhouettes with sculptural drape',
                'description': 'Handcrafted tunics, kurta ensembles, and structured overlays designed for modern grace.',
                'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
                'display_order': 2,
            },
            {
                'name': 'Festive Heirlooms',
                'slug': 'festive-heirlooms',
                'tagline': 'Masterpieces woven for generations to cherish',
                'description': 'Ceremonial velvet jackets, brocade kurtas, and handcrafted angrakhas embellished with subtle zardozi needlework.',
                'image_url': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
                'display_order': 3,
            },
            {
                'name': 'Everyday Luxury',
                'slug': 'everyday-luxury',
                'tagline': 'Quiet sophistication for day-to-evening fluidity',
                'description': 'Breathable organic cottons, handspun khadi, and fluid linen separates tailored to effortless perfection.',
                'image_url': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
                'display_order': 4,
            },
            {
                'name': 'Private Salon Co-ords',
                'slug': 'private-salon-coords',
                'tagline': 'Monochrome relaxed tailoring in handwoven raw fibers',
                'description': 'Effortless twin-sets, wide-leg culottes, and belted tunics for discerning loungewear and salon entertaining.',
                'image_url': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
                'display_order': 5,
            },
            {
                'name': 'Artisanal Dupattas & Heirlooms',
                'slug': 'artisanal-dupattas',
                'tagline': 'Intricate gossamer tissue with hand-beaten gold edging',
                'description': 'Statement heirloom drapes, Banarasi kadwa weaves, and hand-embroidered borders celebrating craft legacy.',
                'image_url': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
                'display_order': 6,
            },
        ]

        cat_objs = {}
        for c_data in categories_data:
            cat, _ = Category.objects.update_or_create(slug=c_data['slug'], defaults=c_data)
            cat_objs[cat.slug] = cat
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(cat_objs)} luxury categories."))

        # 4. Create 10 Luxury Silhouettes with Photography & Variants
        products_data = [
            {
                'sku': 'SJ-NOOR-01',
                'name': 'The Noor Chanderi Kurta & Organza Dupatta Set',
                'category': cat_objs['contemporary-ethnic'],
                'collection_name': 'Winter Solstice',
                'base_price': Decimal('7850.00'),
                'sale_price': Decimal('6990.00'),
                'short_description': 'Handspun chanderi kurta with delicate pin-tucks and hand-painted tissue organza dupatta.',
                'description': 'The Noor ensemble is an ode to understated grandeur. Handcrafted from luminous Maheshwari chanderi, this silhouette features architectural neck detailing, discreet inseam pockets, and gossamer organza finished with hand-rolled hems. Perfect for quiet celebrations and festive soirees.',
                'fabric_and_care': '100% Handloom Chanderi Silk Cotton. Dupatta in Pure Tissue Organza. Dry clean only.',
                'fit_and_sizing': 'Relaxed, fluid fit. Model is 5\'9" and wearing size S. Length: 46 inches.',
                'shipping_and_returns': 'Dispatches in 24-48 hours. Complimentary express domestic transit. 7-day hassle-free exchange policy.',
                'is_featured': True,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Noor Kurta set front drape'},
                    {'image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', 'is_primary': False, 'alt_text': 'Organza dupatta craftsmanship detail'}
                ],
                'variants': [
                    {'size': 'XS', 'color_name': 'Alabaster Ivory', 'color_hex': '#F8F6F0', 'stock': 8},
                    {'size': 'S', 'color_name': 'Alabaster Ivory', 'color_hex': '#F8F6F0', 'stock': 12},
                    {'size': 'M', 'color_name': 'Alabaster Ivory', 'color_hex': '#F8F6F0', 'stock': 14},
                    {'size': 'L', 'color_name': 'Alabaster Ivory', 'color_hex': '#F8F6F0', 'stock': 9},
                    {'size': 'XL', 'color_name': 'Alabaster Ivory', 'color_hex': '#F8F6F0', 'stock': 4},
                    {'size': 'S', 'color_name': 'Dusky Rose', 'color_hex': '#B5837B', 'stock': 6},
                    {'size': 'M', 'color_name': 'Dusky Rose', 'color_hex': '#B5837B', 'stock': 10},
                    {'size': 'L', 'color_name': 'Dusky Rose', 'color_hex': '#B5837B', 'stock': 5},
                ]
            },
            {
                'sku': 'SJ-ROOH-02',
                'name': 'The Rooh Fluted Chanderi Anarkali with Zari Border',
                'category': cat_objs['festive-heirlooms'],
                'collection_name': 'Winter Solstice',
                'base_price': Decimal('11500.00'),
                'sale_price': None,
                'short_description': 'Twenty-panel kalidar silhouette featuring antique champagne zari wefts along the hemline.',
                'description': 'Cut from fifty meters of fine hand-spun chanderi, the Rooh Anarkali flows with regal lightness. Its tailored bodice is complemented by hand-twisted cord buttons and fine hand-braided edging along the neckline.',
                'fabric_and_care': 'Maheshwar Handspun Silk Chanderi with Pure Zari Border. Dry clean only. Store wrapped in unbleached muslin.',
                'fit_and_sizing': 'Fitted at bust and waist, cascading into a sweeping full flare. Length: 52 inches.',
                'shipping_and_returns': 'Atelier bespoke tailoring. Dispatches within 3 business days with insured courier.',
                'is_featured': True,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Rooh Anarkali lookbook'},
                    {'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', 'is_primary': False, 'alt_text': 'Zari hem detail'}
                ],
                'variants': [
                    {'size': 'S', 'color_name': 'Terracotta Wine', 'color_hex': '#844238', 'stock': 7},
                    {'size': 'M', 'color_name': 'Terracotta Wine', 'color_hex': '#844238', 'stock': 11},
                    {'size': 'L', 'color_name': 'Terracotta Wine', 'color_hex': '#844238', 'stock': 5},
                    {'size': 'S', 'color_name': 'Charcoal Noir', 'color_hex': '#23201F', 'stock': 6},
                    {'size': 'M', 'color_name': 'Charcoal Noir', 'color_hex': '#23201F', 'stock': 8},
                ]
            },
            {
                'sku': 'SJ-MEHR-03',
                'name': 'The Mehr Sculpted Linen Tunic',
                'category': cat_objs['everyday-luxury'],
                'collection_name': 'Artisanal Essentials',
                'base_price': Decimal('4990.00'),
                'sale_price': Decimal('4290.00'),
                'short_description': 'Boxy minimalist tunic in handwoven organic European flax linen with French seam construction.',
                'description': 'Designed for unhurried living, the Mehr tunic bridges effortless lounge ease with architectural precision. Features drop shoulders, a band collar, and hand-finished blind hems.',
                'fabric_and_care': '100% Certified Organic Hand-Loomed Linen. Gentle cold machine wash or dry clean.',
                'fit_and_sizing': 'Relaxed, oversized silhouette. We advise choosing your usual size for a fluid drape.',
                'shipping_and_returns': 'In stock. Same day courier dispatch.',
                'is_featured': False,
                'is_new_arrival': False,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Mehr linen tunic'}
                ],
                'variants': [
                    {'size': 'XS', 'color_name': 'Natural Ecru', 'color_hex': '#E7DFD5', 'stock': 10},
                    {'size': 'S', 'color_name': 'Natural Ecru', 'color_hex': '#E7DFD5', 'stock': 15},
                    {'size': 'M', 'color_name': 'Natural Ecru', 'color_hex': '#E7DFD5', 'stock': 12},
                    {'size': 'L', 'color_name': 'Natural Ecru', 'color_hex': '#E7DFD5', 'stock': 8},
                ]
            },
            {
                'sku': 'SJ-TARA-04',
                'name': 'The Tara Silk Angrakha Day Dress',
                'category': cat_objs['contemporary-ethnic'],
                'collection_name': 'Winter Solstice',
                'base_price': Decimal('8900.00'),
                'sale_price': Decimal('7650.00'),
                'short_description': 'Wrap-style Angrakha dress in raw mulberry silk with tie-up tassel fastenings.',
                'description': 'Inspired by Mughal court attire and refined for modern silhouettes, the Tara dress features an overlapping bodice that fastens gracefully at the side with handcrafted silk cords and metallic thread tassels.',
                'fabric_and_care': 'Raw Mulberry Silk with fine hand-block printed lining. Dry clean only.',
                'fit_and_sizing': 'Adjustable wrap bodice. True to size with customizable waist fit.',
                'shipping_and_returns': 'Dispatches in 24-48 hours.',
                'is_featured': True,
                'is_new_arrival': False,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Tara Angrakha dress'}
                ],
                'variants': [
                    {'size': 'S', 'color_name': 'Deep Sage', 'color_hex': '#4A5B4C', 'stock': 7},
                    {'size': 'M', 'color_name': 'Deep Sage', 'color_hex': '#4A5B4C', 'stock': 10},
                    {'size': 'L', 'color_name': 'Deep Sage', 'color_hex': '#4A5B4C', 'stock': 5},
                ]
            },
            {
                'sku': 'SJ-AURELIA-05',
                'name': 'Aurelia Banarasi Brocade Sari with Zari Weaves',
                'category': cat_objs['the-silk-edit'],
                'collection_name': 'Heirloom Archive',
                'base_price': Decimal('26500.00'),
                'sale_price': Decimal('24500.00'),
                'short_description': 'Pure Katan silk hand-woven on historic pit looms in Varanasi with antique gold zari shikargah motifs.',
                'description': 'Taking over 90 days of meticulous pit-loom weaving, the Aurelia saree is an unrepeatable masterpiece. Each floral jaal is individually hand-clipped using the ancient kadwa technique, creating raised motifs that glisten with regal subtlety.',
                'fabric_and_care': '100% Pure Varanasi Katan Silk with certified silver & gold dipped zari. Dry clean only.',
                'fit_and_sizing': 'Length: 5.5 meters with 0.8 meter unstitched matching blouse fabric.',
                'shipping_and_returns': 'Comes packaged in archival velvet keepsake box. Hand-delivered via white-glove courier.',
                'is_featured': True,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Aurelia Banarasi Silk Saree full drape'},
                    {'image_url': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85', 'is_primary': False, 'alt_text': 'Kadwa zari pallu detail'}
                ],
                'variants': [
                    {'size': 'FREE', 'color_name': 'Royal Crimson', 'color_hex': '#8C1D24', 'stock': 3},
                    {'size': 'FREE', 'color_name': 'Emerald Forest', 'color_hex': '#1C3B2B', 'stock': 4},
                ]
            },
            {
                'sku': 'SJ-SITARA-06',
                'name': 'The Sitara Tissue Organza Overlay Jacket',
                'category': cat_objs['festive-heirlooms'],
                'collection_name': 'Winter Solstice',
                'base_price': Decimal('10800.00'),
                'sale_price': Decimal('9800.00'),
                'short_description': 'Sheer champagne organza open-front jacket adorned with delicate pearl and bead hand-embroidery.',
                'description': 'A versatile statement overlay that pairs effortlessly with slip dresses or tailored silk coordinates. Features scalloped front hems, vented bell sleeves, and shimmering bugle bead details.',
                'fabric_and_care': 'Pure Silk Tissue Organza. Specialized dry clean only.',
                'fit_and_sizing': 'Easy draped silhouette. Fits comfortably across standard sizes.',
                'shipping_and_returns': 'Dispatches in 2 business days.',
                'is_featured': True,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Sitara organza overlay jacket'}
                ],
                'variants': [
                    {'size': 'S', 'color_name': 'Champagne Gold', 'color_hex': '#D4AF37', 'stock': 6},
                    {'size': 'M', 'color_name': 'Champagne Gold', 'color_hex': '#D4AF37', 'stock': 8},
                    {'size': 'L', 'color_name': 'Champagne Gold', 'color_hex': '#D4AF37', 'stock': 5},
                ]
            },
            {
                'sku': 'SJ-MEENA-07',
                'name': 'The Meenakari Katan Silk Saree in Vermilion',
                'category': cat_objs['the-silk-edit'],
                'collection_name': 'Heirloom Archive',
                'base_price': Decimal('32000.00'),
                'sale_price': None,
                'short_description': 'Heritage Katan silk sari with colorful meenakari resham florets hand-interwoven with gold zari.',
                'description': 'A monumental expression of Banaras weaving traditions. Delicate jewel-toned silk threads are hand-threaded into the warp to render delicate birds and vines against rich vermilion silk.',
                'fabric_and_care': '100% Pure Katan Silk. Store wrapped in cotton cloth.',
                'fit_and_sizing': 'Standard 5.5 meters with 0.8 meter matching blouse piece.',
                'shipping_and_returns': 'Atelier registered shipment with physical signature confirmation.',
                'is_featured': True,
                'is_new_arrival': False,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Meenakari Saree pallu'}
                ],
                'variants': [
                    {'size': 'FREE', 'color_name': 'Vermilion Scarlet', 'color_hex': '#C4281B', 'stock': 2}
                ]
            },
            {
                'sku': 'SJ-ZOHRA-08',
                'name': 'The Zohra Asymmetric Raw Silk Co-ord Set',
                'category': cat_objs['private-salon-coords'],
                'collection_name': 'Salon Private',
                'base_price': Decimal('9200.00'),
                'sale_price': Decimal('8400.00'),
                'short_description': 'Two-piece tailored raw silk ensemble with high-low tunic and straight-leg cigarette trousers.',
                'description': 'Tailored with crisp structure and subtle slub textures, the Zohra set brings refined cosmopolitan poise to evening gatherings. Finished with hand-stitched horn buttons.',
                'fabric_and_care': '100% Hand-Reeled Raw Silk. Dry clean recommended.',
                'fit_and_sizing': 'Tailored silhouette with elasticated back trouser waistband for comfortable elegance.',
                'shipping_and_returns': 'Dispatches in 24 hours.',
                'is_featured': False,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Zohra Raw Silk Co-ord Set'}
                ],
                'variants': [
                    {'size': 'S', 'color_name': 'Oatmeal Sand', 'color_hex': '#D8CAB8', 'stock': 9},
                    {'size': 'M', 'color_name': 'Oatmeal Sand', 'color_hex': '#D8CAB8', 'stock': 12},
                    {'size': 'L', 'color_name': 'Oatmeal Sand', 'color_hex': '#D8CAB8', 'stock': 6},
                ]
            },
            {
                'sku': 'SJ-KAASHVI-09',
                'name': 'The Kaashvi Hand-Embroidered Velvet Cape',
                'category': cat_objs['festive-heirlooms'],
                'collection_name': 'Winter Solstice',
                'base_price': Decimal('16500.00'),
                'sale_price': Decimal('14900.00'),
                'short_description': 'Plush midnight silk velvet cape with handcrafted dori and dabka metallic embroidery.',
                'description': 'An opulent winter layering piece. Lined in rich mulberry silk habotai with hand-finished armholes and a dramatic sweeping collar.',
                'fabric_and_care': 'Micro Silk Velvet with pure metallic dabka needlework. Specialized dry clean.',
                'fit_and_sizing': 'One size free fit with effortless drape over dresses and sarees.',
                'shipping_and_returns': 'Dispatches in 3 business days.',
                'is_featured': True,
                'is_new_arrival': True,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Kaashvi Velvet Cape'}
                ],
                'variants': [
                    {'size': 'FREE', 'color_name': 'Midnight Indigo', 'color_hex': '#1B263B', 'stock': 5}
                ]
            },
            {
                'sku': 'SJ-ANANDA-10',
                'name': 'Ananda Hand-Painted Kalamkari Silk Dupatta',
                'category': cat_objs['artisanal-dupattas'],
                'collection_name': 'Artisanal Essentials',
                'base_price': Decimal('6200.00'),
                'sale_price': Decimal('5600.00'),
                'short_description': 'Pure Tussar silk drape hand-drawn using natural vegetable dyes by traditional temple artisans.',
                'description': 'Each Ananda dupatta depicts the Tree of Life using organic madder root, indigo, and myrobalan mordants. It requires seventeen manual boiling and washing stages in flowing river water.',
                'fabric_and_care': '100% Handloom Tussar Silk with natural dyes. Dry clean only.',
                'fit_and_sizing': 'Length: 2.5 meters. Width: 38 inches.',
                'shipping_and_returns': 'Complimentary domestic courier.',
                'is_featured': False,
                'is_new_arrival': False,
                'images': [
                    {'image_url': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85', 'is_primary': True, 'alt_text': 'Ananda Kalamkari Dupatta'}
                ],
                'variants': [
                    {'size': 'FREE', 'color_name': 'Antique Ochre', 'color_hex': '#C68B59', 'stock': 6}
                ]
            }
        ]

        created_variants = []
        for p_data in products_data:
            images = p_data.pop('images')
            variants = p_data.pop('variants')

            product, _ = Product.objects.update_or_create(sku=p_data['sku'], defaults=p_data)

            # Seed Images
            for idx, img in enumerate(images):
                ProductImage.objects.update_or_create(
                    product=product,
                    image_url=img['image_url'],
                    defaults={
                        'is_primary': img.get('is_primary', idx == 0),
                        'alt_text': img.get('alt_text', product.name),
                        'display_order': idx
                    }
                )

            # Seed Variants & Inventory
            for v in variants:
                sku_code = f"{product.sku}-{v['size']}-{v['color_name'][:3].upper()}"
                variant, _ = ProductVariant.objects.update_or_create(
                    product=product,
                    size=v['size'],
                    color_name=v['color_name'],
                    defaults={
                        'sku': sku_code,
                        'color_hex': v['color_hex'],
                        'stock_quantity': v['stock'],
                        'is_active': True,
                    }
                )
                created_variants.append(variant)

                inv, _ = Inventory.objects.update_or_create(
                    variant=variant,
                    defaults={'stock_quantity': v['stock'], 'low_stock_threshold': 3}
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(products_data)} products and full variant inventory."))

        # 5. Create Coupons
        coupons = [
            {
                'code': 'SAAJNIKA10',
                'description': '10% privilege on orders over ₹3,000',
                'discount_type': Coupon.DiscountType.PERCENTAGE,
                'discount_value': Decimal('10.00'),
                'min_order_value': Decimal('3000.00'),
                'max_discount_amount': Decimal('1500.00'),
                'valid_from': timezone.now() - timedelta(days=1),
                'valid_to': timezone.now() + timedelta(days=90),
                'usage_limit': 500,
                'per_user_limit': 2,
                'is_active': True
            },
            {
                'code': 'PRIVATESALON',
                'description': 'Private Salon 15% preview privilege',
                'discount_type': Coupon.DiscountType.PERCENTAGE,
                'discount_value': Decimal('15.00'),
                'min_order_value': Decimal('5000.00'),
                'max_discount_amount': Decimal('2500.00'),
                'valid_from': timezone.now() - timedelta(days=1),
                'valid_to': timezone.now() + timedelta(days=60),
                'usage_limit': 200,
                'per_user_limit': 1,
                'is_active': True
            },
            {
                'code': 'WELCOME500',
                'description': 'Flat ₹500 introductory welcome gift',
                'discount_type': Coupon.DiscountType.FIXED,
                'discount_value': Decimal('500.00'),
                'min_order_value': Decimal('4000.00'),
                'valid_from': timezone.now() - timedelta(days=1),
                'valid_to': timezone.now() + timedelta(days=180),
                'usage_limit': 1000,
                'per_user_limit': 1,
                'is_active': True
            },
            {
                'code': 'FESTIVE2025',
                'description': 'Grand Festive 20% privilege on luxury heirlooms',
                'discount_type': Coupon.DiscountType.PERCENTAGE,
                'discount_value': Decimal('20.00'),
                'min_order_value': Decimal('15000.00'),
                'max_discount_amount': Decimal('5000.00'),
                'valid_from': timezone.now() - timedelta(days=5),
                'valid_to': timezone.now() + timedelta(days=45),
                'usage_limit': 150,
                'per_user_limit': 1,
                'is_active': True
            }
        ]
        coupon_objs = {}
        for c in coupons:
            c_obj, _ = Coupon.objects.update_or_create(code=c['code'], defaults=c)
            coupon_objs[c['code']] = c_obj
        self.stdout.write(self.style.SUCCESS("Seeded boutique coupons."))

        # 6. Seed Realistic Orders Across Multiple Customers
        sample_orders = [
            {
                'order_number': 'SJ-882041',
                'user': customer_objs[0], # Aanya Kapoor
                'status': Order.Status.DELIVERED,
                'subtotal': Decimal('24500.00'),
                'discount_amount': Decimal('0.00'),
                'shipping_fee': Decimal('0.00'),
                'total_amount': Decimal('24500.00'),
                'shipping_address': {
                    'full_name': 'Aanya Kapoor',
                    'phone': '+91 98112 34567',
                    'address_line1': 'Villa 14, Magnolia Enclave',
                    'city': 'Gurugram',
                    'state': 'Haryana',
                    'pincode': '122002'
                },
                'items': [
                    {'variant': created_variants[8], 'product_name': 'Aurelia Banarasi Brocade Sari with Zari Weaves', 'size': 'FREE', 'color': 'Royal Crimson', 'qty': 1, 'price': Decimal('24500.00')}
                ],
                'shipment': {
                    'tracking_number': 'BD-AIR-88204192',
                    'courier_name': 'BlueDart Air Express',
                    'current_status': 'DELIVERED',
                    'shipped_at': timezone.now() - timedelta(days=5),
                    'delivered_at': timezone.now() - timedelta(days=1),
                },
                'created_days_ago': 6,
            },
            {
                'order_number': 'SJ-910245',
                'user': customer_objs[1], # Meera Sharma
                'status': Order.Status.SHIPPED,
                'subtotal': Decimal('11500.00'),
                'discount_amount': Decimal('1150.00'), # SAAJNIKA10
                'shipping_fee': Decimal('0.00'),
                'total_amount': Decimal('10350.00'),
                'coupon': coupon_objs['SAAJNIKA10'],
                'shipping_address': {
                    'full_name': 'Meera Sharma',
                    'phone': '+91 98201 88412',
                    'address_line1': 'Flat 8B, Imperial Heights, Altamount Road',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'pincode': '400026'
                },
                'items': [
                    {'variant': created_variants[2], 'product_name': 'The Rooh Fluted Chanderi Anarkali with Zari Border', 'size': 'M', 'color': 'Terracotta Wine', 'qty': 1, 'price': Decimal('11500.00')}
                ],
                'shipment': {
                    'tracking_number': 'DELH-EXP-91024567',
                    'courier_name': 'Delhivery Air Express',
                    'current_status': 'IN_TRANSIT_METRO',
                    'shipped_at': timezone.now() - timedelta(days=2),
                },
                'created_days_ago': 3,
            },
            {
                'order_number': 'SJ-945120',
                'user': customer_objs[2], # Radhika Patel
                'status': Order.Status.PROCESSING,
                'subtotal': Decimal('15390.00'),
                'discount_amount': Decimal('0.00'),
                'shipping_fee': Decimal('0.00'),
                'total_amount': Decimal('15390.00'),
                'shipping_address': {
                    'full_name': 'Radhika Patel',
                    'phone': '+91 97245 11902',
                    'address_line1': 'A-402, Shivalik Villa, Bodakdev',
                    'city': 'Ahmedabad',
                    'state': 'Gujarat',
                    'pincode': '380054'
                },
                'items': [
                    {'variant': created_variants[0], 'product_name': 'The Noor Chanderi Kurta & Organza Dupatta Set', 'size': 'M', 'color': 'Alabaster Ivory', 'qty': 1, 'price': Decimal('6990.00')},
                    {'variant': created_variants[10], 'product_name': 'The Zohra Asymmetric Raw Silk Co-ord Set', 'size': 'M', 'color': 'Oatmeal Sand', 'qty': 1, 'price': Decimal('8400.00')},
                ],
                'created_days_ago': 1,
            },
            {
                'order_number': 'SJ-971842',
                'user': customer_objs[0], # Aanya Kapoor (repeat order)
                'status': Order.Status.PAID,
                'subtotal': Decimal('7650.00'),
                'discount_amount': Decimal('500.00'), # WELCOME500
                'shipping_fee': Decimal('0.00'),
                'total_amount': Decimal('7150.00'),
                'coupon': coupon_objs['WELCOME500'],
                'shipping_address': {
                    'full_name': 'Aanya Kapoor',
                    'phone': '+91 98112 34567',
                    'address_line1': 'Villa 14, Magnolia Enclave',
                    'city': 'Gurugram',
                    'state': 'Haryana',
                    'pincode': '122002'
                },
                'items': [
                    {'variant': created_variants[5], 'product_name': 'The Tara Silk Angrakha Day Dress', 'size': 'M', 'color': 'Deep Sage', 'qty': 1, 'price': Decimal('7650.00')}
                ],
                'created_days_ago': 0,
            }
        ]

        for ord_data in sample_orders:
            items = ord_data.pop('items')
            shipment_data = ord_data.pop('shipment', None)
            created_days = ord_data.pop('created_days_ago', 0)

            order, created = Order.objects.update_or_create(
                order_number=ord_data['order_number'],
                defaults=ord_data
            )
            if created or order:
                order.created_at = timezone.now() - timedelta(days=created_days)
                order.save(update_fields=['created_at'])

            # Add items
            order.items.all().delete()
            for itm in items:
                OrderItem.objects.create(
                    order=order,
                    variant=itm['variant'],
                    product_name=itm['product_name'],
                    sku=itm['variant'].sku,
                    size=itm['size'],
                    color=itm['color'],
                    unit_price=itm['price'],
                    quantity=itm['qty'],
                    total_price=itm['price'] * itm['qty'],
                    image_url=itm['variant'].product.primary_image
                )

            # Add shipment
            if shipment_data:
                Shipment.objects.update_or_create(
                    order=order,
                    defaults=shipment_data
                )

            # Add payment record
            Payment.objects.update_or_create(
                order=order,
                defaults={
                    'amount': order.total_amount,
                    'provider': Payment.Provider.RAZORPAY,
                    'status': Payment.Status.SUCCESS if order.status != Order.Status.PAYMENT_PENDING else Payment.Status.PENDING,
                    'razorpay_payment_id': f"pay_mock_{order.order_number}",
                    'verified_at': timezone.now() - timedelta(days=created_days) if order.status != Order.Status.PAYMENT_PENDING else None
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(sample_orders)} realistic boutique orders with shipments."))

        # 7. Seed Homepage Banners & CMS
        HomepageBanner.objects.update_or_create(
            banner_type=HomepageBanner.BannerType.HERO,
            defaults={
                'kicker': 'COLLECTION 04 / WINTER SOLSTICE',
                'title': 'Poetry in Pure Weave.',
                'subtitle': 'Crafted by master artisans in Maheshwar and Varanasi. Silhouettes shaped for quiet grace and timeless presence.',
                'cta_text': 'DISCOVER THE EDIT',
                'cta_link': '/shop',
                'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
                'secondary_image_url': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
                'display_order': 1,
                'is_active': True
            }
        )

        HomepageBanner.objects.update_or_create(
            banner_type=HomepageBanner.BannerType.EDITORIAL,
            defaults={
                'kicker': 'THE ATELIER MANIFESTO',
                'title': 'The Architecture of Silk & Linen',
                'subtitle': 'We reject ephemeral fast-fashion cycles. Each Saajnika piece is cut from hand-reeled fibers, dyed in small batches, and finished with meticulous French seams meant to last across generations.',
                'cta_text': 'EXPLORE OUR CRAFT',
                'cta_link': '/shop?category=the-silk-edit',
                'image_url': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
                'display_order': 2,
                'is_active': True
            }
        )

        # 8. Store Settings
        settings_map = {
            'store_announcement': 'COMPLIMENTARY DOMESTIC COURIER ON ORDERS OVER ₹3,999 | PRIVATE SALON PREVIEW',
            'brand_name': 'SAAJNIKA',
            'brand_tagline': 'Curated Contemporary Fashion & Heirlooms',
            'contact_email': 'concierge@saajnika.com',
            'contact_phone': '+91 (011) 4892-0199',
            'free_shipping_threshold': '3999',
            'standard_shipping_charge': '250',
            'atelier_address': 'The Dhan Mill, 100 Feet Road, Chhatarpur, New Delhi 110074'
        }
        for k, v in settings_map.items():
            StoreSetting.objects.update_or_create(key=k, defaults={'value': v})

        self.stdout.write(self.style.SUCCESS("All Saajnika seed data successfully initialized!"))
