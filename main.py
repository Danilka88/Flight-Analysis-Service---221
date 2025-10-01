from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import json
import io
import os
from parsing import parse_shr, parse_dep_arr, calculate_duration
from geojson_converter import convert_shapefile_to_geojson, standardize_region_name
from ollama_analyzer.main import router as ai_router
from database_connector.main import router as db_router
from auth_connector.main import router as auth_router
from crypto_connector.main import router as crypto_router

app = FastAPI()

DATA_FILE = "/Users/danil_ka88/Desktop/moscow/project/data/base_data.json"
DEFAULT_XLSX = "/Users/danil_ka88/Desktop/moscow/project/data/2025.xlsx"
GEOJSON_FILE = "/Users/danil_ka88/Desktop/moscow/project/data/russia_regions.geojson"
SHAPEFILE_PATH = "/Users/danil_ka88/Desktop/moscow/project/Russia-Admin-Shapemap-main/RF/admin_4"

def get_flight_regions_stats():
    if not os.path.exists(DEFAULT_XLSX):
        return {}

    df = pd.read_excel(DEFAULT_XLSX)
    df = df.replace({np.nan: None})

    region_flight_counts = {}

    # Получаем список всех GeoJSON регионов для нечеткого сопоставления
    geojson_region_names = []
    if os.path.exists(GEOJSON_FILE):
        with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
        for feature in geojson_data["features"]:
            geojson_region_names.append(feature["properties"]["region_name"])

    for index, row in df.iterrows():
        region_name = row.get("Центр ЕС ОрВД")
        if region_name:
            # Передаем geojson_region_names в standardize_region_name
            standardized_region_name = standardize_region_name(region_name, geojson_region_names)
            region_flight_counts[standardized_region_name] = region_flight_counts.get(standardized_region_name, 0) + 1
        
    return region_flight_counts

@app.on_event("startup")
def on_startup():
    """На старте проверяет, существуют ли базовые JSON файлы. Если нет - создает их."""
    if not os.path.exists(DATA_FILE):
        try:
            df = pd.read_excel(DEFAULT_XLSX)
            df = df.replace({np.nan: None})
            
            results = []
            for index, row in df.iterrows():
                if len(results) >= 50:
                    break
                try:
                    shr_parsed = parse_shr(row.get('SHR'))
                    dep_parsed = parse_dep_arr(row.get('DEP'))
                    arr_parsed = parse_dep_arr(row.get('ARR'))

                    result = {
                        "Центр ЕС ОрВД": row.get("Центр ЕС ОрВД"),
                        "SHR_raw": row.get("SHR"),
                        "DEP_raw": row.get("DEP"),
                        "ARR_raw": row.get("ARR"),
                        "parsed_data": {
                            "SHR": shr_parsed,
                            "DEP": dep_parsed,
                            "ARR": arr_parsed,
                            "flight_duration_minutes": calculate_duration(dep_parsed, arr_parsed)
                        }
                    }
                    results.append(result)
                except Exception:
                    continue
            
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=4)
            print(f"Default data file created at {DATA_FILE}")
        except Exception as e:
            print(f"Error creating default data file: {e}")

    if not os.path.exists(GEOJSON_FILE):
        convert_shapefile_to_geojson(SHAPEFILE_PATH, GEOJSON_FILE)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Разрешить фронтенд
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Включаем роутер из модуля анализа
app.include_router(ai_router)

# Включаем роутеры из новых коннекторов (для будущего использования)
app.include_router(db_router)
app.include_router(auth_router)
app.include_router(crypto_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/upload")
async def upload_and_parse_excel(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        return JSONResponse(status_code=400, content={"error": "Invalid file format. Please upload an .xlsx file."})

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        df = df.replace({np.nan: None})
        
        results = []
        errors = []
        for index, row in df.iterrows():
            try:
                shr_parsed = parse_shr(row.get('SHR'))
                dep_parsed = parse_dep_arr(row.get('DEP'))
                arr_parsed = parse_dep_arr(row.get('ARR'))

                result = {
                    "Центр ЕС ОрВД": row.get("Центр ЕС ОрВД"),
                    "SHR_raw": row.get("SHR"),
                    "DEP_raw": row.get("DEP"),
                    "ARR_raw": row.get("ARR"),
                    "parsed_data": {
                        "SHR": shr_parsed,
                        "DEP": dep_parsed,
                        "ARR": arr_parsed,
                        "flight_duration_minutes": calculate_duration(dep_parsed, arr_parsed)
                    }
                }
                results.append(result)
            except Exception as e:
                errors.append({"row": index, "error": str(e), "data": row.to_dict()})
        
        if errors:
            return JSONResponse(status_code=422, content={"errors": errors})

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
            
        return JSONResponse(content={"message": f"File processed successfully. {len(results)} records saved.", "data": results})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/flights")
def get_flights():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@app.get("/api/flight_regions_stats")
def get_flight_regions_stats_api():
    return get_flight_regions_stats()

@app.get("/api/geo/regions")
def get_geo_regions():
    if not os.path.exists(GEOJSON_FILE):
        return JSONResponse(status_code=404, content={"error": "GeoJSON file not found."})
    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)
    
    flight_stats = get_flight_regions_stats()

    for feature in geojson_data["features"]:
        region_name = feature["properties"]["region_name"]
        feature["properties"]["flight_count"] = flight_stats.get(region_name, 0)
        feature["properties"]["has_flights"] = flight_stats.get(region_name, 0) > 0
    
    return geojson_data
