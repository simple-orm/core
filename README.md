# Simple ORM

A simple ORM for NodeJS.
# Description

This ORM is deigned to have a minimal amount of built-in functionality with 2 main components: Repositories and Models.  The base components will provide the basic functionality for creating, retrieving, and saving data.  It will also provide a minimal amount of functionality on top of that:

- Data validation
- Easily add in custom behavior to repositories and models
- Easily hooking into certain point in time to perform certain actions (like beforeSave, afterSave, beforeFind, etc...)

Right now MySQL/MariaDB is the only data store supported however data stores can be added in by just creating a new adapter for it with the require interface (TBD).

# Quick Start

TBD

## LICENSE

MIT
