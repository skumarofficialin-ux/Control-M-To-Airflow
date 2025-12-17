# DAGFLOW - Control-M JSON Workflow Visualizer

A modern, interactive web application for uploading and visualizing Control-M JSON workflow files. Built with Flask and featuring advanced D3.js graph visualization.

## ✨ Features

### 📁 File Upload & Parsing
- Upload Control-M JSON files via intuitive web interface
- Automatic parsing of Control-M Automation API format
- Support for multiple workflow folders and job definitions

### 🌳 Interactive Job Tree
- Hierarchical display of jobs and dependencies
- Expandable/collapsible tree structure with smooth animations
- Modern icons (📁 for folders, ⚙️ for jobs)
- Hover effects and visual feedback

### 📊 Advanced Dependency Graph
- **Interactive Visualization**: Zoom, pan, and drag nodes
- **Smart Layout**: Force-directed graph with collision detection
- **Card-Based Nodes**: Rectangular cards displaying full job names
- **Rich Tooltips**: Hover for detailed job information (schedule, command, etc.)
- **Color-Coded Categories**:
  - 🔴 Main Job (red)
  - 🔵 Dependencies (blue)
  - 🟢 Add Events (green)
  - 🟠 Delete Events (orange)
  - 🟣 Wait For Events (purple)
- **Fit to Screen**: One-click auto-zoom and center
- **Smooth Animations**: Professional transitions and interactions

### 🎨 Modern UI/UX
- **Branded Header**: Gradient design with DAGFLOW logo
- **Responsive Layout**: Clean, professional interface
- **Styled Components**: Hover effects, shadows, and gradients
- **Accessibility**: Clear typography and color contrast

## 🚀 How to Run

### Prerequisites
- Python 3.7+
- Flask (automatically installed)

### Installation & Execution
1. **Clone/Download** the project
2. **Install Dependencies**:
   ```bash
   pip install flask
   ```
3. **Run the Application**:
   ```bash
   python app.py
   ```
4. **Open Browser**: Navigate to `http://127.0.0.1:5000`
5. **Upload JSON**: Select your Control-M JSON file and explore!

## 📋 JSON Structure

The application expects Control-M Automation API JSON format:

```json
{
  "Defaults": {
    "Application": "SampleApp",
    "SubApplication": "SampleSubApp"
  },
  "SampleApp_Flow": {
    "Type": "Folder",
    "RunAs": "USERNAME",
    "Host": "HOST",
    "jobs": [
      {
        "Name": "JobName",
        "Type": "Job:Command",
        "Command": "echo command",
        "Description": "Job description",
        "Schedule": "Daily at 6:00 AM",
        "Events": {
          "In": ["Event1"],
          "Out": ["Event2"]
        },
        "Conditions": {
          "In": ["Cond1"],
          "Out": ["Cond2"]
        },
        "DependsOn": ["DepJob"]
      }
    ]
  }
}
```

### Field Mappings
- **Events.In** → Wait For events
- **Events.Out** → Add events
- **Conditions.Out** → Additional Add events
- **DependsOn** → Job dependencies

## 🛠️ Technical Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualization**: D3.js v7
- **Icons**: Unicode emojis
- **Styling**: Modern CSS with gradients and animations

## 📁 Project Structure

```
DagFlow/
├── app.py                 # Flask application
├── templates/
│   └── index.html         # Main page template
├── static/
│   ├── css/
│   │   └── styles.css     # Application styles
│   └── js/
│       └── app.js         # Frontend logic & D3 visualization
├── uploads/               # Temporary file storage
└── README.md             # This file
```

## 🎯 Usage Tips

1. **Upload**: Click the file input to select your Control-M JSON
2. **Explore Tree**: Use the left panel to navigate job hierarchy
3. **View Details**: Click any job for comprehensive information
4. **Interact with Graph**:
   - Drag nodes to reposition
   - Scroll to zoom in/out
   - Click "Fit to Screen" for optimal view
   - Hover cards for detailed tooltips

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to enhance DAGFLOW!

## 📄 License

This project is open-source. Please check individual component licenses for details.
