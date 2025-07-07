# 線上簽名維修單

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/js/`
4. Commit after every completed task

## Project Structure

```
線上簽名維修單/
├── CLAUDE.md              # Essential rules for Claude Code
├── README.md              # Project documentation
├── .gitignore             # Git ignore patterns
├── src/                   # Source code (NEVER put files in root)
│   ├── main/              # Main application code
│   │   ├── js/            # JavaScript components
│   │   │   ├── core/      # Core business logic
│   │   │   ├── utils/     # Utility functions
│   │   │   ├── models/    # Data models
│   │   │   ├── services/  # Service layer
│   │   │   └── api/       # API endpoints
│   │   └── resources/     # Non-code resources
│   │       ├── config/    # Configuration files
│   │       └── assets/    # Static assets
│   └── test/              # Test code
│       ├── unit/          # Unit tests
│       └── integration/   # Integration tests
├── docs/                  # Documentation
├── tools/                 # Development tools and scripts
├── examples/              # Usage examples
└── output/                # Generated output files
```

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Language-agnostic structure** - works with Python, JS, Java, etc.
- **Scalable** - start simple, grow as needed