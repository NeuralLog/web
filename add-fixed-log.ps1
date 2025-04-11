# Create a log entry without the nested data structure
$body = @{
    model = "gpt-4"
    status = "success"
    latency = 150
    message = "Fixed log entry"
    timestamp = Get-Date -Format "o"
} | ConvertTo-Json

$uri = "http://localhost:3030/logs/fixed-log"

Write-Host "Sending request to $uri with body: $body"

$response = Invoke-WebRequest -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -Uri $uri

Write-Host "Response status: $($response.StatusCode)"
Write-Host "Response body: $($response.Content)"

# Now let's check if the log was added
$getResponse = Invoke-WebRequest -Method GET -Uri "http://localhost:3030/logs"
Write-Host "Logs response: $($getResponse.Content)"

# Get the log entries
$logResponse = Invoke-WebRequest -Method GET -Uri "http://localhost:3030/logs/fixed-log"
Write-Host "Log entries: $($logResponse.Content)"
