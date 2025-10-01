import pytest
from parsing import parse_coordinates, parse_typ, parse_rmk, parse_route, parse_field_18, parse_shr, parse_dep_arr, calculate_duration

# Тесты для parse_coordinates
def test_parse_coordinates_ddmmn_dddmmme_valid():
    assert parse_coordinates("5152N08600E") == pytest.approx({"latitude": 51.86666666666667, "longitude": 86.0})
    assert parse_coordinates("4408N04308E") == pytest.approx({"latitude": 44.13333333333333, "longitude": 43.13333333333333})
    assert parse_coordinates("6049N07311E") == pytest.approx({"latitude": 60.81666666666667, "longitude": 73.18333333333334})

def test_parse_coordinates_ddmmssn_dddmmss_valid():
    assert parse_coordinates("440846N0430829E") == pytest.approx({"latitude": 44.14611111111111, "longitude": 43.14138888888889})
    assert parse_coordinates("564630N0620220E") == pytest.approx({"latitude": 56.775, "longitude": 62.03888888888889})

def test_parse_coordinates_invalid_format():
    assert parse_coordinates("INVALID") is None
    assert parse_coordinates("5152N08600") is None
    assert parse_coordinates("5152N08600EEXTRA") is None # This should now pass with fullmatch

def test_parse_coordinates_none_input():
    assert parse_coordinates(None) is None

def test_parse_coordinates_empty_string():
    assert parse_coordinates("") is None

# Тесты для parse_typ
def test_parse_typ_single_type():
    assert parse_typ("BLA") == {"count": 1, "type": "BLA"}

def test_parse_typ_multiple_type():
    assert parse_typ("2BLA") == {"count": 2, "type": "BLA"}

def test_parse_typ_none_input():
    assert parse_typ(None) == {"raw": None}

def test_parse_typ_empty_string():
    assert parse_typ("") == {"raw": ""}

# Тесты для parse_rmk
def test_parse_rmk_char_replacements():
    rmk_str = "ВЛАДИМИРОВИ4 4АСТЬ М4С У4ЕТНЫЕ"
    expected_raw = "ВЛАДИМИРОВИЧ ЧАСТЬ МЧС УЧЕТНЫЕ"
    parsed = parse_rmk(rmk_str)
    assert parsed["raw"] == expected_raw

def test_parse_rmk_phone_extraction_and_cleaning():
    rmk_str = "ОПЕРАТОР ИВАНОВ +7 913 123-45-67 БВС МОДЕЛЬ"
    parsed = parse_rmk(rmk_str)
    assert "телефоны" in parsed
    assert parsed["телефоны"] == ["+79131234567"]

def test_parse_rmk_operator_extraction():
    rmk_str = "ОПЕРАТОР БВС ПЕТРОВ ИВАНОВИЧ"
    parsed = parse_rmk(rmk_str)
    assert "оператор" in parsed
    assert parsed["оператор"] == "ПЕТРОВ ИВАНОВИЧ"

def test_parse_rmk_model_extraction():
    rmk_str = "БВС МОДЕЛЬ DJI MINI 3"
    parsed = parse_rmk(rmk_str)
    assert "модель_бвс" in parsed
    assert parsed["модель_бвс"] == "DJI MINI 3"

def test_parse_rmk_coordinates_extraction():
    rmk_str = "ТОЧКА 554819N0373011E"
    parsed = parse_rmk(rmk_str)
    assert "координаты" in parsed
    assert parsed["координаты"] == [pytest.approx({"latitude": 55.80527777777778, "longitude": 37.50305555555556})]

def test_parse_rmk_zone_names_extraction():
    rmk_str = "ЗОНА MR076285 И WR123"
    parsed = parse_rmk(rmk_str)
    assert "названия_зон" in parsed
    assert set(parsed["названия_зон"]) == set(["MR076285", "WR123"])

def test_parse_rmk_permission_extraction():
    rmk_str = "РАЗРЕШЕНИЕ N-16 ОТ 20.12.2024"
    parsed = parse_rmk(rmk_str)
    assert "разрешение" in parsed
    assert parsed["разрешение"] == "N-16 ОТ 20.12.2024"

