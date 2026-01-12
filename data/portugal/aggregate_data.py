import pandas as pd
import os

# Read the large CSV file
print("Reading CSV file...")
csv_path = r"c:\Users\Dell\OneDrive\Bureau\M2\Bloc 2-Spécialisation\Data Visualization\Projet\ProjetDataVizUCBL1\data\portugal\2agosto -dic 2021.csv"

# Read in chunks to handle large file, with error handling
chunks = []
try:
    for chunk in pd.read_csv(csv_path, chunksize=100000, on_bad_lines='skip', engine='python'):
        chunks.append(chunk)
        print(f"Loaded {len(chunks)} chunks ({len(chunk)} rows)...")
except Exception as e:
    print(f"Stopped at chunk {len(chunks)+1}: {e}")
    print("Continuing with loaded data...")

df = pd.concat(chunks, ignore_index=True)
print(f"Total rows: {len(df)}")

# Parse datetime
df['timestamp'] = pd.to_datetime(df['fecha_servidor'])
df['date'] = df['timestamp'].dt.date
df['hour'] = df['timestamp'].dt.hour
df['month'] = df['timestamp'].dt.month
df['day_name'] = df['timestamp'].dt.day_name()

# Convert numeric columns
numeric_cols = ['voltaje', 'corriente', 'potencia', 'frecuencia', 'energia', 'fp', 
                'ESP32_temp', 'WORKSTATION_CPU', 'WORKSTATION_CPU_POWER', 
                'WORKSTATION_CPU_TEMP', 'WORKSTATION_GPU', 'WORKSTATION_GPU_POWER',
                'WORKSTATION_GPU_TEMP', 'WORKSTATION_RAM', 'WORKSTATION_RAM_POWER']

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Output directory
out_dir = r"c:\Users\Dell\OneDrive\Bureau\M2\Bloc 2-Spécialisation\Data Visualization\Projet\ProjetDataVizUCBL1\data\portugal"

# 1. Daily aggregation
print("Creating daily aggregation...")
daily = df.groupby('date').agg({
    'potencia': ['mean', 'max', 'min', 'std'],
    'energia': 'max',
    'voltaje': 'mean',
    'corriente': 'mean',
    'ESP32_temp': 'mean',
    'WORKSTATION_CPU': 'mean',
    'WORKSTATION_CPU_POWER': 'mean',
    'WORKSTATION_CPU_TEMP': 'mean',
    'WORKSTATION_GPU': 'mean',
    'WORKSTATION_GPU_POWER': 'mean'
}).round(2)
daily.columns = ['_'.join(col).strip() for col in daily.columns.values]
daily = daily.reset_index()
daily.to_csv(os.path.join(out_dir, 'portugal_daily.csv'), index=False, sep=';')
print(f"Daily: {len(daily)} rows")

# 2. Hourly pattern (average by hour across all days)
print("Creating hourly pattern...")
hourly = df.groupby('hour').agg({
    'potencia': 'mean',
    'energia': 'mean',
    'ESP32_temp': 'mean',
    'WORKSTATION_CPU': 'mean',
    'WORKSTATION_CPU_POWER': 'mean'
}).round(2).reset_index()
hourly.to_csv(os.path.join(out_dir, 'portugal_hourly_pattern.csv'), index=False, sep=';')
print(f"Hourly pattern: {len(hourly)} rows")

# 3. Weekday pattern
print("Creating weekday pattern...")
weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
weekday = df.groupby('day_name').agg({
    'potencia': 'mean',
    'energia': 'mean',
    'WORKSTATION_CPU': 'mean',
    'WORKSTATION_CPU_POWER': 'mean'
}).round(2).reindex(weekday_order).reset_index()
weekday.to_csv(os.path.join(out_dir, 'portugal_weekday_pattern.csv'), index=False, sep=';')
print(f"Weekday pattern: {len(weekday)} rows")

# 4. Monthly summary
print("Creating monthly summary...")
monthly = df.groupby('month').agg({
    'potencia': ['mean', 'max'],
    'energia': 'max',
    'ESP32_temp': 'mean',
    'WORKSTATION_CPU': 'mean',
    'WORKSTATION_CPU_POWER': 'mean'
}).round(2)
monthly.columns = ['_'.join(col).strip() for col in monthly.columns.values]
monthly = monthly.reset_index()
month_names = {8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'}
monthly['month_name'] = monthly['month'].map(month_names)
monthly.to_csv(os.path.join(out_dir, 'portugal_monthly.csv'), index=False, sep=';')
print(f"Monthly: {len(monthly)} rows")

# 5. Device statistics (by MAC)
print("Creating device statistics...")
devices = df.groupby('MAC').agg({
    'potencia': ['mean', 'max', 'std'],
    'energia': 'max',
    'WORKSTATION_CPU': 'mean',
    'WORKSTATION_CPU_POWER': 'mean'
}).round(2)
devices.columns = ['_'.join(col).strip() for col in devices.columns.values]
devices = devices.reset_index()
devices.to_csv(os.path.join(out_dir, 'portugal_devices.csv'), index=False, sep=';')
print(f"Devices: {len(devices)} rows")

# 6. Hourly by weekday heatmap data
print("Creating heatmap data...")
heatmap = df.groupby(['day_name', 'hour']).agg({
    'potencia': 'mean'
}).round(2).reset_index()
heatmap.to_csv(os.path.join(out_dir, 'portugal_heatmap.csv'), index=False, sep=';')
print(f"Heatmap: {len(heatmap)} rows")

print("\nAll aggregations complete!")
print("Files created:")
print("- portugal_daily.csv")
print("- portugal_hourly_pattern.csv")
print("- portugal_weekday_pattern.csv")
print("- portugal_monthly.csv")
print("- portugal_devices.csv")
print("- portugal_heatmap.csv")
