#Sample code for data processing

class LocationDataProcessor:

    @staticmethod
    def extract_location_details(api_response):

        if not api_response:
            return None

        result = api_response["results"][0]

        return {
            "formatted_address": result["formatted_address"],
            "latitude": result["geometry"]["location"]["lat"],
            "longitude": result["geometry"]["location"]["lng"]
        }

    @staticmethod
    def calculate_foot_traffic(population):

        if population < 1000:
            return "Low"

        if population < 5000:
            return "Medium"

        return "High"

    @staticmethod
    def generate_ai_summary(location_data):

        return (
            f"This location shows strong potential "
            f"for retail and food-related businesses "
            f"based on surrounding establishments."
        )

    @staticmethod
    def build_location_report(location, establishments, population):

        return {
            "location": location,
            "establishments": establishments,
            "population": population,
            "foot_traffic": LocationDataProcessor.calculate_foot_traffic(
                population["barangay_population"]
            ),
            "ai_summary": LocationDataProcessor.generate_ai_summary(location)
        }