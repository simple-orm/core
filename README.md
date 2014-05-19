# Simple ORM

A simple ORM for node, designed for the NucleiApps application.

# Description

This is a simple ORM that I have built for what is right now a private application.  This was built as I was frustrated with ORMs like Sequelize that tried to do too much in my opinion and I was always fighting with it.  I finally got feed up when I started to have to make changed to my database schema in order to get Sequelize to work.

This ORM is deigned to have a minimal amount of built-in functionality with 2 main components: Repositories and Models.  The base components will provide the basic functionality for creating, retrieving, and saving data.  It will also provide a minimal amount of functionality on top of that:

- Relationship support
- Data validation

Right now MySQL/MariaDB is the only database supported however SQLite support is planned.  After that I don't plan to add support for other database myself though I will try to build it in a way where other adapters can be added.

# Quick Start

TBD

## LICENSE

MIT