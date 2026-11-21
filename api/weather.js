module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: { message: "Method not allowed." } });
  }

  const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
  if (!query || query.length > 100) {
    return response.status(400).json({ error: { message: "Enter a location with no more than 100 characters." } });
  }

  const apiKey = process.env.WEATHERAPI_KEY;
  const apiUrl = process.env.WEATHERAPI_URL;
  if (!apiKey || !apiUrl) {
    return response.status(500).json({ error: { message: "Weather service is not configured." } });
  }

  let url;
  try {
    url = new URL(apiUrl);
  } catch (error) {
    console.error("WEATHERAPI_URL is invalid:", error);
    return response.status(500).json({ error: { message: "Weather service is not configured." } });
  }

  url.search = new URLSearchParams({
    key: apiKey,
    q: query,
    days: "3",
    aqi: "no",
    alerts: "no"
  });

  try {
    const weatherResponse = await fetch(url);
    const data = await weatherResponse.json();
    return response.status(weatherResponse.status).json(data);
  } catch (error) {
    console.error("WeatherAPI request failed:", error);
    return response.status(502).json({ error: { message: "Unable to load weather. Please try again." } });
  }
};