def test_parse_rmk_complex_string():
    rmk_str = "WR16567 ZENKOWO БЕЗ SRO БВС SUPERCAM S350 GT WZL 6049N06937E GT POS 6049N06937E H IST 0 350 M H ABS 0 400 M R 1000 M W ZONE H POL IST 250 350 M H POL ABS 280 400 M ПОЛЕТЫ НАД НАСЕЛЕННЫМИ ПУНКТАМИ НЕ ПРЕДУСМОТРЕНЫ ЦЕЛЯХ МОНИТОРИНГ ТРУБОПРОВОДА SHR РАЗРАБОТАЛ PRP OOO FINKO ELYSHEWA TEL 89829906599 ВЗАИМОДЕЙСТВИЕ С ОРГАНАМИ ОВД ОСУЩЕСТВЛЯЕТ ВНЕШНИЙ ПИЛОТ БВС СИМОНОВ TEL 89641837292"
    parsed = parse_rmk(rmk_str)
    assert parsed["raw"].startswith("WR16567 ZENKOWO БЕЗ SRO БВС SUPERCAM S350 GT WZL")
    assert "телефоны" in parsed
    assert set(parsed["телефоны"]) == set(["89829906599", "89641837292"])
    assert "модель_бвс" in parsed
    assert parsed["модель_бвс"] == "SUPERCAM S350 GT WZL"
    assert "координаты" in parsed
    assert len(parsed["координаты"]) == 2
    assert "названия_зон" in parsed
    assert parsed["названия_зон"] == ["WR16567"]

def test_parse_rmk_empty_input():
    assert parse_rmk("") == {}

def test_parse_rmk_none_input():
    assert parse_rmk(None) == {}

# Тесты для parse_route
def test_parse_route_altitude_zona_radius():
    route_str = "M0000/M0080 /ZONA R002 5152N08600E/"
    parsed = parse_route(route_str)
    assert parsed["altitude"] == {"min_m": 0, "max_m": 80}
    assert parsed["zona"]["type"] == "radius"
    assert parsed["zona"]["radius_km"] == pytest.approx(2.0)
    assert parsed["zona"]["center"] == pytest.approx({"latitude": 51.86666666666667, "longitude": 86.0})
    assert parsed["waypoints"] == []

def test_parse_route_altitude_zona_polygon():
    route_str = "M0000/M0005 /ZONA 5646N06202E 5646N06203E 5647N06203E 5647N06202E 5646N06202E/"
    parsed = parse_route(route_str)
    assert parsed["altitude"] == {"min_m": 0, "max_m": 5}
    assert parsed["zona"]["type"] == "polygon"
    assert len(parsed["zona"]["coordinates"]) == 5
    assert parsed["waypoints"] == []

def test_parse_route_altitude_zona_name():
    route_str = "M0020/M0025 /ZONA KO02/"
    parsed = parse_route(route_str)
    assert parsed["altitude"] == {"min_m": 20, "max_m": 25}
    assert parsed["zona"]["type"] == "name"
    assert parsed["zona"]["name"] == "KO02"
    assert parsed["waypoints"] == []

def test_parse_route_waypoints_in_main_part():
    route_str = "K0040M0015 4643N04855E 4650N04835E /ZONA R002 5152N08600E/"
    parsed = parse_route(route_str)
    assert parsed["altitude"] == None # K0040M0015 is speed/altitude, not MXXXX/MXXXX
    assert len(parsed["waypoints"]) == 2
    assert parsed["waypoints"][0] == pytest.approx({"latitude": 46.71666666666667, "longitude": 48.916666666666664})
    assert parsed["waypoints"][1] == pytest.approx({"latitude": 46.833333333333336, "longitude": 48.583333333333336})

def test_parse_route_none_input():
    assert parse_route(None) == {"raw": None}

# Тесты для parse_field_18
def test_parse_field_18_basic_keys():
    field_str = "DEP/5548N03730E DOF/250108 TYP/BLA RMK/ТЕСТ"
    parsed = parse_field_18(field_str)
    assert parsed["DEP"]["coordinates"] == pytest.approx({"latitude": 55.8, "longitude": 37.5})
    assert parsed["DOF"] == "2025-01-08"
    assert parsed["TYP"] == {"count": 1, "type": "BLA"}
    assert parsed["RMK"]["raw"] == "ТЕСТ"

def test_parse_field_18_reg_split():
    field_str = "REG/RF-37204, RF-37018 0J02194"
    parsed = parse_field_18(field_str)
    assert parsed["REG"] == ["RF-37204", "RF-37018", "0J02194"]

def test_parse_field_18_opr_phone_moved_to_rmk():
    field_str = "OPR/ИВАНОВ ИВАН ИВАНОВИЧ +79131234567 RMK/ДОП ИНФО"
    parsed = parse_field_18(field_str)
    assert parsed["OPR"] == "ИВАНОВ ИВАН ИВАНОВИЧ"
    assert "телефоны" in parsed["RMK"]
    assert parsed["RMK"]["телефоны"] == ["+79131234567"]
    assert parsed["RMK"]["raw"] == "ДОП ИНФО"

def test_parse_field_18_opr_phone_moved_to_rmk_no_initial_rmk():
    field_str = "OPR/ПЕТРОВ ПЕТРОВИЧ +79131234567"
    parsed = parse_field_18(field_str)
    assert parsed["OPR"] == "ПЕТРОВ ПЕТРОВИЧ"
    assert "телефоны" in parsed["RMK"]
    assert parsed["RMK"]["телефоны"] == ["+79131234567"]
    assert parsed["RMK"]["raw"] == ""

