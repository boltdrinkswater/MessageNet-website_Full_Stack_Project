const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' folder

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User and Message models
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicFilename: { type: String }, // Field to store the filename of the profile picture
  friends: [{ type: String }]
}));

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Endpoint to send a message
app.post('/api/message', async (req, res) => {
  const { sender, recipient, content } = req.body;

  try {
    const senderUser = await User.findOne({ username: sender });
    const recipientUser = await User.findOne({ username: recipient });

    if (!senderUser || !recipientUser) {
      return res.status(404).json({ message: 'Sender or recipient not found' });
    }

    const newMessage = new Message({ sender, recipient, content });
    await newMessage.save();

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Endpoint to retrieve messages between two users
app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// Endpoint for image upload
app.post('/api/upload/:username', upload.single('image'), async (req, res) => {
  const username = req.params.username;
  const file = req.file;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicFilename = file.filename;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', profilePicFilename: user.profilePicFilename });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to update profile picture', error: error.message });
  }
});

// Endpoint to get user by username
app.get('/api/user/:username', async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      profilePicFilename: user.profilePicFilename,
      friends: user.friends
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Endpoint for sign-up
app.post('/api/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    const newUser = new User({ email, username, password });
    await newUser.save();
    res.json({ message: 'Sign up successful' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Sign up failed', error: error.message });
  }
});

// Endpoint for friend request
app.post('/api/frequest', async (req, res) => {
  const { username, friendname } = req.body;

  try {
    if (username === friendname) {
      return res.status(400).json({ message: 'Cannot add yourself' });
    }

    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendname });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    let friendAdded = false;

    if (!user.friends.includes(friendname)) {
      user.friends.push(friendname);
      await user.save();
      friendAdded = true;
    }

    if (!friend.friends.includes(username)) {
      friend.friends.push(username);
      await friend.save();
      friendAdded = true;
    }

    if (friendAdded) {
      return res.json({ message: 'Friend added' });
    } else {
      return res.json({ message: 'Friend already added' });
    }
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Failed to add friend', error: error.message });
  }
});

// Endpoint for sign-in
app.post('/api/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: 'User found' });
    } else {
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ message: 'Sign in failed', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
