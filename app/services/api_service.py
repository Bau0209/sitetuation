#Sample code for API calls

from flask import requests

class LocationAPIService:

    @staticmethod
    def get_location_data(address):
        """
        Sends requests to external mapping APIs
        and returns raw location data.
        """

        # Example Google Geocoding API call
        url = "https://maps.googleapis.com/maps/api/geocode/json"

        params = {
            "address": address,
            "key": "YOUR_API_KEY"
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            return response.json()

        return None

    @staticmethod
    def get_nearby_establishments(lat, lng):
        """
        Retrieves nearby establishments.
        """

        # Example placeholder
        return {
            "restaurants": 12,
            "cafes": 5,
            "pharmacies": 3
        }

    @staticmethod
    def get_population_data(city):
        """
        Retrieves population statistics.
        """

        return {
            "city_population": 10576,
            "barangay_population": 1345
        }