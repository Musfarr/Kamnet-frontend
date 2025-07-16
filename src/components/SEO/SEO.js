import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for optimizing page metadata
 * @param {string} title - Page title
 * @param {string} description - Page description for SEO
 * @param {string} keywords - Comma-separated keywords
 * @param {string} image - URL for social sharing image
 * @param {string} url - Canonical URL for the page
 * @param {string} type - Content type (website, article, etc.)
 * @param {Object} schema - JSON-LD structured data
 * @returns {JSX.Element} - Helmet component with SEO metadata
 */
const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  schema
}) => {
  // Build default values based on Kamnet being a Pakistani C2C marketplace
  const defaultTitle = 'Kamnet Marketplace | Connect Task Posters & Task Doers in Pakistan';
  const defaultDescription = 'Find local services or earn money by completing tasks. Kamnet is Pakistan\'s trusted marketplace connecting skilled professionals with people who need work done.';
  const defaultKeywords = 'kamnet, marketplace, pakistan, freelance, services, tasks, gigs, remote work';
  const defaultImage = '/images/kamnet-social-preview.jpg'; // Ensure this image exists
  const defaultUrl = typeof window !== 'undefined' ? window.location.href : 'https://kamnet.com';
  
  // Use provided values or fall back to defaults
  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url || defaultUrl;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:locale" content="en_PK" />
      <meta property="og:site_name" content="Kamnet Marketplace" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* Geolocation Meta (for Pakistani market focus) */}
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />
      
      {/* Mobile Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4CAF50" />
      
      {/* Language */}
      <meta property="og:locale" content="en_PK" />
      <html lang="en" />
      
      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
