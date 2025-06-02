# ScribbleTab Chrome Extension

A Chrome extension that provides an overlay drawing and annotation layer on any web page. Draw, highlight, add text annotations, and create visual guides directly on top of web content without affecting the original page.


## Features

### Drawing Tools
- **Pen Tool** - Freehand drawing with customizable thickness and color
- **Highlighter** - Semi-transparent marker for emphasizing content  
- **Rectangle** - Draw rectangular outlines and boxes
- **Circle** - Create circular annotations and highlights
- **Arrow** - Point to specific elements with professional arrows
- **Text Tool** - Add text annotations anywhere on the page

### Interface
- **Draggable Toolbar** - Move the control panel anywhere on screen
- **Hideable Interface** - Hide toolbar with Ctrl+H while keeping annotations active
- **Color Picker** - Choose any color for your annotations
- **Size Control** - Adjust brush/line thickness with easy slider
- **Professional Icons** - Clean, recognizable tool icons

### Functionality  
- **Undo/Redo** - Full undo/redo support for all annotation types (Ctrl+Z/Ctrl+Y)
- **Clear All** - Remove all annotations instantly
- **Responsive Design** - Works on any website, adapts to page scrolling and resizing
- **No Data Storage** - All annotations are temporary and local
- **Keyboard Shortcuts** - Quick access to common functions

## Installation

### From Source (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The ScribbleTab icon will appear in your toolbar

### Files Structure
```
scribbletab/
├── manifest.json       # Extension configuration
├── background.js       # Service worker  
├── content.js         # Main annotation functionality
├── content.css        # Annotation overlay styles
├── popup.html         # Extension popup interface
└── popup.js          # Popup functionality
```

## Usage

### Getting Started
1. Click the ScribbleTab extension icon in your toolbar
2. Click "Start Annotating" in the popup
3. The floating toolbar will appear on your page
4. Select a tool and start annotating!

### Drawing Tools
- **Pen**: Click and drag to draw freehand
- **Highlighter**: Like pen but with transparency
- **Shapes**: Click and drag to create rectangles, circles, or arrows
- **Text**: Click anywhere to place a text annotation

### Keyboard Shortcuts
- `Ctrl+H` - Hide/show toolbar
- `Ctrl+Z` - Undo last action
- `Ctrl+Y` - Redo last undone action  
- `Escape` - Close annotation mode

### Tips
- Drag the toolbar by its header to reposition
- Use the minimize button (-) to hide the toolbar temporarily
- All annotations are cleared when you close the extension
- Annotations stay in place when scrolling or resizing the page

## Technical Details

### Built With
- **Manifest V3** - Latest Chrome extension standards
- **Vanilla JavaScript** - No external dependencies
- **HTML5 Canvas** - High-performance drawing engine
- **CSS3** - Modern styling and animations

### Browser Compatibility
- Chrome (full support)
- Chromium-based browsers (Edge, Brave, etc.)

### Performance
- Minimal impact on page performance
- Efficient canvas rendering
- Memory-conscious state management
- Optimized for large documents

## Development

### Local Development
1. Clone the repository
2. Make changes to the source files
3. Reload the extension in `chrome://extensions/`
4. Test your changes

## Privacy & Security

- **No Data Collection** - This extension does not collect, store, or transmit any user data
- **Local Only** - All annotations are stored locally in browser memory
- **No External Requests** - Extension works entirely offline
- **Temporary Storage** - Annotations are cleared when extension is closed

## Known Limitations

- Annotations are not persistent (cleared on page refresh or extension close)
- Text annotations are HTML elements, not saved in image exports
- Canvas-based tools only (no vector editing)
- Single page annotations (don't transfer between pages)

## License

MIT License

## Changelog

### v1.0.0
- Initial release
- All core drawing tools
- Undo/redo functionality  
- Draggable, hideable toolbar
- Keyboard shortcuts
