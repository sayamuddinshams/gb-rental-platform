import db from '../config/db.js';

// @desc    Get all active/approved listings (with advanced filtering)
// @route   GET /api/properties
export const getProperties = async (req, res, next) => {
  const { city, category, minPrice, maxPrice, bedrooms, search, sort, limit = 50, offset = 0 } = req.query;

  try {
    // We call the custom detailed SELECT from db
    const queryResult = await db.query(
      'SELECT p.*, c.name as city_name, u.name as owner_name FROM properties p JOIN cities c ON p.city_id = c.id JOIN users u ON p.owner_id = u.id'
    );
    
    let properties = queryResult.rows;

    // Apply Filters in JavaScript for compatibility across JSON and Postgres modes
    if (city) {
      properties = properties.filter(p => p.city_name.toLowerCase() === city.toLowerCase());
    }

    if (category) {
      properties = properties.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minPrice) {
      properties = properties.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      properties = properties.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (bedrooms) {
      properties = properties.filter(p => p.bedrooms === parseInt(bedrooms, 10));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower)
      );
    }

    // Sort: default to newest
    if (sort === 'price_asc') {
      properties.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      properties.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      properties.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else {
      // Default: newest
      properties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Inject featured image for each property
    for (let p of properties) {
      const imagesResult = await db.query('SELECT * FROM property_images WHERE property_id = $1', [p.id]);
      p.images = imagesResult.rows;
      p.featured_image = p.images.find(img => img.is_featured)?.image_url || p.images[0]?.image_url || '';
    }

    // Apply pagination
    const totalCount = properties.length;
    const paginatedProps = properties.slice(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10));

    res.json({
      properties: paginatedProps,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property details
// @route   GET /api/properties/:id
export const getPropertyById = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  try {
    const propQuery = await db.query('SELECT p.*, c.name as city_name, u.name as owner_name, u.email as owner_email FROM properties p JOIN cities c ON p.city_id = c.id JOIN users u ON p.owner_id = u.id WHERE p.id = $1', [id]);
    
    if (propQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = propQuery.rows[0];

    // Get Images
    const imagesQuery = await db.query('SELECT * FROM property_images WHERE property_id = $1', [id]);
    property.images = imagesQuery.rows;

    // Get Amenities
    const amenitiesQuery = await db.query('SELECT a.* FROM amenities a JOIN property_amenities pa ON a.id = pa.amenity_id WHERE pa.property_id = $1', [id]);
    property.amenities = amenitiesQuery.rows;

    // Get Reviews
    const reviewsQuery = await db.query('SELECT r.*, u.name as tenant_name FROM reviews r JOIN users u ON r.tenant_id = u.id WHERE r.property_id = $1', [id]);
    property.reviews = reviewsQuery.rows;

    // Calculate Average Rating
    const totalReviews = property.reviews.length;
    const averageRating = totalReviews > 0 
      ? parseFloat((property.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;
    property.rating_stats = {
      average: averageRating,
      count: totalReviews
    };

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new property listing (Owner only)
// @route   POST /api/properties
export const createProperty = async (req, res, next) => {
  const { 
    cityId, title, description, price, category, bedrooms, bathrooms, area, address, 
    latitude, longitude, images, amenities 
  } = req.body;

  try {
    if (!cityId || !title || !price || !category || !address) {
      return res.status(400).json({ message: 'Please provide all mandatory details' });
    }

    // Insert Property (Initial status pending approval)
    const result = await db.query(
      'INSERT INTO properties (owner_id, city_id, title, description, price, category, bedrooms, bathrooms, area, address, latitude, longitude, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [
        req.user.id, 
        parseInt(cityId, 10), 
        title, 
        description || '', 
        parseFloat(price), 
        category, 
        parseInt(bedrooms, 10) || 0, 
        parseInt(bathrooms, 10) || 0, 
        area || '', 
        address, 
        latitude ? parseFloat(latitude) : null, 
        longitude ? parseFloat(longitude) : null,
        'pending' // Requires admin review
      ]
    );

    const property = result.rows[0];

    // Insert Images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO property_images (property_id, image_url, is_featured) VALUES ($1, $2, $3)',
          [property.id, images[i], i === 0]
        );
      }
    }

    // Insert Amenities
    if (amenities && amenities.length > 0) {
      for (const amenityId of amenities) {
        await db.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2)',
          [property.id, parseInt(amenityId, 10)]
        );
      }
    }

    // System Notification for Admin
    const admins = await db.query("SELECT id FROM users WHERE role = 'admin'");
    for (let adminUser of admins.rows) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
        [adminUser.id, 'New Property Listing Pending Approval', `Owner ${req.user.name} posted a new property: ${title}`]
      );
    }

    // Activity Log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'CREATE_PROPERTY', `Created property "${title}" (ID: ${property.id})`]
    );

    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Update property listing (Owner only)
// @route   PUT /api/properties/:id
export const updateProperty = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { 
    cityId, title, description, price, category, bedrooms, bathrooms, area, address, 
    latitude, longitude, images, amenities, availability_status 
  } = req.body;

  try {
    // Verify ownership
    const propCheck = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (propCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const existingProp = propCheck.rows[0];
    if (existingProp.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

    // Allow changing status
    if (availability_status) {
      await db.query(
        'UPDATE properties SET availability_status = $1 WHERE id = $2',
        [availability_status, id]
      );
    }

    // Update main details
    await db.query(
      'UPDATE properties SET city_id = $1, title = $2, description = $3, price = $4, category = $5, bedrooms = $6, bathrooms = $7, area = $8, address = $9, latitude = $10, longitude = $11, updated_at = NOW() WHERE id = $12',
      [
        parseInt(cityId || existingProp.city_id, 10),
        title || existingProp.title,
        description !== undefined ? description : existingProp.description,
        price !== undefined ? parseFloat(price) : existingProp.price,
        category || existingProp.category,
        bedrooms !== undefined ? parseInt(bedrooms, 10) : existingProp.bedrooms,
        bathrooms !== undefined ? parseInt(bathrooms, 10) : existingProp.bathrooms,
        area !== undefined ? area : existingProp.area,
        address || existingProp.address,
        latitude !== undefined ? parseFloat(latitude) : existingProp.latitude,
        longitude !== undefined ? parseFloat(longitude) : existingProp.longitude,
        id
      ]
    );

    // Refresh images
    if (images && images.length > 0) {
      await db.query('DELETE FROM property_images WHERE property_id = $1', [id]);
      for (let i = 0; i < images.length; i++) {
        await db.query(
          'INSERT INTO property_images (property_id, image_url, is_featured) VALUES ($1, $2, $3)',
          [id, images[i], i === 0]
        );
      }
    }

    // Refresh amenities
    if (amenities) {
      await db.query('DELETE FROM property_amenities WHERE property_id = $1', [id]);
      for (const amenityId of amenities) {
        await db.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2)',
          [id, parseInt(amenityId, 10)]
        );
      }
    }

    // Activity Log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'UPDATE_PROPERTY', `Updated property "${title || existingProp.title}" (ID: ${id})`]
    );

    res.json({ message: 'Property updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
export const deleteProperty = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  try {
    const propCheck = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (propCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const prop = propCheck.rows[0];
    if (prop.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await db.query('DELETE FROM properties WHERE id = $1', [id]);

    // Activity Log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'DELETE_PROPERTY', `Deleted property "${prop.title}" (ID: ${id})`]
    );

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle property as favorite (Tenant/User)
// @route   POST /api/properties/:id/favorite
export const toggleFavorite = async (req, res, next) => {
  const propertyId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  try {
    const exist = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
    
    if (exist.rows.length > 0) {
      // Remove
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // Add
      await db.query('INSERT INTO favorites (user_id, property_id) VALUES ($1, $2) RETURNING *', [userId, propertyId]);
      res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's favorites
// @route   GET /api/properties/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT p.* FROM properties p JOIN favorites f ON p.id = f.property_id WHERE f.user_id = $1', 
      [req.user.id]
    );

    const properties = result.rows;
    for (let p of properties) {
      const imagesResult = await db.query('SELECT * FROM property_images WHERE property_id = $1', [p.id]);
      p.featured_image = imagesResult.rows.find(img => img.is_featured)?.image_url || imagesResult.rows[0]?.image_url || '';
    }

    res.json(properties);
  } catch (err) {
    next(err);
  }
};

// @desc    Add a review (Tenant/User)
// @route   POST /api/properties/:id/reviews
export const addReview = async (req, res, next) => {
  const propertyId = parseInt(req.params.id, 10);
  const { rating, reviewText } = req.body;

  try {
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Please provide a rating (1-5) and review content' });
    }

    const prop = await db.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (prop.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Upsert review
    const result = await db.query(
      'INSERT INTO reviews (tenant_id, property_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, propertyId, parseInt(rating, 10), reviewText]
    );

    // Notify owner
    const propOwnerId = prop.rows[0].owner_id;
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [propOwnerId, 'New Review Received', `${req.user.name} rated your property "${prop.rows[0].title}" ${rating} stars.`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of all supported cities
// @route   GET /api/properties/cities
export const getCities = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM cities ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of all supported amenities
// @route   GET /api/properties/amenities
export const getAmenities = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM amenities');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a report for property/user
// @route   POST /api/properties/:id/report
export const reportProperty = async (req, res, next) => {
  const propertyId = parseInt(req.params.id, 10);
  const { reportType, description } = req.body;

  try {
    const propResult = await db.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (propResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const prop = propResult.rows[0];

    await db.query(
      'INSERT INTO reports (reporter_id, reported_user_id, property_id, report_type, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, prop.owner_id, propertyId, reportType, description]
    );

    res.json({ message: 'Report submitted successfully. Administrators will review it shortly.' });
  } catch (err) {
    next(err);
  }
};
