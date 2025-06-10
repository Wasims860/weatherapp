import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      }>;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getCurrentWeather(lat: number, lon: number): Observable<WeatherData> {
    const url = `${environment.weatherApiUrl}/forecast.json?key=${environment.weatherApiKey}&q=${lat},${lon}&days=5&aqi=no&alerts=no`;
    return this.http.get<WeatherData>(url);
  }

  getWeatherByCity(city: string): Observable<WeatherData> {
    const url = `${environment.weatherApiUrl}/forecast.json?key=${environment.weatherApiKey}&q=${city}&days=5&aqi=no&alerts=no`;
    return this.http.get<WeatherData>(url);
  }

  searchCities(query: string): Observable<any[]> {
    const url = `${environment.weatherApiUrl}/search.json?key=${environment.weatherApiKey}&q=${query}`;
    return this.http.get<any[]>(url);
  }
}