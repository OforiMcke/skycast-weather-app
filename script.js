const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const locationBtn = document.getElementById("locationBtn");
const unitToggle = document.getElementById("unitToggle");
const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");
const recentSection = document.getElementById("recentSection");
const recentSearchesEl = document.getElementById("recentSearches");

let currentWeatherData = null;
let unit = "c";
let recentCities = JSON.parse(localStorage.getItem("skycastRecent") || "[]");

function temp(c, f) { return unit === "c" ? `${Math.round(c)}°` : `${Math.round(f)}°`; }
function iconUrl(icon) { return icon.startsWith("//") ? `https:${icon}` : icon; }
function hourLabel(time) {
  const d = new Date(time.replace(" ", "T"));
  return d.toLocaleTimeString([], {hour:"numeric"});
}
function dayLabel(date, index) {
  if(index === 0) return "Today";
  if(index === 1) return "Tomorrow";
  return new Date(date+"T12:00:00").toLocaleDateString([], {weekday:"short"});
}

async function fetchWeather(query) {
  if (!query.trim()) return;
  loading.hidden = false; errorBox.hidden = true; weatherDisplay.hidden = true;
  try {
    const url = `/api/weather?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Could not find that location.");
    currentWeatherData = data;
    renderWeather(data);
    saveRecent(data.location.name);
    weatherDisplay.hidden = false;
  } catch (err) {
    errorBox.textContent = err.message || "Unable to load weather. Please try again.";
    errorBox.hidden = false;
  } finally { loading.hidden = true; }
}

function renderWeather(data) {
  const {location, current, forecast} = data;
  document.getElementById("cityName").textContent = `${location.name}, ${location.country}`;
  document.getElementById("localTime").textContent = `Local time · ${location.localtime}`;
  document.getElementById("description").textContent = current.condition.text;
  document.getElementById("temperature").textContent = temp(current.temp_c,current.temp_f);
  document.getElementById("heroUnit").textContent = unit === "c" ? "°C" : "°F";
  document.getElementById("weatherIcon").src = iconUrl(current.condition.icon);
  document.getElementById("weatherIcon").alt = current.condition.text;
  const today = forecast.forecastday[0];
  document.getElementById("highLow").textContent = `High ${temp(today.day.maxtemp_c,today.day.maxtemp_f)} · Low ${temp(today.day.mintemp_c,today.day.mintemp_f)}`;
  document.getElementById("feelsLike").textContent = temp(current.feelslike_c,current.feelslike_f);
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("windSpeed").textContent = unit === "c" ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;
  document.getElementById("uv").textContent = `${current.uv}`;
  document.getElementById("pressure").textContent = `${current.pressure_mb} hPa`;
  document.getElementById("visibility").textContent = unit === "c" ? `${current.vis_km} km` : `${current.vis_miles} mi`;
  document.getElementById("dayLabel").textContent = "Current conditions";
  renderHourly(forecast.forecastday[0].hour, location.localtime);
  renderDaily(forecast.forecastday);
  setBackground(current.condition.text);
}

function renderHourly(hours, localtime) {
  const now = new Date(localtime.replace(" ", "T"));
  const start = now.getHours();
  const nextHours = hours.slice(start).concat(hours.slice(0,start)).slice(0,8);
  hourlyForecast.innerHTML = nextHours.map((h,i) => `
    <div class="hour-card">
      <div class="hour-time">${i===0?"Now":hourLabel(h.time)}</div>
      <img src="${iconUrl(h.condition.icon)}" alt="${h.condition.text}">
      <div class="hour-temp">${temp(h.temp_c,h.temp_f)}</div>
      <div class="hour-rain">${h.chance_of_rain}% rain</div>
    </div>`).join("");
}
function renderDaily(days) {
  dailyForecast.innerHTML = days.map((d,i) => `
    <div class="daily-row">
      <div class="daily-day">${dayLabel(d.date,i)}</div>
      <div class="daily-condition"><img src="${iconUrl(d.day.condition.icon)}" alt=""><span>${d.day.condition.text}</span></div>
      <div class="daily-range"><span>${temp(d.day.maxtemp_c,d.day.maxtemp_f)}</span><span class="low">${temp(d.day.mintemp_c,d.day.mintemp_f)}</span></div>
      <div class="daily-rain">${d.day.daily_chance_of_rain}% rain</div>
    </div>`).join("");
}
function setBackground(condition) {
  const c=condition.toLowerCase();
  document.body.classList.remove("weather-sunny","weather-rain","weather-cloudy","weather-snow");
  if(c.includes("rain")||c.includes("drizzle")||c.includes("thunder")) document.body.classList.add("weather-rain");
  else if(c.includes("snow")||c.includes("ice")) document.body.classList.add("weather-snow");
  else if(c.includes("cloud")||c.includes("overcast")||c.includes("fog")||c.includes("mist")) document.body.classList.add("weather-cloudy");
  else document.body.classList.add("weather-sunny");
}
function saveRecent(city) {
  recentCities=[city,...recentCities.filter(c=>c.toLowerCase()!==city.toLowerCase())].slice(0,5);
  localStorage.setItem("skycastRecent",JSON.stringify(recentCities));
  renderRecent();
}
function renderRecent() {
  recentSection.hidden=recentCities.length===0;
  recentSearchesEl.innerHTML=recentCities.map(city=>`<button class="recent-chip" type="button" data-city="${escapeHtml(city)}">${escapeHtml(city)}</button>`).join("");
}
function escapeHtml(str){return str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

form.addEventListener("submit",e=>{e.preventDefault();fetchWeather(cityInput.value.trim());});
recentSearchesEl.addEventListener("click",e=>{const btn=e.target.closest("[data-city]");if(btn)fetchWeather(btn.dataset.city);});
document.getElementById("clearRecent").addEventListener("click",()=>{recentCities=[];localStorage.removeItem("skycastRecent");renderRecent();});
unitToggle.addEventListener("click",()=>{unit=unit==="c"?"f":"c";unitToggle.innerHTML=unit==="c"?"°C <span>/</span> °F":"°F <span>/</span> °C";if(currentWeatherData)renderWeather(currentWeatherData);});
locationBtn.addEventListener("click",()=>{
  if(!navigator.geolocation){errorBox.textContent="Geolocation is not supported by your browser.";errorBox.hidden=false;return;}
  loading.hidden=false;errorBox.hidden=true;
  navigator.geolocation.getCurrentPosition(pos=>fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),err=>{
    loading.hidden=true;errorBox.textContent=err.code===1?"Location permission denied. Search for a city instead.":"Unable to detect your location.";errorBox.hidden=false;
  },{timeout:10000});
});
renderRecent();
fetchWeather("Sunyani");
