# Data Retention

This document describes the data retention features in the NeuralLog Web application, including how to configure and manage retention policies through the user interface.

## Overview

NeuralLog's data retention system allows you to control how long your log data is stored before being automatically deleted. This helps you:

- Comply with data protection regulations
- Manage storage costs
- Implement data lifecycle policies
- Maintain good data hygiene

All retention policies maintain NeuralLog's zero-knowledge architecture, ensuring that log names remain encrypted and private.

## Accessing Data Retention Settings

1. Log in to the NeuralLog Web application
2. Navigate to the **Settings** section from the main navigation
3. Click on the **Data Retention** card
4. You will be taken to the data retention settings page

## Managing Default Retention Policy

The default retention policy applies to all logs that don't have a specific retention policy set.

### Viewing the Default Policy

The current default retention policy is displayed at the top of the data retention settings page, showing how long logs are retained by default.

### Updating the Default Policy

To update the default retention policy:

1. In the "Update Default Policy" section, enter a new retention period value
2. Select the appropriate time unit (seconds, minutes, hours, days, months, or years)
3. (Optional) Click "Check Impact" to see how many log entries would be affected by this change
4. Click "Update" to apply the new default policy

## Managing Log-Specific Retention Policies

You can set different retention periods for specific logs, which will override the default policy for those logs.

### Viewing Log-Specific Policies

All existing log-specific policies are displayed in a table showing:
- Log name
- Retention period
- Actions (delete)

### Adding a Log-Specific Policy

To add a new log-specific retention policy:

1. In the "Add/Update Log-Specific Policy" section, select a log from the dropdown
2. Enter a retention period value
3. Select the appropriate time unit
4. Click "Set Policy" to apply the new policy

### Updating a Log-Specific Policy

To update an existing log-specific policy, follow the same steps as adding a policy, but select a log that already has a policy. The existing policy will be replaced with the new one.

### Deleting a Log-Specific Policy

To delete a log-specific retention policy:

1. Find the policy in the table of log-specific policies
2. Click the "Delete" button next to the policy
3. The policy will be deleted, and the log will fall back to using the default policy

## Checking Impact Before Changes

Before applying a retention policy change, you can check how many log entries would be affected:

1. Enter the new retention period value and select the time unit
2. Click the "Check Impact" button
3. The system will display how many log entries would be deleted if this policy were applied

This allows you to make informed decisions about retention policy changes before implementing them.

## Understanding Retention Periods

Retention periods determine how long log entries are kept before being automatically deleted:

- A retention period of 30 days means log entries older than 30 days will be deleted
- A retention period of 0 means log entries will be deleted immediately (not recommended)
- A retention period of -1 means log entries will be kept indefinitely (no automatic deletion)

Retention periods can be specified in various time units:
- Seconds
- Minutes
- Hours
- Days
- Months
- Years

## Implementation Details

The web interface communicates with the NeuralLog Client SDK, which handles:

- Encrypting log names before sending them to the server
- Decrypting log names received from the server
- Making API calls to the retention policy endpoints

The actual deletion of expired log entries is handled by a scheduled job on the server side.

## Best Practices

1. **Set Appropriate Retention Periods**: Balance between data availability and storage costs
2. **Use Log-Specific Policies**: Set different retention periods based on the importance and usage patterns of different logs
3. **Check Impact Before Changes**: Use the "Check Impact" feature to understand the impact of policy changes before applying them
4. **Regular Audits**: Periodically review retention policies to ensure they meet your needs and compliance requirements

## Troubleshooting

### Common Issues

#### Policy Not Showing Up

If a policy you just created doesn't appear in the list:
- Refresh the page
- Check if you have the necessary permissions
- Verify that the API call was successful (check browser console for errors)

#### Cannot Delete a Policy

If you cannot delete a policy:
- Ensure you have the necessary permissions
- Try refreshing the page and attempting again
- Check browser console for any error messages

## Related Documentation

- [User Guide](./user-guide.md)
- [Configuration](./configuration.md)
- [API Reference](./api.md)
- [Zero-Knowledge Implementation](./zero-knowledge.md)