def test_parse_field_18_none_input():
    assert parse_field_18(None) == {}

# Тесты для parse_shr
def test_parse_shr_basic():
    shr_str = "(SHR-ZZZZZ\n-ZZZZ0705\n-K0300M3000\n-DEP/5957N02905E DOF/250201 OPR/МАЛИНОВСКИЙ НИКИТА АЛЕКСАНДРОВИЧ\n+79313215153 TYP/SHAR RMK/ОБОЛОЧКА 300 ДЛЯ ЗОНДИРОВАНИЯ АТМОСФЕРЫ SID/7772187998)"
    parsed = parse_shr(shr_str)
    assert parsed["Тип сообщения"] == "SHR"
    assert parsed["Опознавательный индекс"] == "ZZZZZ"
    assert parsed["Аэродром вылета"] == "ZZZZ"
    assert parsed["Время вылета"] == "0705"
    assert parsed["Маршрут"]["raw"] == "K0300M3000"
    assert parsed["Прочая информация"]["OPR"] == "МАЛИНОВСКИЙ НИКИТА АЛЕКСАНДРОВИЧ"
    assert parsed["Прочая информация"]["RMK"]["телефоны"] == ["+79313215153"]

def test_parse_shr_field_16_present():
    # Updated shr_str to include newline in OPR value as per example_mini.json
    shr_str = "(SHR-00725\n-ZZZZ0600\n-M0000/M0005 /ZONA R0,5 4408N04308E/\n-ZZZZ0700\n-DEP/4408N04308E DEST/4408N04308E DOF/250124 OPR/ГУ МЧС РОССИИ ПО\nСТАВРОПОЛЬСКОМУ КРАЮ REG/00724,REG00725 STS/SAR TYP/BLA RMK/WR655 В ЗОНЕ ВИЗУАЛЬНОГО ПОЛЕТА СОГЛАСОВАНО С ЕСОРВД РОСТОВ ПОЛЕТ БЛА В ВП-С-МЧС МОНИТОРИНГ ПАВОДКООПАСНЫХ УЧАСТКОВ РАЗРЕШЕНИЕ 10-37/9425 15.11.2024 АДМИНИСТРАЦИЯ МИНЕРАЛОВОДСКОГО МУНИЦИПАЛЬНОГО ОКРУГА ОПЕРАТОР ЛЯХОВСКАЯ +79283000251 ЛЯПИН +79620149012 SID/7772251137)"
    parsed = parse_shr(shr_str)
    assert parsed["Аэродром назначения"] == "ZZZZ"
    assert parsed["Время назначения"] == "0700"
    assert parsed["Прочая информация"]["OPR"] == "ГУ МЧС РОССИИ ПО СТАВРОПОЛЬСКОМУ КРАЮ"
    assert "телефоны" in parsed["Прочая информация"]["RMK"]
    assert set(parsed["Прочая информация"]["RMK"]["телефоны"]) == set(["+79283000251", "+79620149012"])

def test_parse_shr_none_input():
    assert parse_shr(None) is None

# Тесты для parse_dep_arr
def test_parse_dep_arr_valid():
    dep_raw = "-TITLE IDEP\n-SID 7772187998\n-ADD 250201\n-ATD 0705\n-ADEP ZZZZ\n-ADEPZ 5957N02905E\n-PAP 0"
    parsed = parse_dep_arr(dep_raw)
    assert parsed["sid"] == "7772187998"
    assert parsed["date"] == "2025-02-01"
    assert parsed["time"] == "0705"
    assert parsed["coordinates"] == pytest.approx({"latitude": 59.95, "longitude": 29.083333333333332})

def test_parse_dep_arr_with_reg():
    dep_raw = "-TITLE IDEP\n-SID 7772251311\n-ADD 250123\n-ATD 0402\n-ADEP ZZZZ\n-ADEPZ 5152N08600E\n-PAP 0\n-REG RF37362"
    parsed = parse_dep_arr(dep_raw)
    assert parsed["registration"] == ["RF37362"]

def test_parse_dep_arr_none_input():
    assert parse_dep_arr(None) is None

# Тесты для calculate_duration
def test_calculate_duration_valid():
    dep_info = {"date": "2025-01-01", "time": "1000"}
    arr_info = {"date": "2025-01-01", "time": "1230"}
    assert calculate_duration(dep_info, arr_info) == 150

def test_calculate_duration_across_midnight():
    dep_info = {"date": "2025-01-01", "time": "2300"}
    arr_info = {"date": "2025-01-02", "time": "0100"}
    assert calculate_duration(dep_info, arr_info) == 120

def test_calculate_duration_missing_info():
    dep_info = {"date": "2025-01-01"}
    arr_info = {"date": "2025-01-01", "time": "1230"}
    assert calculate_duration(dep_info, arr_info) is None

def test_calculate_duration_none_input():
    assert calculate_duration(None, None) is None