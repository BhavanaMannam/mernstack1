const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const todoRoutes = require('./routes/todoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://mannambhavana313:bhavanamannam@cluster0.xys1lpi.mongodb.net/mytodosdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.use('/api/todos', todoRoutes);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
