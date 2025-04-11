$body = @{
    data = @{
        model = "gpt-4"
        status = "success"
        latency = 150
        message = "Test log entry"
        timestamp = Get-Date -Format "o"
    }
} | ConvertTo-Json

$uri = "http://localhost:3030/logs/test-log"

Write-Host "Sending request to $uri with body: $body"

$response = Invoke-WebRequest -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -Uri $uri

Write-Host "Response status: $($response.StatusCode)"
Write-Host "Response body: $($response.Content)"

# Now let's check if the log was added
$getResponse = Invoke-WebRequest -Method GET -Uri "http://localhost:3030/logs"
Write-Host "Logs response: $($getResponse.Content)"
