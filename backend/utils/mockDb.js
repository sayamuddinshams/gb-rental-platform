import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'db_store.json');

// Ensure data directory exists
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export let dbData = {
  users: [],
  cities: [],
  owner_profiles: [],
  properties: [],
  property_images: [],
  amenities: [],
  property_amenities: [],
  favorites: [],
  messages: [],
  bookings: [],
  reviews: [],
  notifications: [],
  reports: [],
  activity_logs: []
};

// Load database from file
export const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(content);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error loading mock database, resetting. Error:', err.message);
    saveDb();
  }
};

// Save database to file
export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock database:', err.message);
  }
};

// Helper to query mock database using SQL regex matching
export const mockQuery = async (sql, params = []) => {
  loadDb();
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 0. COUNT / SUM AGGREGATION QUERIES (Admin Dashboard)
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM users WHERE role = 'tenant'/i)) {
    return { rows: [{ count: dbData.users.filter(u => u.role === 'tenant').length }] };
  }
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM users WHERE role = 'owner'/i)) {
    return { rows: [{ count: dbData.users.filter(u => u.role === 'owner').length }] };
  }
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM users/i)) {
    return { rows: [{ count: dbData.users.length }] };
  }
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM properties WHERE status = 'approved'/i)) {
    return { rows: [{ count: dbData.properties.filter(p => p.status === 'approved').length }] };
  }
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM properties/i)) {
    return { rows: [{ count: dbData.properties.length }] };
  }
  if (cleanSql.match(/SELECT SUM\(views_count\) as views FROM properties/i)) {
    const totalViews = dbData.properties.reduce((sum, p) => sum + (p.views_count || 0), 0);
    return { rows: [{ views: totalViews }] };
  }
  if (cleanSql.match(/SELECT COUNT\(\*\) as count FROM reports WHERE status = 'pending'/i)) {
    return { rows: [{ count: dbData.reports.filter(r => r.status === 'pending').length }] };
  }
  
  // 1. SELECT USERS BY EMAIL
  if (cleanSql.match(/SELECT \* FROM users WHERE email = \$1/i)) {
    const email = params[0].toLowerCase();
    const rows = dbData.users.filter(u => u.email.toLowerCase() === email);
    return { rows };
  }

  // 2. SELECT USERS BY ID
  if (cleanSql.match(/SELECT .* FROM users WHERE id = \$1/i)) {
    const id = parseInt(params[0], 10);
    const rows = dbData.users.filter(u => u.id === id);
    return { rows };
  }

  // 3. INSERT USER
  if (cleanSql.match(/INSERT INTO users \(([^)]+)\) VALUES \(([^)]+)\) RETURNING \*/i)) {
    const newUser = {
      id: dbData.users.length > 0 ? Math.max(...dbData.users.map(u => u.id)) + 1 : 1,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'tenant',
      is_verified: params[4] || false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.users.push(newUser);
    saveDb();
    return { rows: [newUser] };
  }

  // 4. SELECT ALL USERS (Admin dashboard)
  if (cleanSql.match(/SELECT .* FROM users ORDER BY id/i) || cleanSql.match(/SELECT .* FROM users/i)) {
    return { rows: dbData.users };
  }

  // 5. UPDATE USER STATUS (Ban/Unban)
  if (cleanSql.match(/UPDATE users SET status = \$1/i)) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const userIndex = dbData.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      dbData.users[userIndex].status = status;
      dbData.users[userIndex].updated_at = new Date().toISOString();
      saveDb();
      return { rows: [dbData.users[userIndex]] };
    }
    return { rows: [] };
  }

  // 6. UPDATE USER DETAILS
  if (cleanSql.match(/UPDATE users SET name = \$1, email = \$2/i)) {
    const name = params[0];
    const email = params[1];
    const id = parseInt(params[2], 10);
    const userIndex = dbData.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      dbData.users[userIndex].name = name;
      dbData.users[userIndex].email = email;
      dbData.users[userIndex].updated_at = new Date().toISOString();
      saveDb();
      return { rows: [dbData.users[userIndex]] };
    }
    return { rows: [] };
  }

  // 7. CITIES LIST
  if (cleanSql.match(/SELECT \* FROM cities ORDER BY name/i) || cleanSql.match(/SELECT \* FROM cities/i)) {
    return { rows: dbData.cities };
  }

  // 8. INSERT CITY
  if (cleanSql.match(/INSERT INTO cities/i)) {
    const newCity = {
      id: dbData.cities.length > 0 ? Math.max(...dbData.cities.map(c => c.id)) + 1 : 1,
      name: params[0],
      image_url: params[1],
      created_at: new Date().toISOString()
    };
    dbData.cities.push(newCity);
    saveDb();
    return { rows: [newCity] };
  }

  // 9. SELECT AMENITIES
  if (cleanSql.match(/SELECT \* FROM amenities/i)) {
    return { rows: dbData.amenities };
  }

  // 10. INSERT AMENITY
  if (cleanSql.match(/INSERT INTO amenities/i)) {
    const newAmenity = {
      id: dbData.amenities.length > 0 ? Math.max(...dbData.amenities.map(a => a.id)) + 1 : 1,
      name: params[0],
      icon: params[1]
    };
    dbData.amenities.push(newAmenity);
    saveDb();
    return { rows: [newAmenity] };
  }

  // 11. SELECT ALL PROPERTIES WITH DETAILS
  if (cleanSql.match(/SELECT p\.\*, c\.name as city_name, u\.name as owner_name FROM properties p/i)) {
    // Joint list representation
    let list = dbData.properties.map(p => {
      const city = dbData.cities.find(c => c.id === p.city_id);
      const owner = dbData.users.find(u => u.id === p.owner_id);
      return {
        ...p,
        city_name: city ? city.name : 'Unknown',
        owner_name: owner ? owner.name : 'Unknown Owner'
      };
    });
    
    // Check if filtering by owner_id or status is present in params
    // Highly specific checks for queries in controllers
    if (cleanSql.includes('p.owner_id = $1')) {
      const ownerId = parseInt(params[0], 10);
      list = list.filter(p => p.owner_id === ownerId);
    } else if (cleanSql.includes('p.status = $1') && params.length > 0) {
      const status = params[0];
      list = list.filter(p => p.status === status);
    }
    
    // Sort by id descending
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 12. SELECT PROPERTY BY ID WITH DETAILS
  if (cleanSql.match(/SELECT p\.\*, c\.name as city_name, u\.name as owner_name, u\.email as owner_email/i)) {
    const propertyId = parseInt(params[0], 10);
    const p = dbData.properties.find(prop => prop.id === propertyId);
    if (p) {
      const city = dbData.cities.find(c => c.id === p.city_id);
      const owner = dbData.users.find(u => u.id === p.owner_id);
      const ownerProfile = dbData.owner_profiles.find(op => op.user_id === p.owner_id);
      
      const record = {
        ...p,
        city_name: city ? city.name : 'Unknown',
        owner_name: owner ? owner.name : 'Unknown Owner',
        owner_email: owner ? owner.email : 'unknown@rentgb.com',
        owner_phone: ownerProfile ? ownerProfile.contact_number : 'Not Available',
        business_name: ownerProfile ? ownerProfile.business_name : 'Individual'
      };
      
      // Increment views count in mock mode for detail fetch
      p.views_count = (p.views_count || 0) + 1;
      saveDb();
      
      return { rows: [record] };
    }
    return { rows: [] };
  }

  // 13. INSERT PROPERTY
  if (cleanSql.match(/INSERT INTO properties/i)) {
    const newProp = {
      id: dbData.properties.length > 0 ? Math.max(...dbData.properties.map(p => p.id)) + 1 : 1,
      owner_id: parseInt(params[0], 10),
      city_id: parseInt(params[1], 10),
      title: params[2],
      description: params[3],
      price: parseFloat(params[4]),
      category: params[5],
      bedrooms: parseInt(params[6], 10) || 0,
      bathrooms: parseInt(params[7], 10) || 0,
      area: params[8],
      address: params[9],
      latitude: parseFloat(params[10]) || null,
      longitude: parseFloat(params[11]) || null,
      status: params[12] || 'pending',
      availability_status: 'available',
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.properties.push(newProp);
    saveDb();
    return { rows: [newProp] };
  }

  // 14. UPDATE PROPERTY
  if (cleanSql.match(/UPDATE properties SET/i)) {
    // Check if simple approve/reject status change
    if (cleanSql.includes('status = $1') && cleanSql.includes('id = $2')) {
      const status = params[0];
      const id = parseInt(params[1], 10);
      const propIndex = dbData.properties.findIndex(p => p.id === id);
      if (propIndex !== -1) {
        dbData.properties[propIndex].status = status;
        dbData.properties[propIndex].updated_at = new Date().toISOString();
        saveDb();
        return { rows: [dbData.properties[propIndex]] };
      }
    }
    
    // Check if availability status change
    if (cleanSql.includes('availability_status = $1') && cleanSql.includes('id = $2')) {
      const avail = params[0];
      const id = parseInt(params[1], 10);
      const propIndex = dbData.properties.findIndex(p => p.id === id);
      if (propIndex !== -1) {
        dbData.properties[propIndex].availability_status = avail;
        dbData.properties[propIndex].updated_at = new Date().toISOString();
        saveDb();
        return { rows: [dbData.properties[propIndex]] };
      }
    }

    // General property edit
    // params: city_id ($1), title ($2), description ($3), price ($4), category ($5), bedrooms ($6), bathrooms ($7), area ($8), address ($9), lat ($10), lng ($11), id ($12)
    if (params.length >= 12) {
      const city_id = parseInt(params[0], 10);
      const title = params[1];
      const description = params[2];
      const price = parseFloat(params[3]);
      const category = params[4];
      const bedrooms = parseInt(params[5], 10);
      const bathrooms = parseInt(params[6], 10);
      const area = params[7];
      const address = params[8];
      const lat = parseFloat(params[9]);
      const lng = parseFloat(params[10]);
      const id = parseInt(params[11], 10);

      const propIndex = dbData.properties.findIndex(p => p.id === id);
      if (propIndex !== -1) {
        dbData.properties[propIndex] = {
          ...dbData.properties[propIndex],
          city_id, title, description, price, category, bedrooms, bathrooms, area, address,
          latitude: lat, longitude: lng,
          updated_at: new Date().toISOString()
        };
        saveDb();
        return { rows: [dbData.properties[propIndex]] };
      }
    }
    return { rows: [] };
  }

  // 15. DELETE PROPERTY
  if (cleanSql.match(/DELETE FROM properties WHERE id = \$1/i)) {
    const id = parseInt(params[0], 10);
    const propIndex = dbData.properties.findIndex(p => p.id === id);
    if (propIndex !== -1) {
      const deleted = dbData.properties.splice(propIndex, 1)[0];
      // Clean up images and amenities
      dbData.property_images = dbData.property_images.filter(img => img.property_id !== id);
      dbData.property_amenities = dbData.property_amenities.filter(pa => pa.property_id !== id);
      dbData.bookings = dbData.bookings.filter(b => b.property_id !== id);
      dbData.favorites = dbData.favorites.filter(f => f.property_id !== id);
      dbData.reviews = dbData.reviews.filter(r => r.property_id !== id);
      saveDb();
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // 16. PROPERTY IMAGES SELECT
  if (cleanSql.match(/SELECT \* FROM property_images WHERE property_id = \$1/i)) {
    const propertyId = parseInt(params[0], 10);
    const rows = dbData.property_images.filter(img => img.property_id === propertyId);
    return { rows };
  }

  // 17. INSERT PROPERTY IMAGE
  if (cleanSql.match(/INSERT INTO property_images/i)) {
    const newImg = {
      id: dbData.property_images.length > 0 ? Math.max(...dbData.property_images.map(img => img.id)) + 1 : 1,
      property_id: parseInt(params[0], 10),
      image_url: params[1],
      is_featured: params[2] || false,
      created_at: new Date().toISOString()
    };
    dbData.property_images.push(newImg);
    saveDb();
    return { rows: [newImg] };
  }

  // 18. DELETE PROPERTY IMAGES
  if (cleanSql.match(/DELETE FROM property_images WHERE property_id = \$1/i)) {
    const propertyId = parseInt(params[0], 10);
    dbData.property_images = dbData.property_images.filter(img => img.property_id !== propertyId);
    saveDb();
    return { rows: [] };
  }

  // 19. SELECT AMENITIES FOR PROPERTY
  if (cleanSql.match(/SELECT a\.\* FROM amenities a JOIN property_amenities pa/i)) {
    const propertyId = parseInt(params[0], 10);
    const linkIds = dbData.property_amenities.filter(pa => pa.property_id === propertyId).map(pa => pa.amenity_id);
    const rows = dbData.amenities.filter(a => linkIds.includes(a.id));
    return { rows };
  }

  // 20. INSERT PROPERTY AMENITY LINK
  if (cleanSql.match(/INSERT INTO property_amenities/i)) {
    const pId = parseInt(params[0], 10);
    const aId = parseInt(params[1], 10);
    const exists = dbData.property_amenities.find(pa => pa.property_id === pId && pa.amenity_id === aId);
    if (!exists) {
      dbData.property_amenities.push({ property_id: pId, amenity_id: aId });
      saveDb();
    }
    return { rows: [] };
  }

  // 21. DELETE PROPERTY AMENITY LINKS
  if (cleanSql.match(/DELETE FROM property_amenities WHERE property_id = \$1/i)) {
    const propertyId = parseInt(params[0], 10);
    dbData.property_amenities = dbData.property_amenities.filter(pa => pa.property_id !== propertyId);
    saveDb();
    return { rows: [] };
  }

  // 22. SELECT FAVORITES FOR USER
  if (cleanSql.match(/SELECT f\.\*, p\.title, p\.price, p\.category, p\.address, c\.name as city_name/i) || cleanSql.match(/SELECT p\.\* FROM properties p JOIN favorites f/i)) {
    const userId = parseInt(params[0], 10);
    const favs = dbData.favorites.filter(f => f.user_id === userId);
    const favPropIds = favs.map(f => f.property_id);
    const rows = dbData.properties.filter(p => favPropIds.includes(p.id)).map(p => {
      const city = dbData.cities.find(c => c.id === p.city_id);
      return {
        ...p,
        city_name: city ? city.name : 'Unknown'
      };
    });
    return { rows };
  }

  // 23. ADD FAVORITE
  if (cleanSql.match(/INSERT INTO favorites \(user_id, property_id\) VALUES \(\$1, \$2\) RETURNING \*/i)) {
    const userId = parseInt(params[0], 10);
    const propertyId = parseInt(params[1], 10);
    const exists = dbData.favorites.find(f => f.user_id === userId && f.property_id === propertyId);
    if (!exists) {
      const newFav = {
        id: dbData.favorites.length > 0 ? Math.max(...dbData.favorites.map(f => f.id)) + 1 : 1,
        user_id: userId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      };
      dbData.favorites.push(newFav);
      saveDb();
      return { rows: [newFav] };
    }
    return { rows: [exists] };
  }

  // 24. REMOVE FAVORITE
  if (cleanSql.match(/DELETE FROM favorites WHERE user_id = \$1 AND property_id = \$2/i)) {
    const userId = parseInt(params[0], 10);
    const propertyId = parseInt(params[1], 10);
    dbData.favorites = dbData.favorites.filter(f => !(f.user_id === userId && f.property_id === propertyId));
    saveDb();
    return { rows: [] };
  }

  // 25. SELECT BOOKINGS FOR TENANT
  if (cleanSql.match(/SELECT b\.\*, p\.title as property_title, p\.address as property_address, u\.name as owner_name/i)) {
    const tenantId = parseInt(params[0], 10);
    const list = dbData.bookings
      .filter(b => b.tenant_id === tenantId)
      .map(b => {
        const prop = dbData.properties.find(p => p.id === b.property_id);
        const owner = prop ? dbData.users.find(u => u.id === prop.owner_id) : null;
        return {
          ...b,
          property_title: prop ? prop.title : 'Deleted Property',
          property_address: prop ? prop.address : 'Unknown',
          owner_name: owner ? owner.name : 'Unknown Owner'
        };
      });
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 26. SELECT BOOKINGS FOR OWNER
  if (cleanSql.match(/SELECT b\.\*, p\.title as property_title, u\.name as tenant_name, u\.email as tenant_email/i)) {
    const ownerId = parseInt(params[0], 10);
    const myPropertiesIds = dbData.properties.filter(p => p.owner_id === ownerId).map(p => p.id);
    const list = dbData.bookings
      .filter(b => myPropertiesIds.includes(b.property_id))
      .map(b => {
        const prop = dbData.properties.find(p => p.id === b.property_id);
        const tenant = dbData.users.find(u => u.id === b.tenant_id);
        return {
          ...b,
          property_title: prop ? prop.title : 'Deleted Property',
          tenant_name: tenant ? tenant.name : 'Unknown Tenant',
          tenant_email: tenant ? tenant.email : 'unknown@tenant.com'
        };
      });
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 27. INSERT BOOKING
  if (cleanSql.match(/INSERT INTO bookings/i)) {
    const newBooking = {
      id: dbData.bookings.length > 0 ? Math.max(...dbData.bookings.map(b => b.id)) + 1 : 1,
      tenant_id: parseInt(params[0], 10),
      property_id: parseInt(params[1], 10),
      visit_date: params[2],
      visit_time: params[3],
      notes: params[4] || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.bookings.push(newBooking);
    saveDb();
    return { rows: [newBooking] };
  }

  // 28. UPDATE BOOKING STATUS
  if (cleanSql.match(/UPDATE bookings SET status = \$1/i)) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const bookingIndex = dbData.bookings.findIndex(b => b.id === id);
    if (bookingIndex !== -1) {
      dbData.bookings[bookingIndex].status = status;
      dbData.bookings[bookingIndex].updated_at = new Date().toISOString();
      saveDb();
      return { rows: [dbData.bookings[bookingIndex]] };
    }
    return { rows: [] };
  }

  // 29. SELECT MESSAGES CHAT HISTORY BETWEEN TWO USERS
  if (cleanSql.match(/SELECT \* FROM messages WHERE/i)) {
    const userId1 = parseInt(params[0], 10);
    const userId2 = parseInt(params[1], 10);
    const chatRows = dbData.messages.filter(m => 
      (m.sender_id === userId1 && m.receiver_id === userId2) ||
      (m.sender_id === userId2 && m.receiver_id === userId1)
    );
    if (cleanSql.includes('ORDER BY created_at DESC') || cleanSql.includes('DESC LIMIT')) {
      chatRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      chatRows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    if (cleanSql.includes('LIMIT 1')) {
      return { rows: chatRows.slice(0, 1) };
    }
    return { rows: chatRows };
  }

  // 30. INSERT MESSAGE
  if (cleanSql.match(/INSERT INTO messages/i)) {
    const newMsg = {
      id: dbData.messages.length > 0 ? Math.max(...dbData.messages.map(m => m.id)) + 1 : 1,
      sender_id: parseInt(params[0], 10),
      receiver_id: parseInt(params[1], 10),
      message_text: params[2],
      is_read: false,
      created_at: new Date().toISOString()
    };
    dbData.messages.push(newMsg);
    saveDb();
    return { rows: [newMsg] };
  }

  // 31. OWNER PROFILE GET
  if (cleanSql.match(/SELECT \* FROM owner_profiles WHERE user_id = \$1/i)) {
    const userId = parseInt(params[0], 10);
    const rows = dbData.owner_profiles.filter(op => op.user_id === userId);
    return { rows };
  }

  // 32. OWNER PROFILE INSERT/UPDATE
  if (cleanSql.match(/INSERT INTO owner_profiles/i)) {
    const newProfile = {
      id: dbData.owner_profiles.length > 0 ? Math.max(...dbData.owner_profiles.map(op => op.id)) + 1 : 1,
      user_id: parseInt(params[0], 10),
      business_name: params[1],
      contact_number: params[2],
      business_address: params[3],
      company_logo: params[4] || null,
      is_verified: false,
      created_at: new Date().toISOString()
    };
    dbData.owner_profiles.push(newProfile);
    saveDb();
    return { rows: [newProfile] };
  }
  
  if (cleanSql.match(/UPDATE owner_profiles SET business_name = \$1/i)) {
    const bName = params[0];
    const phone = params[1];
    const addr = params[2];
    const userId = parseInt(params[3], 10);
    const idx = dbData.owner_profiles.findIndex(op => op.user_id === userId);
    if (idx !== -1) {
      dbData.owner_profiles[idx].business_name = bName;
      dbData.owner_profiles[idx].contact_number = phone;
      dbData.owner_profiles[idx].business_address = addr;
      saveDb();
      return { rows: [dbData.owner_profiles[idx]] };
    } else {
      const newProfile = {
        id: dbData.owner_profiles.length > 0 ? Math.max(...dbData.owner_profiles.map(op => op.id)) + 1 : 1,
        user_id: userId,
        business_name: bName,
        contact_number: phone,
        business_address: addr,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      dbData.owner_profiles.push(newProfile);
      saveDb();
      return { rows: [newProfile] };
    }
  }

  // 33. REVIEWS SELECT FOR PROPERTY
  if (cleanSql.match(/SELECT r\.\*, u\.name as tenant_name FROM reviews r JOIN users u/i)) {
    const propertyId = parseInt(params[0], 10);
    const rows = dbData.reviews
      .filter(r => r.property_id === propertyId)
      .map(r => {
        const tenant = dbData.users.find(u => u.id === r.tenant_id);
        return {
          ...r,
          tenant_name: tenant ? tenant.name : 'Anonymous'
        };
      });
    return { rows };
  }

  // 34. INSERT REVIEW
  if (cleanSql.match(/INSERT INTO reviews/i)) {
    const newRev = {
      id: dbData.reviews.length > 0 ? Math.max(...dbData.reviews.map(r => r.id)) + 1 : 1,
      tenant_id: parseInt(params[0], 10),
      property_id: parseInt(params[1], 10),
      rating: parseInt(params[2], 10),
      review_text: params[3],
      created_at: new Date().toISOString()
    };
    // Ensure uniqueness
    dbData.reviews = dbData.reviews.filter(r => !(r.tenant_id === newRev.tenant_id && r.property_id === newRev.property_id));
    dbData.reviews.push(newRev);
    saveDb();
    return { rows: [newRev] };
  }

  // 35. NOTIFICATIONS FOR USER
  if (cleanSql.match(/SELECT \* FROM notifications WHERE user_id = \$1/i)) {
    const userId = parseInt(params[0], 10);
    const list = dbData.notifications.filter(n => n.user_id === userId);
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 36. INSERT NOTIFICATION
  if (cleanSql.match(/INSERT INTO notifications/i)) {
    const newNotif = {
      id: dbData.notifications.length > 0 ? Math.max(...dbData.notifications.map(n => n.id)) + 1 : 1,
      user_id: parseInt(params[0], 10),
      title: params[1],
      message: params[2],
      is_read: false,
      created_at: new Date().toISOString()
    };
    dbData.notifications.push(newNotif);
    saveDb();
    return { rows: [newNotif] };
  }

  // 37. UPDATE NOTIFICATION AS READ
  if (cleanSql.match(/UPDATE notifications SET is_read = true WHERE user_id = \$1/i)) {
    const userId = parseInt(params[0], 10);
    dbData.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    saveDb();
    return { rows: [] };
  }

  // 38. SELECT REPORTS
  if (cleanSql.match(/SELECT r\.\*, u1\.name as reporter_name, u2\.name as reported_user_name, p\.title as property_title/i) || cleanSql.match(/SELECT \* FROM reports/i)) {
    const list = dbData.reports.map(r => {
      const reporter = dbData.users.find(u => u.id === r.reporter_id);
      const reportedUser = r.reported_user_id ? dbData.users.find(u => u.id === r.reported_user_id) : null;
      const prop = r.property_id ? dbData.properties.find(p => p.id === r.property_id) : null;
      return {
        ...r,
        reporter_name: reporter ? reporter.name : 'Unknown',
        reported_user_name: reportedUser ? reportedUser.name : 'N/A',
        property_title: prop ? prop.title : 'N/A'
      };
    });
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 39. INSERT REPORT
  if (cleanSql.match(/INSERT INTO reports/i)) {
    const newReport = {
      id: dbData.reports.length > 0 ? Math.max(...dbData.reports.map(r => r.id)) + 1 : 1,
      reporter_id: parseInt(params[0], 10),
      reported_user_id: params[1] ? parseInt(params[1], 10) : null,
      property_id: params[2] ? parseInt(params[2], 10) : null,
      report_type: params[3],
      description: params[4],
      status: 'pending',
      created_at: new Date().toISOString()
    };
    dbData.reports.push(newReport);
    saveDb();
    return { rows: [newReport] };
  }

  // 40. UPDATE REPORT STATUS
  if (cleanSql.match(/UPDATE reports SET status = \$1 WHERE id = \$2/i)) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const idx = dbData.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      dbData.reports[idx].status = status;
      saveDb();
    }
    return { rows: [] };
  }

  // 41. SYSTEM LOGS
  if (cleanSql.match(/SELECT \* FROM activity_logs/i)) {
    const list = dbData.activity_logs.map(log => {
      const user = dbData.users.find(u => u.id === log.user_id);
      return {
        ...log,
        user_name: user ? user.name : 'System'
      };
    });
    list.sort((a, b) => b.id - a.id);
    return { rows: list };
  }

  // 42. INSERT LOG
  if (cleanSql.match(/INSERT INTO activity_logs/i)) {
    const newLog = {
      id: dbData.activity_logs.length > 0 ? Math.max(...dbData.activity_logs.map(l => l.id)) + 1 : 1,
      user_id: params[0] ? parseInt(params[0], 10) : null,
      action: params[1],
      details: params[2] || '',
      created_at: new Date().toISOString()
    };
    dbData.activity_logs.push(newLog);
    saveDb();
    return { rows: [newLog] };
  }

  // 43. Aggregations (moved to top of mockQuery)

  // 44. OWNER VERIFICATION & BANNING IN USERS / PROFILE
  if (cleanSql.match(/UPDATE users SET is_verified = true WHERE id = \$1/i)) {
    const id = parseInt(params[0], 10);
    const idx = dbData.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      dbData.users[idx].is_verified = true;
      saveDb();
    }
    return { rows: [] };
  }
  if (cleanSql.match(/UPDATE owner_profiles SET is_verified = true WHERE user_id = \$1/i)) {
    const userId = parseInt(params[0], 10);
    const idx = dbData.owner_profiles.findIndex(op => op.user_id === userId);
    if (idx !== -1) {
      dbData.owner_profiles[idx].is_verified = true;
      saveDb();
    }
    return { rows: [] };
  }

  // 45. MESSAGE CONTACTS & RECIPIENTS SELECT
  if (cleanSql.match(/SELECT DISTINCT receiver_id as id FROM messages WHERE sender_id = \$1/i)) {
    const senderId = parseInt(params[0], 10);
    const ids = Array.from(new Set(dbData.messages.filter(m => m.sender_id === senderId).map(m => m.receiver_id)));
    return { rows: ids.map(id => ({ id })) };
  }
  if (cleanSql.match(/SELECT DISTINCT sender_id as id FROM messages WHERE receiver_id = \$1/i)) {
    const receiverId = parseInt(params[0], 10);
    const ids = Array.from(new Set(dbData.messages.filter(m => m.receiver_id === receiverId).map(m => m.sender_id)));
    return { rows: ids.map(id => ({ id })) };
  }
  if (cleanSql.match(/SELECT .* FROM users WHERE id IN \(([^)]+)\)/i)) {
    const match = cleanSql.match(/id IN \(([^)]+)\)/i);
    const ids = match[1].split(',').map(id => parseInt(id.trim(), 10));
    const rows = dbData.users.filter(u => ids.includes(u.id));
    return { rows };
  }
  if (cleanSql.match(/UPDATE messages SET is_read = true WHERE sender_id = \$1 AND receiver_id = \$2 AND is_read = false/i)) {
    const senderId = parseInt(params[0], 10);
    const receiverId = parseInt(params[1], 10);
    dbData.messages.forEach(m => {
      if (m.sender_id === senderId && m.receiver_id === receiverId && !m.is_read) {
        m.is_read = true;
      }
    });
    saveDb();
    return { rows: [] };
  }

  // 46. SELECT SINGLE PROPERTY BY ID / ADMIN SELECTION
  if (cleanSql.match(/SELECT \* FROM properties WHERE id = \$1/i)) {
    const id = parseInt(params[0], 10);
    const rows = dbData.properties.filter(p => p.id === id);
    return { rows };
  }
  if (cleanSql.match(/SELECT id FROM users WHERE role = 'admin'/i) || cleanSql.match(/SELECT id FROM users WHERE role = \$1/i)) {
    const role = params[0] || 'admin';
    const rows = dbData.users.filter(u => u.role === role).map(u => ({ id: u.id }));
    return { rows };
  }

  // 47. SELECT FAVORITES AND BOOKINGS DETAIL CHECKS
  if (cleanSql.match(/SELECT \* FROM favorites WHERE user_id = \$1 AND property_id = \$2/i)) {
    const userId = parseInt(params[0], 10);
    const propertyId = parseInt(params[1], 10);
    const rows = dbData.favorites.filter(f => f.user_id === userId && f.property_id === propertyId);
    return { rows };
  }
  if (cleanSql.match(/SELECT b\.\*, p\.title as property_title, p\.owner_id FROM bookings b JOIN properties p/i)) {
    const id = parseInt(params[0], 10);
    const booking = dbData.bookings.find(b => b.id === id);
    if (booking) {
      const prop = dbData.properties.find(p => p.id === booking.property_id);
      return {
        rows: [{
          ...booking,
          property_title: prop ? prop.title : 'Unknown Property',
          owner_id: prop ? prop.owner_id : null
        }]
      };
    }
    return { rows: [] };
  }

  // Fallback default: empty rows
  console.warn('Mock DB unhandled SQL query pattern:', sql);
  return { rows: [] };
};
