import re
from datetime import datetime

def parse_coordinates(coord_str):
    if not isinstance(coord_str, str):
        return None
    coord_str = coord_str.replace(" ", "")
    # Try to parse DDMMN/DDDMMME (e.g., 5957N02905E)
    match = re.fullmatch(r'(\d{4})([NS])(\d{5})([EW])', coord_str) # Changed to fullmatch
    if match:
        lat_str, lat_dir, lon_str, lon_dir = match.groups()
        lat_deg = int(lat_str[:2])
        lat_min = int(lat_str[2:])
        lon_deg = int(lon_str[:3])
        lon_min = int(lon_str[3:])

        lat = lat_deg + lat_min / 60
        if lat_dir == 'S':
            lat = -lat

        lon = lon_deg + lon_min / 60
        if lon_dir == 'W':
            lon = -lon

        return {"latitude": lat, "longitude": lon}
    
    # Try to parse DDMMSSN/DDDMMSS (e.g., 564630N0620220E)
    match_ss = re.fullmatch(r'(\d{2})(\d{2})(\d{2})([NS])(\d{3})(\d{2})(\d{2})([EW])', coord_str) # Changed to fullmatch
    if match_ss:
        lat_deg, lat_min, lat_sec, lat_dir, lon_deg, lon_min, lon_sec, lon_dir = match_ss.groups()
        lat = int(lat_deg) + int(lat_min) / 60 + int(lat_sec) / 3600
        lon = int(lon_deg) + int(lon_min) / 60 + int(lon_sec) / 3600
        if lat_dir == 'S': lat = -lat
        if lon_dir == 'W': lon = -lon
        return {"latitude": lat, "longitude": lon}

    return None

def parse_typ(typ_str):
    if not isinstance(typ_str, str):
        return {"raw": typ_str}
    match = re.match(r'(\d*)(\w+)', typ_str)
    if match:
        count = int(match.group(1)) if match.group(1) else 1
        return {"count": count, "type": match.group(2)}
    return {"raw": typ_str}

def parse_rmk(rmk_str):
    if not rmk_str:
        return {}
    
    rmk_str_processed = rmk_str
    
    # Specific replacements for known abbreviations/words
    rmk_str_processed = re.sub(r'М4С', 'МЧС', rmk_str_processed)
    
    # General replacement for '4' with 'Ч' within Cyrillic words
    # Replace '4' at the beginning of a Cyrillic word (e.g., 4АСТЬ -> ЧАСТЬ)
    rmk_str_processed = re.sub(r'\b4([А-Яа-яЁё])', r'Ч\1', rmk_str_processed)
    # Replace '4' within a Cyrillic word (preceded by Cyrillic, followed by Cyrillic or word boundary).
    rmk_str_processed = re.sub(r'([А-Яа-яЁё])4([А-Яа-яЁё])', r'\1Ч\2', rmk_str_processed)
    # Replace '4' at the end of a Cyrillic word (e.g., ВЛАДИМИРОВИ4 -> ВЛАДИМИРОВИЧ)
    rmk_str_processed = re.sub(r'([А-Яа-яЁё])4\b', r'\1Ч', rmk_str_processed)

    # Fix for model extraction: BWS is БВС
    rmk_str_processed = re.sub(r'BWS', 'БВС', rmk_str_processed) # Replace Latin BWS with Cyrillic БВС
    
    parsed_rmk = {"raw": rmk_str_processed}
    
    # Adjusted phone number regex to be more flexible
    phones_raw = re.findall(r'\+?\d[\d\s\-()]{9,}\d', rmk_str_processed) # Expects 10+ digits, optional + at start, allows separators
    phones_cleaned = []
    for phone in phones_raw:
        cleaned_phone = re.sub(r'[\s\-()]+', '', phone) # Clean phone number
        phones_cleaned.append(cleaned_phone)

    if phones_cleaned:
        parsed_rmk['телефоны'] = phones_cleaned
        
    operator_match = re.search(r'(ОПЕРАТОР БВС|ОПЕРАТОР)\s*([^+\n\r]+)', rmk_str_processed, re.IGNORECASE)
    if operator_match:
        parsed_rmk['оператор'] = operator_match.group(2).strip()

    model_match = re.search(r'БВС\s+(?:МОДЕЛЬ\s+)?([A-Z0-9][A-Z0-9\s\-\.]*?)(?=\s+[А-ЯЁа-яё]|\s+\+?\d{10,}|(?:\s\d{4}[NS])|$)', rmk_str_processed, re.IGNORECASE)
    if model_match:
        parsed_rmk['модель_бвс'] = model_match.group(1).strip()

    coords_raw = re.findall(r'\d{4}[NS]\d{5}[EW]|\d{6}[NS]\d{7}[EW]', rmk_str_processed) # Expanded regex for coordinates
    coords_parsed = [parse_coordinates(c) for c in coords_raw if parse_coordinates(c) is not None]
    if coords_parsed:
        parsed_rmk['координаты'] = coords_parsed

    zone_names = re.findall(r'\b(MR\d+|WR\d+|ULR\d+)\b', rmk_str_processed)
    if zone_names:
        parsed_rmk['названия_зон'] = list(set(zone_names))

    permission_match = re.search(r'РАЗРЕШЕНИЕ\s+([\w\s\-.,/]+(?:\sОТ\s\d{2}\.\d{2}\.\d{4})?)', rmk_str_processed, re.IGNORECASE)
    if permission_match:
        parsed_rmk['разрешение'] = permission_match.group(1).strip()
        
    return parsed_rmk

