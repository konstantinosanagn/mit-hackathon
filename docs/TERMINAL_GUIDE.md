# Terminal Guide - MIT Hackathon Project

## 🚀 Overview

The integrated terminal provides direct access to your sandbox environment, allowing you to run commands, install packages, and manage your development workflow directly from the web interface.

## 🎯 Features

### **Beautiful UI**
- Dark theme with green accents (classic terminal look)
- Timestamps for all commands and outputs
- Color-coded output (green for commands, red for errors, white for output)
- Smooth animations and transitions

### **Smart Command Handling**
- **Built-in commands**: `help`, `clear`
- **Backend integration**: All other commands execute in your sandbox
- **Command history**: Use ↑↓ arrow keys to navigate previous commands
- **Auto-scroll**: Output automatically scrolls to show latest results

### **Multiple Access Points**
- **Header button**: 💻 Terminal button in the main header
- **File explorer**: 💻 button in the file panel
- **Floating button**: Green floating button in bottom-right corner
- **Keyboard shortcuts**: Focus management and navigation

## 🎮 How to Use

### **Opening the Terminal**
1. Click the 💻 Terminal button in the header
2. Or click the 💻 button in the file explorer panel
3. Or click the floating green button in the bottom-right corner

### **Running Commands**
1. Type your command in the input field
2. Press Enter to execute
3. View the output in real-time
4. Use ↑↓ arrow keys to navigate command history

### **Built-in Commands**

#### `help`
Shows available commands and usage information.

#### `clear`
Clears the terminal output and shows a fresh welcome message.

### **Common Development Commands**

#### **File Operations**
```bash
ls                    # List files in current directory
pwd                   # Show current working directory
cat filename.txt      # Display file contents
```

#### **Package Management**
```bash
npm install package-name    # Install npm packages
pip install package-name    # Install Python packages
```

#### **Running Scripts**
```bash
python script.py      # Run Python scripts
node script.js        # Run Node.js scripts
npm start             # Start npm scripts
```

#### **System Commands**
```bash
whoami               # Show current user
date                 # Show current date/time
```

## 🔧 Technical Details

### **Backend Integration**
- Commands are sent to `/api/run-command` endpoint
- Executed in your active sandbox environment
- Working directory: `/home/user/app`
- Full shell access with subprocess support

### **State Management**
- Uses React hooks for state management
- Global terminal state accessible from any component
- Persistent command history during session
- Automatic output caching

### **Performance Features**
- Lazy loading of terminal content
- Efficient re-rendering with React optimizations
- Debounced input handling
- Memory-efficient output storage

## 🎨 Customization

### **Styling**
The terminal uses Tailwind CSS classes for consistent theming:
- `bg-gray-900` for main background
- `bg-gray-800` for header/footer
- `text-green-400` for command input
- `text-red-400` for error messages

### **Layout**
- Fixed positioning at bottom of screen
- Height: 320px (h-80)
- Z-index: 50 for proper layering
- Responsive design considerations

## 🚨 Troubleshooting

### **Terminal Not Opening**
- Check if you have an active sandbox
- Ensure the backend API is running
- Check browser console for errors

### **Commands Not Executing**
- Verify sandbox is active and healthy
- Check network connectivity
- Review backend logs for errors

### **Performance Issues**
- Clear terminal output if too many lines
- Restart terminal if unresponsive
- Check sandbox resource usage

## 🔮 Future Enhancements

### **Planned Features**
- **Auto-completion**: Tab completion for commands and files
- **Split panes**: Multiple terminal sessions
- **Custom themes**: Light/dark mode toggle
- **Command aliases**: Custom command shortcuts
- **File drag & drop**: Drag files into terminal

### **Advanced Features**
- **Real-time collaboration**: Shared terminal sessions
- **Command suggestions**: AI-powered command recommendations
- **Output filtering**: Search and filter command output
- **Export logs**: Save terminal sessions to files

## 📚 Examples

### **Complete Development Workflow**
```bash
# Navigate to project directory
cd /home/user/app

# Install dependencies
npm install

# Run development server
npm run dev

# Check running processes
ps aux | grep node

# View logs
tail -f logs/app.log
```

### **Python Development**
```bash
# Create virtual environment
python -m venv venv

# Activate environment
source venv/bin/activate

# Install packages
pip install flask requests

# Run application
python app.py
```

### **System Administration**
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tuln

# View system logs
journalctl -f
```

---

**Happy coding! 🎉** The terminal is your gateway to powerful development workflows directly in the browser.
