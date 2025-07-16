# Kamnet Marketplace Documentation

## Overview
Kamnet is a marketplace application optimized for the Pakistani market, connecting task posters with task doers. The application uses React for the frontend with a mock API implementation for demonstration purposes.

## Pages & Components

### 1. Home Page (`/src/pages/Home/index.js`)
- **Purpose**: Landing page showcasing featured tasks and main call-to-action buttons
- **Features**: 
  - Featured tasks display with Pakistani locations and prices in Rupees
  - Navigation buttons to find tasks or post a task
  - Login/signup triggers via custom events
- **Status**: Complete with mock data

### 2. Map View (`/src/pages/MapView/index.js`)
- **Purpose**: Shows tasks on a map for geographical browsing
- **Features**:
  - Leaflet map integration centered on Pakistan
  - Task markers with popup information
  - Task list sidebar that syncs with map
- **Status**: Complete with mock data, using Leaflet instead of Mapbox

### 3. All Tasks (`/src/pages/AllTasks/index.js`)
- **Purpose**: Lists all available tasks with filtering options
- **Features**:
  - Task cards with details and apply buttons
  - Filtering by category, location, and price range
  - Pagination
- **Status**: Complete with mock data

### 4. Task Detail (`/src/pages/TaskDetail/index.js`)
- **Purpose**: Shows detailed information about a specific task
- **Features**:
  - Task description, budget, location, and requirements
  - Apply button (requires authentication)
  - Task poster information
- **Status**: Complete with mock data

### 5. Sign Up Modal (`/src/components/modal/SignupModal.js`)
- **Purpose**: User registration form
- **Features**:
  - Email/password registration
  - Google OAuth integration
  - Role selection (Task Poster or Task Doer)
  - Form validation
- **Status**: Complete with mock API integration

### 6. Login Modal (`/src/components/modal/LoginModal.js`)
- **Purpose**: User authentication form
- **Features**:
  - Email/password login
  - Google OAuth integration
  - Error handling
- **Status**: Complete with mock API integration

### 7. Complete Profile (`/src/pages/CompleteProfile/index.js`)
- **Purpose**: Profile completion for Task Doers
- **Features**:
  - Multi-step form (Personal Info, Professional Details, Verification)
  - Skills selection
  - Education and hourly rate settings
- **Status**: Complete with mock API integration

### 8. Talent Dashboard (`/src/pages/TalentDashboard/index.js`)
- **Purpose**: Dashboard for Task Doers to manage applications
- **Features**:
  - Profile summary
  - Tabs for all, accepted, and pending applications
  - Application details
- **Status**: Complete with mock data

### 9. User Dashboard (`/src/pages/UserDashboard/index.js`)
- **Purpose**: Dashboard for Task Posters to manage posted tasks
- **Features**:
  - Posted tasks overview
  - Applicant management
  - Task status updates
- **Status**: Complete with mock data

### 10. Post Task (`/src/pages/PostTask/index.js`)
- **Purpose**: Form to create a new task
- **Features**:
  - Task details input
  - Location selection
  - Budget setting
- **Status**: Complete with mock API integration

## Authentication Flow
1. User clicks Login/Signup button on Header or Home page
2. Modal opens for Login or Signup
3. User authenticates via form or Google OAuth
4. If Task Doer with incomplete profile, redirected to Complete Profile
5. Otherwise, redirected to appropriate dashboard

## API Integration
- **Current Status**: Using mock API implementations in `/src/api/apiClient.js`
- **Data Source**: Static data in `db-optimized.json`
- **Server**: Custom server in `server.js` using json-server

## Search Engine Optimization (SEO)

### Overview
Kamnet Marketplace implements a comprehensive SEO strategy designed to improve visibility in search engines, particularly for the Pakistani market. The implementation focuses on proper metadata, structured data, and search engine crawlability.

### SEO Architecture

#### Core Components
- **SEO Component**: Reusable component at `/src/components/SEO/SEO.js` using `react-helmet-async` for managing document head
- **HelmetProvider**: Integrated at the root in `src/index.js` for React context
- **Structured Data**: JSON-LD implementation following schema.org standards
- **Crawler Control**: robots.txt and sitemap.xml in the public directory

#### SEO Component Design
```jsx
// Example usage
<SEO
  title="Page Title | Kamnet Marketplace"
  description="Page description for search results"
  keywords="keyword1, keyword2"
  image="url-to-image.jpg"
  url="https://kamnetcorp.com/page"
  type="website"
  schema={schemaObject}
/>
```

#### Features Implemented
1. **Meta Tags Management**:
   - Title, description, keywords
   - Viewport, language, canonical URL
   - Open Graph (Facebook/WhatsApp)
   - Twitter Cards

2. **Structured Data**:
   - Home Page: Organization and WebSite schemas
   - Task Detail: JobPosting schema for rich results
   - All Tasks: ItemList schema for better search listings

3. **Crawlability**:
   - Static sitemap.xml with key pages
   - Dynamic sitemap generator script (`scripts/generate-sitemap.js`)
   - Robots.txt with proper crawler instructions
   - Build process integration for sitemap generation

### Implementation Status

| Page | Meta Tags | Open Graph | Structured Data | Status |
|------|-----------|------------|----------------|--------|
| Home | ✓ | ✓ | Organization, WebSite | Complete |
| Task Detail | ✓ | ✓ | JobPosting | Complete |
| All Tasks | ✓ | ✓ | ItemList | Complete |
| Map View | - | - | - | Pending |
| Dashboards | - | - | - | Pending |
| Post Task | - | - | - | Pending |

### Remaining SEO Work

#### Immediate Tasks
- Implement SEO for Map View, User Dashboard, Talent Dashboard, and Post Task pages
- Create unique meta descriptions for each major section of the application
- Add geo-specific meta tags for Pakistani market targeting

#### Production Optimization
- **Server-Side Rendering**: Consider migrating to Next.js or implement pre-rendering
- **Performance Optimization**: Image optimization, lazy loading, code splitting
- **Core Web Vitals**: Address Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift
- **Local SEO**: Implement local business schema for physical locations if applicable

#### Post-Backend Integration
- Update dynamic content in meta tags from actual API data
- Generate dynamic sitemaps based on real tasks in the database
- Implement canonical URLs for pagination and filtered views
- Set up monitoring with Google Search Console

## Remaining Work

### Backend Integration
- Replace mock API calls with real backend endpoints
- Update authentication to use real JWT tokens
- Implement proper error handling for API failures

### Data Management
- Replace static data with dynamic data from database
- Implement proper data caching strategies
- Add real-time updates for task status changes

### Features to Complete
- Implement payment integration for Pakistani market
- Add notification system for application updates
- Implement chat functionality between task posters and doers
- Add review and rating system after task completion

### Optimization
- Implement lazy loading for better performance
- Add proper image optimization
- Improve mobile responsiveness

## Environment Configuration
- `.env` file contains configuration for:
  - API URL: `REACT_APP_API_URL=http://localhost:8000`
  - Google OAuth: `REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE`

## Running the Application
1. Install dependencies: `npm install`
2. Start the mock server: `node server.js`
3. Start the React application: `npm start`
4. Access the application at: `http://localhost:3000`