def parse_route(route_str):
    if not isinstance(route_str, str):
        return {"raw": route_str}
    
    parts = route_str.split('/ZONA')
    main_part = parts[0].strip()
    zona_part = parts[1].strip() if len(parts) > 1 else None

    altitude_range = None
    alt_match = re.search(r'M(\d{4})/M(\d{4})', main_part)
    if alt_match:
        altitude_range = {"min_m": int(alt_match.group(1)), "max_m": int(alt_match.group(2))}

    # Extract waypoints from main_part
    # Expanded regex to find both DDMMN/DDDMMME and DDMMSSN/DDDMMSS formats
    waypoints_raw = re.findall(r'\d{4}[NS]\d{5}[EW]|\d{6}[NS]\d{7}[EW]', main_part)
    waypoints_parsed = [parse_coordinates(c) for c in waypoints_raw if parse_coordinates(c) is not None]

    zona_info = None
    if zona_part:
        zona_part = zona_part.strip('/')
        if zona_part.startswith('R'):
            radius_match = re.match(r'R([\d,]+)\s+(.*)', zona_part)
            if radius_match:
                center_coords = parse_coordinates(radius_match.group(2))
                zona_info = {"type": "radius", "radius_km": float(radius_match.group(1).replace(',', '.')), "center": center_coords}
        else:
            # Expanded regex to find both DDMMN/DDDMMME and DDMMSSN/DDDMMSS formats
            coords = re.findall(r'\d{4}[NS]\d{5}[EW]|\d{6}[NS]\d{7}[EW]', zona_part)
            if coords:
                zona_info = {"type": "polygon", "coordinates": [parse_coordinates(c) for c in coords if parse_coordinates(c) is not None]}
            else:
                zona_info = {"type": "name", "name": zona_part}

    return {"altitude": altitude_range, "zona": zona_info, "waypoints": waypoints_parsed, "raw": route_str}

