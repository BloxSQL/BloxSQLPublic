local HttpService = game:GetService("HttpService")

local url = "YOUR SERVER"

-- Create a function to send the request
local function sendRequest(key)
    local payload = {
        key = key
    }

    local jsonData = HttpService:JSONEncode(payload)
    local headers = {
        ["Content-Type"] = "application/json"
    }

    local success, response = pcall(function()
        return HttpService:PostAsync(url, jsonData, Enum.HttpContentType.ApplicationJson, false, headers)
    end)

    if success then
        print("Response from server: ", response)
        local responseData = HttpService:JSONDecode(response)
        if responseData.tables then
            print("Tables found: ", table.concat(responseData.tables, ", "))
        else
            print("No tables found or unexpected response format.")
        end
    else
        warn("Error in request: ", response)
    end
end

-- Example usage
sendRequest("AXSDSADS")
