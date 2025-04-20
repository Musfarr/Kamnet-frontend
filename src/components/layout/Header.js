import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Avatar, 
  Divider 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  TaskAlt, 
  Dashboard, 
  ExitToApp, 
  Map as MapIcon, 
  Person
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../../redux/features/userSlice';
import { userApi } from '../../api/apiClient';
import LoginModal from '../modal/LoginModal';
import SignupModal from '../modal/SignupModal';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userLoginDialog, setUserLoginDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle profile menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle login dialog
  const handleLoginOpen = (isUser = false) => {
    setUserLoginDialog(isUser);
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  // Handle signup dialog
  const handleSignupOpen = (isUser = false) => {
    setUserLoginDialog(isUser);
    setSignupOpen(true);
  };

  const handleSignupClose = () => {
    setSignupOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    userApi.logout();
    dispatch(removeUser());
    handleClose();
    navigate('/');
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem component={Link} to="/" button>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={Link} to="/tasks" button>
          <ListItemText primary="Browse Tasks" />
        </ListItem>
        <ListItem component={Link} to="/map" button>
          <ListItemText primary="Task Map" />
        </ListItem>
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
              <Avatar 
                src={user?.picture || ''} 
                alt={user?.name}
                sx={{ mr: 2 }}
              />
              <Typography variant="subtitle1">{user?.name}</Typography>
            </Box>
          </ListItem>
          <ListItem 
            button 
            component={Link} 
            to={user?.role === 'user' ? '/user/dashboard' : '/talent/dashboard'} 
          >
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button onClick={() => handleLoginOpen(false)}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Login as Task Doer" />
          </ListItem>
          <ListItem button onClick={() => handleLoginOpen(true)}>
            <ListItemIcon>
              <TaskAlt />
            </ListItemIcon>
            <ListItemText primary="Login as Task Poster" />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => handleSignupOpen(false)}>
            <ListItemText primary="Sign Up as Task Doer" />
          </ListItem>
          <ListItem button onClick={() => handleSignupOpen(true)}>
            <ListItemText primary="Sign Up as Task Poster" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{padding: '10px' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/images/logo.png" 
              alt="Kaam Connect Logo" 
              style={{ width: '10%', marginRight: '8px' }}
            />
            
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/tasks"
              sx={{ mx: 1 }}
            >
              Browse Tasks
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/map"
              sx={{ mx: 1 }}
            >
              Task Map
            </Button>
          </Box>

          {/* User Menu */}
          {isAuthenticated ? (
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user?.picture ? (
                  <Avatar 
                    src={user.picture} 
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem 
                  onClick={() => {
                    handleClose();
                    navigate(user?.role === 'user' ? '/user/dashboard' : '/talent/dashboard');
                  }}
                >
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex' }}>
              {/* Desktop Auth Buttons */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Button 
                  color="inherit"
                  onClick={() => handleLoginOpen(false)}
                  sx={{ mx: 0.5 }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => handleSignupOpen(false)}
                  sx={{ mx: 0.5 }}
                >
                  Sign Up
                </Button>
              </Box>
              
              {/* Mobile Auth Button */}
              <IconButton
                color="inherit"
                aria-label="account menu"
                edge="end"
                onClick={handleMenu}
                sx={{ display: { sm: 'none' } }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && !isAuthenticated}
                onClose={handleClose}
              >
                <MenuItem onClick={() => {
                  handleClose();
                  handleLoginOpen(false);
                }}>
                  Login as Task Doer
                </MenuItem>
                <MenuItem onClick={() => {
                  handleClose();
                  handleLoginOpen(true);
                }}>
                  Login as Task Poster
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                  handleClose();
                  handleSignupOpen(false);
                }}>
                  Sign Up as Task Doer
                </MenuItem>
                <MenuItem onClick={() => {
                  handleClose();
                  handleSignupOpen(true);
                }}>
                  Sign Up as Task Poster
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Auth Modals */}
      <LoginModal
        open={loginOpen}
        handleClose={handleLoginClose}
        setSignupOpen={setSignupOpen}
        userLoginDialog={userLoginDialog}
      />
      <SignupModal
        open={signupOpen}
        handleClose={handleSignupClose}
        setLoginOpen={setLoginOpen}
        userLoginDialog={userLoginDialog}
      />
    </>
  );
}

export default Header;
