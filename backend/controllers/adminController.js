import db from '../config/db.js';

// @desc    Get Admin Dashboard Stats & KPIs
// @route   GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const usersCountResult = await db.query('SELECT COUNT(*) as count FROM users');
    const tenantsCountResult = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'tenant'");
    const ownersCountResult = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'owner'");
    const listingsCountResult = await db.query('SELECT COUNT(*) as count FROM properties');
    const activeListingsResult = await db.query("SELECT COUNT(*) as count FROM properties WHERE status = 'approved'");
    const reportsCountResult = await db.query("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");
    const totalViewsResult = await db.query('SELECT SUM(views_count) as views FROM properties');

    // Aggregate monthly listings growth count (mock or direct)
    const mockGrowth = {
      userGrowth: [
        { name: 'Jan', count: 12 },
        { name: 'Feb', count: 19 },
        { name: 'Mar', count: 32 },
        { name: 'Apr', count: 48 },
        { name: 'May', count: 65 },
        { name: 'Jun', count: 82 }
      ],
      listingGrowth: [
        { name: 'Jan', count: 5 },
        { name: 'Feb', count: 12 },
        { name: 'Mar', count: 20 },
        { name: 'Apr', count: 35 },
        { name: 'May', count: 48 },
        { name: 'Jun', count: 62 }
      ]
    };

    res.json({
      kpis: {
        totalUsers: parseInt(usersCountResult.rows[0]?.count || 0, 10),
        totalTenants: parseInt(tenantsCountResult.rows[0]?.count || 0, 10),
        totalOwners: parseInt(ownersCountResult.rows[0]?.count || 0, 10),
        totalListings: parseInt(listingsCountResult.rows[0]?.count || 0, 10),
        activeListings: parseInt(activeListingsResult.rows[0]?.count || 0, 10),
        pendingReports: parseInt(reportsCountResult.rows[0]?.count || 0, 10),
        totalViews: parseInt(totalViewsResult.rows[0]?.views || 0, 10),
        revenue: 0 // Free portal, zero commissions
      },
      charts: mockGrowth
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (for management)
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, role, is_verified, status, created_at FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Ban or Unban a user
// @route   PUT /api/admin/users/:id/ban
export const toggleUserBan = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body; // 'active' or 'suspended'

  try {
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid user status' });
    }

    const check = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = check.rows[0];

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrators cannot be suspended' });
    }

    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, status === 'suspended' ? 'BAN_USER' : 'UNBAN_USER', `Set status of user "${user.name}" (ID: ${id}) to ${status}`]
    );

    res.json({ message: `User account has been successfully ${status === 'suspended' ? 'suspended' : 'activated'}` });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Owner Profile
// @route   PUT /api/admin/users/:id/verify-owner
export const verifyOwner = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  try {
    const check = await db.query('SELECT * FROM users WHERE id = $1 AND role = \'owner\'', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    await db.query('UPDATE users SET is_verified = true WHERE id = $1', [id]);
    await db.query('UPDATE owner_profiles SET is_verified = true WHERE user_id = $1', [id]);

    // Send notification to owner
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [id, 'Owner Account Verified', 'Your identity and rental business profile have been approved by RentGB admin. You can now list properties.']
    );

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'VERIFY_OWNER', `Verified owner user ID ${id}`]
    );

    res.json({ message: 'Owner profile verified successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or Reject Property Listing
// @route   PUT /api/admin/properties/:id/status
export const updatePropertyStatus = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid listing status' });
    }

    const check = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Property listing not found' });
    }

    const prop = check.rows[0];

    await db.query('UPDATE properties SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);

    // Notify owner
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [
        prop.owner_id,
        `Listing ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        `Your property listing "${prop.title}" has been ${status === 'approved' ? 'approved and is now public' : 'rejected by administrators'}.`
      ]
    );

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, status === 'approved' ? 'APPROVE_PROPERTY' : 'REJECT_PROPERTY', `Set status of property "${prop.title}" (ID: ${id}) to ${status}`]
    );

    res.json({ message: `Listing status successfully updated to ${status}` });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
export const getReports = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              u1.name as reporter_name, 
              u2.name as reported_user_name, 
              p.title as property_title 
       FROM reports r 
       JOIN users u1 ON r.reporter_id = u1.id 
       LEFT JOIN users u2 ON r.reported_user_id = u2.id 
       LEFT JOIN properties p ON r.property_id = p.id 
       ORDER BY r.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id/resolve
export const resolveReport = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  try {
    const check = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Report case not found' });
    }

    await db.query("UPDATE reports SET status = 'resolved' WHERE id = $1", [id]);

    // Log Activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'RESOLVE_REPORT', `Marked report ID ${id} as resolved`]
    );

    res.json({ message: 'Report case marked as resolved' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system Activity Logs
// @route   GET /api/admin/logs
export const getLogs = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT l.*, u.name as user_name FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
