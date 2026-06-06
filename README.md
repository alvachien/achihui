[![build and test](https://github.com/alvachien/achihui/actions/workflows/build-test.yml/badge.svg)](https://github.com/alvachien/achihui/actions/workflows/build-test.yml)

# Home Info. Hub

**Home Information Hub**, abbreviated as **HIH**, is a personal and family information platform designed to manage and track all aspects of daily life. It provides a comprehensive set of tools for financial management, event planning, library organization, and personal blogging.

## Key Features

### Finance Traces

A complete personal/family finance system that tracks all financial activities:

- **Document Management** — Create and manage various types of financial documents including income/expense records, transfers, currency exchanges, asset buy/sell transactions, loans, repayments, down payments, and asset value changes. Supports mass creation for batch entry.
- **Account Management** — Track multiple accounts across categories (cash, deposit, investment, loan, receivable/payable). Supports account reconciliation and settlement.
- **Reports & Analytics** — Visualize financial data with interactive charts (powered by ECharts), including account reports, cash journals, balance reports, month-on-month comparisons, transaction type analysis, control center summaries, and order-level reporting.
- **Financial Planning** — Create and track financial plans and budgets.
- **Orders & Control Centers** — Organize transactions by activities/projects (orders) and organizational units (control centers) for better categorization.
- **Recurring Documents** — Automate recurring financial entries.
- **Multi-currency Support** — Handle transactions in different currencies with exchange rate management.

### Event Management

Track and manage events and activities:

- **Normal Events** — One-time events with full detail tracking.
- **Recurring Events** — Repeating events with flexible scheduling.
- **Event Overview** — Calendar-style view of all events.
- **Event Search** — Find events across all types and time periods.

### Library System

Organize and manage personal collections:

- **Book Management** — Catalog books with full metadata, including tags and categories.
- **Borrow Records** — Track book lending with creation dialogs and record lists.
- **Location Tracking** — Organize books by physical locations with detail views.
- **Person & Organization Management** — Manage people and organizations associated with your library.
- **Search** — Full-text search across library contents.

### Blog System

A built-in blogging platform:

- **Post Management** — Create, edit, and manage blog posts with markdown support.
- **Collections** — Organize posts into collections/categories.
- **User Settings** — Personalize blog settings and preferences.

## How to Use It

**HIH** is designed to run on a cloud or HTTP/HTTPS server, providing easy access from all workstations and mobile devices.

Ideally, deploy it on a cloud server, or run it on a NAS/family server with ASP.NET Core backend and HTTP server support.

## Live Demo

A live application is hosted at [alvachien.com](http://www.alvachien.com/hih).

### Snapshots

![Index page](https://github.com/alvachien/achihui/blob/master/docs/images/index.JPG)
Welcome page

![Finance report](https://github.com/alvachien/achihui/blob/master/docs/images/finance_report.JPG)
Finance reports

![Tag cloud](https://github.com/alvachien/achihui/blob/master/docs/images/tag_cloud.JPG)
Cloud of tag

![Create document](https://github.com/alvachien/achihui/blob/master/docs/images/create_doc.JPG)
Create a financial document

![Document display](https://github.com/alvachien/achihui/blob/master/docs/images/display_doc.JPG)
Display a posted document

### Related API/App

The live demo uses the following services:

- **AC ID Server** ([Github](https://github.com/alvachien/acidserver)) — Identity and authentication service
- **AC HIH API** ([Github](https://github.com/alvachien/achihapi)) — Web API backend

## What's HIH

**HIH** (Home Information Hub) is a centralized platform for storing and managing information across all family members. Since version 0.1, it supports finance traces and learning traces, with additional features for events, libraries, and blogging.

## AI-Powered Development

This project is developed with **AI-assisted coding** using Claude (Anthropic), significantly accelerating development velocity and improving code quality through:

- **Intelligent code generation** — Boilerplate, test cases, and refactoring powered by AI pair programming
- **Automated bug fixing** — AI-driven analysis and resolution of test failures and edge cases
- **Code review assistance** — Automated review for correctness, security, and adherence to project conventions
- **Multi-agent orchestration** — Parallel AI agents for comprehensive codebase exploration, feature design, and verification

## Upcoming AI Features

**AI-powered finance analysis** is planned for the Finance Traces module, bringing intelligent insights to your financial data:

- **Activity Analysis** — AI-driven analysis of finance activities to identify spending patterns, income trends, and financial health indicators
- **Smart Insights** — Automated detection of unusual transactions, budget deviations, and optimization opportunities
- **Natural Language Queries** — Ask questions about your finances in plain language and get instant answers

## Technology Stack

This project is the UI layer of HIH, built with modern web technologies:

- [Angular 21+](https://angular.dev/) — Application framework
- [TypeScript](https://www.typescriptlang.org/) — Language
- [Ant Design for Angular (NG-ZORRO)](https://ng.ant.design/) — UI component library
- [ECharts](https://echarts.apache.org/) — Data visualization
- [ngx-echarts](https://github.com/xieziyu/ngx-echarts/) — ECharts integration for Angular
- [Moment.js](https://momentjs.com/) — Date handling

## Development

```bash
# Install dependencies
npm install

# Run development server
ng serve

# Run unit tests
npm test

# Build for production
npm run build
```

## Credits

As an open source project, **HIH** relies on the following open source projects and libraries:

* [TypeScript](http://www.typescriptlang.org)
* [Angular](https://github.com/angular/angular)
* [NG-ZORRO (Ant Design for Angular)](https://ng.ant.design)
* [ECharts](http://echarts.baidu.com/)
* [ngx-echarts](https://github.com/xieziyu/ngx-echarts/)
* [Moment.js](https://momentjs.com/)

## Contact

**Alva Chien | 钱红俊**

A programmer, a photographer, and a father.

Contact me:

1. Via email: alvachien@163.com
2. [Visit my website](https://www.alvachien.com)

## License

MIT
