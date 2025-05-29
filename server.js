// server.js - Custom json-server setup for Kamnet frontend
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./db-optimized.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// Add custom response for authentication endpoints
server.post('/auth/login/:role', (req, res) => {
  const { email, password } = req.body;
  const { role } = req.params;
  
  // Mock authentication
  let userData;
  
  if (role === 'talent' && email === 'ali.hassan@example.com') {
    userData = {
      id: 'talent1',
      email: 'ali.hassan@example.com',
      name: 'Ali Hassan',
      given_name: 'Ali',
      family_name: 'Hassan',
      picture: 'https://randomuser.me/api/portraits/men/5.jpg',
      role: 'talent',
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
      profileCompleted: true,
      success: true
    };
  } else {
    return res.status(401).jsonp({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  res.jsonp(userData);
});

server.post('/auth/register/:role', (req, res) => {
  const userData = req.body;
  const { role } = req.params;
  
  // Mock registration
  const registeredUser = {
    ...userData,
    id: role + '-' + Math.random().toString(36).substring(2),
    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
    success: true
  };
  
  res.status(201).jsonp(registeredUser);
});

server.post('/auth/google', (req, res) => {
  const { role } = req.body;
  
  // Mock Google Auth
  let userData;
  
  if (role === 'user') {
    userData = {
      id: 'user1',
      email: 'ahmad.khan@example.com',
      name: 'Ahmad Khan',
      given_name: 'Ahmad',
      family_name: 'Khan',
      picture: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'user',
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
      profileCompleted: true,
      success: true
    };
  } else {
    userData = {
      id: 'talent1',
      email: 'ali.hassan@example.com',
      name: 'Ali Hassan',
      given_name: 'Ali',
      family_name: 'Hassan',
      picture: 'https://randomuser.me/api/portraits/men/5.jpg',
      role: 'talent',
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
      profileCompleted: true,
      success: true
    };
  }
  
  res.jsonp(userData);
});

// Use default router
server.use(router);

// Start server
const port = 8000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`Server is serving data from db-optimized.json`);
  console.log(`Access the API at http://localhost:${port}`);
});
