# Adding New Items to Is It Loud?

This guide explains how to easily add new sound level items to the application.

## Quick Start

To add a new item, simply edit the `src/data/items.json` file and add your new item to the array.

## Item Structure

Each item must have the following properties:

```json
{
  "id": 11,
  "name": "Nome do Objeto",
  "soundLevel": 65,
  "image": "https://example.com/image.jpg",
  "category": "Categoria",
  "description": "Descrição detalhada do objeto e seu ruído"
}
```

### Property Details

- **id** (number): Unique identifier for the item. Use the next available number.
- **name** (string): Display name of the object in Portuguese.
- **soundLevel** (number): Sound level in decibels (dB). Must be between 0-120.
- **image** (string): URL to a high-quality image (recommended: Unsplash, 1600x1200px minimum).
- **category** (string): Category for organization (e.g., "Cozinha", "Equipamentos Domésticos").
- **description** (string): Brief description explaining what the object is and why it makes noise.

## Sound Level Guidelines

- **0-50 dB**: Very Low/Quiet (green indicators)
- **50-70 dB**: Moderate (yellow indicators) 
- **70+ dB**: High/Very High (red indicators)

## Image Requirements

- Use high-quality images (preferably from Unsplash)
- Minimum resolution: 1600x1200px
- Aspect ratio: Prefer 4:3 or close
- Clear view of the object
- Good lighting and contrast

## Categories

Current categories include:
- Equipamentos Domésticos
- Cozinha
- Eletrônicos
- Climatização

Feel free to create new categories as needed.

## Example Addition

```json
{
  "id": 11,
  "name": "Batedeira",
  "soundLevel": 75,
  "image": "https://images.unsplash.com/photo-1574781330855-d0db65ed7ebb?q=80&w=1600",
  "category": "Cozinha",
  "description": "Equipamento para misturar ingredientes com motor de alta rotação"
}
```

## Validation

The application includes automatic validation to ensure:
- All required fields are present
- Sound level is within valid range (0-120 dB)
- Data types are correct

Invalid items will be filtered out automatically.

## Testing

After adding items:
1. Save the `items.json` file
2. Refresh the application
3. Search for your new item by name
4. Verify it displays correctly with proper sound level indicators

## Tips

- Use descriptive names that users would naturally search for
- Keep descriptions concise but informative
- Choose images that clearly show the object
- Consider sound levels realistically (research actual dB levels)
- Group similar items in appropriate categories