# Database Setup Guide

This guide explains how to set up the database for production use.

## Environment Configuration

### Development (Default)
- Uses JSON file: `src/data/items.json`
- No database connection required
- Images served from original URLs

### Production
- Uses database for data storage
- Images served through CDN with optimization
- Configurable via environment variables

## Environment Variables

Create a `.env.local` file in your project root:

```bash
# For development (default)
NODE_ENV=development
USE_DATABASE=false

# For production with database
NODE_ENV=production
USE_DATABASE=true
DATABASE_URL=your_database_connection_string

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com
```

## Database Schema

### Items Table Structure

```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sound_level INTEGER NOT NULL CHECK (sound_level >= 0 AND sound_level <= 120),
  image TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_sound_level ON items(sound_level);
CREATE INDEX idx_items_name ON items USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_items_description ON items USING gin(to_tsvector('portuguese', description));
```

## Supported Database Providers

### PostgreSQL (Recommended)
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/isitloud
```

### MySQL
```bash
DATABASE_URL=mysql://username:password@localhost:3306/isitloud
```

### SQLite (Development)
```bash
DATABASE_URL=file:./dev.db
```

### MongoDB
```bash
DATABASE_URL=mongodb://username:password@localhost:27017/isitloud
```

## Migration from JSON to Database

To migrate your existing JSON data to the database:

1. Set up your database and connection
2. Run the migration script:

```javascript
// scripts/migrate-json-to-db.js
const items = require('../src/data/items.json');

async function migrateData() {
  for (const item of items) {
    await db.items.create({
      data: {
        id: item.id,
        name: item.name,
        soundLevel: item.soundLevel,
        image: item.image,
        category: item.category,
        description: item.description
      }
    });
  }
  console.log('Migration completed!');
}

migrateData();
```

## CDN Setup

### Popular CDN Providers

#### Cloudinary
```bash
NEXT_PUBLIC_CDN_URL=https://res.cloudinary.com/your-cloud-name
```

#### ImageKit
```bash
NEXT_PUBLIC_CDN_URL=https://ik.imagekit.io/your-imagekit-id
```

#### AWS CloudFront
```bash
NEXT_PUBLIC_CDN_URL=https://your-distribution.cloudfront.net
```

### Image Optimization Features

The CDN integration provides:
- Automatic WebP/AVIF conversion
- Responsive image sizing
- Quality optimization
- Lazy loading support
- Automatic caching

### Image Presets

- **thumbnail**: 150x150px, 80% quality
- **card**: 400x300px, 85% quality  
- **hero**: 1200x600px, 90% quality
- **full**: 1600x1200px, 95% quality

## Deployment Checklist

- [ ] Database created and schema applied
- [ ] Environment variables configured
- [ ] CDN setup and configured
- [ ] Data migrated from JSON to database
- [ ] Test data loading and search functionality
- [ ] Verify image optimization is working
- [ ] Monitor performance and error logs

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Data Source | JSON File | Database |
| Images | Original URLs | CDN Optimized |
| Caching | None | Full CDN Caching |
| Search | Client-side | Database Queries |
| Performance | Basic | Optimized |

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database server is running
- Verify credentials and permissions

### CDN Issues
- Check NEXT_PUBLIC_CDN_URL configuration
- Verify CDN service is active
- Test image transformation endpoints
- Monitor CDN usage and limits