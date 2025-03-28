const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const communicationtRoutes = require('./routes/communicationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const accountsRoutes = require('./routes/accountRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares de segurança e logging
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.json());


// Rotas públicas e protegidas 
app.use('/api/auth', authRoutes);
app.use('/api/communications', communicationtRoutes);
app.use('/api/contacts', contactRoutes); 
app.use('/api/accounts', accountsRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/', (req, res) => {
  res.send('CRM API is running');
});

// Middleware centralizado de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
