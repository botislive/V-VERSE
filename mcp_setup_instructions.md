# Google Stitch MCP Setup Instructions

To resolve the `npm ERR! 405` error and correctly set up the Model Context Protocol (MCP) for Google Stitch, follow these steps:

## Prerequisites
1. **Google Cloud CLI**: Ensure `gcloud` is installed and authenticated.
   - Run `gcloud auth login` if you haven't already.
2. **Project Setup**: Ensure billing is enabled and the Stitch API is active for your project.

## Step 1: Initialize Stitch MCP
Run the following command in your terminal. This tool will guide you through project selection and IAM setup:

```bash
npx -y @_davideast/stitch-mcp init
```

## Step 2: Configure your AI Client
If you are using Claude Desktop or another MCP-compatible client, the `init` command should help generate the necessary configuration. 

**Avoid using the URL `https://stitch.googleapis.com/mcp` directly in your `package.json` or as an npm install target.**

## Troubleshooting
If you encounter issues during initialization, try forcing a fresh logout/login:
1. `npx -y @_davideast/stitch-mcp logout --force`
2. `npx -y @_davideast/stitch-mcp init`
