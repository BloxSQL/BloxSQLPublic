local SERVER_URL = "http://localhost:3000/query" 

local payload = {
	key = "AXSDSADS", -- MAKE YOUR KEY UNIQUE
	sqlQuery = {
		table = "testTable",
		query = "CREATE TABLE IF NOT EXISTS {TABLE_NAME} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)"
		-- If your table doesnt use {TABLE_NAME} it will result in a warning every time and leaving your data exposed if you use {TABLE_NAME} it will use (KEY)_(TABLE)
	}
}

-- Convert Lua table to JSON string
local payloadJson = game:GetService("HttpService"):JSONEncode(payload)

-- Create HTTP request object
local request = {
	Url = SERVER_URL,
	Method = "POST",
	Headers = {
		["Content-Type"] = "application/json"
	},
	Body = payloadJson
}

-- Send HTTP request asynchronously
local success, response = pcall(function()
	return game:GetService("HttpService"):RequestAsync(request)
end)

if success then
	-- Log the raw response body for debugging
	print("Raw response:", response.Body)
else
	print("Error sending request:", response)
	return
end

-- Attempt to decode the JSON response
local decodedResponse = game:GetService("HttpService"):JSONDecode(response.Body)

if decodedResponse then
	if decodedResponse.error then
		print("Error:", decodedResponse.error)
	else
		print("Table created successfully:", decodedResponse)
	end
else
	print("Error decoding JSON:", response.Body)
end