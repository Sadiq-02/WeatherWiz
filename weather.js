const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const searchInput = document.querySelector("[data-searchInput]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");

let oldTab = userTab;
const API_KEY = "801047665fa73f3152221f85efcac601";
oldTab.classList.add("current-tab");
getfromSessionStorage();

// Switch tab function
function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

// Event Listeners for tabs
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Handle session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// Show position and store coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation not supported by your browser");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Event listener for grant access button
grantAccessButton.addEventListener("click", getLocation);

// Fetch user weather info
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    try {
        loadingScreen.classList.add("active");
        grantAccessContainer.classList.remove("active");

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        console.error("Error fetching user weather info", err);
    }
}

// Render weather info
function renderWeatherInfo(data) {
    document.querySelector("[data-cityName]").textContent = data?.name;
    document.querySelector("[data-countryIcon]").src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    document.querySelector("[data-weatherDesc]").textContent = data?.weather?.[0]?.description;
    document.querySelector("[data-weatherIcon]").src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    document.querySelector("[data-temp]").textContent = `${data?.main?.temp.toFixed(2)} °C`;
    document.querySelector("[data-windspeed]").textContent = `${data?.wind?.speed} m/s`;
    document.querySelector("[data-humidity]").textContent = `${data?.main?.humidity}%`;
    document.querySelector("[data-cloudiness]").textContent = `${data?.clouds?.all}%`;
}

// Handle form submit
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city !== "") {
        fetchSearchWeatherInfo(city);
    }
});

// Fetch weather by city
async function fetchSearchWeatherInfo(city) {
    try {
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        console.error("Error fetching weather details:", err);
    }
}