def parse_field_18(field_18_string):
    if not field_18_string:
        return {}
    
    keys = ['DEP', 'DEST', 'DOF', 'EET', 'OPR', 'REG', 'STS', 'TYP', 'RMK', 'SID', 'PERM']
    pattern = r'\b(' + '|'.join(keys) + r')\/'
    
    matches = list(re.finditer(pattern, field_18_string))
    
    if not matches:
        return {'raw': field_18_string}
        
    parsed_info = {}
    for i, match in enumerate(matches):
        key = match.group(1)
        value_start = match.end()
        value_end = matches[i+1].start() if i + 1 < len(matches) else len(field_18_string)
        value = field_18_string[value_start:value_end].strip()
        
        if key == 'TYP':
            parsed_info[key] = parse_typ(value)
        elif key == 'DOF':
            try:
                parsed_info[key] = datetime.strptime(value, '%y%m%d').strftime('%Y-%m-%d')
            except ValueError:
                parsed_info[key] = value
        elif key == 'DEP' or key == 'DEST':
            parsed_info[key] = {"raw": value, "coordinates": parse_coordinates(value)}
        elif key == 'RMK':
            phones_from_opr = parsed_info.get('RMK', {}).get('телефоны', [])
            parsed_rmk = parse_rmk(value)
            if phones_from_opr:
                parsed_rmk['телефоны'] = sorted(list(set(parsed_rmk.get('телефоны', []) + phones_from_opr)))
            parsed_info[key] = parsed_rmk
        elif key == 'REG':
            reg_values = re.split(r'[\,\s]+\s*', value) # Split by comma and/or whitespace
            parsed_info[key] = [v.strip() for v in reg_values if v.strip()]
        elif key == 'OPR':
            operator_name = value.replace('\n', ' ') # Replace newlines with spaces for OPR
            phone_numbers_in_opr_raw = re.findall(r'\+?\d[\d\s\-()]{9,}\d', operator_name) # Find raw phones in original value
            
            if phone_numbers_in_opr_raw:
                for raw_phone in phone_numbers_in_opr_raw:
                    # Use re.sub to remove the phone number and any surrounding whitespace
                    operator_name = re.sub(re.escape(raw_phone) + r'\s*', '', operator_name).strip()
                
                if 'RMK' not in parsed_info:
                    parsed_info['RMK'] = {'raw': ''} # Initialize RMK if not present
                
                cleaned_phones = []
                for phone in phone_numbers_in_opr_raw:
                    cleaned_phone = re.sub(r'[\s\-()]+', '', phone)
                    cleaned_phones.append(cleaned_phone)

                if 'телефоны' not in parsed_info['RMK']:
                    parsed_info['RMK']['телефоны'] = []
                parsed_info['RMK']['телефоны'].extend(cleaned_phones)
                
            parsed_info[key] = operator_name.strip() # Ensure OPR name is stripped
        else:
            parsed_info[key] = value
            
    return parsed_info

