# Contributing changes

Create a feature branch, run the checks documented in [README.md](README.md), and open a pull request. Do not commit `.env.local`, database dumps, generated authentication state, `.qa/`, or test credentials.

The `BuildNext quality` workflow runs a clean installation, type/lint checks, unit tests, production dependency audit, production build, and isolated-database browser tests. Generated browser evidence is retained as a CI artifact rather than committed application data.

Deployment is a separate explicit operation. Pushing or opening a pull request does not provision a database or create a production administrator.
