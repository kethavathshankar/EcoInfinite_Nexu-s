
const { Router } = require('express');
const User = require('../models/user');
const router = Router();
const User2 = require('../models/user2');
const User3 = require('../models/user3');
const tf = require('@tensorflow/tfjs-node');




const express = require('express');
const app = express();
const path = require('path');




// Serve static files from the 'views/partials' directory
app.use('/static', express.static(path.join(__dirname, 'views/partials')));


// Sign-in route
router.get("/signin", (req, res) => {
    return res.render("signin"); // Assuming you have a "signin" view
});

// Sign-up route
router.get("/signup", (req, res) => {
    return res.render("signup"); 
});


// Roter to all extra pages and links
router.get("/img", (req, res) => {
    return res.render("partials/img"); 
});

router.get("/infoimg", (req, res) => {
    return res.render("partials/infoimg");  
});

router.get("/Home", (req, res) => {
    return res.render("partials/home"); 
});

router.get("/Aboutus", (req, res) => {
    return res.render("partials/Aboutus"); 
});

router.get("/AboutWM", (req, res) => {
    return res.render("partials/AboutWM"); 
});

router.get("/Articles", (req, res) => {
    return res.render("partials/Articles"); 
});

router.get("/BuyTrash", (req, res) => {
    return res.render("partials/BuyTrash"); 
});

router.get("/RecycleProducts", (req, res) => {
    return res.render("partials/RecycleProducts"); 
});

router.get("/SellTrash", (req, res) => {
    return res.render("partials/SellTrash"); 
});

router.get("/Service", (req, res) => {
    return res.render("partials/Service"); 
});

router.get("/Typeswaste", (req, res) => {
    return res.render("partials/Typeswaste"); 
});



router.get("/confirmationpage",  (req, res) => {
    const orderId = req.query.orderId; // Get the order ID from the query parameters
    const totalAmount = req.query.totalAmount; // Get the total amount from the query parameters
    // Render the confirmation page and pass orderId and totalAmount to the template
    res.render("partials/confirmationpage", { orderId, totalAmount });
});

// Confirmation page route
router.get("/confirmationpage", async (req, res) => {
    try {
        const { orderId, totalAmount, name, address } = req.query;

        // Find the user by name or any other unique identifier
        const user = await User.findOne({ fullName: name });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Update the user's address
        user.address = address;
        await user.save();

        // Render the confirmation page with the order details
        return res.render("partials/confirmationpage", { orderId, totalAmount });
    } catch (error) {
        console.error("Error updating user address:", error);
        return res.status(500).send("Internal Server Error");
    }


});

router.get("/track", (req, res) => {
    return res.render("partials/track"); 
});
//
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(401).send('Invalid email or password');
    }

// 2. Then check if password matches using an instance method on user
        

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});





// Sign-up form submission route
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Create a new user
        await User.create({
            username,
            email,
            password
        });
        return res.redirect("/"); // Redirect to the home page
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("Error creating user");
    }
});
//

// Sign-up form submission route
router.post("/SellTrash", async (req, res) => {
    const { wasteType, quantity, price } = req.body;
    try {
        // Create a new user
        await User2.create({
            wasteType,
            quantity,
            price
        });
        return res.redirect("/"); // Redirect to the home page
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("Error creating user");
    }
});

// Sign-up form submission route
router.post('/infoimg', async (req, res) => {
  try {

    let userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in.' });
      
    }

    console.log('Request body:', req.body);
    
    const {
      address,
      city,
      state,
      pincode,
      landmark,
      phone,
      wasteType,
      imageDescription
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !phone ||
      !wasteType 
      
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await  User3.create({
      userId,
      address,
      city,
      state,
      pincode,
      landmark,
      phone,
      imageDescription,
      wasteType,
      
    });


    return res.redirect("/");

  } catch (error) {
    console.error('Error creating waste entry:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});



const PDFDocument = require('pdfkit');
const fs = require('fs');

router.get("/download-bill", (req, res) => {
    const { orderId, totalAmount } = req.query;

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response header to indicate it's a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${orderId}.pdf`);

    // Pipe the PDF output to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('Payment Bill', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Order ID: ${orderId}`);
    doc.fontSize(18).text(`Total Amount: ₹${totalAmount}`);
    
    // Add more content as needed
    doc.moveDown();
    doc.fontSize(14).text('Thank you for your purchase!');

    // Finalize the document and send it to the client
    doc.end();
});

module.exports = router;
