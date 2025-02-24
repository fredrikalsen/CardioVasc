import pandas as pd

# Original data
data = {
    "assessment_centre": [
        "Leeds", "Stockport (pilot)", "Glasgow", "Sheffield", "Liverpool", "Cardiff",
        "Bury", "Edinburgh", "Bristol", "Reading", "Birmingham", "Oxford", "Newcastle",
        "Barts", "Hounslow", "Stoke", "Nottingham", "Croydon", "Middlesborough",
        "Swansea", "Manchester", "Wrexham"
    ],
    "latitude": [
        53.8008, 53.4084, 55.8642, 53.3811, 53.4084, 51.4816,
        53.5933, 55.9533, 51.4545, 51.4542, 52.4862, 51.7520, 54.9783,
        51.5180, 51.4678, 53.0027, 52.9548, 51.3721, 54.5742,
        51.6214, 53.4808, 53.0464
    ],
    "longitude": [
        -1.5491, -2.1494, -4.2518, -1.4701, -2.9916, -3.1791,
        -2.2954, -3.1883, -2.5879, -1.3041, -1.8904, -1.2577, -1.6174,
        -0.1021, -0.3625, -2.1853, -1.1557, -0.0982, -1.2355,
        -3.9436, -2.2426, -3.0026
    ]
}

# Mapping coordinates to cities
coords_df = pd.DataFrame(data)

# Original dataset
file_path = "heart_illness_rates_by_city.csv"  # Replace with your CSV file path
output_file_path = "heart_disease_with_coords.csv"

# Load the dataset
df = pd.read_csv(file_path)

# Merge datasets on "assessment_centre"
merged_df = df.merge(coords_df, on="assessment_centre", how="left")

# Save the updated dataset to a new CSV file
merged_df.to_csv(output_file_path, index=False)

print(f"Updated file with coordinates saved to {output_file_path}")