def parse_shr(shr_string):
    if not isinstance(shr_string, str) or not shr_string.startswith('(SHR'):
        return None

    shr_string = shr_string.strip()[1:-1]
    parts = shr_string.split('\n-')

    parsed_data = {}
    
    if len(parts) > 0:
        match = re.match(r'SHR-(.*)', parts[0])
        if match:
            parsed_data['Тип сообщения'] = 'SHR'
            parsed_data['Опознавательный индекс'] = match.group(1).strip()

    # Field 13: Aerodrome and time of departure
    if len(parts) > 1: # Ensure there is a part for Field 13
        aerodrome_time_str = parts[1].strip()
        # Pattern for Field 13: (ZZZZ or 4-letter code) + TIME
        field_13_match = re.match(r'(ZZZZ|\w{4})(\d{4})', aerodrome_time_str)
        if field_13_match:
            parsed_data['Аэродром вылета'] = field_13_match.group(1)
            parsed_data['Время вылета'] = field_13_match.group(2)
        else:
            # If it doesn't match the expected pattern, store as raw for now
            parsed_data['Аэродром и время вылета'] = aerodrome_time_str

    # Field 15: Route
    if len(parts) > 2: # Ensure there is a part for Field 15
        parsed_data['Маршрут'] = parse_route(parts[2].strip())

    # Field 16: Destination aerodrome and total estimated elapsed time, alternate aerodromes
    # This is the 4th part if it exists and matches the Field 16 pattern.
    # Otherwise, it's part of Field 18.
    other_info_start_index = 3 # Default to Field 18 starting from parts[3]
    if len(parts) > 3: # Check if there's a 4th part
        field_16_str = parts[3].strip()
        # Pattern for Field 16: (ZZZZ or 4-letter code) + TIME + (optional alternate aerodromes)
        # Example: ZZZZ0700, UUWW0330 UUOO URRR
        field_16_match = re.match(r'(ZZZZ|\w{4})(\d{4})(?:\s+((?:ZZZZ|\w{4})(?:\s+(?:ZZZZ|\w{4}))*))?', field_16_str)
        if field_16_match:
            parsed_data['Аэродром назначения'] = field_16_match.group(1)
            parsed_data['Время назначения'] = field_16_match.group(2)
            if field_16_match.group(3): # Check for alternate aerodromes
                alt_aerodromes = re.findall(r'(ZZZZ|\w{4})', field_16_match.group(3))
                if alt_aerodromes:
                    parsed_data['Запасные аэродромы'] = alt_aerodromes
            other_info_start_index = 4 # Field 16 was successfully parsed, so Field 18 starts from next part
        # else: # If it doesn't match Field 16 pattern, it's part of Field 18. other_info_start_index remains 3.

    # Field 18: Other Information
    if len(parts) >= other_info_start_index: # Ensure there are parts for Field 18
        # Join remaining parts to form the full Field 18 string
        other_info_str = '\n-'.join(parts[other_info_start_index-1:])
        
        # Find the first key in the other_info_str to determine where actual Field 18 starts
        first_key_pos = -1
        keys_for_field_18 = ['DEP', 'DEST', 'DOF', 'EET', 'OPR', 'REG', 'STS', 'TYP', 'RMK', 'SID', 'PERM']
        for key in keys_for_field_18:
            pos = other_info_str.find(key + '/')
            if pos != -1 and (first_key_pos == -1 or pos < first_key_pos):
                first_key_pos = pos
        
        if first_key_pos != -1: # If a key was found, start parsing from there
            other_info_str = other_info_str[first_key_pos:]
        else: # If no key was found, the whole string is raw other info
            pass # other_info_str is already the full string

        parsed_data['Прочая информация'] = parse_field_18(other_info_str)
    
    return parsed_data

def parse_dep_arr(raw_str):
    if not isinstance(raw_str, str):
        return None
    
    parsed = {}
    for line in raw_str.split('\n'):
        line = line.strip()
        parts = line.split(None, 1)
        if len(parts) < 2:
            continue
        key = parts[0]
        value = parts[1]

        if key == '-SID':
            parsed['sid'] = value
        elif key == '-ADD' or key == '-ADA':
            try:
                parsed['date'] = datetime.strptime(value, '%y%m%d').strftime('%Y-%m-%d')
            except (ValueError, IndexError):
                parsed['date'] = None
        elif key == '-ATD' or key == '-ATA':
            parsed['time'] = value
        elif key == '-ADEPZ' or key == '-ADARRZ':
            parsed['coordinates'] = parse_coordinates(value)
        elif key == '-REG':
            reg_values = re.split(r'[\,\s]+\s*', value)
            parsed['registration'] = [v.strip() for v in reg_values if v.strip()]

    return parsed

def calculate_duration(dep_info, arr_info):
    if not dep_info or not arr_info:
        return None
    
    dep_date = dep_info.get('date')
    dep_time = dep_info.get('time')
    arr_date = arr_info.get('date')
    arr_time = arr_info.get('time')

    if not dep_date or not dep_time or not arr_date or not arr_time:
        return None
    
    try:
        dep_datetime = datetime.strptime(f"{dep_date} {dep_time}", '%Y-%m-%d %H%M')
        arr_datetime = datetime.strptime(f"{arr_date} {arr_time}", '%Y-%m-%d %H%M')
        duration = (arr_datetime - dep_datetime).total_seconds() / 60
        return round(duration)
    except (ValueError, TypeError):
        return None