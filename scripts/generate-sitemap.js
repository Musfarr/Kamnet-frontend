/**
 * Sitemap Generator for Kamnet Marketplace
 * 
 * This script generates a dynamic sitemap including:
 * - Static pages (home, tasks, map, etc.)
 * - Dynamic task detail pages
 * 
 * Run with: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const baseUrl = 'https://kamnetcorp.com'; // Change to your production URL
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // API URL to fetch tasks
const outputPath = path.join(__dirname, '../public/sitemap.xml');

// Static pages that should always be in the sitemap
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/tasks', priority: '0.9', changefreq: 'daily' },
  { url: '/map', priority: '0.8', changefreq: 'daily' },
  { url: '/post-task', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' }
];

/**
 * Generate sitemap XML content
 */
async function generateSitemap() {
  try {
    console.log('🔍 Generating sitemap...');
    
    // Start XML content
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    }
    
    // Fetch tasks from API for dynamic pages
    try {
      const response = await axios.get(`${apiUrl}/api/tasks`);
      const tasks = response.data;
      
      // Add task detail pages
      for (const task of tasks) {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/tasks/${task.id}</loc>\n`;
        
        // Use task's updated date or current date
        const lastMod = task.updatedAt ? 
          new Date(task.updatedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
        
        sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `  </url>\n`;
      }
    } catch (error) {
      console.error('❌ Error fetching tasks for sitemap:', error.message);
      console.log('⚠️ Continuing with static pages only');
    }
    
    // Close XML
    sitemap += '</urlset>';
    
    // Write to file
    fs.writeFileSync(outputPath, sitemap);
    console.log(`✅ Sitemap generated at: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

// Run the generator
generateSitemap();
