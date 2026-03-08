# Contributing to manifest-validator

Thank you for your interest in contributing to manifest-validator! This document provides guidelines for contributing to this project.

## How to Fork and Clone

1. **Fork the repository**: Click the "Fork" button on the GitHub page to create your own copy of the repository.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/manifest-validator.git
   cd manifest-validator
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/theluckystrike/manifest-validator.git
   ```

4. **Keep your fork synced**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Run the CLI locally**:
   ```bash
   node dist/cli.js /path/to/manifest.json
   ```

## Code Style Guidelines

- **TypeScript**: This project uses TypeScript. Ensure all code is properly typed.
- **Formatting**: Use consistent indentation (2 spaces) and follow the existing code style.
- **Naming**: Use camelCase for variables and functions, PascalCase for classes and interfaces.
- **Comments**: Add JSDoc comments for public APIs and complex logic.
- **Linting**: Run type checking before committing:
  ```bash
  npx tsc --noEmit
  ```

## How to Submit Pull Requests

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-description
   ```

2. **Make your changes**: Implement your feature or bug fix.

3. **Run tests and ensure they pass**:
   ```bash
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: resolve issue"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**: Open a PR against the `main` branch of the original repository.

7. **PR Guidelines**:
   - Provide a clear description of the changes
   - Include relevant issue numbers if applicable
   - Ensure all tests pass
   - Update documentation if needed

## Issue Reporting Guidelines

When reporting issues, please include:

1. **Clear title**: Describe the issue briefly
2. **Description**: Provide detailed steps to reproduce the issue
3. **Environment**: Include OS, Node.js version, and project version
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened
6. **Screenshots/Logs**: If applicable, include relevant logs or screenshots

### Issue Templates

Use the appropriate issue template for:
- 🐛 Bug reports
- 💡 Feature requests
- ❓ Questions

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
