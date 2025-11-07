const express = require('express');
const router = express.Router();

const Admin = require('../models/admin');
const User = require('../models/user');
const User3 = require('../models/user3');
const User2 = require('../models/user2');

// Admin Login Page
router.get('/login', (req, res) => {
    res.render("admin/login");
});

// Admin Dashboard - requires login
router.get('/dashboard', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    try {
        // Count total users
        const totalUsers = await User.countDocuments();

        // Fetch all waste entries
        const wasteEntries = await User2.find();

        // Helper function to extract numeric part from quantity strings like "50 kg"
        function extractNumber(value) {
            const number = parseFloat(value?.toString().replace(/[^0-9.]/g, ''));
            return isNaN(number) ? 0 : number;
        }

        // Calculate total waste quantity
        const totalWasteQuantity = wasteEntries.reduce((sum, entry) => {
            return sum + extractNumber(entry.quantity);
        }, 0);

        // Get distinct waste types
        const wasteTypes = [...new Set(wasteEntries.map(entry => entry.wasteType || "Unknown"))];

        // You can also calculate quantity by waste type if needed:
        const quantityByWasteType = {};
        wasteEntries.forEach(entry => {
            const type = entry.wasteType || "Unknown";
            const quantity = extractNumber(entry.quantity);
            quantityByWasteType[type] = (quantityByWasteType[type] || 0) + quantity;
        });

        // Render dashboard view
        res.render("admin/dashboard", {
            totalUsers,
            totalWasteQuantity,
            wasteTypes,
            quantityByWasteType // send to view if needed
        });

    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Admin Login POST
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.matchPassword(email, password);
        if (admin) {
            req.session.adminId = admin._id;  // store admin ID in session
            return res.redirect('/admin/dashboard');
        } else {
            return res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Admin Register Page
router.get('/signup', (req, res) => {
    res.render("admin/signup");
});

// Admin Register POST
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send("Admin with this email already exists");
        }

        const newAdmin = new Admin({ username, email, password });
        await newAdmin.save();
        res.redirect('/admin/login');
    } catch (error) {
        console.error("Admin creation error:", error);
        res.status(500).send("Error creating admin");
    }
});

// Customers page
 // This is your waste model


router.get('/customers', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    try {
        // Optionally filter users by role if applicable
        // const customers = await User.find({ role: 'USER' });
        const customers = await User.find(); // If no role field

        // For each user, get related waste data from User3
        const customerData = await Promise.all(customers.map(async (customer) => {
            const wasteSubmissions = await User3.find(
                { userId: customer._id },
                { wasteType: 1, phone: 1, _id: 0 } // Select only specific fields
            );

            return {
                user: customer,
                wastes: wasteSubmissions
            };
        }));

        // Render the EJS view with collected data
        res.render('admin/customers', { customerData });

    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).send('Server Error');
    }
});



  

// Handicrafts page
router.get('/handicrafts', (req, res) => {
    res.render("admin/handicrafts");
});

// Waste page
router.get('/waste', async (req, res) => {
    try {
        const wastes = await User3.find();
        res.render('admin/waste', { wastes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Payments page
router.get('/payments', (req, res) => {
    res.render("admin/payments");
});

// Settings page — show admin settings, requires login
router.get('/settings', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) {
            return res.redirect('/admin/login');
        }
        res.render('admin/settings', { admin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

// Update settings POST (corrected for password hashing in model)
router.post('/settings', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    try {
        const { email, password } = req.body;
        const admin = await Admin.findById(req.session.adminId);

        if (!admin) return res.status(404).send('Admin not found');

        admin.email = email;

        if (password && password.trim() !== '') {
            // Assign plain text password; model pre-save hook hashes it
            admin.password = password;
        }

        await admin.save();
        res.redirect('/admin/settings?updated=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

// Profile page
router.get('/profile', (req, res) => {
    res.render("admin/profile");
});

// Logout route - destroys session
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/admin/login');
    });
});

module.exports = router;
