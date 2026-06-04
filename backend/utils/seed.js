import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { saveDb, loadDb, dbData } from './mockDb.js';

const seed = async () => {
  console.log('Starting RentGB Database Seeding...');
  
  // 1. Password hashing
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const ownerHash = await bcrypt.hash('owner123', salt);
  const tenantHash = await bcrypt.hash('tenant123', salt);

  // 2. Data Definition
  const cities = [
    { name: 'Gilgit', image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Skardu', image_url: 'https://images.unsplash.com/photo-1627063410772-2f3b9000dfb3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Hunza', image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80' },
    { name: 'Nagar', image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80' },
    { name: 'Ghizer', image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80' },
    { name: 'Islamabad', image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
    { name: 'Karachi', image_url: 'https://images.unsplash.com/photo-1608930264026-619f8cee0d0e?auto=format&fit=crop&w=800&q=80' },
    { name: 'Lahore', image_url: 'https://images.unsplash.com/photo-1599387737281-807597af816c?auto=format&fit=crop&w=800&q=80' }
  ];

  const amenities = [
    { name: 'High-speed WiFi', icon: 'Wifi' },
    { name: 'Hot Water / Geyser', icon: 'Thermometer' },
    { name: 'Central Heating', icon: 'Flame' },
    { name: 'Dedicated Parking', icon: 'Car' },
    { name: 'Scenic Mountain View', icon: 'Compass' },
    { name: '24/7 Security Cameras', icon: 'ShieldCheck' },
    { name: 'Kitchen Facilities', icon: 'Utensils' },
    { name: 'Power Backup / Generator', icon: 'Zap' }
  ];

  const users = [
    { name: 'RentGB Administrator', email: 'admin@gmail.com', password_hash: adminHash, role: 'admin', is_verified: true },
    { name: 'Karakoram Properties Ltd.', email: 'owner@gmail.com', password_hash: ownerHash, role: 'owner', is_verified: true },
    { name: 'Ali Ahmed', email: 'tenant@gmail.com', password_hash: tenantHash, role: 'tenant', is_verified: true }
  ];

  // If using JSON database mode, we can directly populate the database structure
  if (process.env.DB_MODE === 'json' || !process.env.DATABASE_URL) {
    loadDb();
    
    // Seed Users
    console.log('Seeding Mock Users...');
    dbData.users = users.map((u, i) => ({ id: i + 1, ...u, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    
    // Seed Cities
    console.log('Seeding Mock Cities...');
    dbData.cities = cities.map((c, i) => ({ id: i + 1, ...c, created_at: new Date().toISOString() }));
    
    // Seed Owner Profile
    console.log('Seeding Mock Owner Profile...');
    dbData.owner_profiles = [
      {
        id: 1,
        user_id: 2, // owner
        business_name: 'Karakoram Properties & Rentals',
        contact_number: '+92 345 1234567',
        business_address: 'Main Bazaar, Karimabad, Hunza Valley, Gilgit-Baltistan',
        is_verified: true,
        company_logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
        created_at: new Date().toISOString()
      }
    ];

    // Seed Amenities
    console.log('Seeding Mock Amenities...');
    dbData.amenities = amenities.map((a, i) => ({ id: i + 1, ...a }));

    // Seed Properties
    console.log('Seeding Mock Properties...');
    const properties = [
      {
        id: 1,
        owner_id: 2,
        city_id: 3, // Hunza
        title: 'Hunza Heights Luxury Guest Cottage',
        description: 'Enjoy panoramic views of Rakaposhi and Ultar Sar from this gorgeous fully furnished guest cottage. Perfect for families, tourists, and digital nomads looking for high-speed internet and uninterrupted peace in Karimabad. Includes cozy heating, modern bathroom, and fully functional kitchen.',
        price: 12000.00,
        category: 'home',
        bedrooms: 3,
        bathrooms: 2,
        area: '10 Marla',
        address: 'Zero Point Road, Karimabad, Hunza',
        latitude: 36.3167,
        longitude: 74.6500,
        status: 'approved',
        availability_status: 'available',
        views_count: 342,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        owner_id: 2,
        city_id: 1, // Gilgit
        title: 'Cozy 1-Bedroom Studio Apartment',
        description: 'Modern, newly built studio apartment located in the secure and peaceful neighborhood of Jutial, Gilgit. Perfect for working professionals or couples. Safe parking and close to local supermarkets and medical centers.',
        price: 4500.00,
        category: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        area: '5 Marla',
        address: 'Jutial Cantt Road, near Serena Hotel, Gilgit',
        latitude: 35.9208,
        longitude: 74.3089,
        status: 'approved',
        availability_status: 'available',
        views_count: 189,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        owner_id: 2,
        city_id: 2, // Skardu
        title: 'Karakoram Boys & Girls Student Hostel Room',
        description: 'Affordable, shared accommodation rooms specifically designed for college and university students in Skardu. High-speed study friendly WiFi, 24/7 hot water, and a shared study hall. Walking distance from University of Baltistan.',
        price: 2500.00,
        category: 'hostel',
        bedrooms: 2,
        bathrooms: 1,
        area: '300 Sq Ft',
        address: 'College Road, near UOB Campus, Skardu',
        latitude: 35.2981,
        longitude: 75.6333,
        status: 'approved',
        availability_status: 'available',
        views_count: 98,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        owner_id: 2,
        city_id: 1, // Gilgit
        title: 'Commercial Boutique Shop in Main Bazaar',
        description: 'Excellent business opportunity in the heart of Gilgit. High foot traffic retail space suitable for garments, handicrafts, dry fruit setups, or a mobile outlet. Shutter gates and internal security systems installed.',
        price: 22000.00,
        category: 'shop',
        bedrooms: 0,
        bathrooms: 0,
        area: '450 Sq Ft',
        address: 'Saddar Bazaar Main Road, Gilgit',
        latitude: 35.9189,
        longitude: 74.3210,
        status: 'pending',
        availability_status: 'available',
        views_count: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        owner_id: 2,
        city_id: 2, // Skardu
        title: 'Premium Multi-Desk Office Space',
        description: 'Ready-to-move-in commercial office space with multiple cubicles, a meeting table, high-speed backup generators, and clean toilets. Ideal for software agencies, NGOs, or travel operators in Skardu.',
        price: 35000.00,
        category: 'office',
        bedrooms: 0,
        bathrooms: 2,
        area: '1500 Sq Ft',
        address: 'Hussaini Chowk, near airport road, Skardu',
        latitude: 35.3020,
        longitude: 75.6410,
        status: 'approved',
        availability_status: 'available',
        views_count: 76,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    dbData.properties = properties;

    // Seed Images
    console.log('Seeding Mock Images...');
    dbData.property_images = [
      { id: 1, property_id: 1, image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', is_featured: true, created_at: new Date().toISOString() },
      { id: 2, property_id: 1, image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', is_featured: false, created_at: new Date().toISOString() },
      { id: 3, property_id: 1, image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', is_featured: false, created_at: new Date().toISOString() },
      { id: 4, property_id: 2, image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80', is_featured: true, created_at: new Date().toISOString() },
      { id: 5, property_id: 2, image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', is_featured: false, created_at: new Date().toISOString() },
      { id: 6, property_id: 3, image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80', is_featured: true, created_at: new Date().toISOString() },
      { id: 7, property_id: 4, image_url: 'https://images.unsplash.com/photo-1582037917204-db05f8576956?auto=format&fit=crop&w=1200&q=80', is_featured: true, created_at: new Date().toISOString() },
      { id: 8, property_id: 5, image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', is_featured: true, created_at: new Date().toISOString() }
    ];

    // Seed Property-Amenity links
    console.log('Seeding Property Amenities Links...');
    dbData.property_amenities = [
      // Cottage: wifi, hot water, heating, parking, mountain view, kitchen, power backup
      { property_id: 1, amenity_id: 1 },
      { property_id: 1, amenity_id: 2 },
      { property_id: 1, amenity_id: 3 },
      { property_id: 1, amenity_id: 4 },
      { property_id: 1, amenity_id: 5 },
      { property_id: 1, amenity_id: 7 },
      { property_id: 1, amenity_id: 8 },
      // Studio: wifi, hot water, heating, kitchen
      { property_id: 2, amenity_id: 1 },
      { property_id: 2, amenity_id: 2 },
      { property_id: 2, amenity_id: 3 },
      { property_id: 2, amenity_id: 7 },
      // Hostel: wifi, hot water, parking, power backup
      { property_id: 3, amenity_id: 1 },
      { property_id: 3, amenity_id: 2 },
      { property_id: 3, amenity_id: 4 },
      { property_id: 3, amenity_id: 8 },
      // Office: wifi, security, power backup, parking
      { property_id: 5, amenity_id: 1 },
      { property_id: 5, amenity_id: 4 },
      { property_id: 5, amenity_id: 6 },
      { property_id: 5, amenity_id: 8 }
    ];

    // Seed Favorites (Tenant favs Hunza Heights)
    dbData.favorites = [
      { id: 1, user_id: 3, property_id: 1, created_at: new Date().toISOString() }
    ];

    // Seed Bookings (Tenant booking Hunza cottage)
    dbData.bookings = [
      {
        id: 1,
        tenant_id: 3,
        property_id: 1,
        visit_date: '2026-06-15',
        visit_time: '11:00 AM',
        status: 'pending',
        notes: 'I would like to schedule a tour of the cottage. I am visiting Hunza from Lahore next week and want to verify details.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Seed Review
    dbData.reviews = [
      {
        id: 1,
        tenant_id: 3,
        property_id: 1,
        rating: 5,
        review_text: 'Absolutely breathtaking! The mountain views are real, and the wifi speed was perfect for my remote work meetings. The owner was extremely helpful and responsive.',
        created_at: new Date().toISOString()
      }
    ];

    // Seed Notification
    dbData.notifications = [
      {
        id: 1,
        user_id: 3, // Tenant
        title: 'Welcome to RentGB!',
        message: 'Your tenant profile is active. Start exploring rental properties in Gilgit-Baltistan without brokers.',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: 2, // Owner
        title: 'New Booking Request Received',
        message: 'Ali Ahmed has requested a visit for your property "Hunza Heights Luxury Guest Cottage".',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];

    // Seed Messages
    dbData.messages = [
      {
        id: 1,
        sender_id: 3, // Tenant
        receiver_id: 2, // Owner
        message_text: 'Hello, is the Hunza Heights cottage available for long term rent of 3 months?',
        is_read: true,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        sender_id: 2, // Owner
        receiver_id: 3, // Tenant
        message_text: 'Yes Ali! It is available. You can schedule a visit request through the portal so we can connect.',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];

    // Seed Reports
    dbData.reports = [
      {
        id: 1,
        reporter_id: 3,
        reported_user_id: 2,
        property_id: 2,
        report_type: 'spam_property',
        description: 'Testing report: The pricing shown is slightly lower than what the owner mentioned on call. Please verify.',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];

    // Seed Logs
    dbData.activity_logs = [
      { id: 1, user_id: 2, action: 'CREATE_LISTING', details: 'Added property "Hunza Heights Luxury Guest Cottage"', created_at: new Date().toISOString() },
      { id: 2, user_id: 1, action: 'VERIFY_OWNER', details: 'Approved owner account "Karakoram Properties Ltd."', created_at: new Date().toISOString() }
    ];

    saveDb();
    console.log('Mock database seeding completed successfully!');
  } else {
    // If PostgreSQL mode is active, we insert into real tables
    console.log('Seeding PostgreSQL database...');
    
    // Clear tables
    await db.query('TRUNCATE TABLE activity_logs, reports, notifications, reviews, bookings, messages, favorites, property_amenities, amenities, property_images, properties, owner_profiles, users, cities RESTART IDENTITY CASCADE');

    // Cities
    for (const c of cities) {
      await db.query('INSERT INTO cities (name, image_url) VALUES ($1, $2)', [c.name, c.image_url]);
    }
    // Amenities
    for (const a of amenities) {
      await db.query('INSERT INTO amenities (name, icon) VALUES ($1, $2)', [a.name, a.icon]);
    }
    // Users
    for (const u of users) {
      await db.query('INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5)', [u.name, u.email, u.password_hash, u.role, u.is_verified]);
    }

    // Owner Profile
    await db.query(`
      INSERT INTO owner_profiles (user_id, business_name, contact_number, business_address, is_verified, company_logo)
      VALUES (2, 'Karakoram Properties & Rentals', '+92 345 1234567', 'Main Bazaar, Karimabad, Hunza Valley, Gilgit-Baltistan', true, 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80')
    `);

    // Properties
    const cottage = await db.query(`
      INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status, availability_status, views_count)
      VALUES (2, 3, 'Hunza Heights Luxury Guest Cottage', 'Enjoy panoramic views of Rakaposhi and Ultar Sar from this gorgeous fully furnished guest cottage. Perfect for families, tourists, and digital nomads looking for high-speed internet and uninterrupted peace in Karimabad. Includes cozy heating, modern bathroom, and fully functional kitchen.', 12000.00, 'home', 3, 2, '10 Marla', 'Zero Point Road, Karimabad, Hunza', 36.3167, 74.6500, 'approved', 'available', 342)
      RETURNING id
    `);
    const cottageId = cottage.rows[0].id;

    const studio = await db.query(`
      INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status, availability_status, views_count)
      VALUES (2, 1, 'Cozy 1-Bedroom Studio Apartment', 'Modern, newly built studio apartment located in the secure and peaceful neighborhood of Jutial, Gilgit. Perfect for working professionals or couples. Safe parking and close to local supermarkets and medical centers.', 4500.00, 'apartment', 1, 1, '5 Marla', 'Jutial Cantt Road, near Serena Hotel, Gilgit', 35.9208, 74.3089, 'approved', 'available', 189)
      RETURNING id
    `);
    const studioId = studio.rows[0].id;

    const hostel = await db.query(`
      INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status, availability_status, views_count)
      VALUES (2, 2, 'Karakoram Boys & Girls Student Hostel Room', 'Affordable, shared accommodation rooms specifically designed for college and university students in Skardu. High-speed study friendly WiFi, 24/7 hot water, and a shared study hall. Walking distance from University of Baltistan.', 2500.00, 'hostel', 2, 1, '300 Sq Ft', 'College Road, near UOB Campus, Skardu', 35.2981, 75.6333, 'approved', 'available', 98)
      RETURNING id
    `);
    const hostelId = hostel.rows[0].id;

    await db.query(`
      INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status, availability_status, views_count)
      VALUES (2, 1, 'Commercial Boutique Shop in Main Bazaar', 'Excellent business opportunity in the heart of Gilgit. High foot traffic retail space suitable for garments, handicrafts, dry fruit setups, or a mobile outlet. Shutter gates and internal security systems installed.', 22000.00, 'shop', 0, 0, '450 Sq Ft', 'Saddar Bazaar Main Road, Gilgit', 35.9189, 74.3210, 'pending', 'available', 45)
    `);

    const office = await db.query(`
      INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status, availability_status, views_count)
      VALUES (2, 2, 'Premium Multi-Desk Office Space', 'Ready-to-move-in commercial office space with multiple cubicles, a meeting table, high-speed backup generators, and clean toilets. Ideal for software agencies, NGOs, or travel operators in Skardu.', 35000.00, 'office', 0, 2, '1500 Sq Ft', 'Hussaini Chowk, near airport road, Skardu', 35.3020, 75.6410, 'approved', 'available', 76)
      RETURNING id
    `);
    const officeId = office.rows[0].id;

    // Property Images
    const images = [
      [cottageId, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', true],
      [cottageId, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', false],
      [cottageId, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', false],
      [studioId, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80', true],
      [studioId, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', false],
      [hostelId, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80', true],
      [officeId, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', true]
    ];

    for (const img of images) {
      await db.query('INSERT INTO property_images (property_id, image_url, is_featured) VALUES ($1, $2, $3)', img);
    }

    // Property Amenities Links
    const links = [
      [cottageId, 1], [cottageId, 2], [cottageId, 3], [cottageId, 4], [cottageId, 5], [cottageId, 7], [cottageId, 8],
      [studioId, 1], [studioId, 2], [studioId, 3], [studioId, 7],
      [hostelId, 1], [hostelId, 2], [hostelId, 4], [hostelId, 8],
      [officeId, 1], [officeId, 4], [officeId, 6], [officeId, 8]
    ];

    for (const l of links) {
      await db.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2)', l);
    }

    // Favorites
    await db.query('INSERT INTO favorites (user_id, property_id) VALUES (3, $1)', [cottageId]);

    // Bookings
    await db.query(`
      INSERT INTO bookings (tenant_id, property_id, visit_date, visit_time, notes, status)
      VALUES (3, $1, '2026-06-15', '11:00 AM', 'I would like to schedule a tour of the cottage. I am visiting Hunza from Lahore next week and want to verify details.', 'pending')
    `, [cottageId]);

    // Reviews
    await db.query(`
      INSERT INTO reviews (tenant_id, property_id, rating, review_text)
      VALUES (3, $1, 5, 'Absolutely breathtaking! The mountain views are real, and the wifi speed was perfect for my remote work meetings. The owner was extremely helpful and responsive.')
    `, [cottageId]);

    // Notifications
    await db.query("INSERT INTO notifications (user_id, title, message) VALUES (3, 'Welcome to RentGB!', 'Your tenant profile is active. Start exploring rental properties in Gilgit-Baltistan without brokers.')");
    await db.query("INSERT INTO notifications (user_id, title, message) VALUES (2, 'New Booking Request Received', 'Ali Ahmed has requested a visit for your property \"Hunza Heights Luxury Guest Cottage\".')");

    // Messages
    await db.query("INSERT INTO messages (sender_id, receiver_id, message_text, is_read) VALUES (3, 2, 'Hello, is the Hunza Heights cottage available for long term rent of 3 months?', true)");
    await db.query("INSERT INTO messages (sender_id, receiver_id, message_text, is_read) VALUES (2, 3, 'Yes Ali! It is available. You can schedule a visit request through the portal so we can connect.', false)");

    // Reports
    await db.query("INSERT INTO reports (reporter_id, reported_user_id, property_id, report_type, description) VALUES (3, 2, $1, 'spam_property', 'Testing report: The pricing shown is slightly lower than what the owner mentioned on call. Please verify.')", [studioId]);

    // Activity Logs
    await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (2, 'CREATE_LISTING', 'Added property \"Hunza Heights Luxury Guest Cottage\"')");
    await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (1, 'VERIFY_OWNER', 'Approved owner account \"Karakoram Properties Ltd.\"')");

    console.log('PostgreSQL database seeded successfully!');
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seed().then(() => {
    console.log('Seed process finished.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seed process failed:', err);
    process.exit(1);
  });
}

export default seed;
