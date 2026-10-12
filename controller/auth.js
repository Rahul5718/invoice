const User = require('../models/user'); // ensure you have models/User.js created

// Register Controller
exports.register = async (req, res) => {
 try {
     const { name, email, password, businessName } = req.body;
 
     if (!name || !email || !password) {
       return res.status(400).json({ error: 'Name, email, and password are required.' });
     }
 
     // Check if user already exists
     const existingUser = await User.findOne({ email: email.toLowerCase() });
     if (existingUser) {
       return res.status(400).json({ error: 'An account with this email already exists.' });
     }
 
     const newUser = new User({
       name,
       email: email.toLowerCase(),
       password, 
       businessName: businessName || 'Gamming Studio'
     });
 
     await newUser.save();
 
     // Critical: Send JSON response back so client does not hang
     return res.status(201).json({
       message: 'Registration successful! Please log in.',
       user: {
         id: newUser._id,
         name: newUser.name,
         email: newUser.email,
         businessName: newUser.businessName
       }
     });
   } catch (err) {
     console.error('Server error during registration:', err);
     return res.status(500).json({ error: err.message || 'Server error during registration' });
   }
};

// Login Controller
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      return res.json({
        message: 'Login successful!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          businessName: user.businessName || 'Freelance Studio'
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server error during login', details: err.message });
    }
};