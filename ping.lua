local HttpService = game:GetService("HttpService")

local url = "YOUR SERVER"

local function testPing()
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    
    if success then
        print("Ping Response: " .. response)
    else
        warn("Error during ping request: " .. response)
    end
end

testPing()
