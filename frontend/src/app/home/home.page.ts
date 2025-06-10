import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { WeatherService, WeatherData } from '../services/weather.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  weatherData: WeatherData | null = null;
  loading = false;
  error: string | null = null;
  searchQuery = '';
  searchResults: any[] = [];
  Math = Math;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.loadCurrentLocationWeather();
  }

  async loadCurrentLocationWeather() {
    this.loading = true;
    this.error = null;
    
    try {
      // Request location permissions
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location !== 'granted') {
        throw new Error('Location permission denied. Please enable location access.');
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Fetch weather data
      this.weatherService.getCurrentWeather(lat, lon).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load weather data. Please try again.';
          this.loading = false;
          console.error('Weather API error:', err);
        }
      });

    } catch (error: any) {
      this.error = error.message || 'Failed to get location. Please try again.';
      this.loading = false;
      console.error('Location error:', error);
    }
  }

  onSearchInput(event: any) {
    const query = event.detail.value;
    this.searchQuery = query;

    if (query && query.length > 2) {
      this.weatherService.searchCities(query).subscribe({
        next: (results) => {
          this.searchResults = results.slice(0, 5); // Limit to 5 results
        },
        error: (err) => {
          console.error('Search error:', err);
          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  selectCity(city: any) {
    this.searchResults = [];
    this.searchQuery = '';
    this.loading = true;
    this.error = null;

    this.weatherService.getWeatherByCity(city.name).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load weather data for selected city.';
        this.loading = false;
        console.error('Weather API error:', err);
      }
    });
  }

  getDayName(dateString: string, index: number): string {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  getTodayHours() {
    if (!this.weatherData?.forecast.forecastday[0]) return [];
    
    const currentHour = new Date().getHours();
    return this.weatherData.forecast.forecastday[0].hour
      .filter((_, index) => index >= currentHour)
      .slice(0, 9); // Show next 9 hours
  }

  getHourTime(timeString: string): string {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  }
}