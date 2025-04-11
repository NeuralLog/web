# Add a success log
$successBody = @{
    data = @{
        model = "gpt-4"
        status = "success"
        latency = 120
        message = "Successful query"
        timestamp = Get-Date -Format "o"
    }
} | ConvertTo-Json

Invoke-WebRequest -Method POST -Headers @{"Content-Type"="application/json"} -Body $successBody -Uri "http://localhost:3030/logs/test-log"
Write-Host "Added success log"

# Add an error log
$errorBody = @{
    data = @{
        model = "gpt-3.5"
        status = "error"
        latency = 200
        message = "Rate limit exceeded"
        error = "rate_limit_exceeded"
        timestamp = Get-Date -Format "o"
    }
} | ConvertTo-Json

Invoke-WebRequest -Method POST -Headers @{"Content-Type"="application/json"} -Body $errorBody -Uri "http://localhost:3030/logs/test-log"
Write-Host "Added error log"

# Add a warning log
$warningBody = @{
    data = @{
        model = "claude-3"
        status = "warning"
        latency = 180
        message = "Partial success with warnings"
        warnings = @("Content filtered", "Potential hallucination")
        timestamp = Get-Date -Format "o"
    }
} | ConvertTo-Json

Invoke-WebRequest -Method POST -Headers @{"Content-Type"="application/json"} -Body $warningBody -Uri "http://localhost:3030/logs/test-log"
Write-Host "Added warning log"

# Check the logs
$getResponse = Invoke-WebRequest -Method GET -Uri "http://localhost:3030/logs/test-log"
Write-Host "Log entries: $($getResponse.Content)"
