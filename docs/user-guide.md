# NeuralLog Web User Guide

This guide provides instructions for using the NeuralLog Web application, a zero-knowledge logging system that ensures your log data remains private and secure.

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard](#dashboard)
- [Viewing Logs](#viewing-logs)
- [Searching Logs](#searching-logs)
- [Managing API Keys](#managing-api-keys)
- [Key Management](#key-management)
- [User Management](#user-management)
- [Settings](#settings)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Application

1. Open your web browser and navigate to the NeuralLog Web application URL
2. You will be presented with a login screen

### Logging In

1. Enter your username and password
2. Click the "Log In" button
3. If this is your first time logging in, you will be prompted to set up your master secret

### Setting Up Your Master Secret

The master secret is used to encrypt and decrypt your log data. It is never sent to the server and is stored only in your browser's local storage.

1. On the master secret setup screen, you have two options:
   - Generate a new master secret
   - Enter an existing master secret

2. To generate a new master secret:
   - Click the "Generate" button
   - A secure random master secret will be generated
   - Make sure to save this master secret in a secure location

3. To enter an existing master secret:
   - Enter your master secret in the input field
   - Click the "Initialize" button

4. After setting up your master secret, you will be redirected to the dashboard

## Dashboard

The dashboard provides an overview of your logs and system status.

### Dashboard Components

- **Recent Logs**: Displays the most recent logs across all log sources
- **Log Statistics**: Shows statistics about your logs, such as count by level
- **System Status**: Displays the status of the NeuralLog system components
- **Quick Actions**: Provides quick access to common actions

### Navigating the Dashboard

- Use the sidebar to navigate to different sections of the application
- Use the search bar at the top to search across all logs
- Use the user menu in the top-right corner to access user settings and log out

## Viewing Logs

The log viewer allows you to view and analyze your logs.

### Selecting a Log

1. Navigate to the "Logs" section from the sidebar
2. Use the log selector dropdown to choose a log to view
3. The selected log's entries will be displayed in the log viewer

### Log Viewer Features

- **Pagination**: Navigate through log entries using the pagination controls
- **Filtering**: Filter logs by various criteria using the filter controls
- **Sorting**: Sort logs by timestamp, level, or other fields
- **Detail View**: Click on a log entry to view its details
- **Export**: Export logs to various formats (JSON, CSV, etc.)

### Understanding the Log Viewer

The log viewer displays the following information for each log entry:

- **Timestamp**: When the log entry was created
- **ID**: A unique identifier for the log entry
- **Data**: The log entry data, which is decrypted client-side

## Searching Logs

The log search feature allows you to search for specific log entries.

### Basic Search

1. Navigate to the "Logs" section from the sidebar
2. Select a log to search using the log selector dropdown
3. Click the "Search" tab
4. Enter your search query in the search input
5. Click the "Search" button
6. The search results will be displayed in the log viewer

### Advanced Search

For more complex searches, you can use the advanced search features:

1. Click the "Advanced" button next to the search input
2. Use the advanced search form to specify:
   - Field-specific searches
   - Date range filters
   - Level filters
   - Custom filters
3. Click the "Search" button
4. The search results will be displayed in the log viewer

### Search Syntax

The search input supports a simple query syntax:

- **Keywords**: Search for logs containing specific keywords
- **Phrases**: Use quotes to search for exact phrases, e.g., "database error"
- **Field-specific**: Use field:value syntax, e.g., level:error
- **Boolean operators**: Use AND, OR, NOT to combine searches
- **Wildcards**: Use * for wildcards, e.g., data.user*

## Managing API Keys

API keys are used to authenticate with the NeuralLog API.

### Viewing API Keys

1. Navigate to the "API Keys" section from the sidebar
2. Your existing API keys will be displayed in a list

### Creating an API Key

1. Navigate to the "API Keys" section from the sidebar
2. Click the "Create API Key" button
3. Enter a name for the API key
4. Select the permissions for the API key
5. Click the "Create" button
6. The new API key will be displayed
7. Make sure to copy the API key, as it will not be displayed again

### Revoking an API Key

1. Navigate to the "API Keys" section from the sidebar
2. Find the API key you want to revoke
3. Click the "Revoke" button
4. Confirm the revocation
5. The API key will be revoked and can no longer be used

## Key Management

The key management section allows you to manage your encryption keys.

### Viewing Key Versions

1. Navigate to the "Keys" section from the sidebar
2. Your existing key versions will be displayed in a list

### Creating a New Key Version

1. Navigate to the "Keys" section from the sidebar
2. Click the "Create Key Version" button
3. Enter a reason for creating the new key version
4. Click the "Create" button
5. The new key version will be created and activated

### Rotating Keys

Key rotation is the process of creating a new key version and marking the old one as deprecated.

1. Navigate to the "Keys" section from the sidebar
2. Click the "Rotate Keys" button
3. Enter a reason for rotating the keys
4. Click the "Rotate" button
5. The keys will be rotated, and a new key version will be created

### Recovering Keys

If you need to recover keys from a recovery phrase:

1. Navigate to the "Keys" section from the sidebar
2. Click the "Recover Keys" button
3. Enter your recovery phrase
4. Click the "Recover" button
5. The keys will be recovered and activated

## User Management

The user management section allows administrators to manage users.

### Viewing Users

1. Navigate to the "Users" section from the sidebar
2. Existing users will be displayed in a list

### Creating a User

1. Navigate to the "Users" section from the sidebar
2. Click the "Create User" button
3. Enter the user's details:
   - Username
   - Email
   - Password
   - Role
4. Click the "Create" button
5. The user will be created and added to the list

### Editing a User

1. Navigate to the "Users" section from the sidebar
2. Find the user you want to edit
3. Click the "Edit" button
4. Update the user's details
5. Click the "Save" button
6. The user's details will be updated

### Deleting a User

1. Navigate to the "Users" section from the sidebar
2. Find the user you want to delete
3. Click the "Delete" button
4. Confirm the deletion
5. The user will be deleted

## Settings

The settings section allows you to configure the application.

### General Settings

1. Navigate to the "Settings" section from the sidebar
2. Update the general settings:
   - Theme (light/dark)
   - Language
   - Time zone
   - Date format
3. Click the "Save" button
4. The settings will be updated

### Security Settings

1. Navigate to the "Settings" section from the sidebar
2. Click the "Security" tab
3. Update the security settings:
   - Password requirements
   - Session timeout
   - Two-factor authentication
4. Click the "Save" button
5. The settings will be updated

### Notification Settings

1. Navigate to the "Settings" section from the sidebar
2. Click the "Notifications" tab
3. Update the notification settings:
   - Email notifications
   - In-app notifications
   - Alert thresholds
4. Click the "Save" button
5. The settings will be updated

## Troubleshooting

### Common Issues

#### Authentication Issues

If you encounter authentication issues:

1. Check that you are using the correct username and password
2. Clear your browser's cookies and try again
3. If you are using an API key, check that it is valid and has not been revoked
4. Contact your administrator if the issue persists

#### Decryption Issues

If you encounter decryption issues:

1. Check that you have entered the correct master secret
2. Clear your browser's local storage and re-enter your master secret
3. Check that the logs were encrypted with the same key hierarchy
4. Contact your administrator if the issue persists

#### Performance Issues

If you encounter performance issues:

1. Reduce the number of logs being displayed at once
2. Use more specific search queries to reduce the result set
3. Close other browser tabs and applications to free up resources
4. Try using a different browser or device
5. Contact your administrator if the issue persists

### Getting Help

If you need help with the NeuralLog Web application:

1. Check the documentation
2. Look for similar issues in the knowledge base
3. Contact your administrator
4. Submit a support ticket

## Advanced Features

### Customizing the Dashboard

You can customize the dashboard to show the information that is most relevant to you:

1. Navigate to the dashboard
2. Click the "Customize" button in the top-right corner
3. Drag and drop widgets to rearrange them
4. Add or remove widgets using the widget selector
5. Click the "Save" button to save your customizations

### Creating Custom Views

You can create custom views to quickly access specific log configurations:

1. Navigate to the "Logs" section from the sidebar
2. Configure the log viewer with your desired settings
3. Click the "Save View" button
4. Enter a name for the view
5. Click the "Save" button
6. The view will be saved and accessible from the "Views" dropdown

### Setting Up Alerts

You can set up alerts to be notified when specific log events occur:

1. Navigate to the "Alerts" section from the sidebar
2. Click the "Create Alert" button
3. Configure the alert:
   - Name
   - Log source
   - Conditions
   - Notification method
4. Click the "Create" button
5. The alert will be created and activated

### Integrating with External Systems

You can integrate NeuralLog with external systems:

1. Navigate to the "Integrations" section from the sidebar
2. Select the integration you want to set up
3. Follow the integration-specific instructions
4. Click the "Save" button
5. The integration will be set up and activated
